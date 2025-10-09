"""
PostgreSQL Checkpointer for LangGraph
Implements persistent state management following LangGraph best practices
"""
import json
import uuid
from typing import Optional, Dict, Any, Sequence, Tuple
from datetime import datetime
from contextlib import asynccontextmanager

from langgraph.checkpoint.base import BaseCheckpointSaver, Checkpoint, CheckpointMetadata, CheckpointTuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from models.database import Checkpoint as CheckpointModel, Conversation
from core.database import get_async_session_maker


class PostgresCheckpointSaver(BaseCheckpointSaver):
    """
    PostgreSQL-based checkpoint saver for LangGraph
    Stores graph state in PostgreSQL for persistent conversation memory
    
    Features:
    - Automatic state persistence across sessions
    - Support for conversation branching
    - Thread-safe operations
    - Efficient querying with indexes
    """
    
    def __init__(self, session_factory=None):
        """
        Initialize the PostgreSQL checkpoint saver
        
        Args:
            session_factory: Optional async session factory (defaults to get_async_session_maker())
        """
        super().__init__()
        self.session_factory = session_factory or get_async_session_maker()
    
    @asynccontextmanager
    async def _get_session(self):
        """Get database session with proper cleanup"""
        async with self.session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def aget(
        self,
        config: Dict[str, Any],
    ) -> Optional[Checkpoint]:
        """
        Get the latest checkpoint for a thread
        
        Args:
            config: Configuration dict containing thread_id and optional checkpoint_ns
        
        Returns:
            Checkpoint object or None if not found
        """
        thread_id = config.get("configurable", {}).get("thread_id")
        checkpoint_ns = config.get("configurable", {}).get("checkpoint_ns", "")
        
        if not thread_id:
            return None
        
        async with self._get_session() as session:
            # Query for the latest checkpoint
            stmt = (
                select(CheckpointModel)
                .where(
                    and_(
                        CheckpointModel.thread_id == thread_id,
                        CheckpointModel.checkpoint_ns == checkpoint_ns
                    )
                )
                .order_by(CheckpointModel.created_at.desc())
                .limit(1)
            )
            
            result = await session.execute(stmt)
            checkpoint_model = result.scalar_one_or_none()
            
            if not checkpoint_model:
                return None
            
            # Convert to LangGraph Checkpoint format
            return self._model_to_checkpoint(checkpoint_model)
    
    async def aput(
        self,
        config: Dict[str, Any],
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
    ) -> Dict[str, Any]:
        """
        Save a checkpoint to the database
        
        Args:
            config: Configuration dict with thread_id
            checkpoint: The checkpoint data to save
            metadata: Checkpoint metadata
        
        Returns:
            Updated config with checkpoint_id
        """
        thread_id = config.get("configurable", {}).get("thread_id")
        checkpoint_ns = config.get("configurable", {}).get("checkpoint_ns", "")
        
        if not thread_id:
            raise ValueError("thread_id is required in config")
        
        async with self._get_session() as session:
            # Ensure conversation exists
            conversation = await self._get_or_create_conversation(session, thread_id)
            
            # Create checkpoint ID
            checkpoint_id = str(uuid.uuid4())
            
            # Get parent checkpoint ID if exists
            parent_checkpoint_id = config.get("configurable", {}).get("checkpoint_id")
            
            # Create checkpoint model
            checkpoint_model = CheckpointModel(
                conversation_id=conversation.id,
                thread_id=thread_id,
                checkpoint_ns=checkpoint_ns,
                checkpoint_id=checkpoint_id,
                parent_checkpoint_id=parent_checkpoint_id,
                checkpoint_data={
                    "v": checkpoint.get("v", 1),
                    "ts": checkpoint.get("ts", datetime.utcnow().isoformat()),
                    "channel_values": checkpoint.get("channel_values", {}),
                    "channel_versions": checkpoint.get("channel_versions", {}),
                    "versions_seen": checkpoint.get("versions_seen", {}),
                },
                metadata=metadata or {},
            )
            
            session.add(checkpoint_model)
            await session.flush()
            
            # Update conversation timestamp
            conversation.last_message_at = datetime.utcnow()
            
            # Return updated config
            return {
                **config,
                "configurable": {
                    **config.get("configurable", {}),
                    "checkpoint_id": checkpoint_id,
                }
            }
    
    async def alist(
        self,
        config: Dict[str, Any],
        limit: Optional[int] = None,
        before: Optional[Dict[str, Any]] = None,
    ) -> Sequence[CheckpointTuple]:
        """
        List checkpoints for a thread
        
        Args:
            config: Configuration dict with thread_id
            limit: Maximum number of checkpoints to return
            before: Filter checkpoints before this config
        
        Returns:
            List of checkpoint tuples
        """
        thread_id = config.get("configurable", {}).get("thread_id")
        checkpoint_ns = config.get("configurable", {}).get("checkpoint_ns", "")
        
        if not thread_id:
            return []
        
        async with self._get_session() as session:
            # Build query
            stmt = (
                select(CheckpointModel)
                .where(
                    and_(
                        CheckpointModel.thread_id == thread_id,
                        CheckpointModel.checkpoint_ns == checkpoint_ns
                    )
                )
                .order_by(CheckpointModel.created_at.desc())
            )
            
            # Apply before filter if provided
            if before:
                before_checkpoint_id = before.get("configurable", {}).get("checkpoint_id")
                if before_checkpoint_id:
                    before_stmt = select(CheckpointModel.created_at).where(
                        CheckpointModel.checkpoint_id == before_checkpoint_id
                    )
                    before_result = await session.execute(before_stmt)
                    before_ts = before_result.scalar_one_or_none()
                    if before_ts:
                        stmt = stmt.where(CheckpointModel.created_at < before_ts)
            
            # Apply limit
            if limit:
                stmt = stmt.limit(limit)
            
            result = await session.execute(stmt)
            checkpoint_models = result.scalars().all()
            
            # Convert to checkpoint tuples
            return [
                CheckpointTuple(
                    config={
                        "configurable": {
                            "thread_id": cp.thread_id,
                            "checkpoint_ns": cp.checkpoint_ns,
                            "checkpoint_id": cp.checkpoint_id,
                        }
                    },
                    checkpoint=self._model_to_checkpoint(cp),
                    metadata=cp.metadata or {},
                    parent_config={
                        "configurable": {
                            "thread_id": cp.thread_id,
                            "checkpoint_ns": cp.checkpoint_ns,
                            "checkpoint_id": cp.parent_checkpoint_id,
                        }
                    } if cp.parent_checkpoint_id else None,
                )
                for cp in checkpoint_models
            ]
    
    async def _get_or_create_conversation(
        self,
        session: AsyncSession,
        thread_id: str
    ) -> Conversation:
        """Get or create a conversation for the thread"""
        stmt = select(Conversation).where(Conversation.thread_id == thread_id)
        result = await session.execute(stmt)
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            conversation = Conversation(
                thread_id=thread_id,
                title=f"Conversation {thread_id[:8]}",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(conversation)
            await session.flush()
        
        return conversation
    
    def _model_to_checkpoint(self, model: CheckpointModel) -> Checkpoint:
        """Convert CheckpointModel to LangGraph Checkpoint"""
        data = model.checkpoint_data
        return {
            "v": data.get("v", 1),
            "ts": data.get("ts"),
            "channel_values": data.get("channel_values", {}),
            "channel_versions": data.get("channel_versions", {}),
            "versions_seen": data.get("versions_seen", {}),
        }


# Convenience function to create checkpointer
def create_postgres_checkpointer() -> PostgresCheckpointSaver:
    """Create a PostgreSQL checkpointer instance"""
    return PostgresCheckpointSaver()

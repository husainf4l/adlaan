"""
Database models for session management and conversation history
Following LangGraph best practices with PostgreSQL persistence
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Index, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()


class User(Base):
    """User model for authentication and session management"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Conversation(Base):
    """Conversation/Thread model for grouping related messages"""
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(String(255), unique=True, index=True, nullable=False)  # LangGraph thread_id
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    title = Column(String(500))
    meta_data = Column(JSON, default={})  # Store jurisdiction, document_type, etc.
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_message_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    checkpoints = relationship("Checkpoint", back_populates="conversation", cascade="all, delete-orphan")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_conversation_user_updated', 'user_id', 'updated_at'),
        Index('idx_conversation_thread', 'thread_id'),
    )
    
    def __repr__(self):
        return f"<Conversation(id={self.id}, thread_id={self.thread_id}, title={self.title})>"


class Message(Base):
    """Message model for storing individual messages in conversations"""
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    
    role = Column(String(50), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    message_type = Column(String(50), default="message")  # 'message', 'doc', 'error'
    
    # LangGraph specific
    checkpoint_id = Column(String(255))  # Link to LangGraph checkpoint
    
    # Metadata
    meta_data = Column(JSON, default={})  # citations, confidence, etc.
    token_count = Column(Integer)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_message_conversation_created', 'conversation_id', 'created_at'),
        Index('idx_message_checkpoint', 'checkpoint_id'),
    )
    
    def __repr__(self):
        return f"<Message(id={self.id}, role={self.role}, type={self.message_type})>"


class Checkpoint(Base):
    """
    LangGraph checkpoint storage for state persistence
    Stores the complete state of the graph at each step
    """
    __tablename__ = "checkpoints"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    
    # LangGraph checkpoint fields
    thread_id = Column(String(255), nullable=False, index=True)
    checkpoint_ns = Column(String(255), default="", nullable=False)
    checkpoint_id = Column(String(255), nullable=False)
    parent_checkpoint_id = Column(String(255))
    
    # State data
    checkpoint_data = Column(JSON, nullable=False)  # The actual checkpoint state
    meta_data = Column(JSON, default={})  # Additional metadata
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    conversation = relationship("Conversation", back_populates="checkpoints")
    
    # Indexes for LangGraph queries
    __table_args__ = (
        Index('idx_checkpoint_thread_ns_id', 'thread_id', 'checkpoint_ns', 'checkpoint_id', unique=True),
        Index('idx_checkpoint_thread_ns', 'thread_id', 'checkpoint_ns'),
        Index('idx_checkpoint_parent', 'parent_checkpoint_id'),
    )
    
    def __repr__(self):
        return f"<Checkpoint(id={self.id}, thread_id={self.thread_id}, checkpoint_id={self.checkpoint_id})>"


class Document(Base):
    """Generated legal documents storage"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    title = Column(String(500))
    content = Column(Text, nullable=False)
    document_type = Column(String(100))  # 'contract', 'agreement', 'memo', etc.
    
    # Legal metadata
    jurisdiction = Column(String(100))
    citations = Column(JSON, default=[])  # List of legal citations
    template_used = Column(String(255))
    
    # Version control
    version = Column(Integer, default=1)
    parent_document_id = Column(Integer, ForeignKey("documents.id"))
    
    # Storage
    file_path = Column(String(500))  # S3 or local storage path
    file_format = Column(String(50))  # 'pdf', 'docx', 'txt'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_document_conversation', 'conversation_id'),
        Index('idx_document_user_created', 'user_id', 'created_at'),
    )
    
    def __repr__(self):
        return f"<Document(id={self.id}, title={self.title}, type={self.document_type})>"


class AuditLog(Base):
    """Audit log for compliance and tracking"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    
    action = Column(String(100), nullable=False)  # 'create_conversation', 'generate_document', etc.
    resource_type = Column(String(100))  # 'conversation', 'document', 'message'
    resource_id = Column(Integer)
    
    details = Column(JSON, default={})
    ip_address = Column(String(50))
    user_agent = Column(String(500))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_audit_user_created', 'user_id', 'created_at'),
        Index('idx_audit_resource', 'resource_type', 'resource_id'),
    )
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action})>"

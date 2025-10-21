"""
Task management service for handling agent tasks.
"""
import asyncio
from typing import Dict, Any, Optional, List, TYPE_CHECKING
from datetime import datetime, timedelta
import uuid

from src.services.base import AsyncService
from src.integrations.backend_service import BackendIntegrationService, AgentTask
from src.core.exceptions import TaskNotFoundError, AgentError, TaskTimeoutError
from src.schemas import AgentType, TaskStatus, TaskPriority

if TYPE_CHECKING:
    from src.agents.base import BaseAgent, LegalDocumentGeneratorAgent, DocumentAnalyzerAgent


class TaskManagerService(AsyncService[Dict[str, Any]]):
    """Service for managing agent tasks."""
    
    def __init__(self):
        super().__init__()
        self.backend_service: Optional[BackendIntegrationService] = None
        self.agents: Dict[AgentType, BaseAgent] = {}
        self.active_tasks: Dict[str, asyncio.Task] = {}
        self.task_metadata: Dict[str, Dict[str, Any]] = {}
    
    async def initialize(self) -> None:
        """Initialize the task manager."""
        await super().initialize()
        
        # Initialize backend service
        self.backend_service = BackendIntegrationService()
        await self.backend_service.initialize()
        
        # Initialize agents
        await self._initialize_agents()
        
        # Start background task cleanup
        asyncio.create_task(self._cleanup_completed_tasks())
    
    async def cleanup(self) -> None:
        """Cleanup the task manager."""
        # Cancel all active tasks
        for task_id, task in self.active_tasks.items():
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
        
        # Cleanup agents
        for agent in self.agents.values():
            await agent.cleanup()
        
        # Cleanup backend service
        if self.backend_service:
            await self.backend_service.cleanup()
        
        await super().cleanup()
    
    async def _initialize_agents(self) -> None:
        """Initialize all available agents."""
        # Import here to avoid circular dependency
        from src.agents import (
            LegalDocumentGeneratorAgent, 
            DocumentAnalyzerAgent,
            DocumentClassifierAgent,
            LegalResearchAgent,
            ContractReviewerAgent
        )
        
        agent_classes = {
            AgentType.LEGAL_DOCUMENT_GENERATOR: LegalDocumentGeneratorAgent,
            AgentType.DOCUMENT_ANALYZER: DocumentAnalyzerAgent,
            AgentType.DOCUMENT_CLASSIFIER: DocumentClassifierAgent,
            AgentType.LEGAL_RESEARCH: LegalResearchAgent,
            AgentType.CONTRACT_REVIEWER: ContractReviewerAgent,
        }
        
        for agent_type, agent_class in agent_classes.items():
            try:
                agent = agent_class()
                await agent.initialize()
                self.agents[agent_type] = agent
                self.logger.info(f"Initialized {agent_type.value} agent")
            except Exception as e:
                self.logger.error(f"Failed to initialize {agent_type.value} agent: {e}")
    
    async def _perform_health_check(self) -> None:
        """Check task manager health."""
        if self.backend_service:
            await self.backend_service.health_check()
        
        for agent_type, agent in self.agents.items():
            try:
                await agent.health_check()
            except Exception as e:
                self.logger.warning(f"Agent {agent_type.value} health check failed: {e}")
    
    async def _get_health_details(self) -> Dict[str, Any]:
        """Get task manager health details."""
        agent_statuses = {}
        for agent_type, agent in self.agents.items():
            try:
                health = await agent.health_check()
                agent_statuses[agent_type.value] = health["status"]
            except Exception:
                agent_statuses[agent_type.value] = "unhealthy"
        
        return {
            "active_tasks": len(self.active_tasks),
            "available_agents": list(self.agents.keys()),
            "agent_statuses": agent_statuses,
            "backend_connected": self.backend_service is not None
        }
    
    async def process(self, input_data: Dict[str, Any]) -> Any:
        """Process a task creation request."""
        return await self.create_task(
            agent_type=input_data["agent_type"],
            input_data=input_data["input_data"],
            user_id=input_data["user_id"],
            case_id=input_data.get("case_id"),
            priority=input_data.get("priority", TaskPriority.NORMAL)
        )
    
    async def create_task(
        self,
        agent_type: AgentType,
        input_data: Dict[str, Any],
        user_id: int,
        case_id: Optional[int] = None,
        priority: TaskPriority = TaskPriority.NORMAL
    ) -> AgentTask:
        """Create and execute a new agent task."""
        
        # Validate agent type
        if agent_type not in self.agents:
            raise AgentError(f"Agent type {agent_type.value} not available")
        
        # Create task in backend
        task = await self.backend_service.create_agent_task(
            agent_type=agent_type,
            task_input=input_data,
            user_id=user_id,
            case_id=case_id,
            metadata={
                "priority": priority.value,
                "created_by_service": "task_manager"
            }
        )
        
        # Execute task asynchronously
        asyncio.create_task(self._execute_task(task))
        
        return task
    
    async def _execute_task(self, task: AgentTask) -> None:
        """Execute an agent task."""
        task_id = str(task.id)
        
        try:
            # Update status to processing
            await self.backend_service.update_task_status(
                task.id, TaskStatus.PROCESSING
            )
            
            # Get the appropriate agent
            agent = self.agents[task.agent_type]
            
            # Store task metadata
            self.task_metadata[task_id] = {
                "started_at": datetime.utcnow(),
                "agent_type": task.agent_type,
                "timeout": self.settings.task_timeout_seconds
            }
            
            # Execute with timeout
            result = await asyncio.wait_for(
                agent.process(task.input_data),
                timeout=self.settings.task_timeout_seconds
            )
            
            # Update task with results
            await self.backend_service.update_task_status(
                task.id,
                TaskStatus.COMPLETED,
                output_data=result,
                progress=100
            )
            
            self.logger.info(f"Task {task_id} completed successfully")
            
        except asyncio.TimeoutError:
            error_msg = f"Task timed out after {self.settings.task_timeout_seconds} seconds"
            await self.backend_service.update_task_status(
                task.id,
                TaskStatus.FAILED,
                error_message=error_msg
            )
            self.logger.error(f"Task {task_id} timed out")
            
        except Exception as e:
            error_msg = f"Task execution failed: {str(e)}"
            await self.backend_service.update_task_status(
                task.id,
                TaskStatus.FAILED,
                error_message=error_msg
            )
            self.logger.error(f"Task {task_id} failed: {e}")
            
        finally:
            # Clean up task metadata
            self.task_metadata.pop(task_id, None)
    
    async def get_task(self, task_id: int) -> Optional[AgentTask]:
        """Get a task by ID."""
        return await self.backend_service.get_agent_task(task_id)
    
    async def get_user_tasks(
        self,
        user_id: int,
        agent_type: Optional[AgentType] = None,
        status: Optional[TaskStatus] = None,
        limit: Optional[int] = None
    ) -> List[AgentTask]:
        """Get tasks for a user."""
        return await self.backend_service.get_user_tasks(
            user_id=user_id,
            agent_type=agent_type,
            status=status,
            limit=limit
        )
    
    async def cancel_task(self, task_id: int) -> bool:
        """Cancel a running task."""
        task_id_str = str(task_id)
        
        # Cancel the asyncio task if it's running
        if task_id_str in self.active_tasks:
            self.active_tasks[task_id_str].cancel()
            self.active_tasks.pop(task_id_str, None)
        
        # Update status in backend
        return await self.backend_service.update_task_status(
            task_id, TaskStatus.CANCELLED
        )
    
    async def get_task_progress(self, task_id: int) -> Dict[str, Any]:
        """Get task progress information."""
        task = await self.get_task(task_id)
        
        if not task:
            raise TaskNotFoundError(str(task_id))
        
        task_id_str = str(task_id)
        metadata = self.task_metadata.get(task_id_str, {})
        
        progress_info = {
            "task_id": task_id,
            "status": task.status.value,
            "agent_type": task.agent_type.value,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "updated_at": task.updated_at.isoformat() if task.updated_at else None,
        }
        
        if metadata:
            started_at = metadata.get("started_at")
            if started_at:
                elapsed = (datetime.utcnow() - started_at).total_seconds()
                timeout = metadata.get("timeout", self.settings.task_timeout_seconds)
                
                progress_info.update({
                    "elapsed_seconds": elapsed,
                    "timeout_seconds": timeout,
                    "progress_percentage": min(100, (elapsed / timeout) * 100)
                })
        
        return progress_info
    
    async def _cleanup_completed_tasks(self) -> None:
        """Background task to cleanup completed tasks."""
        while True:
            try:
                current_time = datetime.utcnow()
                to_remove = []
                
                for task_id, metadata in self.task_metadata.items():
                    started_at = metadata.get("started_at")
                    if started_at:
                        age = current_time - started_at
                        # Clean up tasks older than 1 hour
                        if age > timedelta(hours=1):
                            to_remove.append(task_id)
                
                for task_id in to_remove:
                    self.task_metadata.pop(task_id, None)
                    self.active_tasks.pop(task_id, None)
                
                # Sleep for 5 minutes before next cleanup
                await asyncio.sleep(300)
                
            except Exception as e:
                self.logger.error(f"Task cleanup failed: {e}")
                await asyncio.sleep(60)  # Sleep for 1 minute on error
    
    def get_active_task_count(self) -> int:
        """Get the number of active tasks."""
        return len(self.active_tasks)
    
    def get_agent_status(self, agent_type: AgentType) -> Dict[str, Any]:
        """Get status of a specific agent."""
        if agent_type not in self.agents:
            return {"status": "not_available"}
        
        agent = self.agents[agent_type]
        return {
            "status": "healthy" if agent.is_healthy else "unhealthy",
            "agent_type": agent_type.value,
            "initialized": True
        }
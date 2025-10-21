"""
FastAPI router for V2 API endpoints.
"""
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import StreamingResponse
import json
from datetime import datetime

from src.core.dependencies import get_container
from src.core.exceptions import create_http_exception, AdlaanAgentException
from src.schemas import (
    DocumentGenerationRequest,
    DocumentAnalysisRequest,
    TaskCreateRequest,
    TaskResponse,
    HealthResponse,
    ServiceInfoResponse,
    AgentStatusResponse,
    AgentType,
    TaskStatus
)
from src.services.task_manager import TaskManagerService

router = APIRouter(prefix="/api/v2", tags=["Agent API v2"])


def get_task_manager() -> TaskManagerService:
    """Get task manager service."""
    container = get_container()
    return container.get(TaskManagerService)


@router.get("/", response_model=ServiceInfoResponse)
async def get_service_info():
    """Get service information and available endpoints."""
    from src.core.config import get_settings
    settings = get_settings()
    
    return ServiceInfoResponse(
        name=settings.app_name,
        version=settings.app_version,
        environment=settings.environment.value,
        endpoints={
            "health": "/api/v2/health",
            "generate_document": "/api/v2/documents/generate",
            "analyze_document": "/api/v2/documents/analyze",
            "create_task": "/api/v2/tasks",
            "get_tasks": "/api/v2/tasks/user/{user_id}",
            "task_status": "/api/v2/tasks/{task_id}",
            "cancel_task": "/api/v2/tasks/{task_id}/cancel",
            "agent_status": "/api/v2/agents/{agent_type}/status"
        },
        integrations={
            "backend_api": settings.backend_url,
            "graphql_endpoint": settings.backend_graphql_url
        },
        features=[
            "Legal Document Generation",
            "Document Analysis",
            "Task Management",
            "Real-time Streaming",
            "Health Monitoring",
            "Backend Integration"
        ]
    )


@router.get("/health", response_model=HealthResponse)
async def health_check(task_manager: TaskManagerService = Depends(get_task_manager)):
    """Check service health."""
    try:
        health_data = await task_manager.health_check()
        
        from src.core.config import get_settings
        settings = get_settings()
        
        # Calculate uptime (simplified)
        import time
        uptime = time.time() - getattr(health_check, '_start_time', time.time())
        if not hasattr(health_check, '_start_time'):
            health_check._start_time = time.time()
        
        return HealthResponse(
            status=health_data["status"],
            timestamp=datetime.utcnow(),
            services={
                "task_manager": health_data["status"],
                "backend": "connected" if health_data["backend_connected"] else "disconnected",
                "agents": str(len(health_data["available_agents"]))
            },
            version=settings.app_version,
            uptime_seconds=uptime
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "message": "Health check failed",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )


@router.post("/documents/generate", response_model=TaskResponse)
async def generate_document(
    request: DocumentGenerationRequest,
    user_id: int,  # In practice, extract from JWT token
    background_tasks: BackgroundTasks,
    task_manager: TaskManagerService = Depends(get_task_manager)
):
    """Generate a legal document."""
    try:
        task = await task_manager.create_task(
            agent_type=AgentType.LEGAL_DOCUMENT_GENERATOR,
            input_data={
                "document_type": request.document_type,
                "title": request.title,
                "parameters": request.parameters,
                "jurisdiction": request.parameters.get("jurisdiction", "jordan")
            },
            user_id=user_id,
            case_id=request.case_id,
            priority=request.priority
        )
        
        return TaskResponse(
            id=task.id,
            agent_type=task.agent_type,
            status=task.status,
            input_data=task.input_data,
            metadata=task.metadata,
            case_id=task.case_id,
            created_by=task.created_by,
            created_at=task.created_at,
            updated_at=task.updated_at,
            progress=0
        )
        
    except AdlaanAgentException as e:
        raise create_http_exception(e)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Document generation failed", "error": str(e)}
        )


@router.post("/documents/analyze", response_model=TaskResponse)
async def analyze_document(
    request: DocumentAnalysisRequest,
    user_id: int,  # In practice, extract from JWT token
    task_manager: TaskManagerService = Depends(get_task_manager)
):
    """Analyze a legal document."""
    try:
        task = await task_manager.create_task(
            agent_type=AgentType.DOCUMENT_ANALYZER,
            input_data={
                "document_content": request.document_content,
                "analysis_type": request.analysis_type,
                "parameters": request.parameters
            },
            user_id=user_id,
            case_id=request.case_id
        )
        
        return TaskResponse(
            id=task.id,
            agent_type=task.agent_type,
            status=task.status,
            input_data=task.input_data,
            metadata=task.metadata,
            case_id=task.case_id,
            created_by=task.created_by,
            created_at=task.created_at,
            updated_at=task.updated_at,
            progress=0
        )
        
    except AdlaanAgentException as e:
        raise create_http_exception(e)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Document analysis failed", "error": str(e)}
        )


@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    request: TaskCreateRequest,
    user_id: int,  # In practice, extract from JWT token
    task_manager: TaskManagerService = Depends(get_task_manager)
):
    """Create a generic agent task."""
    try:
        task = await task_manager.create_task(
            agent_type=request.agent_type,
            input_data=request.input_data,
            user_id=user_id,
            case_id=request.case_id,
            priority=request.priority
        )
        
        return TaskResponse(
            id=task.id,
            agent_type=task.agent_type,
            status=task.status,
            input_data=task.input_data,
            metadata=task.metadata,
            case_id=task.case_id,
            created_by=task.created_by,
            created_at=task.created_at,
            updated_at=task.updated_at,
            progress=0
        )
        
    except AdlaanAgentException as e:
        raise create_http_exception(e)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Task creation failed", "error": str(e)}
        )


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    task_manager: TaskManagerService = Depends(get_task_manager)
):
    """Get task status and details."""
    try:
        task = await task_manager.get_task(task_id)
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": f"Task {task_id} not found"}
            )
        
        return TaskResponse(
            id=task.id,
            agent_type=task.agent_type,
            status=task.status,
            input_data=task.input_data,
            output_data=task.output_data,
            error_message=task.error_message,
            metadata=task.metadata,
            case_id=task.case_id,
            document_id=task.document_id,
            created_by=task.created_by,
            created_at=task.created_at,
            updated_at=task.updated_at,
            completed_at=task.completed_at,
            progress=100 if task.status == TaskStatus.COMPLETED else 0
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Failed to get task", "error": str(e)}
        )


@router.get("/tasks/user/{user_id}", response_model=List[TaskResponse])
async def get_user_tasks(
    user_id: int,
    agent_type: Optional[AgentType] = None,
    status: Optional[TaskStatus] = None,
    limit: Optional[int] = 50,
    task_manager: TaskManagerService = Depends(get_task_manager)
):
    """Get tasks for a user."""
    try:
        tasks = await task_manager.get_user_tasks(
            user_id=user_id,
            agent_type=agent_type,
            status=status,
            limit=limit
        )
        
        return [
            TaskResponse(
                id=task.id,
                agent_type=task.agent_type,
                status=task.status,
                input_data=task.input_data,
                output_data=task.output_data,
                error_message=task.error_message,
                metadata=task.metadata,
                case_id=task.case_id,
                document_id=task.document_id,
                created_by=task.created_by,
                created_at=task.created_at,
                updated_at=task.updated_at,
                completed_at=task.completed_at,
                progress=100 if task.status == TaskStatus.COMPLETED else 0
            )
            for task in tasks
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Failed to get user tasks", "error": str(e)}
        )


@router.get("/tasks/{task_id}/progress")
async def get_task_progress(
    task_id: int,
    task_manager: TaskManagerService = Depends(get_task_manager)
):
    """Get detailed task progress information."""
    try:
        progress = await task_manager.get_task_progress(task_id)
        return progress
        
    except AdlaanAgentException as e:
        raise create_http_exception(e)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Failed to get task progress", "error": str(e)}
        )


@router.post("/tasks/{task_id}/cancel")
async def cancel_task(
    task_id: int,
    task_manager: TaskManagerService = Depends(get_task_manager)
):
    """Cancel a running task."""
    try:
        success = await task_manager.cancel_task(task_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": f"Failed to cancel task {task_id}"}
            )
        
        return {"message": f"Task {task_id} cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Failed to cancel task", "error": str(e)}
        )


@router.get("/agents/{agent_type}/status", response_model=AgentStatusResponse)
async def get_agent_status(
    agent_type: AgentType,
    task_manager: TaskManagerService = Depends(get_task_manager)
):
    """Get status of a specific agent."""
    try:
        status_info = task_manager.get_agent_status(agent_type)
        
        return AgentStatusResponse(
            agent_type=agent_type,
            status=status_info["status"],
            active_tasks=task_manager.get_active_task_count(),
            total_tasks=0,  # Would need to track this
            last_activity=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Failed to get agent status", "error": str(e)}
        )


@router.get("/tasks/{task_id}/stream")
async def stream_task_progress(
    task_id: int,
    task_manager: TaskManagerService = Depends(get_task_manager)
):
    """Stream real-time task progress updates."""
    
    async def generate_progress_stream():
        """Generate server-sent events for task progress."""
        
        # Initial status
        task = await task_manager.get_task(task_id)
        if not task:
            yield f"data: {json.dumps({'error': 'Task not found'})}\n\n"
            return
        
        # Stream progress updates
        while True:
            try:
                progress = await task_manager.get_task_progress(task_id)
                yield f"data: {json.dumps(progress)}\n\n"
                
                # Stop streaming if task is complete
                if progress.get("status") in ["completed", "failed", "cancelled"]:
                    break
                    
                # Wait before next update
                import asyncio
                await asyncio.sleep(1)
                
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                break
    
    return StreamingResponse(
        generate_progress_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )
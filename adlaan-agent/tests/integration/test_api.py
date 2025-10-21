"""
Integration tests for API endpoints.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock

from src.schemas import AgentType, TaskStatus


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    async def test_health_check_success(self, async_client: AsyncClient, mock_task_manager):
        """Test successful health check."""
        mock_task_manager.health_check.return_value = {
            "status": "healthy",
            "backend_connected": True,
            "available_agents": [AgentType.LEGAL_DOCUMENT_GENERATOR],
            "agent_statuses": {"legal_document_generator": "healthy"}
        }
        
        response = await async_client.get("/api/v2/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "services" in data
        assert "version" in data
        assert "uptime_seconds" in data
    
    async def test_legacy_health_endpoint(self, async_client: AsyncClient):
        """Test legacy health endpoint."""
        response = await async_client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestDocumentGeneration:
    """Test document generation endpoints."""
    
    async def test_generate_document_success(self, async_client: AsyncClient, mock_task_manager):
        """Test successful document generation."""
        from src.integrations.backend_service import AgentTask
        from datetime import datetime
        
        mock_task = AgentTask(
            id=1,
            agent_type=AgentType.LEGAL_DOCUMENT_GENERATOR,
            status=TaskStatus.PENDING,
            input_data={"document_type": "contract"},
            created_by=1,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        mock_task_manager.create_task.return_value = mock_task
        
        request_data = {
            "document_type": "employment_contract",
            "title": "Test Contract",
            "parameters": {
                "employee_name": "John Doe",
                "position": "Developer"
            }
        }
        
        response = await async_client.post(
            "/api/v2/documents/generate?user_id=1",
            json=request_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["agent_type"] == AgentType.LEGAL_DOCUMENT_GENERATOR.value
        assert data["status"] == TaskStatus.PENDING.value
    
    async def test_generate_document_invalid_request(self, async_client: AsyncClient):
        """Test document generation with invalid request."""
        request_data = {
            "title": "Test Contract"
            # Missing required document_type
        }
        
        response = await async_client.post(
            "/api/v2/documents/generate?user_id=1",
            json=request_data
        )
        
        assert response.status_code == 422


class TestTaskManagement:
    """Test task management endpoints."""
    
    async def test_get_task_success(self, async_client: AsyncClient, mock_task_manager):
        """Test successful task retrieval."""
        from src.integrations.backend_service import AgentTask
        from datetime import datetime
        
        mock_task = AgentTask(
            id=1,
            agent_type=AgentType.LEGAL_DOCUMENT_GENERATOR,
            status=TaskStatus.COMPLETED,
            input_data={"document_type": "contract"},
            output_data={"document": "Generated content"},
            created_by=1,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            completed_at=datetime.utcnow()
        )
        
        mock_task_manager.get_task.return_value = mock_task
        
        response = await async_client.get("/api/v2/tasks/1")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["status"] == TaskStatus.COMPLETED.value
        assert "output_data" in data
    
    async def test_get_task_not_found(self, async_client: AsyncClient, mock_task_manager):
        """Test task not found."""
        mock_task_manager.get_task.return_value = None
        
        response = await async_client.get("/api/v2/tasks/999")
        
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"]["message"]
    
    async def test_get_user_tasks(self, async_client: AsyncClient, mock_task_manager):
        """Test getting user tasks."""
        from src.integrations.backend_service import AgentTask
        from datetime import datetime
        
        mock_tasks = [
            AgentTask(
                id=1,
                agent_type=AgentType.LEGAL_DOCUMENT_GENERATOR,
                status=TaskStatus.COMPLETED,
                created_by=1,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            ),
            AgentTask(
                id=2,
                agent_type=AgentType.DOCUMENT_ANALYZER,
                status=TaskStatus.PENDING,
                created_by=1,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
        ]
        
        mock_task_manager.get_user_tasks.return_value = mock_tasks
        
        response = await async_client.get("/api/v2/tasks/user/1")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["id"] == 1
        assert data[1]["id"] == 2
    
    async def test_cancel_task_success(self, async_client: AsyncClient, mock_task_manager):
        """Test successful task cancellation."""
        mock_task_manager.cancel_task.return_value = True
        
        response = await async_client.post("/api/v2/tasks/1/cancel")
        
        assert response.status_code == 200
        data = response.json()
        assert "cancelled successfully" in data["message"]
    
    async def test_cancel_task_failure(self, async_client: AsyncClient, mock_task_manager):
        """Test task cancellation failure."""
        mock_task_manager.cancel_task.return_value = False
        
        response = await async_client.post("/api/v2/tasks/1/cancel")
        
        assert response.status_code == 400
        data = response.json()
        assert "Failed to cancel" in data["detail"]["message"]


class TestServiceInfo:
    """Test service information endpoints."""
    
    async def test_root_endpoint(self, async_client: AsyncClient):
        """Test root endpoint."""
        response = await async_client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "running"
    
    async def test_service_info_endpoint(self, async_client: AsyncClient):
        """Test service info endpoint."""
        response = await async_client.get("/api/v2/")
        
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "endpoints" in data
        assert "integrations" in data
        assert "features" in data
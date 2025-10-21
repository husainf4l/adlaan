"""
Test configuration and fixtures.
"""
import pytest
import asyncio
from typing import AsyncGenerator
from unittest.mock import Mock, AsyncMock

from fastapi.testclient import TestClient
from httpx import AsyncClient

from src.main import create_app
from src.core.config import get_settings
from src.core.dependencies import get_container
from src.services.task_manager import TaskManagerService
from src.integrations.backend_service import BackendIntegrationService


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_settings():
    """Mock settings for testing."""
    settings = get_settings()
    settings.environment = "testing"
    settings.database_url = "sqlite:///:memory:"
    settings.backend_url = "http://test-backend:3000"
    settings.openai_api_key = "test-key"
    return settings


@pytest.fixture
def mock_backend_service():
    """Mock backend service."""
    service = Mock(spec=BackendIntegrationService)
    service.initialize = AsyncMock()
    service.cleanup = AsyncMock()
    service.health_check = AsyncMock(return_value={"status": "healthy"})
    service.create_agent_task = AsyncMock()
    service.update_task_status = AsyncMock(return_value=True)
    service.get_agent_task = AsyncMock()
    service.get_user_tasks = AsyncMock(return_value=[])
    return service


@pytest.fixture
def mock_task_manager(mock_backend_service):
    """Mock task manager service."""
    manager = Mock(spec=TaskManagerService)
    manager.initialize = AsyncMock()
    manager.cleanup = AsyncMock()
    manager.health_check = AsyncMock(return_value={"status": "healthy"})
    manager.create_task = AsyncMock()
    manager.get_task = AsyncMock()
    manager.get_user_tasks = AsyncMock(return_value=[])
    manager.cancel_task = AsyncMock(return_value=True)
    manager.get_task_progress = AsyncMock()
    manager.get_active_task_count = Mock(return_value=0)
    manager.get_agent_status = Mock(return_value={"status": "healthy"})
    return manager


@pytest.fixture
def app_with_mocks(mock_task_manager, mock_backend_service):
    """Create app with mocked dependencies."""
    app = create_app()
    
    # Override dependencies
    container = get_container()
    container.register_singleton(TaskManagerService, mock_task_manager)
    container.register_singleton(BackendIntegrationService, mock_backend_service)
    
    return app


@pytest.fixture
def client(app_with_mocks):
    """Test client."""
    return TestClient(app_with_mocks)


@pytest.fixture
async def async_client(app_with_mocks) -> AsyncGenerator[AsyncClient, None]:
    """Async test client."""
    async with AsyncClient(app=app_with_mocks, base_url="http://test") as ac:
        yield ac
"""
Base service class for all business logic services.
"""
from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Optional, List, Dict, Any
from datetime import datetime

from src.core.logging import get_logger
from src.core.config import get_settings
from src.core.exceptions import ServiceUnavailableError

T = TypeVar('T')


class BaseService(ABC, Generic[T]):
    """Base service class with common functionality."""
    
    def __init__(self):
        self.logger = get_logger(self.__class__.__name__)
        self.settings = get_settings()
        self._is_healthy = True
        self._last_health_check = datetime.utcnow()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check service health."""
        try:
            await self._perform_health_check()
            self._is_healthy = True
            self._last_health_check = datetime.utcnow()
            
            return {
                "status": "healthy",
                "service": self.__class__.__name__,
                "timestamp": self._last_health_check.isoformat(),
                "details": await self._get_health_details()
            }
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            self._is_healthy = False
            raise ServiceUnavailableError(f"{self.__class__.__name__} health check failed: {str(e)}")
    
    async def _perform_health_check(self) -> None:
        """Perform service-specific health check. Override in subclasses."""
        pass
    
    async def _get_health_details(self) -> Dict[str, Any]:
        """Get service-specific health details. Override in subclasses."""
        return {}
    
    @property
    def is_healthy(self) -> bool:
        """Check if service is healthy."""
        return self._is_healthy
    
    def ensure_healthy(self) -> None:
        """Ensure service is healthy, raise exception if not."""
        if not self._is_healthy:
            raise ServiceUnavailableError(f"{self.__class__.__name__} is not healthy")


class AsyncService(BaseService[T]):
    """Base class for async services."""
    
    async def __aenter__(self):
        """Async context manager entry."""
        await self.initialize()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.cleanup()
    
    async def initialize(self) -> None:
        """Initialize the service. Override in subclasses."""
        self.logger.info(f"Initializing {self.__class__.__name__}")
    
    async def cleanup(self) -> None:
        """Cleanup the service. Override in subclasses."""
        self.logger.info(f"Cleaning up {self.__class__.__name__}")
    
    @abstractmethod
    async def process(self, input_data: T) -> Any:
        """Process input data. Must be implemented by subclasses."""
        pass
"""
Dependency injection container for the Adlaan Agent microservice.
Manages dependencies and provides dependency injection functionality.
"""
from typing import Dict, Any, Optional, Type, TypeVar, Generic, Callable
from functools import lru_cache
import asyncio
from contextlib import asynccontextmanager

from src.core.config import get_settings
from src.core.logging import get_logger

T = TypeVar('T')
logger = get_logger(__name__)


class Container:
    """Dependency injection container."""
    
    def __init__(self):
        self._services: Dict[str, Any] = {}
        self._factories: Dict[str, Callable] = {}
        self._singletons: Dict[str, Any] = {}
        self._settings = get_settings()
    
    def register_singleton(self, service_type: Type[T], instance: T) -> None:
        """Register a singleton instance."""
        key = self._get_key(service_type)
        self._singletons[key] = instance
        logger.debug(f"Registered singleton: {key}")
    
    def register_factory(self, service_type: Type[T], factory: Callable[[], T]) -> None:
        """Register a factory function."""
        key = self._get_key(service_type)
        self._factories[key] = factory
        logger.debug(f"Registered factory: {key}")
    
    def register_service(self, service_type: Type[T], implementation: Type[T]) -> None:
        """Register a service implementation."""
        key = self._get_key(service_type)
        self._services[key] = implementation
        logger.debug(f"Registered service: {key}")
    
    def get(self, service_type: Type[T]) -> T:
        """Get a service instance."""
        key = self._get_key(service_type)
        
        # Check singletons first
        if key in self._singletons:
            return self._singletons[key]
        
        # Check factories
        if key in self._factories:
            instance = self._factories[key]()
            return instance
        
        # Check registered services
        if key in self._services:
            implementation = self._services[key]
            instance = implementation()
            return instance
        
        # Try to instantiate directly
        try:
            return service_type()
        except Exception as e:
            logger.error(f"Failed to create instance of {key}: {e}")
            raise ValueError(f"Cannot resolve dependency: {key}")
    
    async def get_async(self, service_type: Type[T]) -> T:
        """Get a service instance asynchronously."""
        # For now, just call the sync version
        # This can be extended for async factories
        return self.get(service_type)
    
    def _get_key(self, service_type: Type) -> str:
        """Get the key for a service type."""
        if hasattr(service_type, '__name__'):
            return service_type.__name__
        return str(service_type)


# Global container instance
_container: Optional[Container] = None


def get_container() -> Container:
    """Get the global dependency injection container."""
    global _container
    if _container is None:
        _container = Container()
        _setup_default_dependencies()
    return _container


def _setup_default_dependencies() -> None:
    """Set up default dependencies."""
    container = _container
    settings = get_settings()
    
    # Register settings as singleton
    container.register_singleton(type(settings), settings)
    
    logger.info("Default dependencies registered")


@asynccontextmanager
async def get_service(service_type: Type[T]):
    """Async context manager for getting services."""
    container = get_container()
    service = await container.get_async(service_type)
    try:
        if hasattr(service, '__aenter__'):
            async with service as ctx_service:
                yield ctx_service
        else:
            yield service
    finally:
        if hasattr(service, 'cleanup'):
            await service.cleanup()


class Dependency(Generic[T]):
    """Dependency marker for FastAPI dependencies."""
    
    def __init__(self, service_type: Type[T]):
        self.service_type = service_type
    
    def __call__(self) -> T:
        """Get the service instance."""
        container = get_container()
        return container.get(self.service_type)


def dependency(service_type: Type[T]) -> Dependency[T]:
    """Create a dependency for FastAPI."""
    return Dependency(service_type)


# Dependency functions for FastAPI
def get_settings_dependency():
    """Get settings dependency."""
    return get_container().get(type(get_settings()))


async def get_async_dependency(service_type: Type[T]) -> T:
    """Get an async dependency."""
    container = get_container()
    return await container.get_async(service_type)
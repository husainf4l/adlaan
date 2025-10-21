"""
Main application module for the Adlaan Agent microservice.
"""
import asyncio
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from src.core.config import get_settings
from src.core.logging import setup_logging, get_logger
from src.core.dependencies import get_container
from src.core.exceptions import AdlaanAgentException, create_http_exception
from src.api import v2_router
from src.services.task_manager import TaskManagerService
from src.integrations.backend_service import BackendIntegrationService

# Set up logging
setup_logging()
logger = get_logger(__name__)

# Get settings
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    logger.info("Starting Adlaan Agent microservice")
    
    # Initialize dependency container
    container = get_container()
    
    # Initialize and register services
    task_manager = TaskManagerService()
    backend_service = BackendIntegrationService()
    
    try:
        await task_manager.initialize()
        await backend_service.initialize()
        
        # Register services in container
        container.register_singleton(TaskManagerService, task_manager)
        container.register_singleton(BackendIntegrationService, backend_service)
        
        logger.info("Services initialized successfully")
        
        yield
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise
    
    finally:
        # Cleanup services
        logger.info("Shutting down services")
        try:
            await task_manager.cleanup()
            await backend_service.cleanup()
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(
        title=settings.app_name,
        description="AI-powered legal document creation and consultation microservice",
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
        debug=settings.debug
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API routers
    app.include_router(v2_router)
    
    # Mount static files and templates
    app.mount("/static", StaticFiles(directory="static"), name="static")
    
    # Global exception handler
    @app.exception_handler(AdlaanAgentException)
    async def agent_exception_handler(request: Request, exc: AdlaanAgentException):
        """Handle custom agent exceptions."""
        logger.error(f"Agent exception: {exc.message}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "message": exc.message,
                "details": exc.details,
                "type": exc.__class__.__name__,
            }
        )
    
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions."""
        logger.error(f"Unexpected error: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal server error",
                "details": {"error": str(exc)} if settings.debug else {},
                "type": "InternalServerError",
            }
        )
    
    # Root endpoint
    @app.get("/")
    async def root():
        """Get service information."""
        return {
            "service": settings.app_name,
            "version": settings.app_version,
            "status": "running",
            "environment": settings.environment.value,
            "endpoints": {
                "health": "/api/v2/health",
                "docs": "/docs",
                "redoc": "/redoc"
            },
            "features": [
                "Legal Document Generation",
                "Document Analysis", 
                "Task Management",
                "Real-time Streaming",
                "Backend Integration"
            ]
        }
    
    # Legacy endpoints for compatibility
    @app.get("/health")
    async def legacy_health():
        """Legacy health check endpoint."""
        return {"status": "healthy", "message": "Use /api/v2/health for detailed health info"}
    
    return app


# Create the application instance
app = create_app()
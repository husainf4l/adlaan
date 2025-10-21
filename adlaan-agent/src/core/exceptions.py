"""
Custom exceptions for the Adlaan Agent microservice.
Provides structured error handling with proper HTTP status codes.
"""
from typing import Optional, Dict, Any
from fastapi import HTTPException
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_408_REQUEST_TIMEOUT,
    HTTP_409_CONFLICT,
    HTTP_422_UNPROCESSABLE_ENTITY,
    HTTP_500_INTERNAL_SERVER_ERROR,
    HTTP_502_BAD_GATEWAY,
    HTTP_503_SERVICE_UNAVAILABLE,
)


class AdlaanAgentException(Exception):
    """Base exception for Adlaan Agent."""
    
    def __init__(
        self,
        message: str,
        status_code: int = HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AdlaanAgentException):
    """Validation error."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, HTTP_422_UNPROCESSABLE_ENTITY, details)


class AuthenticationError(AdlaanAgentException):
    """Authentication error."""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, HTTP_401_UNAUTHORIZED)


class AuthorizationError(AdlaanAgentException):
    """Authorization error."""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, HTTP_403_FORBIDDEN)


class NotFoundError(AdlaanAgentException):
    """Resource not found error."""
    
    def __init__(self, resource: str, identifier: str):
        message = f"{resource} with identifier '{identifier}' not found"
        super().__init__(message, HTTP_404_NOT_FOUND)


class ConflictError(AdlaanAgentException):
    """Conflict error."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, HTTP_409_CONFLICT, details)


class AgentError(AdlaanAgentException):
    """AI Agent processing error."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, HTTP_500_INTERNAL_SERVER_ERROR, details)


class BackendConnectionError(AdlaanAgentException):
    """Backend connection error."""
    
    def __init__(self, message: str = "Failed to connect to backend"):
        super().__init__(message, HTTP_502_BAD_GATEWAY)


class ServiceUnavailableError(AdlaanAgentException):
    """Service unavailable error."""
    
    def __init__(self, message: str = "Service temporarily unavailable"):
        super().__init__(message, HTTP_503_SERVICE_UNAVAILABLE)


class OpenAIError(AdlaanAgentException):
    """OpenAI API error."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, HTTP_502_BAD_GATEWAY, details)


class TaskTimeoutError(AdlaanAgentException):
    """Task timeout error."""
    
    def __init__(self, task_id: str, timeout_seconds: int):
        message = f"Task {task_id} timed out after {timeout_seconds} seconds"
        super().__init__(message, HTTP_408_REQUEST_TIMEOUT)


class TaskNotFoundError(NotFoundError):
    """Task not found error."""
    
    def __init__(self, task_id: str):
        super().__init__("Task", task_id)


class DocumentGenerationError(AgentError):
    """Document generation error."""
    
    def __init__(self, message: str, document_type: str):
        details = {"document_type": document_type}
        super().__init__(f"Document generation failed: {message}", details)


def create_http_exception(exc: AdlaanAgentException) -> HTTPException:
    """Convert AdlaanAgentException to HTTPException."""
    return HTTPException(
        status_code=exc.status_code,
        detail={
            "message": exc.message,
            "details": exc.details,
            "type": exc.__class__.__name__,
        },
    )
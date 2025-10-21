"""
Pydantic schemas for request/response models.
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
from enum import Enum


class AgentType(str, Enum):
    """Available agent types."""
    LEGAL_DOCUMENT_GENERATOR = "legal_document_generator"
    DOCUMENT_ANALYZER = "document_analyzer"
    DOCUMENT_CLASSIFIER = "document_classifier"
    LEGAL_RESEARCH = "legal_research"
    CONTRACT_REVIEWER = "contract_reviewer"


class TaskStatus(str, Enum):
    """Task status values."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    """Task priority levels."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


# Request Schemas
class DocumentGenerationRequest(BaseModel):
    """Request schema for document generation."""
    document_type: str = Field(..., description="Type of document to generate")
    title: str = Field(..., description="Document title")
    parameters: Dict[str, Any] = Field(..., description="Document parameters")
    case_id: Optional[int] = Field(None, description="Related case ID")
    priority: TaskPriority = Field(TaskPriority.NORMAL, description="Task priority")
    
    class Config:
        schema_extra = {
            "example": {
                "document_type": "employment_contract",
                "title": "Employment Agreement - John Doe",
                "parameters": {
                    "employee_name": "John Doe",
                    "position": "Software Developer",
                    "salary": 75000,
                    "start_date": "2025-01-01",
                    "department": "Engineering"
                },
                "case_id": 123,
                "priority": "normal"
            }
        }


class DocumentAnalysisRequest(BaseModel):
    """Request schema for document analysis."""
    document_content: str = Field(..., description="Document content to analyze")
    analysis_type: str = Field(..., description="Type of analysis to perform")
    parameters: Optional[Dict[str, Any]] = Field({}, description="Analysis parameters")
    case_id: Optional[int] = Field(None, description="Related case ID")
    
    class Config:
        schema_extra = {
            "example": {
                "document_content": "This is a sample contract...",
                "analysis_type": "risk_assessment",
                "parameters": {
                    "jurisdiction": "jordan",
                    "focus_areas": ["liability", "termination", "confidentiality"]
                },
                "case_id": 123
            }
        }


class TaskCreateRequest(BaseModel):
    """Request schema for creating a task."""
    agent_type: AgentType = Field(..., description="Type of agent to use")
    input_data: Dict[str, Any] = Field(..., description="Input data for the task")
    case_id: Optional[int] = Field(None, description="Related case ID")
    priority: TaskPriority = Field(TaskPriority.NORMAL, description="Task priority")
    metadata: Optional[Dict[str, Any]] = Field({}, description="Additional metadata")


# Response Schemas
class TaskResponse(BaseModel):
    """Response schema for task information."""
    id: int = Field(..., description="Task ID")
    agent_type: AgentType = Field(..., description="Agent type")
    status: TaskStatus = Field(..., description="Current status")
    input_data: Optional[Dict[str, Any]] = Field(None, description="Input data")
    output_data: Optional[Dict[str, Any]] = Field(None, description="Output data")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    progress: int = Field(0, description="Progress percentage (0-100)")
    metadata: Optional[Dict[str, Any]] = Field({}, description="Task metadata")
    case_id: Optional[int] = Field(None, description="Related case ID")
    document_id: Optional[int] = Field(None, description="Generated document ID")
    created_by: int = Field(..., description="User ID who created the task")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    
    class Config:
        orm_mode = True


class DocumentResponse(BaseModel):
    """Response schema for generated documents."""
    id: int = Field(..., description="Document ID")
    title: str = Field(..., description="Document title")
    content: str = Field(..., description="Document content")
    document_type: str = Field(..., description="Document type")
    metadata: Optional[Dict[str, Any]] = Field({}, description="Document metadata")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    class Config:
        orm_mode = True


class HealthResponse(BaseModel):
    """Response schema for health check."""
    status: str = Field(..., description="Overall health status")
    timestamp: datetime = Field(..., description="Check timestamp")
    services: Dict[str, str] = Field(..., description="Service statuses")
    version: str = Field(..., description="Application version")
    uptime_seconds: float = Field(..., description="Uptime in seconds")


class ErrorResponse(BaseModel):
    """Response schema for errors."""
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field({}, description="Error details")
    type: str = Field(..., description="Error type")
    timestamp: datetime = Field(..., description="Error timestamp")


class AgentStatusResponse(BaseModel):
    """Response schema for agent status."""
    agent_type: AgentType = Field(..., description="Agent type")
    status: str = Field(..., description="Agent status")
    active_tasks: int = Field(..., description="Number of active tasks")
    total_tasks: int = Field(..., description="Total tasks processed")
    last_activity: Optional[datetime] = Field(None, description="Last activity timestamp")


class ServiceInfoResponse(BaseModel):
    """Response schema for service information."""
    name: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")
    environment: str = Field(..., description="Environment")
    endpoints: Dict[str, str] = Field(..., description="Available endpoints")
    integrations: Dict[str, str] = Field(..., description="Integration endpoints")
    features: List[str] = Field(..., description="Available features")


# Streaming Response Schemas
class StreamingUpdate(BaseModel):
    """Schema for streaming updates."""
    type: str = Field(..., description="Update type")
    message: str = Field(..., description="Update message")
    data: Optional[Dict[str, Any]] = Field({}, description="Update data")
    timestamp: datetime = Field(..., description="Update timestamp")
    progress: Optional[int] = Field(None, description="Progress percentage")


class AgentProgressUpdate(StreamingUpdate):
    """Schema for agent progress updates."""
    agent_name: str = Field(..., description="Agent name")
    stage: str = Field(..., description="Current processing stage")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")


# Pagination Schemas
class PaginationParams(BaseModel):
    """Schema for pagination parameters."""
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")
    sort_by: Optional[str] = Field("created_at", description="Sort field")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$", description="Sort order")


class PaginatedResponse(BaseModel):
    """Schema for paginated responses."""
    items: List[Any] = Field(..., description="Items in current page")
    total_count: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Items per page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there's a next page")
    has_previous: bool = Field(..., description="Whether there's a previous page")
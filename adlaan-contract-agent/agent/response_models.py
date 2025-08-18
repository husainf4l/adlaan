"""
Standardized response models for the Adlaan Contract Agent API.
"""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel
import uuid
import time


class AgentEvent(BaseModel):
    """Agent event structure for streaming responses."""

    event: str  # e.g., "MESSAGE_COT", "SEARCH_START", "CONTRACT_GENERATION"
    nodeId: str  # e.g., "COT", "SEARCH", "CONTRACT_ANALYSIS"
    timestamp: int  # Unix timestamp in milliseconds
    message: Dict[str, Any]  # Contains tool, action, param


class ChunkData(BaseModel):
    """Individual chunk in the streaming response."""

    chunkId: str
    error: bool = False
    code: int = 0
    outlineComplete: bool = False
    messageId: str
    agentEvent: str  # JSON string of AgentEvent
    canAddToNote: bool = False


class StandardResponse(BaseModel):
    """Standard API response format."""

    data: List[ChunkData]


def create_agent_event(
    event: str, node_id: str, tool: str, action: str, param: str, **kwargs
) -> str:
    """
    Create an agent event JSON string.

    Args:
        event: Event type (e.g., "MESSAGE_COT", "SEARCH_START")
        node_id: Node identifier (e.g., "COT", "SEARCH")
        tool: Tool name (e.g., "COT", "GOOGLE_SEARCH")
        action: Action description (e.g., "💭 Thought Process")
        param: Parameter or description
        **kwargs: Additional message fields

    Returns:
        JSON string representation of the agent event
    """
    agent_event = AgentEvent(
        event=event,
        nodeId=node_id,
        timestamp=int(time.time() * 1000),  # Current timestamp in milliseconds
        message={"tool": tool, "action": action, "param": param, **kwargs},
    )
    return agent_event.model_dump_json()


def create_chunk_data(
    event: str,
    node_id: str,
    tool: str,
    action: str,
    param: str,
    message_id: Optional[str] = None,
    chunk_id: Optional[str] = None,
    error: bool = False,
    code: int = 0,
    outline_complete: bool = False,
    can_add_to_note: bool = False,
    **kwargs
) -> ChunkData:
    """
    Create a standardized chunk data object.

    Args:
        event: Event type
        node_id: Node identifier
        tool: Tool name
        action: Action description
        param: Parameter or description
        message_id: Optional message ID
        chunk_id: Optional chunk ID
        error: Whether this chunk represents an error
        code: Response code
        outline_complete: Whether outline is complete
        can_add_to_note: Whether this can be added to notes
        **kwargs: Additional message fields

    Returns:
        ChunkData object
    """
    return ChunkData(
        chunkId=chunk_id or str(uuid.uuid4()),
        error=error,
        code=code,
        outlineComplete=outline_complete,
        messageId=message_id or str(uuid.uuid4()),
        agentEvent=create_agent_event(event, node_id, tool, action, param, **kwargs),
        canAddToNote=can_add_to_note,
    )


def create_standard_response(chunks: List[ChunkData]) -> StandardResponse:
    """
    Create a standard API response with multiple chunks.

    Args:
        chunks: List of chunk data objects

    Returns:
        StandardResponse object
    """
    return StandardResponse(data=chunks)


# Pre-defined event types and node IDs
class EventTypes:
    """Standard event types."""

    MESSAGE_COT = "MESSAGE_COT"
    SEARCH_START = "SEARCH_START"
    SEARCH_COMPLETE = "SEARCH_COMPLETE"
    CONTRACT_GENERATION = "CONTRACT_GENERATION"
    CONTRACT_ANALYSIS = "CONTRACT_ANALYSIS"
    VALIDATION_START = "VALIDATION_START"
    VALIDATION_COMPLETE = "VALIDATION_COMPLETE"
    ERROR = "ERROR"


class NodeIds:
    """Standard node identifiers."""

    COT = "COT"  # Chain of Thought
    SEARCH = "SEARCH"
    CONTRACT = "CONTRACT"
    VALIDATION = "VALIDATION"
    CHAT = "CHAT"


class Tools:
    """Standard tool names."""

    COT = "COT"
    GOOGLE_SEARCH = "GOOGLE_SEARCH"
    CONTRACT_GENERATOR = "CONTRACT_GENERATOR"
    CONTENT_VALIDATOR = "CONTENT_VALIDATOR"
    CHAT_PROCESSOR = "CHAT_PROCESSOR"


class Actions:
    """Standard action descriptions."""

    THINKING = "💭 Thought Process"
    SEARCHING = "🔍 Searching"
    GENERATING = "📝 Generating Contract"
    ANALYZING = "🔍 Analyzing Content"
    VALIDATING = "✅ Validating"
    PROCESSING = "⚙️ Processing"
    COMPLETED = "✅ Completed"
    ERROR = "❌ Error"

"""
Contract-specific types and structures for the Adlaan Contract Agent.
Defines contract content types, sections, and rendering metadata.
"""

from typing import Dict, List, Optional, Any, Literal
from pydantic import BaseModel
from datetime import datetime
import json

# Contract content types
ContractContentType = Literal[
    "contract_header",
    "contract_body",
    "contract_clause",
    "contract_signature",
    "contract_terms",
    "contract_metadata",
    "text",
    "analysis",
]


class ContractSection(BaseModel):
    """A section within a contract document."""

    section_id: str
    section_type: ContractContentType
    title: str
    content: str
    order: int
    page_number: Optional[int] = None
    metadata: Dict[str, Any] = {}


class ContractMetadata(BaseModel):
    """Metadata for contract document."""

    contract_id: str
    contract_type: str  # e.g., "employment", "service", "lease"
    parties: List[str] = []
    created_at: datetime
    language: str = "english"  # "english", "arabic", "french", etc.
    jurisdiction: str = ""
    total_pages: int = 1


class ContractDelta(BaseModel):
    """Represents a streaming update to contract content."""

    operation: Literal["add", "replace", "append", "patch"]
    path: str  # JSON pointer path like "/sections/0/content"
    value: Any
    section_id: Optional[str] = None
    content_type: ContractContentType = "text"


class StreamEvent(BaseModel):
    """Structured streaming event for contract generation."""

    event_type: Literal[
        "delta_encoding", "delta", "contract_metadata", "page_break", "complete", "error"
    ]
    data: Dict[str, Any]
    timestamp: datetime = None

    def __init__(self, **data):
        if data.get("timestamp") is None:
            data["timestamp"] = datetime.now()
        super().__init__(**data)


class ContractDocument(BaseModel):
    """Complete contract document structure."""

    metadata: ContractMetadata
    sections: List[ContractSection] = []
    current_page: int = 1

    def add_section(self, section: ContractSection):
        """Add a new section to the contract."""
        self.sections.append(section)

    def get_sections_by_type(
        self, content_type: ContractContentType
    ) -> List[ContractSection]:
        """Get all sections of a specific type."""
        return [s for s in self.sections if s.section_type == content_type]

    def to_sse_format(self) -> str:
        """Convert to Server-Sent Events format."""
        return f"data: {self.model_dump_json()}\n\n"


def create_contract_delta(
    operation: str,
    path: str,
    value: Any,
    content_type: ContractContentType = "text",
    section_id: Optional[str] = None,
) -> ContractDelta:
    """Helper to create contract delta objects."""
    return ContractDelta(
        operation=operation,
        path=path,
        value=value,
        content_type=content_type,
        section_id=section_id,
    )


def create_stream_event(event_type: str, data: Dict[str, Any]) -> str:
    """Create a properly formatted SSE event."""
    event = StreamEvent(event_type=event_type, data=data)

    lines = []
    if event_type != "delta":
        lines.append(f"event: {event_type}")

    # Format the data as JSON
    data_json = json.dumps(data, default=str, ensure_ascii=False)
    lines.append(f"data: {data_json}")
    lines.append("")  # Empty line to complete the event

    return "\n".join(lines)

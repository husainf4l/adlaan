"""
State management for the contract agent.

Defines the core state structure that flows through the agent workflow.
"""

from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict


class ContractAgentState(TypedDict):
    """
    State object that flows through the contract generation workflow.

    This represents the complete state of a contract generation session,
    optimized for streaming responses and interactive client information gathering.
    """

    # Core conversation state
    messages: List[Dict[str, Any]]
    user_query: str

    # Client information gathering
    client_info: Dict[str, Any]  # Collected client information
    missing_info: List[str]  # Information still needed
    questions_asked: List[str]  # Track what we've already asked

    # Contract generation context
    contract_type: Optional[str]  # e.g., "employment", "service", "sale"
    jurisdiction: Optional[str]  # "jordan", "ksa", "dubai"
    legal_requirements: Dict[str, Any]  # Jurisdiction-specific requirements
    
    # Contract building
    contract_clauses: List[Dict[str, Any]]  # Generated clauses
    generated_contract: Optional[str]  # Final contract text
    contract_sections: Dict[str, str]  # Sections being built

    # Streaming state
    current_step: str
    processing_status: str
    stream_buffer: List[str]  # For accumulating streaming responses

    # Workflow control
    needs_more_info: bool
    ready_to_generate: bool
    generation_complete: bool

    # Tool outputs and intermediate results
    tool_outputs: Dict[str, Any]

    # Error handling
    errors: List[str]

    # Session metadata
    session_id: Optional[str]
    user_id: Optional[str]

    # Streaming metadata
    chunk_count: int
    is_final: bool

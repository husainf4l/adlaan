"""
State management for the contract agent.

Defines the core state structure that flows through the agent workflow.
"""

from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict


class ContractAgentState(TypedDict):
    """
    State object that flows through the agent workflow.

    This represents the complete state of a contract processing session,
    including messages, context, and intermediate results.
    """

    # Core conversation state
    messages: List[Dict[str, Any]]

    # Contract-specific context
    contract_text: Optional[str] = None
    contract_metadata: Optional[Dict[str, Any]] = None

    # Processing state
    current_step: str = "start"
    processing_status: str = "pending"

    # Tool outputs and intermediate results
    tool_outputs: Dict[str, Any] = {}
    analysis_results: Dict[str, Any] = {}

    # Error handling
    errors: List[str] = []

    # Session metadata
    session_id: Optional[str] = None
    user_id: Optional[str] = None

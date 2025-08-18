"""
State definition for the LangGraph agent.
Following LangGraph best practices for state management.
"""

from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    """
    Clean state definition following LangGraph best practices.

    This state contains only the essential fields needed for a streaming agent:
    - messages: Conversation history with automatic message aggregation
    - current_message: The current user message being processed
    - response_buffer: Buffer for streaming response chunks
    - metadata: Optional metadata for the conversation
    """

    # Messages with automatic aggregation using LangGraph's add_messages
    messages: List[BaseMessage]

    # Current message being processed
    current_message: str

    # Buffer for streaming response chunks
    response_buffer: str

    # Optional metadata
    metadata: Optional[Dict[str, Any]]


# Configure message aggregation following LangGraph best practices
AgentState.__annotations__["messages"] = add_messages

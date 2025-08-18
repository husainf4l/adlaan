"""
Improved LangGraph workflow with routing between different processing nodes.
"""

from typing import TypedDict, Literal
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

from agent.state import AgentState
from agent.nodes.chat_node import chat_node, streaming_chat_node
from agent.nodes.contract_analysis_node import contract_analysis_node
from agent.tools.content_utils import is_contract_content


def route_message(state: AgentState) -> Literal["chat", "contract_analysis"]:
    """
    Route messages to appropriate processing node based on content.

    Args:
        state: Current agent state

    Returns:
        Name of the node to route to
    """
    current_message = state["current_message"].lower()

    # Keywords that indicate contract-related requests
    contract_keywords = [
        "عقد",
        "contract",
        "اتفاقية",
        "agreement",
        "شروط",
        "terms",
        "توقيع",
        "signature",
        "بند",
        "clause",
        "قانوني",
        "legal",
    ]

    # Check if message contains contract-related keywords
    for keyword in contract_keywords:
        if keyword in current_message:
            return "contract_analysis"

    # Check if previous context indicates contract work
    metadata = state.get("metadata", {})
    if metadata.get("processing_mode") == "contract_analysis":
        return "contract_analysis"

    # Default to general chat
    return "chat"


def create_enhanced_graph():
    """
    Create an enhanced LangGraph workflow with routing capabilities.

    Returns:
        Compiled graph with routing logic
    """
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("chat", chat_node)
    workflow.add_node("contract_analysis", contract_analysis_node)

    # Add routing logic
    workflow.add_conditional_edges(
        START, route_message, {"chat": "chat", "contract_analysis": "contract_analysis"}
    )

    # Both nodes end the workflow
    workflow.add_edge("chat", END)
    workflow.add_edge("contract_analysis", END)

    return workflow.compile()


def create_streaming_graph():
    """
    Create a streaming-optimized graph for real-time responses.

    Returns:
        Compiled streaming graph
    """
    workflow = StateGraph(AgentState)

    # Add streaming node
    workflow.add_node("streaming_chat", streaming_chat_node)

    # Simple linear flow for streaming
    workflow.add_edge(START, "streaming_chat")
    workflow.add_edge("streaming_chat", END)

    return workflow.compile()


# Create default graph instances
default_graph = create_enhanced_graph()
streaming_graph = create_streaming_graph()


def get_graph(streaming: bool = False):
    """
    Get appropriate graph instance.

    Args:
        streaming: Whether to use streaming graph

    Returns:
        Compiled graph instance
    """
    return streaming_graph if streaming else default_graph

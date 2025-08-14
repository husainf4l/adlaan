"""
Main graph definition for the contract generation agent.

This module defines the LangGraph workflow that orchestrates the entire
contract generation pipeline, connecting nodes and managing state flow.
"""

from typing import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from .core import ContractAgentState
from .nodes import (
    stream_router_node,
    stream_type_identification_node,
    stream_information_gathering_node,
    stream_contract_generation_node,
    stream_final_response_node,
)


def should_continue_workflow(
    state: ContractAgentState,
) -> Literal[
    "stream_type_identification",
    "stream_information_gathering", 
    "stream_contract_generation",
    "stream_final_response",
    "__end__"
]:
    """
    Conditional edge function to determine next step in contract generation.

    Args:
        state: Current agent state

    Returns:
        Next node name based on current workflow state
    """
    if state.get("generation_complete"):
        return "stream_final_response"
    elif state.get("ready_to_generate"):
        return "stream_contract_generation"
    elif state.get("contract_type") and state.get("jurisdiction"):
        return "stream_information_gathering"
    elif not state.get("contract_type"):
        return "stream_type_identification"
    else:
        return "stream_information_gathering"


def should_end_workflow(state: ContractAgentState) -> Literal["__end__", "stream_router"]:
    """
    Determine if workflow should end or continue routing.

    Args:
        state: Current agent state

    Returns:
        End workflow or continue routing
    """
    if state.get("is_final") or state.get("generation_complete"):
        return "__end__"
    else:
        return "stream_router"


def create_streaming_graph() -> StateGraph:
    """
    Create and configure the contract generation workflow graph.

    This function builds the complete LangGraph workflow for contract generation:
    - Interactive information gathering
    - Progressive contract building
    - Real-time streaming responses
    - Legal compliance checking

    Returns:
        Compiled StateGraph ready for contract generation
    """
    # Initialize the graph with our state schema
    workflow = StateGraph(ContractAgentState)

    # Add contract generation nodes to the graph
    workflow.add_node("stream_router", stream_router_node)
    workflow.add_node("stream_type_identification", stream_type_identification_node)
    workflow.add_node("stream_information_gathering", stream_information_gathering_node)
    workflow.add_node("stream_contract_generation", stream_contract_generation_node)
    workflow.add_node("stream_final_response", stream_final_response_node)

    # Define the workflow edges
    workflow.add_edge(START, "stream_router")

    # Add conditional routing after router
    workflow.add_conditional_edges(
        "stream_router",
        should_continue_workflow,
        {
            "stream_type_identification": "stream_type_identification",
            "stream_information_gathering": "stream_information_gathering",
            "stream_contract_generation": "stream_contract_generation", 
            "stream_final_response": "stream_final_response",
            "__end__": END,
        },
    )

    # Type identification flows to information gathering
    workflow.add_edge("stream_type_identification", "stream_information_gathering")

    # Information gathering loops back to router for state evaluation
    workflow.add_conditional_edges(
        "stream_information_gathering",
        should_end_workflow,
        {
            "stream_router": "stream_router",
            "__end__": END,
        },
    )

    # Contract generation flows to final response
    workflow.add_edge("stream_contract_generation", "stream_final_response")

    # Final response ends the workflow
    workflow.add_edge("stream_final_response", END)

    # Configure memory for session persistence
    memory = MemorySaver()
    
    # Compile the graph with checkpointing
    return workflow.compile(checkpointer=memory)

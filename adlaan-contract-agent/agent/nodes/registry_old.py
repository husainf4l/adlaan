"""
Node registry for the contract generation workflow.

Manages and provides access to all streaming nodes used in the
contract generation process.
"""

from typing import List, Dict, Callable, Any

# Import contract generation nodes
from .contract_generation import (
    stream_router_node,
    stream_type_identification_node,
    stream_information_gathering_node,
    stream_contract_generation_node,
    stream_final_response_node,
)


class ContractNodeRegistry:
    """
    Registry for managing contract generation workflow nodes.
    
    Provides organized access to nodes for different phases of contract generation:
    - Type identification and setup
    - Interactive information gathering  
    - Contract generation and validation
    - Final response and completion
    """

    def __init__(self):
        self._nodes = self._initialize_nodes()
        self._node_flow = self._define_node_flow()

    def _initialize_nodes(self) -> Dict[str, Callable]:
        """Initialize all available workflow nodes."""
        return {
            # Core workflow nodes
            "stream_router": stream_router_node,
            "stream_type_identification": stream_type_identification_node,
            "stream_information_gathering": stream_information_gathering_node,
            "stream_contract_generation": stream_contract_generation_node,
            "stream_final_response": stream_final_response_node,
        }

    def _define_node_flow(self) -> Dict[str, List[str]]:
        """Define the flow between nodes."""
        return {
            "stream_router": [
                "stream_type_identification",
                "stream_information_gathering", 
                "stream_contract_generation",
                "stream_final_response"
            ],
            "stream_type_identification": [
                "stream_information_gathering"
            ],
            "stream_information_gathering": [
                "stream_contract_generation"
            ],
            "stream_contract_generation": [
                "stream_final_response"
            ],
            "stream_final_response": []  # Terminal node
        }

    def get_all_nodes(self) -> Dict[str, Callable]:
        """Get all available nodes."""
        return self._nodes.copy()

    def get_node(self, node_name: str) -> Callable:
        """Get a specific node by name."""
        return self._nodes.get(node_name)

    def get_node_flow(self) -> Dict[str, List[str]]:
        """Get the node flow definition."""
        return self._node_flow.copy()

    def get_next_nodes(self, current_node: str) -> List[str]:
        """Get possible next nodes from current node."""
        return self._node_flow.get(current_node, [])

    def get_node_names(self) -> List[str]:
        """Get names of all available nodes."""
        return list(self._nodes.keys())

    def validate_flow(self) -> bool:
        """Validate that all nodes in flow exist."""
        all_nodes = set(self._nodes.keys())
        
        for node, next_nodes in self._node_flow.items():
            if node not in all_nodes:
                return False
            for next_node in next_nodes:
                if next_node not in all_nodes:
                    return False
        
        return True

    def get_entry_node(self) -> str:
        """Get the entry point node for the workflow."""
        return "stream_router"

    def get_terminal_nodes(self) -> List[str]:
        """Get nodes that end the workflow."""
        return [node for node, next_nodes in self._node_flow.items() if not next_nodes]


# Create global registry instance
contract_node_registry = ContractNodeRegistry()


def get_all_nodes() -> Dict[str, Callable]:
    """
    Get all available nodes for the workflow.

    Returns:
        Dictionary mapping node names to node functions
    """
    return _NODE_REGISTRY.copy()


def get_node_by_name(node_name: str) -> Optional[Callable]:
    """
    Get a specific node by name.

    Args:
        node_name: Name of the node to retrieve

    Returns:
        The requested node function or None if not found
    """
    return _NODE_REGISTRY.get(node_name)


def get_streaming_nodes() -> List[str]:
    """
    Get list of streaming-capable node names.

    Returns:
        List of node names that support streaming
    """
    return list(_NODE_REGISTRY.keys())


def get_node_metadata() -> Dict[str, Dict[str, Any]]:
    """
    Get metadata for all available nodes.

    Returns:
        Dictionary mapping node names to their metadata
    """
    metadata = {
        "stream_router": {
            "name": "Stream Router",
            "description": "Routes streaming workflow based on input",
            "input_type": "ContractAgentState",
            "output_type": "ContractAgentState",
            "supports_streaming": True,
        },
        "stream_analysis": {
            "name": "Stream Analysis",
            "description": "Performs contract analysis with streaming updates",
            "input_type": "ContractAgentState",
            "output_type": "ContractAgentState",
            "supports_streaming": True,
        },
        "stream_response": {
            "name": "Stream Response",
            "description": "Generates streaming response from analysis results",
            "input_type": "ContractAgentState",
            "output_type": "ContractAgentState",
            "supports_streaming": True,
        },
    }
    return metadata

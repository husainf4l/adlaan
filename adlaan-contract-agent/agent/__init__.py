"""
Agent package for contract generation workflows.

This package contains the LangGraph-based agent architecture including:
- Graph definition and workflow orchestration
- Node implementations for contract generation
- Tool definitions for legal compliance
- Core infrastructure (state, config, LLM)
"""

from .graph import create_streaming_graph
from .core import ContractAgentState, AgentConfig

__all__ = [
    "create_streaming_graph",
    "ContractAgentState", 
    "AgentConfig",
]

"""
Agents module initialization.
Contains only BaseAgent - individual agents are now self-contained.
"""
from .base_agent import BaseAgent, AgentState

__all__ = [
    "BaseAgent",
    "AgentState"
]
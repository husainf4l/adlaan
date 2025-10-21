"""
Legal Research Agent module.
Self-contained agent with its own tools and nodes.
"""
from .agent import LegalResearchAgent
from . import tools
from . import nodes

__all__ = [
    "LegalResearchAgent",
    "tools",
    "nodes"
]
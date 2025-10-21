"""
Legal Document Generator Agent module.
Self-contained agent with its own tools and nodes.
"""
from .agent import LegalDocumentGeneratorAgent
from . import tools
from . import nodes

__all__ = [
    "LegalDocumentGeneratorAgent",
    "tools",
    "nodes"
]
"""
Document Classifier Agent module.
Self-contained agent with its own tools and nodes.
"""
from .agent import DocumentClassifierAgent
from . import tools
from . import nodes

__all__ = [
    "DocumentClassifierAgent",
    "tools", 
    "nodes"
]
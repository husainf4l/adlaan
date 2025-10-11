"""
Agent nodes for the legal assistant
"""
from .legal_agent import LegalAgentNode
from .thinking_node import ThinkingNode
from .planning_node import PlanningNode
from .document_generator import DocumentGeneratorNode

__all__ = ['LegalAgentNode', 'ThinkingNode', 'PlanningNode', 'DocumentGeneratorNode']
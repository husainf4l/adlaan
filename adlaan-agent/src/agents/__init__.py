"""
Agent module initialization.
Self-contained agent architecture with individual agent directories.
"""
from .legal_document_generator import LegalDocumentGeneratorAgent
from .document_analyzer import DocumentAnalyzerAgent
from .document_classifier import DocumentClassifierAgent
from .legal_research_agent import LegalResearchAgent
from .contract_reviewer import ContractReviewerAgent

# Import BaseAgent from the base_agent directory
from .base_agent.base_agent import BaseAgent

# Agent registry for easy access
AVAILABLE_AGENTS = {
    "legal_document_generator": LegalDocumentGeneratorAgent,
    "document_analyzer": DocumentAnalyzerAgent,
    "document_classifier": DocumentClassifierAgent,
    "legal_research": LegalResearchAgent,
    "contract_reviewer": ContractReviewerAgent
}


def get_agent(agent_type: str, **kwargs):
    """Get agent instance by type."""
    if agent_type not in AVAILABLE_AGENTS:
        raise ValueError(f"Unknown agent type: {agent_type}")
    
    return AVAILABLE_AGENTS[agent_type](**kwargs)


__all__ = [
    # Base classes
    "BaseAgent",
    
    # Agents
    "LegalDocumentGeneratorAgent",
    "DocumentAnalyzerAgent",
    "DocumentClassifierAgent",
    "LegalResearchAgent", 
    "ContractReviewerAgent",
    
    # Functions
    "get_agent",
    
    # Registries
    "AVAILABLE_AGENTS"
]
"""
Adlaan Enhanced Intelligence Layer

A comprehensive legal AI intelligence system featuring:
- Multi-agent collaboration (Research, Draft, Review, Citation, Validation)
- Knowledge versioning with temporal legal data management  
- Auto-citation system with external legal database integration
- Advanced legal validation and compliance checking

Usage:
    from intelligence import create_enhanced_agent
    
    # Initialize enhanced intelligence
    intelligence = create_enhanced_agent()
    
    # Process legal request with full intelligence layer
    result = await intelligence.process_legal_request(
        messages=messages,
        jurisdiction="jordan",
        legal_domain="commercial", 
        task_type="document_creation"
    )
"""

from .enhanced_intelligence import EnhancedLegalIntelligence, create_enhanced_agent
from .multi_agent_system import MultiAgentOrchestrator, MultiAgentState
from .knowledge_versioning import LegalKnowledgeManager, JurisdictionManager, LegalKnowledgeEntry
from .citation_system import AutoCitationSystem, CitationContext, LegalCitation

__version__ = "1.0.0"
__author__ = "Adlaan Legal AI Team"
__description__ = "Enhanced Intelligence Layer for Legal AI"

# Export main classes and functions
__all__ = [
    # Main intelligence system
    "EnhancedLegalIntelligence",
    "create_enhanced_agent",
    
    # Multi-agent system
    "MultiAgentOrchestrator", 
    "MultiAgentState",
    
    # Knowledge management
    "LegalKnowledgeManager",
    "JurisdictionManager", 
    "LegalKnowledgeEntry",
    
    # Citation system
    "AutoCitationSystem",
    "CitationContext",
    "LegalCitation",
]

# System information
INTELLIGENCE_INFO = {
    "name": "Adlaan Enhanced Intelligence",
    "version": __version__,
    "components": {
        "multi_agent_system": "Multi-agent legal collaboration",
        "knowledge_versioning": "Temporal legal knowledge management", 
        "citation_system": "Auto-citation with external APIs",
        "legal_validation": "Comprehensive quality assurance"
    },
    "capabilities": [
        "Legal document creation",
        "Contract review and analysis", 
        "Compliance checking",
        "Legal research with citations",
        "Multi-jurisdiction support",
        "Temporal law tracking",
        "Quality validation"
    ],
    "supported_jurisdictions": [
        "jordan", "uae", "us", "uk", "general"
    ],
    "legal_domains": [
        "commercial", "employment", "corporate", 
        "contract", "intellectual-property", "compliance"
    ]
}


def get_intelligence_info():
    """Get comprehensive intelligence system information."""
    return INTELLIGENCE_INFO


def get_version():
    """Get intelligence layer version."""
    return __version__


# Initialize intelligence components on import (optional)
def quick_start(knowledge_db_path="legal_knowledge.db", 
               lexis_api_key=None, 
               justia_api_key=None):
    """
    Quick start method to initialize enhanced intelligence.
    
    Args:
        knowledge_db_path: Path to legal knowledge database
        lexis_api_key: LexisNexis API key (optional)
        justia_api_key: Justia API key (optional)
        
    Returns:
        EnhancedLegalIntelligence: Initialized intelligence system
    """
    return create_enhanced_agent(
        knowledge_db_path=knowledge_db_path,
        lexis_api_key=lexis_api_key,
        justia_api_key=justia_api_key
    )


# Validation function
def validate_intelligence_setup():
    """Validate that intelligence system can be initialized."""
    try:
        # Test imports
        from .enhanced_intelligence import EnhancedLegalIntelligence
        from .multi_agent_system import MultiAgentOrchestrator
        from .knowledge_versioning import LegalKnowledgeManager  
        from .citation_system import AutoCitationSystem
        
        return {
            "status": "ready",
            "components": {
                "enhanced_intelligence": True,
                "multi_agent_system": True, 
                "knowledge_versioning": True,
                "citation_system": True
            },
            "message": "All intelligence components loaded successfully"
        }
    except Exception as e:
        return {
            "status": "error",
            "components": {},
            "message": f"Intelligence setup validation failed: {str(e)}"
        }
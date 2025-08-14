"""
Contract generation tools package.

Provides tools for creating legal contracts with jurisdiction-specific
compliance for Jordan, KSA, and Dubai.
"""

from .contract_generation import (
    identify_contract_type,
    get_jurisdiction_requirements,
    generate_information_questions,
    generate_contract_clause,
    validate_contract_completeness,
)

from .database import (
    store_client_session,
    retrieve_client_session,
    save_contract_draft,
    get_contract_templates,
)

from .registry import contract_tool_registry

__all__ = [
    # Contract generation tools
    "identify_contract_type",
    "get_jurisdiction_requirements", 
    "generate_information_questions",
    "generate_contract_clause",
    "validate_contract_completeness",
    
    # Database tools
    "store_client_session",
    "retrieve_client_session",
    "save_contract_draft",
    "get_contract_templates",
    
    # Registry
    "contract_tool_registry",
]

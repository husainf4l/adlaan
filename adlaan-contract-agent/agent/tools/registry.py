"""
Tool registry for the contract generation agent.

Manages and provides access to all available tools for contract generation,
information gathering, and legal compliance checking.
"""

from typing import List, Dict, Any
from langchain_core.tools import BaseTool

# Import contract generation tools
from .contract_generation import (
    identify_contract_type,
    get_jurisdiction_requirements,
    generate_information_questions,
    generate_contract_clause,
    validate_contract_completeness,
)

# Import database tools if needed
from .database import (
    store_client_session,
    retrieve_client_session,
    save_contract_draft,
    get_contract_templates,
)


class ContractToolRegistry:
    """
    Registry for managing contract generation tools.
    
    Provides organized access to tools for different phases of contract generation:
    - Information gathering and contract type identification
    - Legal requirement determination
    - Contract clause generation
    - Validation and compliance checking
    """

    def __init__(self):
        self._tools = self._initialize_tools()
        self._tools_by_category = self._categorize_tools()

    def _initialize_tools(self) -> List[BaseTool]:
        """Initialize all available tools."""
        return [
            # Contract identification and setup
            identify_contract_type,
            get_jurisdiction_requirements,
            
            # Information gathering
            generate_information_questions,
            
            # Contract generation
            generate_contract_clause,
            
            # Validation and compliance
            validate_contract_completeness,
            
            # Database operations
            store_client_session,
            retrieve_client_session,
            save_contract_draft,
            get_contract_templates,
        ]

    def _categorize_tools(self) -> Dict[str, List[BaseTool]]:
        """Categorize tools by their function."""
        return {
            "identification": [
                identify_contract_type,
                get_jurisdiction_requirements,
            ],
            "information_gathering": [
                generate_information_questions,
            ],
            "generation": [
                generate_contract_clause,
            ],
            "validation": [
                validate_contract_completeness,
            ],
            "database": [
                store_client_session,
                retrieve_client_session,
                save_contract_draft,
                get_contract_templates,
            ],
        }

    def get_all_tools(self) -> List[BaseTool]:
        """Get all available tools."""
        return self._tools.copy()

    def get_tools_by_category(self, category: str) -> List[BaseTool]:
        """Get tools for a specific category."""
        return self._tools_by_category.get(category, [])

    def get_information_gathering_tools(self) -> List[BaseTool]:
        """Get tools specifically for gathering client information."""
        return self.get_tools_by_category("information_gathering")

    def get_generation_tools(self) -> List[BaseTool]:
        """Get tools for contract generation."""
        return self.get_tools_by_category("generation")

    def get_validation_tools(self) -> List[BaseTool]:
        """Get tools for contract validation."""
        return self.get_tools_by_category("validation")

    def get_identification_tools(self) -> List[BaseTool]:
        """Get tools for contract type identification."""
        return self.get_tools_by_category("identification")

    def get_tool_names(self) -> List[str]:
        """Get names of all available tools."""
        return [tool.name for tool in self._tools]

    def get_tool_descriptions(self) -> Dict[str, str]:
        """Get descriptions of all tools."""
        return {tool.name: tool.description for tool in self._tools}


# Create global registry instance
contract_tool_registry = ContractToolRegistry()

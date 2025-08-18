"""
Agent tools package.
Contains utility functions and configurations for the agent.
"""

from .llm_config import (
    get_llm,
    get_streaming_response,
    CONTRACT_SYSTEM_PROMPT,
    ARABIC_CONTRACT_PROMPT,
)
from .content_utils import (
    extract_content_type,
    is_contract_content,
    classify_content_batch,
)
from .validation import (
    validate_contract_section,
    validate_contract_metadata,
    sanitize_user_input,
)
from .search_tool import (
    web_search,
    contract_research,
    legal_precedent_search,
    GoogleSearchTool,
)

__all__ = [
    "get_llm",
    "get_streaming_response",
    "CONTRACT_SYSTEM_PROMPT",
    "ARABIC_CONTRACT_PROMPT",
    "extract_content_type",
    "is_contract_content",
    "classify_content_batch",
    "validate_contract_section",
    "validate_contract_metadata",
    "sanitize_user_input",
    "web_search",
    "contract_research",
    "legal_precedent_search",
    "GoogleSearchTool",
]

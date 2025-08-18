"""
Legacy compatibility module.
Provides backward compatibility for old imports and function names.
"""

# Import from new locations and provide aliases
from agent.tools.llm_config import (
    get_llm as _get_llm,
    get_streaming_response,
    ARABIC_CONTRACT_PROMPT,
)
from agent.tools.content_utils import extract_content_type

# Legacy aliases
get_arabic_llm = _get_llm  # Both functions are now the same
stream_llm_response = get_streaming_response


def get_content_type_for_streaming(text: str) -> str:
    """Legacy function for streaming content type detection."""
    content_type, _ = extract_content_type(text)
    return content_type

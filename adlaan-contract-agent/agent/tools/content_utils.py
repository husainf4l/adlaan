"""
Simple Contract Content Classification utilities.

This module provides minimal functionality for classifying content as:
- Normal content (no special handling)
- Contract content: header, body, or footer

The frontend handles all design, styling, and template logic.
The AI just generates content and indicates the type.
"""

import re
from typing import Tuple


# Simple Content Classification mapped to ContractContentType
CONTENT_TYPES = {
    "CH": "contract_header",  # Contract Header
    "CB": "contract_body",  # Contract Body
    "CF": "contract_signature",  # Contract Footer/Signature
}


def extract_content_type(text: str) -> Tuple[str, str]:
    """
    Extract content type from text - either normal or contract content.
    Enhanced to handle Arabic text and multiple code positions.

    Args:
        text: Text that may contain type codes like "Some content [CH]"

    Returns:
        Tuple of (content_type, clean_content)
        content_type: "contract_header", "contract_body", "contract_signature", or "text"
        clean_content: text without the type code
    """
    # Look for pattern like "Some content [CH]", "[CB]", "[CF]"
    # Search at end of text first, then anywhere in the text for flexibility
    match = re.search(r"\s*\[([A-Z]{2})\]\s*$", text.strip())

    if not match:
        # Try finding the code anywhere in the text (for streaming scenarios)
        match = re.search(r"\[([A-Z]{2})\]", text)

    if match:
        code = match.group(1)
        # Remove the code from the text
        clean_content = re.sub(r"\s*\[" + code + r"\]\s*", "", text).strip()
        content_type = CONTENT_TYPES.get(code, "text")
        return content_type, clean_content

    # Default to normal text content
    return "text", text.strip()


def classify_content_batch(texts: list[str]) -> list[Tuple[str, str]]:
    """
    Classify multiple texts at once.

    Args:
        texts: List of text strings to classify

    Returns:
        List of (content_type, clean_content) tuples
    """
    return [extract_content_type(text) for text in texts]


def is_contract_content(text: str) -> bool:
    """
    Check if text contains contract content markers.

    Args:
        text: Text to check

    Returns:
        bool: True if text contains contract markers
    """
    content_type, _ = extract_content_type(text)
    return content_type != "text"


def get_contract_section_order(content_type: str) -> int:
    """
    Get the typical order for contract sections.

    Args:
        content_type: The contract content type

    Returns:
        int: Order number (lower = appears earlier)
    """
    order_map = {
        "contract_header": 1,
        "contract_body": 2,
        "contract_signature": 3,
        "text": 0,  # Non-contract content has no order
    }
    return order_map.get(content_type, 0)

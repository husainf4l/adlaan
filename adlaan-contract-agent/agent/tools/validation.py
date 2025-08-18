"""
Validation utilities for contract content and agent operations.
"""

import re
from typing import List, Dict, Any, Optional
from agent.contract_types import ContractSection, ContractMetadata


def validate_contract_section(section: ContractSection) -> List[str]:
    """
    Validate a contract section and return any validation errors.

    Args:
        section: ContractSection to validate

    Returns:
        List of validation error messages (empty if valid)
    """
    errors = []

    # Check required fields
    if not section.section_id:
        errors.append("Section ID is required")

    if not section.title:
        errors.append("Section title is required")

    if not section.content:
        errors.append("Section content is required")

    # Validate section type
    valid_types = [
        "contract_header",
        "contract_body",
        "contract_clause",
        "contract_signature",
        "contract_terms",
        "contract_metadata",
        "text",
        "analysis",
    ]
    if section.section_type not in valid_types:
        errors.append(f"Invalid section type: {section.section_type}")

    # Validate order
    if section.order < 0:
        errors.append("Section order must be non-negative")

    return errors


def validate_contract_metadata(metadata: ContractMetadata) -> List[str]:
    """
    Validate contract metadata and return any validation errors.

    Args:
        metadata: ContractMetadata to validate

    Returns:
        List of validation error messages (empty if valid)
    """
    errors = []

    # Check required fields
    if not metadata.contract_id:
        errors.append("Contract ID is required")

    if not metadata.contract_type:
        errors.append("Contract type is required")

    # Validate parties
    if not metadata.parties:
        errors.append("At least one party is required")

    # Validate language
    valid_languages = ["english", "arabic", "french"]
    if metadata.language not in valid_languages:
        errors.append(f"Invalid language: {metadata.language}")

    # Validate total pages
    if metadata.total_pages < 1:
        errors.append("Total pages must be at least 1")

    return errors


def validate_arabic_contract_content(content: str) -> List[str]:
    """
    Validate Arabic contract content for common issues.

    Args:
        content: Arabic contract content to validate

    Returns:
        List of validation warnings/suggestions
    """
    warnings = []

    # Check for Arabic text
    arabic_pattern = r"[\u0600-\u06FF]"
    if not re.search(arabic_pattern, content):
        warnings.append("No Arabic text detected in Arabic contract")

    # Check for required contract elements in Arabic
    required_terms = [
        "عقد",  # Contract
        "الطرف",  # Party
        "شروط",  # Terms
        "التوقيع",  # Signature
    ]

    missing_terms = []
    for term in required_terms:
        if term not in content:
            missing_terms.append(term)

    if missing_terms:
        warnings.append(f"Missing common contract terms: {', '.join(missing_terms)}")

    return warnings


def validate_api_response(response_data: Dict[str, Any]) -> List[str]:
    """
    Validate API response structure.

    Args:
        response_data: Response data to validate

    Returns:
        List of validation error messages
    """
    errors = []

    # Check for required response fields
    if "status" not in response_data:
        errors.append("Response missing 'status' field")

    if "data" not in response_data:
        errors.append("Response missing 'data' field")

    # Validate status values
    valid_statuses = ["success", "error", "processing"]
    if response_data.get("status") not in valid_statuses:
        errors.append(f"Invalid status: {response_data.get('status')}")

    return errors


def sanitize_user_input(user_input: str, max_length: int = 10000) -> str:
    """
    Sanitize user input for safety.

    Args:
        user_input: Raw user input
        max_length: Maximum allowed length

    Returns:
        Sanitized input string
    """
    if not user_input:
        return ""

    # Truncate if too long
    if len(user_input) > max_length:
        user_input = user_input[:max_length]

    # Remove potentially dangerous characters
    # Keep Arabic, English, numbers, common punctuation
    safe_pattern = (
        r'[^\u0600-\u06FF\u0000-\u007F\u00A0-\u00FF\s\.,;:!?\-()[\]{}"\'\/\\]'
    )
    sanitized = re.sub(safe_pattern, "", user_input)

    return sanitized.strip()

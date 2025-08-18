"""
Contract analysis node for specialized contract processing and validation.
"""

from typing import Dict, Any, List
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from agent.state import AgentState
from agent.tools.llm_config import get_llm, ARABIC_CONTRACT_PROMPT
from agent.tools.content_utils import extract_content_type, is_contract_content
from agent.tools.validation import validate_arabic_contract_content, sanitize_user_input
from agent.contract_types import ContractSection, ContractMetadata


def contract_analysis_node(state: AgentState) -> Dict[str, Any]:
    """
    Specialized node for contract analysis and generation.

    Args:
        state: Current agent state

    Returns:
        Updated state with contract analysis
    """
    # Get LLM with contract-specific prompt
    llm = get_llm()

    # Sanitize input
    sanitized_message = sanitize_user_input(state["current_message"])

    # Use Arabic contract prompt for contract-specific processing
    contract_system = SystemMessage(content=ARABIC_CONTRACT_PROMPT)

    # Prepare messages
    messages = [contract_system] + state["messages"].copy()

    # Add current message if not already present
    if not messages or messages[-1].content != sanitized_message:
        messages.append(HumanMessage(content=sanitized_message))

    try:
        # Generate contract response
        response = llm.invoke(messages)

        # Extract content type and analyze
        content_type, clean_content = extract_content_type(response.content)

        # Validate if Arabic contract content
        validation_warnings = []
        if content_type != "text":
            validation_warnings = validate_arabic_contract_content(clean_content)

        # Create AI response
        ai_message = AIMessage(content=clean_content)

        # Update metadata with contract-specific information
        metadata = state.get("metadata", {})
        metadata.update(
            {
                "content_type": content_type,
                "is_contract_content": content_type != "text",
                "validation_warnings": validation_warnings,
                "processing_mode": "contract_analysis",
                "processing_status": "completed",
            }
        )

        return {
            "messages": state["messages"] + [ai_message],
            "current_message": sanitized_message,
            "response_buffer": clean_content,
            "metadata": metadata,
        }

    except Exception as e:
        error_message = f"Contract analysis error: {str(e)}"
        error_ai_message = AIMessage(content=error_message)

        metadata = state.get("metadata", {})
        metadata.update(
            {
                "processing_status": "error",
                "error_details": str(e),
                "processing_mode": "contract_analysis",
            }
        )

        return {
            "messages": state["messages"] + [error_ai_message],
            "current_message": sanitized_message,
            "response_buffer": error_message,
            "metadata": metadata,
        }


def extract_contract_sections(text: str) -> List[ContractSection]:
    """
    Extract contract sections from generated text.

    Args:
        text: Contract text with type markers

    Returns:
        List of ContractSection objects
    """
    sections = []

    # Split text by paragraphs and analyze each
    paragraphs = text.split("\n\n")

    for i, paragraph in enumerate(paragraphs):
        if paragraph.strip():
            content_type, clean_content = extract_content_type(paragraph)

            if content_type != "text":
                section = ContractSection(
                    section_id=f"section_{i+1}",
                    section_type=content_type,
                    title=_extract_title(clean_content),
                    content=clean_content,
                    order=i + 1,
                    metadata={"generated": True},
                )
                sections.append(section)

    return sections


def _extract_title(content: str) -> str:
    """
    Extract title from contract content.

    Args:
        content: Contract section content

    Returns:
        Extracted title or default
    """
    lines = content.split("\n")
    first_line = lines[0].strip()

    # If first line is short and looks like a title
    if len(first_line) < 100 and ("**" in first_line or first_line.isupper()):
        return first_line.replace("**", "").strip()

    # Extract first few words as title
    words = first_line.split()[:5]
    return " ".join(words) + ("..." if len(words) == 5 else "")


def validate_contract_completeness(sections: List[ContractSection]) -> Dict[str, Any]:
    """
    Validate if contract has all required sections.

    Args:
        sections: List of contract sections

    Returns:
        Validation results
    """
    section_types = [section.section_type for section in sections]

    required_types = ["contract_header", "contract_body", "contract_signature"]
    missing_types = [t for t in required_types if t not in section_types]

    return {
        "is_complete": len(missing_types) == 0,
        "missing_sections": missing_types,
        "total_sections": len(sections),
        "section_types": section_types,
    }

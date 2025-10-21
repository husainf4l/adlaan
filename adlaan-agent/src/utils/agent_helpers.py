"""
Utility functions for AI agents.
"""
import json
import re
from typing import Dict, Any, Optional, List
from datetime import datetime


def safe_json_parse(text: str, fallback: Dict[str, Any] = None) -> Dict[str, Any]:
    """Safely parse JSON text with fallback."""
    if fallback is None:
        fallback = {}
    
    try:
        # Try to parse as-is
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to extract JSON from text
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # Return fallback
        return fallback


def extract_json_from_response(response: str) -> Optional[Dict[str, Any]]:
    """Extract JSON from LLM response text."""
    # Common patterns for JSON in responses
    patterns = [
        r'```json\s*(\{.*?\})\s*```',  # Code block
        r'```\s*(\{.*?\})\s*```',      # Code block without json
        r'(\{[^{}]*\{[^{}]*\}[^{}]*\})',  # Nested JSON
        r'(\{[^{}]*\})',               # Simple JSON
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, response, re.DOTALL | re.IGNORECASE)
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
    
    return None


def clean_document_content(content: str) -> str:
    """Clean and format document content."""
    if not content:
        return ""
    
    # Remove excessive whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    content = re.sub(r'[ \t]+', ' ', content)
    
    # Clean up common formatting issues
    content = content.strip()
    
    return content


def validate_document_structure(content: str) -> Dict[str, Any]:
    """Validate basic document structure."""
    if not content:
        return {
            "valid": False,
            "issues": ["Document is empty"],
            "score": 0.0
        }
    
    issues = []
    score = 1.0
    
    # Check minimum length
    if len(content) < 100:
        issues.append("Document is too short")
        score -= 0.3
    
    # Check for basic structure
    if not re.search(r'[A-Z][^.!?]*[.!?]', content):
        issues.append("No complete sentences found")
        score -= 0.2
    
    # Check for common legal terms
    legal_terms = ["agreement", "contract", "party", "terms", "conditions", "whereas"]
    found_terms = sum(1 for term in legal_terms if term.lower() in content.lower())
    if found_terms < 2:
        issues.append("Limited legal terminology")
        score -= 0.2
    
    score = max(0.0, score)
    
    return {
        "valid": score >= 0.5,
        "issues": issues,
        "score": score,
        "word_count": len(content.split()),
        "character_count": len(content)
    }


def create_task_metadata(
    agent_type: str,
    document_type: str = None,
    jurisdiction: str = "jordan",
    **kwargs
) -> Dict[str, Any]:
    """Create standardized task metadata."""
    metadata = {
        "created_at": datetime.utcnow().isoformat(),
        "agent_type": agent_type,
        "jurisdiction": jurisdiction,
        "version": "3.0.0",
        **kwargs
    }
    
    if document_type:
        metadata["document_type"] = document_type
    
    return metadata


def format_legal_prompt(
    task_description: str,
    context: Dict[str, Any],
    output_format: str = "json"
) -> str:
    """Format a prompt for legal AI tasks."""
    prompt_parts = [
        f"Task: {task_description}",
        "",
        "Context:"
    ]
    
    for key, value in context.items():
        if isinstance(value, (dict, list)):
            value = json.dumps(value, indent=2)
        prompt_parts.append(f"- {key}: {value}")
    
    prompt_parts.extend([
        "",
        f"Please provide your response in {output_format} format.",
        "Ensure all information is accurate and follows legal best practices."
    ])
    
    return "\n".join(prompt_parts)


def truncate_content(content: str, max_length: int = 4000) -> str:
    """Truncate content while preserving structure."""
    if len(content) <= max_length:
        return content
    
    # Try to truncate at sentence boundaries
    truncated = content[:max_length]
    last_sentence = truncated.rfind('.')
    
    if last_sentence > max_length * 0.8:  # If we can preserve most content
        return truncated[:last_sentence + 1] + "\n\n[Content truncated...]"
    
    return truncated + "..."


def analyze_document_complexity(content: str) -> Dict[str, Any]:
    """Analyze document complexity metrics."""
    if not content:
        return {"complexity": "unknown", "score": 0}
    
    words = content.split()
    sentences = len(re.findall(r'[.!?]+', content))
    
    # Calculate metrics
    avg_words_per_sentence = len(words) / max(sentences, 1)
    long_words = sum(1 for word in words if len(word) > 6)
    long_word_ratio = long_words / max(len(words), 1)
    
    # Complexity scoring
    complexity_score = 0
    if avg_words_per_sentence > 20:
        complexity_score += 0.3
    if long_word_ratio > 0.3:
        complexity_score += 0.3
    if len(words) > 1000:
        complexity_score += 0.2
    if len(re.findall(r'\([^)]*\)', content)) > 5:  # Parenthetical expressions
        complexity_score += 0.2
    
    if complexity_score >= 0.7:
        complexity = "high"
    elif complexity_score >= 0.4:
        complexity = "medium"
    else:
        complexity = "low"
    
    return {
        "complexity": complexity,
        "score": complexity_score,
        "word_count": len(words),
        "sentence_count": sentences,
        "avg_words_per_sentence": avg_words_per_sentence,
        "long_word_ratio": long_word_ratio
    }
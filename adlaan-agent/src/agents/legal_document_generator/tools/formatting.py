"""
Document Formatting Tool for AI agents.
"""
from typing import Dict, Any
import re
from src.core.logging import get_logger
from src.utils.agent_helpers import clean_document_content

logger = get_logger(__name__)


class DocumentFormattingTool:
    """Tool for formatting legal documents."""
    
    def __init__(self):
        self.logger = logger
    
    async def format_document(self, content: str, format_type: str = "professional") -> Dict[str, Any]:
        """Format document according to professional standards."""
        self.logger.info(f"Formatting document as {format_type}")
        
        formatted_content = clean_document_content(content)
        
        # Apply formatting rules
        if format_type == "professional":
            formatted_content = self._apply_professional_formatting(formatted_content)
        elif format_type == "legal":
            formatted_content = self._apply_legal_formatting(formatted_content)
        
        return {
            "original_length": len(content),
            "formatted_length": len(formatted_content),
            "formatted_content": formatted_content,
            "format_type": format_type,
            "formatting_applied": True
        }
    
    def _apply_professional_formatting(self, content: str) -> str:
        """Apply professional document formatting."""
        # Add proper spacing
        content = re.sub(r'\n{3,}', '\n\n', content)  # Limit multiple newlines
        content = re.sub(r'([.!?])\s*([A-Z])', r'\1\n\n\2', content)  # Paragraph breaks
        
        # Ensure proper capitalization
        sentences = content.split('. ')
        formatted_sentences = []
        for sentence in sentences:
            if sentence:
                sentence = sentence.strip()
                if sentence and not sentence[0].isupper():
                    sentence = sentence[0].upper() + sentence[1:]
                formatted_sentences.append(sentence)
        
        return '. '.join(formatted_sentences)
    
    def _apply_legal_formatting(self, content: str) -> str:
        """Apply legal document formatting."""
        # Number sections
        paragraphs = content.split('\n\n')
        formatted_paragraphs = []
        
        for i, paragraph in enumerate(paragraphs, 1):
            if paragraph.strip():
                if not re.match(r'^\d+\.', paragraph):
                    paragraph = f"{i}. {paragraph}"
                formatted_paragraphs.append(paragraph)
        
        return '\n\n'.join(formatted_paragraphs)
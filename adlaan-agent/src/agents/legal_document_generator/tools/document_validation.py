"""
Document Validation Tool for AI agents.
"""
from typing import Dict, Any, List
from src.core.logging import get_logger

logger = get_logger(__name__)


class DocumentValidationTool:
    """Tool for validating legal documents."""
    
    def __init__(self):
        self.logger = logger
    
    async def validate_legal_structure(self, content: str, document_type: str) -> Dict[str, Any]:
        """Validate the legal structure of a document."""
        self.logger.info(f"Validating legal structure for {document_type}")
        
        validation_result = {
            "document_type": document_type,
            "is_valid": True,
            "issues": [],
            "recommendations": [],
            "compliance_score": 0.0
        }
        
        # Basic validation rules
        required_sections = self._get_required_sections(document_type)
        found_sections = self._identify_sections(content)
        
        missing_sections = set(required_sections) - set(found_sections)
        if missing_sections:
            validation_result["is_valid"] = False
            validation_result["issues"].extend([
                f"Missing required section: {section}" 
                for section in missing_sections
            ])
        
        # Calculate compliance score
        if required_sections:
            compliance_score = len(found_sections) / len(required_sections)
            validation_result["compliance_score"] = min(1.0, compliance_score)
        
        # Add recommendations
        if validation_result["compliance_score"] < 0.8:
            validation_result["recommendations"].append(
                "Consider adding missing required sections"
            )
        
        return validation_result
    
    def _get_required_sections(self, document_type: str) -> List[str]:
        """Get required sections for document type."""
        section_map = {
            "contract": ["parties", "terms", "conditions", "signatures"],
            "agreement": ["background", "obligations", "duration", "termination"],
            "legal_notice": ["recipient", "issue", "remedy", "deadline"],
            "memorandum": ["header", "purpose", "details", "conclusion"]
        }
        return section_map.get(document_type.lower(), ["introduction", "main_content", "conclusion"])
    
    def _identify_sections(self, content: str) -> List[str]:
        """Identify sections present in the document."""
        content_lower = content.lower()
        
        section_keywords = {
            "parties": ["party", "parties", "between"],
            "terms": ["terms", "conditions", "provisions"],
            "signatures": ["signature", "signed", "date"],
            "background": ["background", "whereas", "preamble"],
            "obligations": ["obligation", "responsibility", "duty"],
            "termination": ["termination", "expiry", "end"]
        }
        
        found_sections = []
        for section, keywords in section_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                found_sections.append(section)
        
        return found_sections

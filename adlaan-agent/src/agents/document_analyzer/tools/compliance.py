"""
Compliance Tool for AI agents.
"""
from typing import Dict, Any, List
import re
from datetime import datetime
from src.core.logging import get_logger

logger = get_logger(__name__)


class ComplianceTool:
    """Tool for checking compliance with legal requirements."""
    
    def __init__(self, jurisdiction: str = "jordan"):
        self.jurisdiction = jurisdiction
        self.logger = logger
    
    async def check_compliance(self, content: str, document_type: str) -> Dict[str, Any]:
        """Check document compliance with legal requirements."""
        self.logger.info(f"Checking compliance for {document_type} in {self.jurisdiction}")
        
        compliance_checks = []
        
        # Jordan-specific compliance rules
        jordan_requirements = {
            "contract": [
                {
                    "requirement": "Arabic language option",
                    "pattern": r'[\u0600-\u06FF]',
                    "mandatory": False,
                    "description": "Document should include Arabic translation for enforceability"
                },
                {
                    "requirement": "Date specification",
                    "pattern": r'\d{1,2}[/-]\d{1,2}[/-]\d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}',
                    "mandatory": True,
                    "description": "Contract must specify execution date"
                }
            ],
            "agreement": [
                {
                    "requirement": "Party identification",
                    "pattern": r'(company|corporation|individual|person)',
                    "mandatory": True,
                    "description": "Parties must be clearly identified"
                }
            ]
        }
        
        requirements = jordan_requirements.get(document_type.lower(), [])
        
        for req in requirements:
            is_compliant = bool(re.search(req["pattern"], content, re.IGNORECASE))
            
            compliance_checks.append({
                "requirement": req["requirement"],
                "mandatory": req["mandatory"],
                "compliant": is_compliant,
                "description": req["description"],
                "severity": "high" if req["mandatory"] and not is_compliant else "low"
            })
        
        # Calculate compliance score
        total_checks = len(compliance_checks)
        if total_checks > 0:
            compliant_checks = sum(1 for check in compliance_checks if check["compliant"])
            compliance_score = compliant_checks / total_checks
        else:
            compliance_score = 1.0
        
        return {
            "jurisdiction": self.jurisdiction,
            "document_type": document_type,
            "compliance_score": compliance_score,
            "checks": compliance_checks,
            "overall_compliant": compliance_score >= 0.8,
            "check_timestamp": datetime.now().isoformat()
        }
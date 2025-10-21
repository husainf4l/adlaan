"""
Risk Assessment Tool for AI agents.
"""
from typing import Dict, Any, List
import re
from datetime import datetime
from src.core.logging import get_logger

logger = get_logger(__name__)


class RiskAssessmentTool:
    """Tool for assessing legal risks in documents."""
    
    def __init__(self):
        self.logger = logger
    
    async def assess_legal_risks(self, content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Assess legal risks in document content."""
        self.logger.info("Assessing legal risks")
        
        risks = []
        content_lower = content.lower()
        
        # Enhanced risk patterns with better detection
        risk_patterns = {
            "ambiguous_terms": {
                "patterns": [
                    r'\b(may|might|could|should)\b(?!\s+(?:be|have|include|terminate|provide))',
                    r'\breasonable\b(?!\s+(?:control|notice|efforts?))',
                    r'\bappropriate\b(?!\s+(?:notice|documentation))',
                    r'\b(?:adequate|sufficient)\b(?!\s+(?:notice|documentation|insurance))',
                    r'\bbest efforts?\b(?!\s+to)',
                    r'\bcommercially reasonable\b(?!\s+(?:standards?|efforts?))',
                    r'\bas soon as possible\b|\basap\b',
                    r'\btimely\b(?!\s+(?:notice|delivery))',
                    r'\bpromptly\b(?!\s+(?:notify|deliver))'
                ],
                "severity": "medium",
                "description": "Ambiguous language that could lead to disputes",
                "threshold": 5  # Only flag if many instances
            },
            "missing_jurisdiction": {
                "patterns": [
                    r'(governing law|applicable law|jurisdiction|courts? of|legal proceedings)',
                    r'(disputes? (?:shall|will) be (?:governed|resolved|heard))',
                    r'(subject to the laws? of|in accordance with the laws? of)'
                ],
                "severity": "high",
                "description": "Missing or unclear jurisdiction clause",
                "invert": True,  # Risk if NOT found
                "threshold": 1
            },
            "unlimited_liability": {
                "patterns": [
                    r'unlimited liability|without limitation|no limit(?:ation)?',
                    r'liable for all|responsible for all|full liability',
                    r'(?:shall|will) be liable for (?:any|all) (?:damages|losses|costs)'
                ],
                "severity": "high",
                "description": "Unlimited liability exposure",
                "threshold": 1
            },
            "automatic_renewal": {
                "patterns": [
                    r'automatic(?:ally)? renew(?:al|s)?',
                    r'auto-renew(?:al|s)?',
                    r'(?:shall|will) be (?:automatically )?renewed',
                    r'unless (?:either )?party (?:gives )?notice'
                ],
                "severity": "medium",
                "description": "Automatic renewal clause without clear terms",
                "threshold": 1
            },
            "penalty_clauses": {
                "patterns": [
                    r'penalty|penalties|liquidated damages',
                    r'forfeit(?:ure)?|confiscat(?:e|ion)',
                    r'(?:shall|will) pay.*(?:penalty|fine|damages)'
                ],
                "severity": "medium",
                "description": "Penalty clauses that may be unenforceable",
                "threshold": 1
            },
            "termination_risks": {
                "patterns": [
                    r'(?:may|can) (?:be )?terminat(?:e|ed) (?:at any time|immediately) without (?:cause|reason|notice)',
                    r'terminate(?:d)? at (?:the )?sole discretion without (?:cause|notice)',
                    r'terminate(?:d)? for any reason or no reason'
                ],
                "severity": "high",
                "description": "Unfavorable termination clauses",
                "threshold": 1
            },
            "force_majeure_missing": {
                "patterns": [
                    r'force majeure|act of god|unforeseeable circumstances',
                    r'beyond (?:the )?(?:reasonable )?control',
                    r'impossible(?:ility)? to perform'
                ],
                "severity": "medium",
                "description": "Missing force majeure clause",
                "invert": True,
                "threshold": 1
            },
            "confidentiality_risks": {
                "patterns": [
                    r'confidential(?:ity)?|non-disclosure|proprietary',
                    r'trade secrets?|sensitive information',
                    r'shall not disclose|obligation of confidence'
                ],
                "severity": "low",
                "description": "Weak or missing confidentiality provisions",
                "invert": True,
                "threshold": 1
            },
            "intellectual_property": {
                "patterns": [
                    r'intellectual property|ip rights?',
                    r'copyright|trademark|patent',
                    r'ownership of (?:work|materials|deliverables)'
                ],
                "severity": "medium",
                "description": "Unclear intellectual property rights",
                "invert": True,
                "threshold": 1
            },
            "indemnification_issues": {
                "patterns": [
                    r'indemnify|indemnification|hold harmless',
                    r'defend and hold harmless',
                    r'mutual indemnification'
                ],
                "severity": "medium",
                "description": "One-sided or missing indemnification clauses",
                "invert": True,
                "threshold": 1
            }
        }
        
        # Analyze each risk pattern
        for risk_type, config in risk_patterns.items():
            risk_count = 0
            found_instances = []
            
            # Check all patterns for this risk type
            for pattern in config["patterns"]:
                matches = list(re.finditer(pattern, content_lower, re.IGNORECASE))
                risk_count += len(matches)
                for match in matches:
                    found_instances.append({
                        "text": match.group(0),
                        "position": match.start(),
                        "context": self._get_context(content, match.start(), 50)
                    })
            
            # Determine if this is a risk based on threshold and invert flag
            is_risk = risk_count >= config.get("threshold", 1)
            if config.get("invert"):
                is_risk = not is_risk
            
            if is_risk:
                risk_detail = {
                    "type": risk_type,
                    "severity": config["severity"],
                    "description": config["description"],
                    "count": risk_count if not config.get("invert") else 0,
                    "instances": found_instances if not config.get("invert") else [],
                    "recommendation": self._get_risk_recommendation(risk_type),
                    "severity_score": self._get_severity_score(config["severity"])
                }
                risks.append(risk_detail)
        
        # Calculate overall risk metrics
        risk_metrics = self._calculate_risk_metrics(risks, content)
        
        return {
            "risks": risks,
            "risk_score": risk_metrics["overall_score"],
            "risk_level": risk_metrics["risk_level"],
            "total_risks": len(risks),
            "risk_breakdown": risk_metrics["breakdown"],
            "critical_risks": [r for r in risks if r["severity"] == "high"],
            "recommendations": self._generate_recommendations(risks),
            "assessment_timestamp": datetime.now().isoformat(),
            "document_length": len(content),
            "analysis_coverage": risk_metrics["coverage"]
        }
    
    def _get_context(self, content: str, position: int, context_length: int = 50) -> str:
        """Get context around a specific position in the text."""
        start = max(0, position - context_length)
        end = min(len(content), position + context_length)
        return content[start:end].strip()
    
    def _get_severity_score(self, severity: str) -> int:
        """Convert severity to numeric score."""
        severity_scores = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        return severity_scores.get(severity, 1)
    
    def _calculate_risk_metrics(self, risks: List[Dict[str, Any]], content: str) -> Dict[str, Any]:
        """Calculate comprehensive risk metrics."""
        if not risks:
            return {
                "overall_score": 0.0,
                "risk_level": "low",
                "breakdown": {"low": 0, "medium": 0, "high": 0, "critical": 0},
                "coverage": 1.0
            }
        
        # Calculate weighted risk score
        total_weighted_score = sum(risk["severity_score"] for risk in risks)
        max_possible_score = len(risks) * 4  # Maximum if all were critical
        overall_score = total_weighted_score / max_possible_score if max_possible_score > 0 else 0
        
        # Break down by severity
        breakdown = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        for risk in risks:
            breakdown[risk["severity"]] = breakdown.get(risk["severity"], 0) + 1
        
        # Calculate risk level
        if breakdown["critical"] > 0 or breakdown["high"] >= 3:
            risk_level = "critical"
        elif breakdown["high"] > 0 or overall_score >= 0.6:
            risk_level = "high"
        elif breakdown["medium"] >= 2 or overall_score >= 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # Coverage metric (how well we analyzed the document)
        word_count = len(content.split())
        analysis_coverage = min(1.0, word_count / 100)  # Assume 100 words minimum for full coverage
        
        return {
            "overall_score": overall_score,
            "risk_level": risk_level,
            "breakdown": breakdown,
            "coverage": analysis_coverage
        }
    
    def _generate_recommendations(self, risks: List[Dict[str, Any]]) -> List[str]:
        """Generate prioritized recommendations based on identified risks."""
        recommendations = []
        
        # Critical and high severity recommendations first
        high_priority_risks = [r for r in risks if r["severity"] in ["critical", "high"]]
        medium_priority_risks = [r for r in risks if r["severity"] == "medium"]
        low_priority_risks = [r for r in risks if r["severity"] == "low"]
        
        if high_priority_risks:
            recommendations.append("🚨 IMMEDIATE ACTION REQUIRED:")
            for risk in high_priority_risks:
                recommendations.append(f"   • {risk['recommendation']}")
        
        if medium_priority_risks:
            recommendations.append("⚠️ RECOMMENDED IMPROVEMENTS:")
            for risk in medium_priority_risks:
                recommendations.append(f"   • {risk['recommendation']}")
        
        if low_priority_risks:
            recommendations.append("💡 SUGGESTED ENHANCEMENTS:")
            for risk in low_priority_risks:
                recommendations.append(f"   • {risk['recommendation']}")
        
        # General recommendations
        if len(risks) >= 5:
            recommendations.append("📋 Consider comprehensive legal review due to multiple identified risks")
        
        return recommendations

    def _get_risk_recommendation(self, risk_type: str) -> str:
        """Get detailed recommendation for specific risk type."""
        recommendations = {
            "ambiguous_terms": "Replace ambiguous terms with specific, defined language. Create a definitions section for key terms.",
            "missing_jurisdiction": "Add a governing law and jurisdiction clause specifying which country/state laws apply and where disputes will be resolved.",
            "unlimited_liability": "Consider limiting liability to specific amounts, types of damages, or excluding certain categories like consequential damages.",
            "automatic_renewal": "Specify clear notice periods, methods for providing notice, and conditions for renewal. Consider mutual agreement requirement.",
            "penalty_clauses": "Review penalty clauses for enforceability under local law. Consider liquidated damages instead of penalties.",
            "termination_risks": "Balance termination rights between parties. Include notice periods and specify grounds for immediate termination.",
            "force_majeure_missing": "Add force majeure clause covering unforeseeable events beyond parties' control (natural disasters, government actions, etc.).",
            "confidentiality_risks": "Include comprehensive confidentiality provisions with clear definitions of confidential information and exceptions.",
            "intellectual_property": "Clearly define ownership of intellectual property created during the relationship and pre-existing IP rights.",
            "indemnification_issues": "Consider mutual indemnification clauses with appropriate carve-outs and limitations."
        }
        return recommendations.get(risk_type, "Review and clarify this clause with legal counsel")
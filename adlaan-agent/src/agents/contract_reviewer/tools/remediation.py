"""
Contract Remediation Tool - Automatically fixes identified legal risks.
"""
import re
from typing import Dict, Any, List, Tuple
from datetime import datetime
from src.core.logging import get_logger

logger = get_logger(__name__)


class ContractRemediationTool:
    """Tool for automatically fixing identified legal risks in contracts."""
    
    def __init__(self, jurisdiction: str = "jordan"):
        self.jurisdiction = jurisdiction
        self.logger = logger
    
    async def remediate_contract(self, content: str, risk_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Automatically remediate identified risks in a contract."""
        self.logger.info("Starting contract remediation process")
        
        remediated_content = content
        applied_fixes = []
        risk_reduction_score = 0
        
        # Apply fixes based on identified risks
        for risk in risk_analysis.get('risks', []):
            risk_type = risk['type']
            fix_method = self._get_fix_method(risk_type)
            
            if fix_method:
                try:
                    remediated_content, fix_applied = await fix_method(remediated_content, risk)
                    if fix_applied:
                        applied_fixes.append({
                            'risk_type': risk_type,
                            'severity': risk['severity'],
                            'fix_description': fix_applied,
                            'timestamp': datetime.now().isoformat()
                        })
                        risk_reduction_score += risk.get('severity_score', 1)
                except Exception as e:
                    self.logger.error(f"Failed to fix {risk_type}: {e}")
        
        # Re-analyze the remediated contract using direct import to avoid circular import
        from .risk_assessment import RiskAssessmentTool
        risk_tool = RiskAssessmentTool()
        new_risk_analysis = await risk_tool.assess_legal_risks(remediated_content, {})
        
        improvement_metrics = self._calculate_improvement(risk_analysis, new_risk_analysis)
        
        return {
            'original_content': content,
            'remediated_content': remediated_content,
            'applied_fixes': applied_fixes,
            'original_risks': risk_analysis.get('total_risks', 0),
            'remaining_risks': new_risk_analysis.get('total_risks', 0),
            'risk_reduction_score': risk_reduction_score,
            'improvement_metrics': improvement_metrics,
            'new_risk_analysis': new_risk_analysis,
            'remediation_timestamp': datetime.now().isoformat()
        }
    
    def _get_fix_method(self, risk_type: str):
        """Get the appropriate fix method for a risk type."""
        fix_methods = {
            'missing_jurisdiction': self._fix_missing_jurisdiction,
            'unlimited_liability': self._fix_unlimited_liability,
            'automatic_renewal': self._fix_automatic_renewal,
            'penalty_clauses': self._fix_penalty_clauses,
            'force_majeure_missing': self._fix_force_majeure_missing,
            'confidentiality_risks': self._fix_confidentiality_risks,
            'intellectual_property': self._fix_intellectual_property,
            'indemnification_issues': self._fix_indemnification_issues,
            'termination_risks': self._fix_termination_risks,
            'ambiguous_terms': self._fix_ambiguous_terms
        }
        return fix_methods.get(risk_type)
    
    async def _fix_missing_jurisdiction(self, content: str, risk: Dict[str, Any]) -> Tuple[str, str]:
        """Add governing law and jurisdiction clause."""
        jurisdiction_clause = f"""

GOVERNING LAW AND JURISDICTION:
This Agreement shall be governed by and construed in accordance with the laws of the Hashemite Kingdom of Jordan. Any disputes arising out of or relating to this Agreement shall be subject to the exclusive jurisdiction of the courts of Amman, Jordan. The parties hereby consent to the personal jurisdiction of such courts and waive any objection to venue therein."""
        
        # Add at the end before signatures or append to end
        if re.search(r'(signature|signed|date):', content, re.IGNORECASE):
            content = re.sub(r'(\n*)(signature|signed|date):', fr'{jurisdiction_clause}\n\n\1\2:', content, flags=re.IGNORECASE)
        else:
            content += jurisdiction_clause
        
        return content, "Added comprehensive governing law and jurisdiction clause"
    
    async def _fix_unlimited_liability(self, content: str, risk: Dict[str, Any]) -> Tuple[str, str]:
        """Replace unlimited liability with reasonable limitations."""
        liability_limitation = """
LIMITATION OF LIABILITY:
Except for breaches of confidentiality, gross negligence, or willful misconduct, each party's total liability under this Agreement shall not exceed the total amount paid or payable under this Agreement in the twelve (12) months preceding the claim. Neither party shall be liable for any indirect, incidental, special, consequential, or punitive damages, regardless of the theory of liability."""
        
        # Replace unlimited liability clauses
        patterns_to_replace = [
            (r'shall be liable for all damages without limitation', 
             'liability shall be limited as set forth in the Limitation of Liability clause below'),
            (r'without limitation', 'subject to the limitations set forth herein'),
            (r'liable for all damages', 'liable for direct damages only, subject to limitations'),
            (r'unlimited liability', 'limited liability as specified herein')
        ]
        
        fixed_content = content
        for pattern, replacement in patterns_to_replace:
            fixed_content = re.sub(pattern, replacement, fixed_content, flags=re.IGNORECASE)
        
        # Add the limitation clause
        if 'limitation of liability' not in fixed_content.lower():
            fixed_content += f"\n{liability_limitation}"
        
        return fixed_content, "Replaced unlimited liability with reasonable limitations and added comprehensive liability limitation clause"
    
    async def _fix_automatic_renewal(self, content: str, risk: Dict[str, Any]) -> Tuple[str, str]:
        """Fix automatic renewal terms."""
        renewal_clause = """
TERM AND RENEWAL:
This Agreement shall automatically renew for successive one (1) year periods unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term. Such notice may be delivered by email to the addresses specified herein or by registered mail."""
        
        # Replace vague automatic renewal language
        patterns_to_replace = [
            (r'automatic renewal occurs unless notice is provided in a reasonable timeframe',
             'this Agreement shall automatically renew as specified in the Term and Renewal clause'),
            (r'automatically renew.*?unless.*?notice', 
             'automatically renew for successive periods unless written notice is provided as specified herein')
        ]
        
        fixed_content = content
        for pattern, replacement in patterns_to_replace:
            fixed_content = re.sub(pattern, replacement, fixed_content, flags=re.IGNORECASE | re.DOTALL)
        
        # Add detailed renewal clause if not present
        if 'term and renewal' not in fixed_content.lower():
            fixed_content += f"\n{renewal_clause}"
        
        return fixed_content, "Clarified automatic renewal terms with specific notice periods and methods"
    
    async def _fix_penalty_clauses(self, content: str, risk: Dict[str, Any]) -> Tuple[str, str]:
        """Replace penalties with liquidated damages."""
        liquidated_damages_clause = """
LIQUIDATED DAMAGES:
The parties acknowledge that delays in performance may cause damages that are difficult to quantify. Therefore, for each day of delay beyond agreed deadlines, the defaulting party shall pay liquidated damages (and not a penalty) equal to 0.1% of the affected deliverable value, up to a maximum of 10% of the total Agreement value."""
        
        # Replace penalty language
        patterns_to_replace = [
            (r'penalties will be applied as deemed appropriate',
             'liquidated damages shall apply as specified in the Liquidated Damages clause'),
            (r'penalty|penalties', 'liquidated damages'),
            (r'as deemed appropriate', 'as specifically calculated herein')
        ]
        
        fixed_content = content
        for pattern, replacement in patterns_to_replace:
            fixed_content = re.sub(pattern, replacement, fixed_content, flags=re.IGNORECASE)
        
        # Add liquidated damages clause
        if 'liquidated damages' not in fixed_content.lower() or 'penalty' in content.lower():
            fixed_content += f"\n{liquidated_damages_clause}"
        
        return fixed_content, "Replaced penalty clauses with enforceable liquidated damages provisions"
    
    async def _fix_force_majeure_missing(self, content: str, risk: Dict[str, Any]) -> Tuple[str, str]:
        """Add force majeure clause."""
        force_majeure_clause = """
FORCE MAJEURE:
Neither party shall be liable for any delay or failure to perform its obligations under this Agreement if such delay or failure results from circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, epidemic, pandemic, government actions, labor disputes, or telecommunications failures. The affected party must promptly notify the other party and use reasonable efforts to mitigate the impact."""
        
        content += f"\n{force_majeure_clause}"
        return content, "Added comprehensive force majeure clause covering unforeseeable events"
    
    async def _fix_confidentiality_risks(self, content: str, risk: Dict[str, Any]) -> Tuple[str, str]:
        """Add confidentiality provisions."""
        confidentiality_clause = """
CONFIDENTIALITY:
Each party acknowledges that it may receive confidential and proprietary information of the other party. Each party agrees to: (a) maintain such information in strict confidence; (b) not disclose such information to third parties without written consent; (c) use such information solely for purposes of this Agreement; and (d) return or destroy such information upon termination. This obligation survives termination of this Agreement for five (5) years."""
        
        content += f"\n{confidentiality_clause}"
        return content, "Added comprehensive confidentiality and non-disclosure provisions"
    
    async def _fix_intellectual_property(self, content: str, risk: Dict[str, Any]) -> Tuple[str, str]:
        """Add intellectual property clause."""
        ip_clause = """
INTELLECTUAL PROPERTY:
All intellectual property rights in any work product, deliverables, or materials created specifically for this Agreement shall belong to the Client. Each party retains ownership of its pre-existing intellectual property. The performing party grants the other party a non-exclusive license to use any pre-existing intellectual property necessary for the intended use of the deliverables."""
        
        content += f"\n{ip_clause}"
        return content, "Added clear intellectual property ownership and licensing provisions"
    
    async def _fix_indemnification_issues(self, content: str, risk: Dict[str, Any]) -> Tuple[str, str]:
        """Add mutual indemnification clause."""
        indemnification_clause = """
MUTUAL INDEMNIFICATION:
Each party agrees to indemnify, defend, and hold harmless the other party from and against any third-party claims, damages, losses, and expenses (including reasonable attorneys' fees) arising from: (a) breach of this Agreement by the indemnifying party; (b) negligent acts or omissions of the indemnifying party; or (c) violation of applicable laws by the indemnifying party."""
        
        content += f"\n{indemnification_clause}"
        return content, "Added balanced mutual indemnification provisions"
    
    async def _fix_termination_risks(self, content: str, risk: Dict[str, Any]) -> Tuple[str, str]:
        """Fix unfavorable termination clauses."""
        termination_clause = """
TERMINATION:
Either party may terminate this Agreement: (a) for convenience with thirty (30) days written notice; (b) immediately upon material breach by the other party if such breach is not cured within ten (10) days after written notice; or (c) immediately if the other party becomes insolvent or files for bankruptcy. Upon termination, each party shall return confidential information and pay all amounts due through the termination date."""
        
        # Replace problematic termination language
        patterns_to_replace = [
            (r'may be terminated by either party at any time without cause or notice',
             'may be terminated as specified in the Termination clause below'),
            (r'at any time without cause or notice', 'with appropriate notice as specified herein')
        ]
        
        fixed_content = content
        for pattern, replacement in patterns_to_replace:
            fixed_content = re.sub(pattern, replacement, fixed_content, flags=re.IGNORECASE)
        
        # Add balanced termination clause
        if 'termination:' not in fixed_content.lower():
            fixed_content += f"\n{termination_clause}"
        
        return fixed_content, "Replaced unfavorable termination terms with balanced notice periods and cure provisions"
    
    async def _fix_ambiguous_terms(self, content: str, risk: Dict[str, Any]) -> Tuple[str, str]:
        """Replace ambiguous terms with specific language."""
        # Define specific replacements for ambiguous terms
        replacements = {
            r'\breasonable timeframe\b': 'thirty (30) calendar days',
            r'\breasonable time\b': 'thirty (30) calendar days', 
            r'\btimely manner\b': 'within the timeframes specified herein',
            r'\bas soon as possible\b': 'within five (5) business days',
            r'\bappropriate\b(?!\s+notice)': 'as specified in this Agreement',
            r'\badequate\b(?!\s+notice)': 'sufficient as determined in good faith',
            r'\bcommercially reasonable\b': 'consistent with industry standards'
        }
        
        fixed_content = content
        applied_replacements = []
        
        for pattern, replacement in replacements.items():
            if re.search(pattern, fixed_content, re.IGNORECASE):
                fixed_content = re.sub(pattern, replacement, fixed_content, flags=re.IGNORECASE)
                applied_replacements.append(f"'{pattern}' → '{replacement}'")
        
        if applied_replacements:
            return fixed_content, f"Replaced ambiguous terms: {', '.join(applied_replacements)}"
        else:
            return content, "No ambiguous terms requiring replacement found"
    
    def _calculate_improvement(self, original: Dict[str, Any], remediated: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate improvement metrics."""
        original_score = original.get('risk_score', 0)
        remediated_score = remediated.get('risk_score', 0)
        
        improvement_percentage = ((original_score - remediated_score) / original_score * 100) if original_score > 0 else 0
        
        risk_reduction = {
            'total_risks': original.get('total_risks', 0) - remediated.get('total_risks', 0),
            'score_improvement': original_score - remediated_score,
            'percentage_improvement': improvement_percentage,
            'original_level': original.get('risk_level', 'unknown'),
            'new_level': remediated.get('risk_level', 'unknown')
        }
        
        return risk_reduction


# Tool registration
def get_remediation_tool(jurisdiction: str = "jordan") -> ContractRemediationTool:
    """Get contract remediation tool instance."""
    return ContractRemediationTool(jurisdiction)
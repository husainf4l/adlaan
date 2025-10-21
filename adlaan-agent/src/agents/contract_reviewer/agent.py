"""
Contract Reviewer Agent for comprehensive contract analysis and review.
"""
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from langchain.schema import HumanMessage, SystemMessage

from ..base_agent.base_agent import BaseAgent, AgentState
from src.schemas import AgentType
from .tools import (
    DocumentValidationTool,
    RiskAssessmentTool,
    ComplianceTool,
    ContractRemediationTool
)
from .nodes import (
    ThinkingNode,
    PlanningNode
)


class ContractReviewerAgent(BaseAgent):
    """Agent for comprehensive contract review and analysis."""
    
    def __init__(self):
        super().__init__(AgentType.CONTRACT_REVIEWER)
    
    async def _build_graph(self) -> StateGraph:
        """Build the contract review workflow."""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("validate_structure", self._validate_structure)
        workflow.add_node("assess_risks", self._assess_risks)
        workflow.add_node("check_compliance", self._check_compliance)
        workflow.add_node("analyze_terms", self._analyze_terms)
        workflow.add_node("generate_recommendations", self._generate_recommendations)
        workflow.add_node("create_review_report", self._create_review_report)
        
        # Add edges
        workflow.set_entry_point("validate_structure")
        workflow.add_edge("validate_structure", "assess_risks")
        workflow.add_edge("assess_risks", "check_compliance")
        workflow.add_edge("check_compliance", "analyze_terms")
        workflow.add_edge("analyze_terms", "generate_recommendations")
        workflow.add_edge("generate_recommendations", "create_review_report")
        workflow.add_edge("create_review_report", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    async def _prepare_input(self, input_data: Dict[str, Any]) -> AgentState:
        """Prepare input for contract review."""
        return AgentState({
            "contract_content": input_data.get("contract_content", ""),
            "contract_type": input_data.get("contract_type", "general"),
            "jurisdiction": input_data.get("jurisdiction", "jordan"),
            "review_focus": input_data.get("review_focus", "comprehensive"),
            "structure_validation": {},
            "risk_assessment": {},
            "compliance_check": {},
            "terms_analysis": {},
            "recommendations": [],
            "review_report": {}
        })
    
    async def _extract_output(self, final_state: AgentState) -> Dict[str, Any]:
        """Extract output from final state."""
        return {
            "review_report": final_state.get("review_report", {}),
            "risk_assessment": final_state.get("risk_assessment", {}),
            "compliance": final_state.get("compliance_check", {}),
            "recommendations": final_state.get("recommendations", [])
        }
    
    async def _validate_structure(self, state: AgentState) -> AgentState:
        """Validate contract structure."""
        self.logger.info("Validating contract structure")
        
        try:
            # Use document validation tool
            validation_tool = DocumentValidationTool()
            
            validation_result = await validation_tool.validate_legal_structure(
                state["contract_content"],
                state["contract_type"]
            )
            
            state["structure_validation"] = validation_result
            
        except Exception as e:
            self.logger.error(f"Structure validation failed: {e}")
            state["structure_validation"] = {
                "valid": False,
                "error": str(e),
                "issues": ["Validation failed"]
            }
        
        return state
    
    async def _assess_risks(self, state: AgentState) -> AgentState:
        """Assess contract risks."""
        self.logger.info("Assessing contract risks")
        
        try:
            # Use risk assessment tool
            risk_tool = RiskAssessmentTool()
            
            risk_result = await risk_tool.assess_legal_risks(
                state["contract_content"],
                {"contract_type": state["contract_type"]}
            )
            
            state["risk_assessment"] = risk_result
            
        except Exception as e:
            self.logger.error(f"Risk assessment failed: {e}")
            state["risk_assessment"] = {
                "total_risks": 0,
                "risk_level": "unknown",
                "error": str(e)
            }
        
        return state
    
    async def _check_compliance(self, state: AgentState) -> AgentState:
        """Check contract compliance."""
        self.logger.info("Checking contract compliance")
        
        try:
            # Use compliance tool
            compliance_tool = ComplianceTool(jurisdiction=state["jurisdiction"])
            
            compliance_result = await compliance_tool.check_compliance(
                state["contract_content"],
                state["contract_type"]
            )
            
            state["compliance_check"] = compliance_result
            
        except Exception as e:
            self.logger.error(f"Compliance check failed: {e}")
            state["compliance_check"] = {
                "status": "unknown",
                "error": str(e)
            }
        
        return state
    
    async def _analyze_terms(self, state: AgentState) -> AgentState:
        """Analyze contract terms and conditions."""
        self.logger.info("Analyzing contract terms")
        
        content = state["contract_content"]
        
        # Extract and analyze key terms
        terms_analysis = {
            "key_clauses": self._extract_key_clauses(content),
            "termination_terms": self._analyze_termination(content),
            "payment_terms": self._analyze_payment_terms(content),
            "liability_clauses": self._analyze_liability(content),
            "dispute_resolution": self._analyze_dispute_resolution(content),
            "force_majeure": self._check_force_majeure(content),
            "intellectual_property": self._analyze_ip_clauses(content),
            "confidentiality": self._analyze_confidentiality(content)
        }
        
        state["terms_analysis"] = terms_analysis
        return state
    
    async def _generate_recommendations(self, state: AgentState) -> AgentState:
        """Generate review recommendations."""
        self.logger.info("Generating recommendations")
        
        recommendations = []
        
        # Structure-based recommendations
        structure = state["structure_validation"]
        if not structure.get("valid", True):
            recommendations.extend([
                f"Fix structural issue: {issue}" 
                for issue in structure.get("issues", [])
            ])
        
        # Risk-based recommendations
        risks = state["risk_assessment"]
        if risks.get("total_risks", 0) > 5:
            recommendations.append("High risk level detected - consider comprehensive revision")
        
        # Compliance-based recommendations
        compliance = state["compliance_check"]
        if compliance.get("status") != "compliant":
            recommendations.append("Address compliance issues before finalization")
        
        # Terms-based recommendations
        terms = state["terms_analysis"]
        if not terms.get("termination_terms", {}).get("clear", False):
            recommendations.append("Clarify termination conditions and procedures")
        
        if not terms.get("payment_terms", {}).get("specific", False):
            recommendations.append("Define specific payment terms and schedules")
        
        if not terms.get("dispute_resolution", {}).get("present", False):
            recommendations.append("Add dispute resolution mechanism")
        
        state["recommendations"] = recommendations
        return state
    
    async def _create_review_report(self, state: AgentState) -> AgentState:
        """Create comprehensive review report."""
        self.logger.info("Creating review report")
        
        # Calculate overall scores
        structure_score = self._calculate_structure_score(state["structure_validation"])
        risk_score = self._calculate_risk_score(state["risk_assessment"])
        compliance_score = self._calculate_compliance_score(state["compliance_check"])
        terms_score = self._calculate_terms_score(state["terms_analysis"])
        
        overall_score = (structure_score + risk_score + compliance_score + terms_score) / 4
        
        review_report = {
            "contract_type": state["contract_type"],
            "jurisdiction": state["jurisdiction"],
            "review_date": "2025-10-21",
            "overall_score": round(overall_score, 2),
            "overall_rating": self._get_rating(overall_score),
            "scores": {
                "structure": structure_score,
                "risk_management": risk_score,
                "compliance": compliance_score,
                "terms_clarity": terms_score
            },
            "summary": {
                "total_issues": len(state["recommendations"]),
                "critical_issues": self._count_critical_issues(state),
                "recommendations_count": len(state["recommendations"]),
                "approval_status": self._determine_approval_status(overall_score)
            },
            "detailed_findings": {
                "structure": state["structure_validation"],
                "risks": state["risk_assessment"],
                "compliance": state["compliance_check"],
                "terms": state["terms_analysis"]
            },
            "recommendations": state["recommendations"],
            "next_steps": self._generate_next_steps(overall_score, state["recommendations"])
        }
        
        state["review_report"] = review_report
        return state
    
    def _extract_key_clauses(self, content: str) -> Dict[str, bool]:
        """Extract and check for key clauses."""
        content_lower = content.lower()
        
        return {
            "parties_defined": "party" in content_lower or "parties" in content_lower,
            "consideration": "consideration" in content_lower or "payment" in content_lower,
            "scope_of_work": "scope" in content_lower or "services" in content_lower,
            "term_duration": "term" in content_lower or "duration" in content_lower,
            "governing_law": "governing law" in content_lower or "jurisdiction" in content_lower,
            "signatures": "signature" in content_lower or "signed" in content_lower
        }
    
    def _analyze_termination(self, content: str) -> Dict[str, Any]:
        """Analyze termination clauses."""
        content_lower = content.lower()
        
        has_termination = "terminat" in content_lower
        has_notice_period = "notice" in content_lower and "day" in content_lower
        has_cause = "cause" in content_lower or "breach" in content_lower
        
        return {
            "present": has_termination,
            "notice_period_defined": has_notice_period,
            "termination_for_cause": has_cause,
            "clear": has_termination and has_notice_period
        }
    
    def _analyze_payment_terms(self, content: str) -> Dict[str, Any]:
        """Analyze payment terms."""
        content_lower = content.lower()
        
        has_amount = any(symbol in content for symbol in ["$", "USD", "JOD"])
        has_schedule = "monthly" in content_lower or "quarterly" in content_lower or "annual" in content_lower
        has_late_fees = "late" in content_lower and ("fee" in content_lower or "penalty" in content_lower)
        
        return {
            "amount_specified": has_amount,
            "schedule_defined": has_schedule,
            "late_fees": has_late_fees,
            "specific": has_amount and has_schedule
        }
    
    def _analyze_liability(self, content: str) -> Dict[str, Any]:
        """Analyze liability clauses."""
        content_lower = content.lower()
        
        return {
            "limitation_present": "limitation of liability" in content_lower,
            "indemnification": "indemnif" in content_lower,
            "exclusions": "exclud" in content_lower and "liabil" in content_lower
        }
    
    def _analyze_dispute_resolution(self, content: str) -> Dict[str, Any]:
        """Analyze dispute resolution mechanisms."""
        content_lower = content.lower()
        
        return {
            "present": "dispute" in content_lower or "arbitration" in content_lower or "mediation" in content_lower,
            "arbitration": "arbitration" in content_lower,
            "mediation": "mediation" in content_lower,
            "court_jurisdiction": "court" in content_lower and "jurisdiction" in content_lower
        }
    
    def _check_force_majeure(self, content: str) -> Dict[str, Any]:
        """Check for force majeure clauses."""
        content_lower = content.lower()
        
        return {
            "present": "force majeure" in content_lower or "act of god" in content_lower,
            "comprehensive": "pandemic" in content_lower or "natural disaster" in content_lower
        }
    
    def _analyze_ip_clauses(self, content: str) -> Dict[str, Any]:
        """Analyze intellectual property clauses."""
        content_lower = content.lower()
        
        return {
            "present": "intellectual property" in content_lower or "copyright" in content_lower or "patent" in content_lower,
            "ownership_defined": "owns" in content_lower or "ownership" in content_lower
        }
    
    def _analyze_confidentiality(self, content: str) -> Dict[str, Any]:
        """Analyze confidentiality provisions."""
        content_lower = content.lower()
        
        return {
            "present": "confidential" in content_lower or "non-disclosure" in content_lower,
            "duration_specified": "year" in content_lower and "confidential" in content_lower
        }
    
    def _calculate_structure_score(self, structure: Dict[str, Any]) -> float:
        """Calculate structure quality score."""
        if structure.get("valid", False):
            return 1.0
        else:
            issues_count = len(structure.get("issues", []))
            return max(0.0, 1.0 - (issues_count * 0.2))
    
    def _calculate_risk_score(self, risks: Dict[str, Any]) -> float:
        """Calculate risk management score."""
        total_risks = risks.get("total_risks", 0)
        if total_risks == 0:
            return 1.0
        elif total_risks <= 3:
            return 0.8
        elif total_risks <= 6:
            return 0.6
        else:
            return 0.4
    
    def _calculate_compliance_score(self, compliance: Dict[str, Any]) -> float:
        """Calculate compliance score."""
        status = compliance.get("status", "unknown")
        if status == "compliant":
            return 1.0
        elif status == "minor_issues":
            return 0.7
        elif status == "major_issues":
            return 0.4
        else:
            return 0.5
    
    def _calculate_terms_score(self, terms: Dict[str, Any]) -> float:
        """Calculate terms clarity score."""
        score = 0.0
        total_aspects = 0
        
        for aspect, analysis in terms.items():
            if isinstance(analysis, dict):
                total_aspects += 1
                if analysis.get("clear", False) or analysis.get("present", False) or analysis.get("specific", False):
                    score += 1
        
        return score / total_aspects if total_aspects > 0 else 0.5
    
    def _get_rating(self, score: float) -> str:
        """Convert score to rating."""
        if score >= 0.9:
            return "excellent"
        elif score >= 0.8:
            return "good"
        elif score >= 0.6:
            return "fair"
        else:
            return "needs_improvement"
    
    def _count_critical_issues(self, state: Dict[str, Any]) -> int:
        """Count critical issues."""
        critical_count = 0
        
        # High risk count
        risks = state["risk_assessment"]
        if risks.get("total_risks", 0) > 5:
            critical_count += 1
        
        # Non-compliant
        compliance = state["compliance_check"]
        if compliance.get("status") == "major_issues":
            critical_count += 1
        
        # Structure invalid
        structure = state["structure_validation"]
        if not structure.get("valid", True):
            critical_count += 1
        
        return critical_count
    
    def _determine_approval_status(self, score: float) -> str:
        """Determine contract approval status."""
        if score >= 0.8:
            return "approved"
        elif score >= 0.6:
            return "approved_with_conditions"
        else:
            return "requires_revision"
    
    def _generate_next_steps(self, score: float, recommendations: List[str]) -> List[str]:
        """Generate next steps based on review."""
        if score >= 0.8:
            return ["Contract is ready for execution", "Consider minor improvements if needed"]
        elif score >= 0.6:
            return ["Address identified issues before execution", "Implement recommended changes"]
        else:
            return ["Major revision required", "Address all critical issues", "Consider legal counsel review"]
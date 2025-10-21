"""
Planning node for detailed project planning.
"""
from typing import Dict, Any, List
from datetime import datetime
from src.core.logging import get_logger

logger = get_logger(__name__)


class PlanningNode:
    """Node for detailed project planning."""
    
    def __init__(self, agent_instance):
        self.agent = agent_instance
        self.logger = logger
    
    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Process detailed planning."""
        self.logger.info("📋 Planning node: Creating detailed work plan")
        
        thinking_analysis = state.get("thinking_analysis", {})
        task_type = state.get("task_type", "general")
        
        # Create detailed plan based on task type
        detailed_plan = await self._create_detailed_plan(task_type, thinking_analysis)
        
        # Plan quality checkpoints
        quality_checkpoints = self._plan_quality_checkpoints(detailed_plan)
        
        # Create contingency plans
        contingency_plans = self._create_contingency_plans(thinking_analysis)
        
        state.update({
            "detailed_plan": detailed_plan,
            "quality_checkpoints": quality_checkpoints,
            "contingency_plans": contingency_plans,
            "planning_timestamp": datetime.now().isoformat()
        })
        
        return state
    
    async def _create_detailed_plan(self, task_type: str, thinking_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed execution plan based on task type."""
        plan_templates = {
            "legal_document": {
                "phases": [
                    {
                        "name": "Requirements Analysis",
                        "steps": ["gather_requirements", "analyze_legal_context", "identify_stakeholders"],
                        "outputs": ["requirements_document", "legal_brief"]
                    },
                    {
                        "name": "Research & Analysis", 
                        "steps": ["legal_research", "precedent_analysis", "compliance_check"],
                        "outputs": ["research_summary", "compliance_report"]
                    },
                    {
                        "name": "Document Generation",
                        "steps": ["draft_structure", "write_content", "format_document"],
                        "outputs": ["first_draft", "formatted_document"]
                    },
                    {
                        "name": "Review & Refinement",
                        "steps": ["quality_review", "risk_assessment", "final_formatting"],
                        "outputs": ["reviewed_document", "risk_report", "final_document"]
                    }
                ]
            },
            "document_analysis": {
                "phases": [
                    {
                        "name": "Document Parsing",
                        "steps": ["parse_structure", "extract_sections", "identify_content_types"],
                        "outputs": ["parsed_structure", "section_map"]
                    },
                    {
                        "name": "Content Analysis",
                        "steps": ["analyze_language", "identify_clauses", "extract_entities"],
                        "outputs": ["language_analysis", "clause_list", "entity_map"]
                    },
                    {
                        "name": "Risk Assessment",
                        "steps": ["identify_risks", "assess_severity", "recommend_mitigations"],
                        "outputs": ["risk_matrix", "mitigation_plan"]
                    },
                    {
                        "name": "Compliance Check",
                        "steps": ["check_regulations", "validate_requirements", "generate_report"],
                        "outputs": ["compliance_report", "recommendations"]
                    }
                ]
            }
        }
        
        template = plan_templates.get(task_type, plan_templates["legal_document"])
        
        # Customize based on complexity
        complexity_level = thinking_analysis.get("complexity", {}).get("level", "simple")
        if complexity_level == "complex":
            # Add additional validation steps for complex tasks
            for phase in template["phases"]:
                if "validation" not in phase["steps"]:
                    phase["steps"].append("validation_checkpoint")
        
        return {
            "task_type": task_type,
            "complexity_level": complexity_level,
            "phases": template["phases"],
            "total_phases": len(template["phases"]),
            "estimated_completion": self._calculate_completion_time(template["phases"])
        }
    
    def _plan_quality_checkpoints(self, detailed_plan: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Plan quality checkpoints throughout execution."""
        checkpoints = []
        
        for i, phase in enumerate(detailed_plan.get("phases", [])):
            checkpoint = {
                "phase": phase["name"],
                "checkpoint_type": "phase_completion",
                "criteria": [
                    "All steps completed successfully",
                    "Outputs meet quality standards",
                    "No blocking issues identified"
                ],
                "automated": True,
                "critical": i == len(detailed_plan["phases"]) - 1  # Last phase is critical
            }
            checkpoints.append(checkpoint)
        
        return checkpoints
    
    def _create_contingency_plans(self, thinking_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Create contingency plans for potential issues."""
        return {
            "api_failure": {
                "triggers": ["OpenAI API unavailable", "External service timeout"],
                "actions": ["Switch to fallback model", "Use cached responses", "Graceful degradation"]
            },
            "quality_issues": {
                "triggers": ["Low quality score", "Validation failures", "Compliance issues"],
                "actions": ["Retry with different approach", "Manual review required", "Use backup template"]
            },
            "complexity_overflow": {
                "triggers": ["Task too complex", "Resource constraints", "Time limits exceeded"],
                "actions": ["Break into subtasks", "Request additional resources", "Simplify requirements"]
            }
        }
    
    def _calculate_completion_time(self, phases: List[Dict[str, Any]]) -> str:
        """Calculate estimated completion time."""
        base_time_per_phase = 3  # minutes
        total_minutes = len(phases) * base_time_per_phase
        
        if total_minutes < 60:
            return f"{total_minutes} minutes"
        else:
            hours = total_minutes // 60
            minutes = total_minutes % 60
            return f"{hours}h {minutes}m"
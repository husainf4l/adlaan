"""
Thinking node for complex reasoning and planning.
"""
from typing import Dict, Any, List
from datetime import datetime
from src.core.logging import get_logger

logger = get_logger(__name__)


class ThinkingNode:
    """Node for complex reasoning and planning."""
    
    def __init__(self, agent_instance):
        self.agent = agent_instance
        self.logger = logger
    
    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Process thinking and planning."""
        self.logger.info("🧠 Thinking node: Analyzing task and planning approach")
        
        task_description = state.get("task_description", "")
        context = state.get("context", {})
        
        # Analyze task complexity
        complexity_analysis = self._analyze_task_complexity(task_description, context)
        
        # Create execution plan
        execution_plan = self._create_execution_plan(task_description, complexity_analysis)
        
        # Set priorities and resource allocation
        resource_plan = self._plan_resources(complexity_analysis, execution_plan)
        
        state.update({
            "thinking_analysis": {
                "complexity": complexity_analysis,
                "execution_plan": execution_plan,
                "resource_plan": resource_plan,
                "thinking_timestamp": datetime.now().isoformat()
            },
            "estimated_duration": resource_plan.get("estimated_minutes", 5),
            "priority_level": complexity_analysis.get("priority", "normal")
        })
        
        return state
    
    def _analyze_task_complexity(self, task_description: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the complexity of the given task."""
        complexity_indicators = {
            "length": len(task_description),
            "keywords": len(task_description.split()),
            "legal_terms": self._count_legal_terms(task_description),
            "context_richness": len(context),
            "multiple_parties": "parties" in task_description.lower() or "between" in task_description.lower()
        }
        
        # Calculate complexity score
        score = 0
        if complexity_indicators["length"] > 200:
            score += 2
        if complexity_indicators["legal_terms"] > 5:
            score += 2
        if complexity_indicators["multiple_parties"]:
            score += 1
        if complexity_indicators["context_richness"] > 3:
            score += 1
        
        complexity_level = "simple"
        if score >= 4:
            complexity_level = "complex"
        elif score >= 2:
            complexity_level = "moderate"
        
        return {
            "score": score,
            "level": complexity_level,
            "indicators": complexity_indicators,
            "requires_research": complexity_indicators["legal_terms"] > 3,
            "requires_validation": complexity_level != "simple"
        }
    
    def _count_legal_terms(self, text: str) -> int:
        """Count legal terms in text."""
        legal_terms = [
            "contract", "agreement", "party", "parties", "whereas", "therefore",
            "obligation", "liability", "jurisdiction", "governing", "breach",
            "damages", "remedy", "clause", "provision", "amendment", "terminate"
        ]
        text_lower = text.lower()
        return sum(1 for term in legal_terms if term in text_lower)
    
    def _create_execution_plan(self, task_description: str, complexity_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create step-by-step execution plan."""
        base_steps = [
            {"step": "analyze_requirements", "duration": 1, "priority": "high"},
            {"step": "research_context", "duration": 2, "priority": "medium"},
            {"step": "generate_content", "duration": 3, "priority": "high"},
            {"step": "review_quality", "duration": 2, "priority": "high"}
        ]
        
        # Adjust based on complexity
        if complexity_analysis["requires_research"]:
            base_steps.insert(1, {
                "step": "deep_legal_research", 
                "duration": 5, 
                "priority": "high"
            })
        
        if complexity_analysis["requires_validation"]:
            base_steps.append({
                "step": "validate_compliance", 
                "duration": 3, 
                "priority": "medium"
            })
        
        return base_steps
    
    def _plan_resources(self, complexity_analysis: Dict[str, Any], execution_plan: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Plan resource allocation for the task."""
        total_duration = sum(step["duration"] for step in execution_plan)
        
        return {
            "estimated_minutes": total_duration,
            "cpu_intensive": complexity_analysis["level"] == "complex",
            "requires_external_api": complexity_analysis["requires_research"],
            "memory_usage": "high" if complexity_analysis["level"] == "complex" else "normal",
            "parallel_processing": len(execution_plan) > 4
        }
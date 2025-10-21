"""
Legal research node for conducting legal research.
"""
from typing import Dict, Any, List
import asyncio
from datetime import datetime
from src.core.logging import get_logger
from ..tools import LegalResearchTool

logger = get_logger(__name__)


class LegalResearchNode:
    """Node for conducting legal research."""
    
    def __init__(self, agent_instance):
        self.agent = agent_instance
        self.logger = logger
        self.research_tool = LegalResearchTool()
    
    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Process legal research."""
        self.logger.info("⚖️ Legal research node: Conducting legal research")
        
        task_description = state.get("task_description", "")
        document_type = state.get("document_type", "contract")
        jurisdiction = state.get("jurisdiction", "jordan")
        
        # Initialize research tool with jurisdiction
        research_tool = LegalResearchTool(jurisdiction=jurisdiction)
        
        # Conduct parallel research
        research_tasks = [
            research_tool.search_legal_precedents(task_description, document_type),
            research_tool.get_legal_citations(task_description)
        ]
        
        try:
            precedents_result, citations_result = await asyncio.gather(*research_tasks)
        except Exception as e:
            self.logger.error(f"Research failed: {e}")
            # Provide fallback research data
            precedents_result = {"precedents": [], "total_found": 0}
            citations_result = []
        
        # Compile research findings
        research_findings = {
            "precedents": precedents_result,
            "citations": citations_result,
            "research_summary": self._create_research_summary(precedents_result, citations_result),
            "research_timestamp": datetime.now().isoformat(),
            "jurisdiction": jurisdiction
        }
        
        state.update({
            "legal_research": research_findings,
            "research_completed": True
        })
        
        return state
    
    def _create_research_summary(self, precedents: Dict[str, Any], citations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create summary of research findings."""
        return {
            "total_precedents": precedents.get("total_found", 0),
            "total_citations": len(citations),
            "research_quality": "high" if precedents.get("total_found", 0) > 2 else "medium",
            "key_findings": [
                "Relevant legal precedents identified" if precedents.get("total_found", 0) > 0 else "Limited precedents found",
                f"Found {len(citations)} legal citations" if citations else "No citations found"
            ]
        }
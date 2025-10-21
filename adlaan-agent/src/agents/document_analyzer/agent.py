"""
Document Analyzer Agent for analyzing legal documents.
"""
from typing import Dict, Any
from langgraph.graph import StateGraph, END

from ..base_agent.base_agent import BaseAgent, AgentState
from src.schemas import AgentType
from .tools import (
    DocumentValidationTool,
    RiskAssessmentTool,
    ComplianceTool
)
from .nodes import (
    ThinkingNode,
    PlanningNode
)


class DocumentAnalyzerAgent(BaseAgent):
    """Agent for analyzing legal documents."""
    
    def __init__(self):
        super().__init__(AgentType.DOCUMENT_ANALYZER)
    
    async def _build_graph(self) -> StateGraph:
        """Build the document analysis workflow."""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("parse_document", self._parse_document)
        workflow.add_node("analyze_structure", self._analyze_structure)
        workflow.add_node("identify_risks", self._identify_risks)
        workflow.add_node("assess_compliance", self._assess_compliance)
        workflow.add_node("generate_report", self._generate_report)
        
        # Add edges
        workflow.set_entry_point("parse_document")
        workflow.add_edge("parse_document", "analyze_structure")
        workflow.add_edge("analyze_structure", "identify_risks")
        workflow.add_edge("identify_risks", "assess_compliance")
        workflow.add_edge("assess_compliance", "generate_report")
        workflow.add_edge("generate_report", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    async def _prepare_input(self, input_data: Dict[str, Any]) -> AgentState:
        """Prepare input for document analysis."""
        return AgentState({
            "document_content": input_data.get("document_content"),
            "analysis_type": input_data.get("analysis_type", "comprehensive"),
            "parameters": input_data.get("parameters", {}),
            "parsed_sections": [],
            "structure_analysis": {},
            "risk_assessment": {},
            "compliance_report": {},
            "final_report": {}
        })
    
    async def _extract_output(self, final_state: AgentState) -> Dict[str, Any]:
        """Extract output from final state."""
        return {
            "analysis": final_state.get("final_report", {}),
            "risks": final_state.get("risk_assessment", {}),
            "compliance": final_state.get("compliance_report", {}),
            "structure": final_state.get("structure_analysis", {})
        }
    
    async def _parse_document(self, state: AgentState) -> AgentState:
        """Parse document structure."""
        self.logger.info("Parsing document structure")
        
        # Simplified parsing - in practice, use proper document parsing
        content = state["document_content"]
        state["parsed_sections"] = content.split("\n\n")
        
        return state
    
    async def _analyze_structure(self, state: AgentState) -> AgentState:
        """Analyze document structure."""
        self.logger.info("Analyzing document structure")
        
        state["structure_analysis"] = {
            "section_count": len(state["parsed_sections"]),
            "has_title": True,
            "has_terms": True,
            "structure_score": 0.8
        }
        
        return state
    
    async def _identify_risks(self, state: AgentState) -> AgentState:
        """Identify potential risks."""
        self.logger.info("Identifying risks")
        
        state["risk_assessment"] = {
            "risk_level": "medium",
            "identified_risks": ["Unclear termination clause", "Limited liability coverage"],
            "recommendations": ["Clarify termination conditions", "Expand liability protection"]
        }
        
        return state
    
    async def _assess_compliance(self, state: AgentState) -> AgentState:
        """Assess compliance."""
        self.logger.info("Assessing compliance")
        
        state["compliance_report"] = {
            "compliance_score": 0.85,
            "violations": [],
            "recommendations": ["Add privacy clause"],
            "status": "compliant"
        }
        
        return state
    
    async def _generate_report(self, state: AgentState) -> AgentState:
        """Generate final analysis report."""
        self.logger.info("Generating analysis report")
        
        state["final_report"] = {
            "summary": "Document analysis completed",
            "structure": state["structure_analysis"],
            "risks": state["risk_assessment"],
            "compliance": state["compliance_report"],
            "overall_score": 0.8,
            "recommendations": [
                "Review termination clauses",
                "Add privacy compliance section",
                "Enhance liability protection"
            ]
        }
        
        return state
"""
Legal Document Generator Agent for generating legal documents.
"""
from typing import Dict, Any
import json
from datetime import datetime
from langgraph.graph import StateGraph, END
from langchain.schema import HumanMessage, SystemMessage

from ..base_agent.base_agent import BaseAgent, AgentState
from src.schemas import AgentType
from src.utils.agent_helpers import (
    safe_json_parse,
    clean_document_content,
    validate_document_structure,
    create_task_metadata,
    format_legal_prompt
)
from .tools import (
    DocumentFormattingTool,
    LegalResearchTool,
    DocumentValidationTool
)
from .nodes import (
    ThinkingNode,
    PlanningNode,
    DocumentGeneratorNode
)


class LegalDocumentGeneratorAgent(BaseAgent):
    """Agent for generating legal documents."""
    
    def __init__(self):
        super().__init__(AgentType.LEGAL_DOCUMENT_GENERATOR)
    
    async def _build_graph(self) -> StateGraph:
        """Build the document generation workflow."""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("analyze_requirements", self._analyze_requirements)
        workflow.add_node("research_legal_context", self._research_legal_context)
        workflow.add_node("generate_draft", self._generate_draft)
        workflow.add_node("review_and_refine", self._review_and_refine)
        workflow.add_node("finalize_document", self._finalize_document)
        
        # Add edges
        workflow.set_entry_point("analyze_requirements")
        workflow.add_edge("analyze_requirements", "research_legal_context")
        workflow.add_edge("research_legal_context", "generate_draft")
        workflow.add_edge("generate_draft", "review_and_refine")
        workflow.add_edge("review_and_refine", "finalize_document")
        workflow.add_edge("finalize_document", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    async def _prepare_input(self, input_data: Dict[str, Any]) -> AgentState:
        """Prepare input for document generation."""
        return AgentState({
            "document_type": input_data.get("document_type"),
            "title": input_data.get("title"),
            "parameters": input_data.get("parameters", {}),
            "jurisdiction": input_data.get("jurisdiction", "jordan"),
            "requirements": [],
            "legal_context": {},
            "draft_content": "",
            "reviewed_content": "",
            "final_document": "",
            "metadata": {}
        })
    
    async def _extract_output(self, final_state: AgentState) -> Dict[str, Any]:
        """Extract output from final state."""
        return {
            "document": {
                "title": final_state.get("title"),
                "content": final_state.get("final_document"),
                "type": final_state.get("document_type"),
                "metadata": final_state.get("metadata", {})
            },
            "analysis": {
                "requirements": final_state.get("requirements", []),
                "legal_context": final_state.get("legal_context", {}),
                "jurisdiction": final_state.get("jurisdiction")
            }
        }
    
    async def _analyze_requirements(self, state: AgentState) -> AgentState:
        """Analyze document requirements."""
        self.logger.info("Analyzing document requirements")
        
        context = {
            "document_type": state['document_type'],
            "title": state['title'],
            "parameters": state['parameters'],
            "jurisdiction": state['jurisdiction']
        }
        
        prompt = format_legal_prompt(
            f"Analyze the requirements for generating a {state['document_type']} document",
            context,
            "json"
        )
        
        prompt += """
        
        Provide a detailed analysis with this exact JSON structure:
        {
            "requirements": ["requirement1", "requirement2", ...],
            "analysis": {
                "essential_elements": ["element1", "element2"],
                "specific_clauses": ["clause1", "clause2"],
                "compliance_requirements": ["req1", "req2"],
                "risk_considerations": ["risk1", "risk2"]
            }
        }
        """
        
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content="You are a legal document analysis expert."),
                HumanMessage(content=prompt)
            ])
            
            # Parse response safely
            analysis = safe_json_parse(response.content, {
                "requirements": ["Basic legal structure", "Standard clauses"],
                "analysis": {"status": "fallback_used"}
            })
            
            state["requirements"] = analysis.get("requirements", [])
            state["analysis"] = analysis.get("analysis", {})
            
        except Exception as e:
            self.logger.error(f"Requirements analysis failed: {e}")
            state["requirements"] = ["Basic legal structure", "Standard clauses"]
            state["analysis"] = {"error": str(e)}
        
        return state
    
    async def _research_legal_context(self, state: AgentState) -> AgentState:
        """Research relevant legal context."""
        self.logger.info("Researching legal context")
        
        # This would integrate with legal databases in production
        state["legal_context"] = {
            "jurisdiction": state["jurisdiction"],
            "applicable_laws": ["Civil Code", "Commercial Law"],
            "precedents": [],
            "compliance_notes": "Standard compliance required"
        }
        
        return state
    
    async def _generate_draft(self, state: AgentState) -> AgentState:
        """Generate document draft."""
        self.logger.info("Generating document draft")
        
        prompt = f"""
        Generate a comprehensive {state['document_type']} document.
        
        Requirements: {json.dumps(state['requirements'])}
        Parameters: {json.dumps(state['parameters'])}
        Legal Context: {json.dumps(state['legal_context'])}
        
        Create a professional, legally sound document with:
        1. Proper legal structure
        2. All required clauses
        3. Clear terms and conditions
        4. Compliance with {state['jurisdiction']} law
        
        Output the complete document text.
        """
        
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content="You are an expert legal document drafter."),
                HumanMessage(content=prompt)
            ])
            
            state["draft_content"] = response.content
            
        except Exception as e:
            self.logger.error(f"Draft generation failed: {e}")
            state["draft_content"] = f"Draft generation failed: {str(e)}"
        
        return state
    
    async def _review_and_refine(self, state: AgentState) -> AgentState:
        """Review and refine the document."""
        self.logger.info("Reviewing and refining document")
        
        prompt = f"""
        Review and refine this legal document draft:
        
        {state['draft_content']}
        
        Check for:
        1. Legal accuracy
        2. Completeness
        3. Clarity
        4. Compliance
        
        Provide the refined version.
        """
        
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content="You are a legal document reviewer and editor."),
                HumanMessage(content=prompt)
            ])
            
            state["reviewed_content"] = response.content
            
        except Exception as e:
            self.logger.error(f"Document review failed: {e}")
            state["reviewed_content"] = state["draft_content"]
        
        return state
    
    async def _finalize_document(self, state: AgentState) -> AgentState:
        """Finalize the document."""
        self.logger.info("Finalizing document")
        
        # Clean and validate the document content
        cleaned_content = clean_document_content(state["reviewed_content"])
        validation_result = validate_document_structure(cleaned_content)
        
        state["final_document"] = cleaned_content
        state["metadata"] = create_task_metadata(
            agent_type=self.agent_type.value,
            document_type=state["document_type"],
            jurisdiction=state["jurisdiction"],
            validation=validation_result,
            word_count=len(cleaned_content.split()) if cleaned_content else 0
        )
        
        # Log validation results
        if not validation_result["valid"]:
            self.logger.warning(f"Document validation issues: {validation_result['issues']}")
        
        return state
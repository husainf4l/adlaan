"""
Multi-Agent Orchestration System for Legal AI
Implements specialized agents: Research, Draft, Review, and Citation agents
"""

from typing import Dict, List, Optional, TypedDict
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import BaseMessage
from langchain_openai import ChatOpenAI
import json
from datetime import datetime

class MultiAgentState(TypedDict):
    """State for multi-agent legal processing"""
    messages: List[BaseMessage]
    task_type: str
    jurisdiction: str
    legal_domain: str
    research_findings: List[Dict]
    draft_content: Dict
    review_feedback: Dict
    citations: List[Dict]
    final_output: Dict
    validation_results: Dict


class ResearchAgent:
    """Specialized agent for legal research and precedent finding"""
    
    def __init__(self, model_name: str = "gpt-4"):
        self.llm = ChatOpenAI(model=model_name, temperature=0.1)
    
    def process(self, state: MultiAgentState) -> Dict:
        """Conduct legal research based on the task"""
        system_prompt = """You are a Legal Research Specialist AI.

Your role is to:
1. Identify relevant legal areas and concepts
2. Find applicable laws, regulations, and statutes  
3. Locate relevant case precedents
4. Assess jurisdictional requirements
5. Gather supporting legal authorities

For the given legal task, provide comprehensive research findings in this format:
{
    "legal_areas": ["contract law", "employment law", ...],
    "applicable_laws": [{"title": "...", "section": "...", "summary": "..."}],
    "precedents": [{"case": "...", "year": "...", "jurisdiction": "...", "relevance": "..."}],
    "jurisdictional_notes": "...",
    "research_confidence": "high|medium|low",
    "additional_considerations": ["...", "..."]
}"""

        task_description = f"""
Task Type: {state['task_type']}
Jurisdiction: {state['jurisdiction']}
Legal Domain: {state['legal_domain']}
User Request: {state['messages'][-1].content if state['messages'] else 'No specific request'}

Conduct thorough legal research for this matter.
"""

        response = self.llm.invoke([
            ("system", system_prompt),
            ("user", task_description)
        ])
        
        try:
            research_data = json.loads(response.content)
        except:
            research_data = {
                "legal_areas": ["general legal matter"],
                "applicable_laws": [],
                "precedents": [],
                "jurisdictional_notes": response.content[:500],
                "research_confidence": "medium",
                "additional_considerations": []
            }
        
        return {"research_findings": [research_data]}


class DraftAgent:
    """Specialized agent for legal document drafting"""
    
    def __init__(self, model_name: str = "gpt-4"):
        self.llm = ChatOpenAI(model=model_name, temperature=0.3)
    
    def process(self, state: MultiAgentState) -> Dict:
        """Draft legal documents based on research findings"""
        research = state.get('research_findings', [{}])[0] if state.get('research_findings') else {}
        
        system_prompt = """You are a Legal Drafting Specialist AI.

Your role is to:
1. Create well-structured legal documents
2. Use appropriate legal language and terminology
3. Incorporate relevant laws and regulations
4. Ensure compliance with jurisdictional requirements
5. Follow standard legal document formats

Create documents that are:
- Legally sound and enforceable
- Clear and unambiguous
- Properly formatted
- Jurisdiction-appropriate
- Professional in tone

Output format:
{
    "document_type": "contract|agreement|letter|memo|...",
    "title": "Document Title",
    "content": "Full document content with proper legal formatting",
    "key_provisions": ["provision 1", "provision 2", ...],
    "legal_basis": "Legal foundation for the document",
    "compliance_notes": "Jurisdictional compliance information"
}"""

        research_context = f"""
Research Findings:
- Legal Areas: {', '.join(research.get('legal_areas', []))}
- Applicable Laws: {json.dumps(research.get('applicable_laws', []), indent=2)}
- Jurisdictional Notes: {research.get('jurisdictional_notes', 'No specific notes')}
- Precedents: {json.dumps(research.get('precedents', []), indent=2)}

Task: {state['task_type']}
Jurisdiction: {state['jurisdiction']}
Domain: {state['legal_domain']}
User Request: {state['messages'][-1].content if state['messages'] else 'General legal document'}
"""

        response = self.llm.invoke([
            ("system", system_prompt),
            ("user", research_context)
        ])
        
        try:
            draft_data = json.loads(response.content)
        except:
            draft_data = {
                "document_type": "legal_document",
                "title": "Legal Document Draft",
                "content": response.content,
                "key_provisions": [],
                "legal_basis": "Based on provided research",
                "compliance_notes": "Subject to legal review"
            }
        
        return {"draft_content": draft_data}


class ReviewAgent:
    """Specialized agent for legal document review and validation"""
    
    def __init__(self, model_name: str = "gpt-4"):
        self.llm = ChatOpenAI(model=model_name, temperature=0.1)
    
    def process(self, state: MultiAgentState) -> Dict:
        """Review and validate legal documents"""
        draft = state.get('draft_content', {})
        research = state.get('research_findings', [{}])[0] if state.get('research_findings') else {}
        
        system_prompt = """You are a Legal Review Specialist AI.

Your role is to:
1. Analyze legal documents for accuracy and completeness
2. Check compliance with applicable laws and regulations
3. Identify potential legal risks or gaps
4. Suggest improvements and corrections
5. Validate jurisdictional compliance

Provide comprehensive review feedback in this format:
{
    "overall_assessment": "excellent|good|needs_improvement|inadequate",
    "legal_accuracy": {
        "score": 85,
        "issues": ["issue 1", "issue 2"],
        "strengths": ["strength 1", "strength 2"]
    },
    "compliance_check": {
        "jurisdictional_compliance": "compliant|partial|non_compliant",
        "regulatory_alignment": "aligned|partial|misaligned",
        "missing_requirements": ["requirement 1", ...]
    },
    "risk_assessment": {
        "high_risks": ["risk 1", ...],
        "medium_risks": ["risk 2", ...],
        "low_risks": ["risk 3", ...]
    },
    "recommendations": [
        {"type": "critical|important|minor", "issue": "...", "suggestion": "..."},
    ],
    "approval_status": "approved|conditional|rejected"
}"""

        review_context = f"""
Document to Review:
Type: {draft.get('document_type', 'Unknown')}
Title: {draft.get('title', 'Untitled')}
Content: {draft.get('content', '')[:2000]}...

Legal Basis: {draft.get('legal_basis', 'Not specified')}
Key Provisions: {draft.get('key_provisions', [])}

Research Context:
Applicable Laws: {research.get('applicable_laws', [])}
Jurisdictional Notes: {research.get('jurisdictional_notes', '')}
Legal Areas: {research.get('legal_areas', [])}

Jurisdiction: {state['jurisdiction']}
Legal Domain: {state['legal_domain']}
"""

        response = self.llm.invoke([
            ("system", system_prompt),
            ("user", review_context)
        ])
        
        try:
            review_data = json.loads(response.content)
        except:
            review_data = {
                "overall_assessment": "needs_review",
                "legal_accuracy": {"score": 75, "issues": [], "strengths": []},
                "compliance_check": {
                    "jurisdictional_compliance": "partial",
                    "regulatory_alignment": "partial",
                    "missing_requirements": []
                },
                "risk_assessment": {"high_risks": [], "medium_risks": [], "low_risks": []},
                "recommendations": [],
                "approval_status": "conditional"
            }
        
        return {"review_feedback": review_data}


class CitationAgent:
    """Specialized agent for legal citations and references"""
    
    def __init__(self, model_name: str = "gpt-4"):
        self.llm = ChatOpenAI(model=model_name, temperature=0.1)
    
    def process(self, state: MultiAgentState) -> Dict:
        """Generate and validate legal citations"""
        research = state.get('research_findings', [{}])[0] if state.get('research_findings') else {}
        draft = state.get('draft_content', {})
        
        system_prompt = """You are a Legal Citation Specialist AI.

Your role is to:
1. Generate proper legal citations in standard formats
2. Validate citation accuracy and completeness
3. Ensure proper attribution of legal sources
4. Follow jurisdiction-specific citation styles
5. Create comprehensive reference lists

Provide citations in this format:
{
    "primary_authorities": [
        {
            "type": "statute|regulation|case|constitution",
            "citation": "Proper legal citation format",
            "title": "Full title of the authority",
            "jurisdiction": "Applicable jurisdiction",
            "year": "Year of enactment/decision",
            "relevance": "How this applies to the document",
            "confidence": "high|medium|low"
        }
    ],
    "secondary_authorities": [
        {
            "type": "treatise|law_review|practice_guide",
            "citation": "Proper citation format",
            "title": "Title of secondary source",
            "author": "Author name(s)",
            "relevance": "Application to the matter"
        }
    ],
    "citation_style": "bluebook|alwd|local",
    "jurisdiction_specific_notes": "Any special citation requirements"
}"""

        citation_context = f"""
Research Findings:
Laws: {research.get('applicable_laws', [])}
Precedents: {research.get('precedents', [])}

Document Context:
Type: {draft.get('document_type', 'legal_document')}
Legal Basis: {draft.get('legal_basis', '')}

Jurisdiction: {state['jurisdiction']}
Legal Domain: {state['legal_domain']}

Generate comprehensive legal citations for all referenced authorities.
"""

        response = self.llm.invoke([
            ("system", system_prompt),
            ("user", citation_context)
        ])
        
        try:
            citation_data = json.loads(response.content)
        except:
            citation_data = {
                "primary_authorities": [],
                "secondary_authorities": [],
                "citation_style": "bluebook",
                "jurisdiction_specific_notes": "Standard citation format applied"
            }
        
        return {"citations": [citation_data]}


class ValidationAgent:
    """Auto-validation agent for legal consistency checking"""
    
    def __init__(self, model_name: str = "gpt-4"):
        self.llm = ChatOpenAI(model=model_name, temperature=0.1)
    
    def process(self, state: MultiAgentState) -> Dict:
        """Perform automated legal validation"""
        draft = state.get('draft_content', {})
        research = state.get('research_findings', [{}])[0] if state.get('research_findings') else {}
        review = state.get('review_feedback', {})
        citations = state.get('citations', [{}])[0] if state.get('citations') else {}
        
        system_prompt = """You are a Legal Validation Specialist AI.

Your role is to:
1. Check legal consistency across all document components
2. Validate compliance with jurisdictional laws
3. Ensure proper legal formatting and structure
4. Verify citation accuracy and completeness
5. Assess overall document quality and enforceability

Provide validation results in this format:
{
    "validation_passed": true/false,
    "consistency_check": {
        "internal_consistency": "consistent|inconsistent",
        "legal_coherence": "coherent|incoherent",
        "formatting_compliance": "compliant|non_compliant"
    },
    "jurisdictional_validation": {
        "law_compliance": "compliant|partial|non_compliant",
        "procedural_requirements": "met|partial|unmet",
        "enforceability": "enforceable|questionable|unenforceable"
    },
    "citation_validation": {
        "accuracy": "accurate|partial|inaccurate",
        "completeness": "complete|partial|incomplete",
        "format_compliance": "compliant|non_compliant"
    },
    "quality_score": 85,
    "critical_issues": ["issue 1", ...],
    "recommendations": ["recommendation 1", ...],
    "final_status": "approved|needs_revision|rejected"
}"""

        validation_context = f"""
Document for Validation:
{json.dumps(draft, indent=2)}

Research Foundation:
{json.dumps(research, indent=2)}

Review Feedback:
{json.dumps(review, indent=2)}

Citations:
{json.dumps(citations, indent=2)}

Jurisdiction: {state['jurisdiction']}
Legal Domain: {state['legal_domain']}

Perform comprehensive validation of all components.
"""

        response = self.llm.invoke([
            ("system", system_prompt),
            ("user", validation_context)
        ])
        
        try:
            validation_data = json.loads(response.content)
        except:
            validation_data = {
                "validation_passed": False,
                "consistency_check": {
                    "internal_consistency": "unknown",
                    "legal_coherence": "unknown",
                    "formatting_compliance": "unknown"
                },
                "jurisdictional_validation": {
                    "law_compliance": "unknown",
                    "procedural_requirements": "unknown",
                    "enforceability": "unknown"
                },
                "citation_validation": {
                    "accuracy": "unknown",
                    "completeness": "unknown",
                    "format_compliance": "unknown"
                },
                "quality_score": 50,
                "critical_issues": ["Validation process incomplete"],
                "recommendations": ["Manual review required"],
                "final_status": "needs_revision"
            }
        
        return {"validation_results": validation_data}


class MultiAgentOrchestrator:
    """Orchestrates multiple specialized legal AI agents"""
    
    def __init__(self):
        self.research_agent = ResearchAgent()
        self.draft_agent = DraftAgent()
        self.review_agent = ReviewAgent()
        self.citation_agent = CitationAgent()
        self.validation_agent = ValidationAgent()
        
        # Build the multi-agent workflow graph
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build LangGraph for multi-agent orchestration"""
        workflow = StateGraph(MultiAgentState)
        
        # Add agent nodes
        workflow.add_node("research", self._research_node)
        workflow.add_node("draft", self._draft_node) 
        workflow.add_node("review", self._review_node)
        workflow.add_node("citation", self._citation_node)
        workflow.add_node("validation", self._validation_node)
        workflow.add_node("finalize", self._finalize_node)
        
        # Define workflow edges
        workflow.add_edge(START, "research")
        workflow.add_edge("research", "draft")
        workflow.add_edge("draft", "review")
        workflow.add_edge("review", "citation")
        workflow.add_edge("citation", "validation")
        workflow.add_edge("validation", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()
    
    def _research_node(self, state: MultiAgentState) -> MultiAgentState:
        """Research agent processing node"""
        result = self.research_agent.process(state)
        return {**state, **result}
    
    def _draft_node(self, state: MultiAgentState) -> MultiAgentState:
        """Draft agent processing node"""
        result = self.draft_agent.process(state)
        return {**state, **result}
    
    def _review_node(self, state: MultiAgentState) -> MultiAgentState:
        """Review agent processing node"""
        result = self.review_agent.process(state)
        return {**state, **result}
    
    def _citation_node(self, state: MultiAgentState) -> MultiAgentState:
        """Citation agent processing node"""
        result = self.citation_agent.process(state)
        return {**state, **result}
    
    def _validation_node(self, state: MultiAgentState) -> MultiAgentState:
        """Validation agent processing node"""
        result = self.validation_agent.process(state)
        return {**state, **result}
    
    def _finalize_node(self, state: MultiAgentState) -> MultiAgentState:
        """Finalize and format output"""
        final_output = {
            "document": state.get('draft_content', {}),
            "research": state.get('research_findings', []),
            "review": state.get('review_feedback', {}),
            "citations": state.get('citations', []),
            "validation": state.get('validation_results', {}),
            "timestamp": datetime.utcnow().isoformat(),
            "agents_used": ["research", "draft", "review", "citation", "validation"],
            "quality_assurance": "multi_agent_validated"
        }
        
        return {**state, "final_output": final_output}
    
    def process(self, messages: List[BaseMessage], task_type: str = "document_creation", 
                jurisdiction: str = "general", legal_domain: str = "general") -> Dict:
        """Process legal request through multi-agent system"""
        
        initial_state = {
            "messages": messages,
            "task_type": task_type,
            "jurisdiction": jurisdiction, 
            "legal_domain": legal_domain,
            "research_findings": [],
            "draft_content": {},
            "review_feedback": {},
            "citations": [],
            "final_output": {},
            "validation_results": {}
        }
        
        # Run through multi-agent workflow
        final_state = self.graph.invoke(initial_state)
        
        return final_state["final_output"]


# Example usage and testing
if __name__ == "__main__":
    from langchain_core.messages import HumanMessage
    
    # Initialize multi-agent system
    orchestrator = MultiAgentOrchestrator()
    
    # Test case: NDA creation
    messages = [HumanMessage(content="Create a mutual NDA for a tech startup partnership")]
    
    result = orchestrator.process(
        messages=messages,
        task_type="nda_creation",
        jurisdiction="united_states",
        legal_domain="business_law"
    )
    
    print("Multi-Agent Legal AI Result:")
    print(json.dumps(result, indent=2))
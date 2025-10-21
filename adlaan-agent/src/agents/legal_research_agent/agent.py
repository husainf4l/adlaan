"""
Legal Research Agent for conducting comprehensive legal research.
"""
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from langchain.schema import HumanMessage, SystemMessage

from ..base_agent.base_agent import BaseAgent, AgentState
from src.schemas import AgentType
from .tools import (
    LegalResearchTool,
    ComplianceTool
)
from .nodes import (
    ThinkingNode,
    PlanningNode,
    LegalResearchNode
)


class LegalResearchAgent(BaseAgent):
    """Agent for conducting comprehensive legal research."""
    
    def __init__(self):
        super().__init__(AgentType.LEGAL_RESEARCH)
    
    async def _build_graph(self) -> StateGraph:
        """Build the legal research workflow."""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("analyze_query", self._analyze_query)
        workflow.add_node("search_precedents", self._search_precedents)
        workflow.add_node("find_citations", self._find_citations)
        workflow.add_node("assess_compliance", self._assess_compliance)
        workflow.add_node("compile_research", self._compile_research)
        
        # Add edges
        workflow.set_entry_point("analyze_query")
        workflow.add_edge("analyze_query", "search_precedents")
        workflow.add_edge("search_precedents", "find_citations")
        workflow.add_edge("find_citations", "assess_compliance")
        workflow.add_edge("assess_compliance", "compile_research")
        workflow.add_edge("compile_research", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    async def _prepare_input(self, input_data: Dict[str, Any]) -> AgentState:
        """Prepare input for legal research."""
        return AgentState({
            "research_query": input_data.get("research_query", ""),
            "jurisdiction": input_data.get("jurisdiction", "jordan"),
            "legal_domain": input_data.get("legal_domain", "general"),
            "case_context": input_data.get("case_context", {}),
            "query_analysis": {},
            "precedents": [],
            "citations": [],
            "compliance_info": {},
            "research_summary": {}
        })
    
    async def _extract_output(self, final_state: AgentState) -> Dict[str, Any]:
        """Extract output from final state."""
        return {
            "research_summary": final_state.get("research_summary", {}),
            "precedents": final_state.get("precedents", []),
            "citations": final_state.get("citations", []),
            "compliance": final_state.get("compliance_info", {}),
            "query_analysis": final_state.get("query_analysis", {})
        }
    
    async def _analyze_query(self, state: AgentState) -> AgentState:
        """Analyze the research query."""
        self.logger.info("Analyzing research query")
        
        query = state["research_query"]
        jurisdiction = state["jurisdiction"]
        domain = state["legal_domain"]
        
        # Extract key terms and concepts
        analysis = {
            "primary_concepts": self._extract_legal_concepts(query),
            "research_scope": self._determine_scope(query, domain),
            "complexity_level": self._assess_complexity(query),
            "suggested_keywords": self._generate_keywords(query),
            "jurisdiction_specific": jurisdiction != "general",
            "domain_focus": domain
        }
        
        state["query_analysis"] = analysis
        return state
    
    async def _search_precedents(self, state: AgentState) -> AgentState:
        """Search for legal precedents."""
        self.logger.info("Searching for legal precedents")
        
        try:
            # Use legal research tool
            research_tool = LegalResearchTool(jurisdiction=state["jurisdiction"])
            
            precedents_result = await research_tool.search_legal_precedents(
                state["research_query"],
                state["legal_domain"]
            )
            
            state["precedents"] = precedents_result.get("precedents", [])
            
        except Exception as e:
            self.logger.error(f"Precedent search failed: {e}")
            state["precedents"] = []
        
        return state
    
    async def _find_citations(self, state: AgentState) -> AgentState:
        """Find relevant legal citations."""
        self.logger.info("Finding legal citations")
        
        try:
            # Use legal research tool
            research_tool = LegalResearchTool(jurisdiction=state["jurisdiction"])
            
            citations_result = await research_tool.get_legal_citations(
                state["research_query"]
            )
            
            state["citations"] = citations_result
            
        except Exception as e:
            self.logger.error(f"Citation search failed: {e}")
            state["citations"] = []
        
        return state
    
    async def _assess_compliance(self, state: AgentState) -> AgentState:
        """Assess compliance requirements."""
        self.logger.info("Assessing compliance requirements")
        
        try:
            # Use compliance tool
            compliance_tool = ComplianceTool(jurisdiction=state["jurisdiction"])
            
            compliance_result = await compliance_tool.check_compliance(
                state["research_query"],
                {"domain": state["legal_domain"]}
            )
            
            state["compliance_info"] = compliance_result
            
        except Exception as e:
            self.logger.error(f"Compliance assessment failed: {e}")
            state["compliance_info"] = {"status": "unknown", "error": str(e)}
        
        return state
    
    async def _compile_research(self, state: AgentState) -> AgentState:
        """Compile comprehensive research summary."""
        self.logger.info("Compiling research summary")
        
        precedents = state["precedents"]
        citations = state["citations"]
        compliance = state["compliance_info"]
        analysis = state["query_analysis"]
        
        research_summary = {
            "query": state["research_query"],
            "jurisdiction": state["jurisdiction"],
            "domain": state["legal_domain"],
            "research_quality": self._assess_research_quality(precedents, citations),
            "findings": {
                "total_precedents": len(precedents),
                "total_citations": len(citations),
                "compliance_status": compliance.get("status", "unknown"),
                "key_concepts": analysis.get("primary_concepts", [])
            },
            "recommendations": self._generate_research_recommendations(
                precedents, citations, compliance, analysis
            ),
            "research_gaps": self._identify_gaps(analysis, precedents, citations),
            "confidence_score": self._calculate_confidence(precedents, citations, compliance)
        }
        
        state["research_summary"] = research_summary
        return state
    
    def _extract_legal_concepts(self, query: str) -> List[str]:
        """Extract key legal concepts from query."""
        legal_concepts = []
        query_lower = query.lower()
        
        concept_patterns = {
            "contract": ["contract", "agreement", "deal"],
            "liability": ["liability", "responsibility", "fault"],
            "employment": ["employment", "employee", "worker", "job"],
            "property": ["property", "real estate", "land", "building"],
            "intellectual_property": ["patent", "trademark", "copyright", "ip"],
            "corporate": ["corporation", "company", "business", "entity"],
            "family": ["family", "marriage", "divorce", "custody"],
            "criminal": ["criminal", "crime", "offense", "violation"],
            "tort": ["tort", "negligence", "damages", "injury"],
            "constitutional": ["constitutional", "rights", "amendment"]
        }
        
        for concept, keywords in concept_patterns.items():
            if any(keyword in query_lower for keyword in keywords):
                legal_concepts.append(concept)
        
        return legal_concepts
    
    def _determine_scope(self, query: str, domain: str) -> str:
        """Determine the scope of research needed."""
        if len(query) > 200:
            return "comprehensive"
        elif domain == "general":
            return "broad"
        else:
            return "focused"
    
    def _assess_complexity(self, query: str) -> str:
        """Assess the complexity level of the query."""
        complexity_indicators = [
            "multi-jurisdictional", "international", "complex", "sophisticated",
            "precedent", "constitutional", "appellate", "supreme court"
        ]
        
        if any(indicator in query.lower() for indicator in complexity_indicators):
            return "high"
        elif len(query.split()) > 20:
            return "medium"
        else:
            return "low"
    
    def _generate_keywords(self, query: str) -> List[str]:
        """Generate additional search keywords."""
        base_keywords = query.split()
        
        # Legal synonyms
        synonyms = {
            "contract": ["agreement", "deal", "arrangement"],
            "law": ["statute", "regulation", "code"],
            "court": ["tribunal", "bench", "judiciary"],
            "case": ["matter", "proceeding", "litigation"]
        }
        
        additional_keywords = []
        for word in base_keywords:
            if word.lower() in synonyms:
                additional_keywords.extend(synonyms[word.lower()])
        
        return list(set(base_keywords + additional_keywords))
    
    def _assess_research_quality(self, precedents: List, citations: List) -> str:
        """Assess the quality of research results."""
        total_sources = len(precedents) + len(citations)
        
        if total_sources >= 10:
            return "excellent"
        elif total_sources >= 5:
            return "good"
        elif total_sources >= 2:
            return "adequate"
        else:
            return "limited"
    
    def _generate_research_recommendations(self, precedents: List, citations: List, 
                                         compliance: Dict, analysis: Dict) -> List[str]:
        """Generate research-based recommendations."""
        recommendations = []
        
        if len(precedents) < 3:
            recommendations.append("Consider expanding precedent search with broader keywords")
        
        if len(citations) < 5:
            recommendations.append("Additional statutory research may be beneficial")
        
        if compliance.get("status") == "unknown":
            recommendations.append("Further compliance analysis required")
        
        if analysis.get("complexity_level") == "high":
            recommendations.append("Consider consulting with specialized legal experts")
        
        return recommendations
    
    def _identify_gaps(self, analysis: Dict, precedents: List, citations: List) -> List[str]:
        """Identify gaps in research coverage."""
        gaps = []
        
        concepts = analysis.get("primary_concepts", [])
        
        if "contract" in concepts and len(precedents) < 2:
            gaps.append("Limited contract law precedents")
        
        if "employment" in concepts and not any("employment" in str(p) for p in precedents):
            gaps.append("No employment-specific precedents found")
        
        if len(citations) == 0:
            gaps.append("No statutory citations identified")
        
        return gaps
    
    def _calculate_confidence(self, precedents: List, citations: List, compliance: Dict) -> float:
        """Calculate overall confidence in research results."""
        base_score = 0.5
        
        # Precedents contribution
        if len(precedents) >= 5:
            base_score += 0.2
        elif len(precedents) >= 2:
            base_score += 0.1
        
        # Citations contribution
        if len(citations) >= 5:
            base_score += 0.2
        elif len(citations) >= 2:
            base_score += 0.1
        
        # Compliance contribution
        if compliance.get("status") == "compliant":
            base_score += 0.1
        
        return min(1.0, base_score)
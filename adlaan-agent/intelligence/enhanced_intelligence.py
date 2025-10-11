"""
Enhanced Intelligence Layer for Adlaan Legal AI
Integrates multi-agent system, knowledge versioning, and citation capabilities
"""

from typing import Dict, List, Optional, Any, Union
from datetime import datetime, date
from langchain_core.messages import BaseMessage, HumanMessage
import json
import asyncio

# Import our intelligence components
from .multi_agent_system import MultiAgentOrchestrator, MultiAgentState
from .knowledge_versioning import LegalKnowledgeManager, JurisdictionManager, LegalKnowledgeEntry
from .citation_system import AutoCitationSystem, CitationContext, LegalCitation


class EnhancedLegalIntelligence:
    """
    Enhanced Legal AI Brain combining:
    - Multi-agent collaboration (Research, Draft, Review, Citation, Validation)
    - Knowledge versioning with jurisdiction-specific laws
    - Auto-citation with external legal databases
    - Legal consistency validation
    """
    
    def __init__(self, 
                 knowledge_db_path: str = "legal_knowledge.db",
                 lexis_api_key: str = None,
                 justia_api_key: str = None):
        
        # Initialize core components
        self.multi_agent = MultiAgentOrchestrator()
        self.knowledge_manager = LegalKnowledgeManager(knowledge_db_path)
        self.jurisdiction_manager = JurisdictionManager(self.knowledge_manager)
        self.citation_system = AutoCitationSystem(lexis_api_key, justia_api_key)
        
        # Intelligence layer configuration
        self.config = {
            "enable_multi_agent": True,
            "enable_knowledge_versioning": True,
            "enable_auto_citation": True,
            "enable_validation": True,
            "min_citation_confidence": 0.7,
            "max_citations_per_proposition": 3,
            "validation_threshold": 0.8
        }
        
        print("🧠 Enhanced Legal Intelligence Layer Initialized")
        print(f"   ✅ Multi-Agent System: {len(['research', 'draft', 'review', 'citation', 'validation'])} agents")
        print(f"   ✅ Knowledge Base: {len(self.knowledge_manager._get_jurisdictions())} jurisdictions")
        print(f"   ✅ Citation Providers: {len(self.citation_system.providers)} sources")
    
    async def process_legal_request(self, 
                                  messages: List[BaseMessage],
                                  jurisdiction: str = "general",
                                  legal_domain: str = "general",
                                  task_type: str = "consultation",
                                  enable_citations: bool = True,
                                  as_of_date: date = None) -> Dict:
        """
        Process legal request through enhanced intelligence pipeline
        
        Args:
            messages: User messages/conversation history
            jurisdiction: Legal jurisdiction (e.g., "jordan", "uae", "us")
            legal_domain: Legal area (e.g., "commercial", "employment", "corporate")
            task_type: Type of task (e.g., "consultation", "document_creation", "review")
            enable_citations: Whether to generate citations
            as_of_date: Date for temporal legal analysis
        """
        
        start_time = datetime.utcnow()
        
        # Step 1: Knowledge Context Enrichment
        knowledge_context = await self._enrich_with_knowledge_context(
            messages, jurisdiction, legal_domain, as_of_date
        )
        
        # Step 2: Multi-Agent Processing
        agent_result = await self._process_with_agents(
            messages, jurisdiction, legal_domain, task_type, knowledge_context
        )
        
        # Step 3: Citation Enhancement
        if enable_citations and agent_result.get("document"):
            citations = await self._enhance_with_citations(
                agent_result, jurisdiction, legal_domain, as_of_date
            )
            agent_result["citations"] = citations
        
        # Step 4: Final Validation & Quality Assurance
        validation_result = await self._final_validation(
            agent_result, jurisdiction, knowledge_context
        )
        
        # Step 5: Compile Enhanced Response
        enhanced_response = self._compile_enhanced_response(
            agent_result, validation_result, knowledge_context, 
            start_time, jurisdiction, legal_domain
        )
        
        return enhanced_response
    
    async def _enrich_with_knowledge_context(self, 
                                           messages: List[BaseMessage],
                                           jurisdiction: str,
                                           legal_domain: str,
                                           as_of_date: date = None) -> Dict:
        """Enrich request with relevant legal knowledge context"""
        
        query_date = as_of_date or date.today()
        last_message = messages[-1].content if messages else ""
        
        # Get jurisdiction-specific laws active on the query date
        active_laws = self.knowledge_manager.get_active_laws(
            jurisdiction, query_date, legal_domain
        )
        
        # Perform semantic search for relevant legal knowledge
        semantic_results = self.knowledge_manager.semantic_search(
            last_message, jurisdiction, query_date, k=5
        )
        
        # Get jurisdiction legal snapshot
        legal_snapshot = self.knowledge_manager.get_jurisdiction_snapshot(
            jurisdiction, query_date
        )
        
        return {
            "jurisdiction": jurisdiction,
            "legal_domain": legal_domain,
            "query_date": query_date.isoformat(),
            "active_laws": [
                {
                    "id": law.id,
                    "title": law.title,
                    "type": law.law_type,
                    "version": law.version,
                    "reliability": law.reliability_score
                } for law in active_laws[:10]  # Limit to top 10
            ],
            "relevant_knowledge": semantic_results,
            "legal_snapshot": legal_snapshot,
            "knowledge_confidence": sum(r["similarity_score"] for r in semantic_results) / len(semantic_results) if semantic_results else 0.0
        }
    
    async def _process_with_agents(self,
                                 messages: List[BaseMessage],
                                 jurisdiction: str, 
                                 legal_domain: str,
                                 task_type: str,
                                 knowledge_context: Dict) -> Dict:
        """Process through multi-agent system with knowledge context"""
        
        # Enhance agent state with knowledge context
        enhanced_state = {
            "messages": messages,
            "task_type": task_type,
            "jurisdiction": jurisdiction,
            "legal_domain": legal_domain,
            "knowledge_context": knowledge_context,
            "research_findings": [],
            "draft_content": {},
            "review_feedback": {},
            "citations": [],
            "final_output": {},
            "validation_results": {}
        }
        
        # Process through multi-agent workflow
        result = self.multi_agent.graph.invoke(enhanced_state)
        
        return result["final_output"]
    
    async def _enhance_with_citations(self,
                                    agent_result: Dict,
                                    jurisdiction: str,
                                    legal_domain: str, 
                                    as_of_date: date = None) -> List[Dict]:
        """Enhance document with auto-generated citations"""
        
        document = agent_result.get("document", {})
        document_content = document.get("content", "")
        
        if not document_content:
            return []
        
        # Create citation context
        citation_context = CitationContext(
            legal_proposition=document_content[:500],  # Use first 500 chars as context
            document_type=document.get("document_type", "legal_document"),
            jurisdiction=jurisdiction,
            citation_style="bluebook",
            author="Adlaan Legal AI",
            publication_date=as_of_date or date.today()
        )
        
        # Generate citations for the document
        document_citations = self.citation_system.cite_document(
            document_content, citation_context
        )
        
        # Filter citations by confidence threshold
        high_confidence_citations = []
        for prop_key, prop_data in document_citations.get("citations_by_proposition", {}).items():
            for citation in prop_data.get("citations", []):
                if citation.get("reliability_score", 0) >= self.config["min_citation_confidence"]:
                    high_confidence_citations.append({
                        "proposition": prop_data["text"],
                        "citation": citation,
                        "confidence": citation.get("reliability_score", 0)
                    })
        
        return high_confidence_citations[:self.config["max_citations_per_proposition"] * 3]
    
    async def _final_validation(self,
                              agent_result: Dict,
                              jurisdiction: str,
                              knowledge_context: Dict) -> Dict:
        """Perform final validation and quality assurance"""
        
        validation_result = {
            "overall_quality": "unknown",
            "knowledge_alignment": 0.0,
            "citation_quality": 0.0,
            "jurisdiction_compliance": "unknown",
            "confidence_score": 0.0,
            "issues": [],
            "recommendations": []
        }
        
        try:
            # Validate against knowledge context
            if agent_result.get("validation", {}).get("validation_passed"):
                validation_result["overall_quality"] = "high"
                validation_result["confidence_score"] = 0.9
            elif agent_result.get("review", {}).get("overall_assessment") == "good":
                validation_result["overall_quality"] = "good"
                validation_result["confidence_score"] = 0.75
            else:
                validation_result["overall_quality"] = "needs_improvement"
                validation_result["confidence_score"] = 0.6
            
            # Check knowledge alignment
            knowledge_confidence = knowledge_context.get("knowledge_confidence", 0.0)
            validation_result["knowledge_alignment"] = knowledge_confidence
            
            # Citation quality assessment
            citations = agent_result.get("citations", [])
            if citations:
                avg_citation_confidence = sum(c.get("confidence", 0) for c in citations) / len(citations)
                validation_result["citation_quality"] = avg_citation_confidence
            
            # Jurisdiction compliance check
            if knowledge_confidence > 0.7:
                validation_result["jurisdiction_compliance"] = "compliant"
            elif knowledge_confidence > 0.4:
                validation_result["jurisdiction_compliance"] = "partial"
            else:
                validation_result["jurisdiction_compliance"] = "needs_review"
            
        except Exception as e:
            validation_result["issues"].append(f"Validation error: {str(e)}")
        
        return validation_result
    
    def _compile_enhanced_response(self,
                                 agent_result: Dict,
                                 validation_result: Dict,
                                 knowledge_context: Dict,
                                 start_time: datetime,
                                 jurisdiction: str,
                                 legal_domain: str) -> Dict:
        """Compile final enhanced response with all intelligence layers"""
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Structure the enhanced response
        enhanced_response = {
            # Core AI Response
            "response": {
                "type": agent_result.get("document", {}).get("document_type", "consultation"),
                "content": agent_result.get("document", {}).get("content", ""),
                "title": agent_result.get("document", {}).get("title", "Legal Analysis"),
                "key_provisions": agent_result.get("document", {}).get("key_provisions", []),
                "legal_basis": agent_result.get("document", {}).get("legal_basis", "")
            },
            
            # Intelligence Enhancement Metadata
            "intelligence": {
                "agents_used": agent_result.get("agents_used", []),
                "research_confidence": self._calculate_research_confidence(agent_result),
                "knowledge_context": {
                    "jurisdiction": jurisdiction,
                    "legal_domain": legal_domain,
                    "query_date": knowledge_context.get("query_date"),
                    "active_laws_count": len(knowledge_context.get("active_laws", [])),
                    "knowledge_alignment": validation_result.get("knowledge_alignment", 0.0)
                },
                "processing_stats": {
                    "processing_time_seconds": round(processing_time, 2),
                    "agents_executed": len(agent_result.get("agents_used", [])),
                    "knowledge_sources_consulted": len(knowledge_context.get("relevant_knowledge", [])),
                    "citations_generated": len(agent_result.get("citations", []))
                }
            },
            
            # Legal Research Findings
            "research": {
                "legal_areas": agent_result.get("research", [{}])[0].get("legal_areas", []) if agent_result.get("research") else [],
                "applicable_laws": agent_result.get("research", [{}])[0].get("applicable_laws", []) if agent_result.get("research") else [],
                "precedents": agent_result.get("research", [{}])[0].get("precedents", []) if agent_result.get("research") else [],
                "jurisdictional_notes": agent_result.get("research", [{}])[0].get("jurisdictional_notes", "") if agent_result.get("research") else ""
            },
            
            # Citations and References
            "citations": [
                {
                    "proposition": cit.get("proposition", ""),
                    "citation_text": cit.get("citation", {}).get("bluebook_format", ""),
                    "source": cit.get("citation", {}).get("citation_type", ""),
                    "confidence": cit.get("confidence", 0.0),
                    "verified": cit.get("citation", {}).get("verified", False)
                } for cit in agent_result.get("citations", [])
            ],
            
            # Quality Assurance
            "validation": {
                "overall_assessment": validation_result.get("overall_quality", "unknown"),
                "confidence_score": validation_result.get("confidence_score", 0.0),
                "jurisdiction_compliance": validation_result.get("jurisdiction_compliance", "unknown"),
                "citation_quality": validation_result.get("citation_quality", 0.0),
                "issues": validation_result.get("issues", []),
                "recommendations": validation_result.get("recommendations", [])
            },
            
            # Legal Review
            "review": {
                "legal_accuracy": agent_result.get("review", {}).get("legal_accuracy", {}),
                "compliance_check": agent_result.get("review", {}).get("compliance_check", {}),
                "risk_assessment": agent_result.get("review", {}).get("risk_assessment", {}),
                "approval_status": agent_result.get("review", {}).get("approval_status", "pending")
            },
            
            # System Metadata
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "version": "enhanced_intelligence_v1.0",
                "jurisdiction": jurisdiction,
                "legal_domain": legal_domain,
                "intelligence_layers": [
                    "multi_agent_orchestration",
                    "knowledge_versioning", 
                    "auto_citation",
                    "legal_validation"
                ]
            }
        }
        
        return enhanced_response
    
    def _calculate_research_confidence(self, agent_result: Dict) -> float:
        """Calculate overall research confidence score"""
        
        research_data = agent_result.get("research", [{}])[0] if agent_result.get("research") else {}
        validation_data = agent_result.get("validation", {})
        
        # Base confidence from research
        research_confidence = {
            "high": 0.9,
            "medium": 0.7,
            "low": 0.5
        }.get(research_data.get("research_confidence", "medium"), 0.7)
        
        # Validation boost/penalty
        validation_score = validation_data.get("quality_score", 75) / 100.0
        
        # Average the scores
        overall_confidence = (research_confidence + validation_score) / 2.0
        
        return round(overall_confidence, 2)
    
    # Knowledge Management Methods
    def add_jurisdiction_law(self, jurisdiction: str, law_data: Dict) -> str:
        """Add new jurisdiction-specific law to knowledge base"""
        entry = self.jurisdiction_manager.add_jurisdiction_law(jurisdiction, law_data)
        return entry.id
    
    def update_law_version(self, jurisdiction: str, base_law_id: str, new_version_data: Dict) -> str:
        """Update a law with new version"""
        entry = self.jurisdiction_manager.update_law_version(jurisdiction, base_law_id, new_version_data)
        return entry.id
    
    def get_jurisdiction_laws(self, jurisdiction: str, as_of_date: date = None) -> Dict:
        """Get all laws for a jurisdiction"""
        return self.jurisdiction_manager.get_jurisdiction_laws(jurisdiction, as_of_date)
    
    # System Configuration Methods
    def configure_intelligence(self, **config_updates):
        """Update intelligence layer configuration"""
        self.config.update(config_updates)
        return self.config
    
    def get_system_status(self) -> Dict:
        """Get comprehensive system status"""
        return {
            "intelligence_layer": "operational",
            "components": {
                "multi_agent": "active" if self.multi_agent else "inactive",
                "knowledge_base": f"{len(self.knowledge_manager._get_jurisdictions())} jurisdictions",
                "citation_system": f"{len(self.citation_system.providers)} providers",
            },
            "configuration": self.config,
            "last_updated": datetime.utcnow().isoformat()
        }


# Integration with existing agent system
def create_enhanced_agent(knowledge_db_path: str = "legal_knowledge.db",
                         lexis_api_key: str = None,
                         justia_api_key: str = None) -> EnhancedLegalIntelligence:
    """Factory function to create enhanced legal intelligence system"""
    
    return EnhancedLegalIntelligence(
        knowledge_db_path=knowledge_db_path,
        lexis_api_key=lexis_api_key,
        justia_api_key=justia_api_key
    )


# Example usage and testing
if __name__ == "__main__":
    import asyncio
    
    async def test_enhanced_intelligence():
        # Initialize enhanced system
        intelligence = create_enhanced_agent()
        
        # Add some sample jurisdiction data
        jordan_law = {
            "type": "statute",
            "title": "Commercial Companies Law Amendment 2024",
            "content": "This amendment updates digital transaction requirements...",
            "effective_date": "2024-01-01",
            "year": 2024,
            "version": "1.0",
            "tags": ["commercial", "digital", "companies"],
            "reliability_score": 0.95
        }
        
        law_id = intelligence.add_jurisdiction_law("jordan", jordan_law)
        print(f"Added law: {law_id}")
        
        # Test enhanced processing
        messages = [HumanMessage(content="Create a mutual NDA for a tech partnership in Jordan")]
        
        result = await intelligence.process_legal_request(
            messages=messages,
            jurisdiction="jordan",
            legal_domain="commercial",
            task_type="nda_creation",
            enable_citations=True
        )
        
        print("\n🧠 Enhanced Intelligence Result:")
        print(f"   Response Type: {result['response']['type']}")
        print(f"   Processing Time: {result['intelligence']['processing_stats']['processing_time_seconds']}s")
        print(f"   Confidence Score: {result['validation']['confidence_score']}")
        print(f"   Citations Generated: {len(result['citations'])}")
        print(f"   Laws Consulted: {result['intelligence']['knowledge_context']['active_laws_count']}")
        
        return result
    
    # Run test
    result = asyncio.run(test_enhanced_intelligence())
    print("\n✅ Enhanced Legal Intelligence System Test Completed!")
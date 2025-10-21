"""
Document Classifier Agent for categorizing legal documents.
"""
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from langchain.schema import HumanMessage, SystemMessage

from ..base_agent.base_agent import BaseAgent, AgentState
from src.schemas import AgentType
from src.utils.agent_helpers import safe_json_parse
from .tools import (
    DocumentValidationTool,
    ComplianceTool
)
from .nodes import (
    ThinkingNode
)


class DocumentClassifierAgent(BaseAgent):
    """Agent for classifying and categorizing legal documents."""
    
    def __init__(self):
        super().__init__(AgentType.DOCUMENT_CLASSIFIER)
    
    async def _build_graph(self) -> StateGraph:
        """Build the document classification workflow."""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("extract_features", self._extract_features)
        workflow.add_node("classify_document", self._classify_document)
        workflow.add_node("generate_tags", self._generate_tags)
        workflow.add_node("finalize_classification", self._finalize_classification)
        
        # Add edges
        workflow.set_entry_point("extract_features")
        workflow.add_edge("extract_features", "classify_document")
        workflow.add_edge("classify_document", "generate_tags")
        workflow.add_edge("generate_tags", "finalize_classification")
        workflow.add_edge("finalize_classification", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
    
    async def _prepare_input(self, input_data: Dict[str, Any]) -> AgentState:
        """Prepare input for document classification."""
        return AgentState({
            "document_content": input_data.get("document_content"),
            "document_title": input_data.get("document_title", ""),
            "metadata": input_data.get("metadata", {}),
            "features": {},
            "classification": {},
            "tags": [],
            "final_result": {}
        })
    
    async def _extract_output(self, final_state: AgentState) -> Dict[str, Any]:
        """Extract output from final state."""
        return {
            "classification": final_state.get("final_result", {}),
            "features": final_state.get("features", {}),
            "tags": final_state.get("tags", [])
        }
    
    async def _extract_features(self, state: AgentState) -> AgentState:
        """Extract features from the document."""
        self.logger.info("Extracting document features")
        
        content = state["document_content"]
        title = state["document_title"]
        
        # Simple feature extraction
        features = {
            "length": len(content),
            "word_count": len(content.split()),
            "has_title": bool(title),
            "contains_whereas": "whereas" in content.lower(),
            "contains_parties": "parties" in content.lower(),
            "contains_agreement": "agreement" in content.lower(),
            "contains_contract": "contract" in content.lower(),
            "contains_signatures": "signature" in content.lower(),
            "contains_dates": any(word in content.lower() for word in ["date", "year", "month"]),
            "contains_monetary": any(symbol in content for symbol in ["$", "USD", "JOD", "payment"]),
            "legal_language_density": self._calculate_legal_density(content)
        }
        
        state["features"] = features
        return state
    
    async def _classify_document(self, state: AgentState) -> AgentState:
        """Classify the document type."""
        self.logger.info("Classifying document")
        
        features = state["features"]
        
        # Rule-based classification
        classification = {
            "document_type": "unknown",
            "confidence": 0.0,
            "category": "general",
            "subcategory": "miscellaneous"
        }
        
        # Contract classification
        if features["contains_parties"] and features["contains_agreement"]:
            classification["document_type"] = "contract"
            classification["confidence"] = 0.85
            classification["category"] = "contractual"
            
            if features["contains_monetary"]:
                classification["subcategory"] = "commercial_contract"
            else:
                classification["subcategory"] = "service_agreement"
        
        # Legal notice classification  
        elif "notice" in state["document_content"].lower():
            classification["document_type"] = "legal_notice"
            classification["confidence"] = 0.75
            classification["category"] = "notice"
            classification["subcategory"] = "legal_notification"
        
        # Memorandum classification
        elif "memorandum" in state["document_content"].lower():
            classification["document_type"] = "memorandum"
            classification["confidence"] = 0.80
            classification["category"] = "internal"
            classification["subcategory"] = "legal_memo"
        
        # Agreement classification
        elif features["contains_agreement"]:
            classification["document_type"] = "agreement"
            classification["confidence"] = 0.70
            classification["category"] = "contractual"
            classification["subcategory"] = "general_agreement"
        
        state["classification"] = classification
        return state
    
    async def _generate_tags(self, state: AgentState) -> AgentState:
        """Generate tags for the document."""
        self.logger.info("Generating document tags")
        
        features = state["features"]
        classification = state["classification"]
        content = state["document_content"].lower()
        
        tags = []
        
        # Add type-based tags
        tags.append(classification["document_type"])
        tags.append(classification["category"])
        
        # Add feature-based tags
        if features["contains_monetary"]:
            tags.extend(["financial", "payment"])
        
        if features["contains_parties"]:
            tags.append("multi-party")
        
        if features["contains_signatures"]:
            tags.append("executable")
        
        if features["legal_language_density"] > 0.1:
            tags.append("formal-legal")
        
        # Add domain-specific tags
        if any(term in content for term in ["employment", "employee", "employer"]):
            tags.append("employment")
        
        if any(term in content for term in ["property", "real estate", "lease"]):
            tags.append("property")
        
        if any(term in content for term in ["intellectual property", "patent", "copyright"]):
            tags.append("intellectual-property")
        
        if any(term in content for term in ["confidential", "non-disclosure", "nda"]):
            tags.append("confidentiality")
        
        # Remove duplicates
        tags = list(set(tags))
        
        state["tags"] = tags
        return state
    
    async def _finalize_classification(self, state: AgentState) -> AgentState:
        """Finalize the classification result."""
        self.logger.info("Finalizing classification")
        
        final_result = {
            "document_type": state["classification"]["document_type"],
            "confidence_score": state["classification"]["confidence"],
            "category": state["classification"]["category"],
            "subcategory": state["classification"]["subcategory"],
            "tags": state["tags"],
            "features_summary": {
                "word_count": state["features"]["word_count"],
                "legal_density": state["features"]["legal_language_density"],
                "has_parties": state["features"]["contains_parties"],
                "has_monetary_terms": state["features"]["contains_monetary"]
            },
            "recommendations": self._generate_recommendations(state["classification"], state["tags"])
        }
        
        state["final_result"] = final_result
        return state
    
    def _calculate_legal_density(self, content: str) -> float:
        """Calculate the density of legal language in the document."""
        legal_terms = [
            "whereas", "therefore", "hereby", "herein", "hereafter", "heretofore",
            "notwithstanding", "pursuant", "aforementioned", "aforementioned",
            "party", "parties", "agreement", "contract", "clause", "provision",
            "obligation", "liability", "jurisdiction", "governing", "breach",
            "damages", "remedy", "amendment", "terminate", "waiver"
        ]
        
        words = content.lower().split()
        legal_word_count = sum(1 for word in words if any(term in word for term in legal_terms))
        
        if len(words) == 0:
            return 0.0
        
        return legal_word_count / len(words)
    
    def _generate_recommendations(self, classification: Dict[str, Any], tags: List[str]) -> List[str]:
        """Generate recommendations based on classification."""
        recommendations = []
        
        doc_type = classification["document_type"]
        confidence = classification["confidence"]
        
        if confidence < 0.7:
            recommendations.append("Consider adding more specific legal language for clearer classification")
        
        if doc_type == "contract" and "financial" in tags:
            recommendations.append("Ensure payment terms are clearly defined")
            recommendations.append("Consider adding penalty clauses for late payment")
        
        if doc_type == "agreement" and "multi-party" in tags:
            recommendations.append("Clearly define responsibilities for each party")
        
        if "confidentiality" in tags:
            recommendations.append("Review confidentiality clauses for completeness")
        
        if doc_type == "unknown":
            recommendations.append("Document structure suggests adding more formal legal elements")
        
        return recommendations
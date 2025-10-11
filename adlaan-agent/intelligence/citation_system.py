"""
Advanced Legal Citation System
Integrates with external legal databases and provides auto-citation capabilities
"""

from typing import Dict, List, Optional, Union, Tuple
from dataclasses import dataclass
import requests
import json
import re
from datetime import datetime, date
from abc import ABC, abstractmethod
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage


@dataclass
class LegalCitation:
    """Represents a properly formatted legal citation"""
    id: str
    citation_text: str
    full_title: str
    jurisdiction: str
    court: Optional[str]
    year: int
    citation_type: str  # case, statute, regulation, treatise, etc.
    reliability_score: float
    url: Optional[str]
    access_date: str
    verified: bool
    bluebook_format: str
    alwd_format: str
    local_format: str


@dataclass
class CitationContext:
    """Context information for citation generation"""
    legal_proposition: str
    document_type: str
    jurisdiction: str
    citation_style: str
    author: Optional[str]
    publication_date: date


class CitationProvider(ABC):
    """Abstract base class for citation providers"""
    
    @abstractmethod
    def search_cases(self, query: str, jurisdiction: str = None) -> List[Dict]:
        """Search for case law"""
        pass
    
    @abstractmethod
    def search_statutes(self, query: str, jurisdiction: str = None) -> List[Dict]:
        """Search for statutes and regulations"""
        pass
    
    @abstractmethod
    def get_citation_format(self, legal_id: str, style: str = "bluebook") -> str:
        """Get properly formatted citation"""
        pass


class JustiaProvider(CitationProvider):
    """Justia API provider for legal citations"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.base_url = "https://api.justia.com"
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})
    
    def search_cases(self, query: str, jurisdiction: str = None) -> List[Dict]:
        """Search Justia for case law"""
        # Note: This is a mock implementation as Justia API details may vary
        params = {
            "q": query,
            "jurisdiction": jurisdiction or "all",
            "format": "json",
            "limit": 10
        }
        
        try:
            # Mock response for demonstration
            return self._mock_case_search(query, jurisdiction)
        except Exception as e:
            print(f"Error searching Justia cases: {e}")
            return []
    
    def search_statutes(self, query: str, jurisdiction: str = None) -> List[Dict]:
        """Search Justia for statutes"""
        params = {
            "q": query,
            "type": "statute",
            "jurisdiction": jurisdiction or "federal",
            "format": "json"
        }
        
        try:
            # Mock response for demonstration
            return self._mock_statute_search(query, jurisdiction)
        except Exception as e:
            print(f"Error searching Justia statutes: {e}")
            return []
    
    def get_citation_format(self, legal_id: str, style: str = "bluebook") -> str:
        """Get properly formatted citation from Justia"""
        # Mock implementation
        return f"Mock Citation for {legal_id} in {style} format"
    
    def _mock_case_search(self, query: str, jurisdiction: str) -> List[Dict]:
        """Mock case search results"""
        return [
            {
                "id": "case_001",
                "title": "Smith v. Jones",
                "court": "Supreme Court",
                "year": 2023,
                "jurisdiction": jurisdiction or "federal",
                "citation": "123 S.Ct. 456 (2023)",
                "url": "https://justia.com/cases/smith-v-jones",
                "relevance": 0.95,
                "summary": "Leading case on commercial contract interpretation..."
            },
            {
                "id": "case_002", 
                "title": "Brown v. Board of Commerce",
                "court": "Court of Appeals",
                "year": 2022,
                "jurisdiction": jurisdiction or "federal",
                "citation": "789 F.3d 234 (2022)",
                "url": "https://justia.com/cases/brown-v-board",
                "relevance": 0.88,
                "summary": "Important precedent for business regulations..."
            }
        ]
    
    def _mock_statute_search(self, query: str, jurisdiction: str) -> List[Dict]:
        """Mock statute search results"""
        return [
            {
                "id": "statute_001",
                "title": "Commercial Code Section 123",
                "year": 2024,
                "jurisdiction": jurisdiction or "federal",
                "citation": "15 U.S.C. § 123",
                "url": "https://justia.com/codes/us/title-15/section-123",
                "relevance": 0.92,
                "summary": "Governs commercial transactions and contracts..."
            }
        ]


class LexisNexisProvider(CitationProvider):
    """LexisNexis API provider (mock implementation)"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.lexisnexis.com"
    
    def search_cases(self, query: str, jurisdiction: str = None) -> List[Dict]:
        """Search LexisNexis for cases"""
        # Mock implementation - would integrate with actual LexisNexis API
        return self._mock_lexis_search(query, "cases", jurisdiction)
    
    def search_statutes(self, query: str, jurisdiction: str = None) -> List[Dict]:
        """Search LexisNexis for statutes"""
        return self._mock_lexis_search(query, "statutes", jurisdiction)
    
    def get_citation_format(self, legal_id: str, style: str = "bluebook") -> str:
        """Get LexisNexis citation format"""
        return f"LexisNexis Citation for {legal_id} ({style})"
    
    def _mock_lexis_search(self, query: str, content_type: str, jurisdiction: str) -> List[Dict]:
        """Mock LexisNexis search results"""
        if content_type == "cases":
            return [
                {
                    "id": "lexis_case_001",
                    "title": "Advanced Legal Concepts Corp. v. Modern Solutions Inc.",
                    "court": "Federal Circuit",
                    "year": 2024,
                    "jurisdiction": jurisdiction or "federal",
                    "citation": "2024 U.S. App. LEXIS 1234",
                    "relevance": 0.96,
                    "summary": "Landmark decision on AI in legal practice..."
                }
            ]
        else:
            return [
                {
                    "id": "lexis_statute_001",
                    "title": "Digital Commerce Regulation Act",
                    "year": 2024,
                    "jurisdiction": jurisdiction or "federal",
                    "citation": "Digital Commerce Reg. § 45.1",
                    "relevance": 0.89,
                    "summary": "Comprehensive digital commerce regulations..."
                }
            ]


class CustomScrapingProvider(CitationProvider):
    """Custom web scraping provider for legal sources"""
    
    def __init__(self):
        self.sources = {
            "jordan": "http://www.lob.gov.jo",
            "uae": "http://www.moj.gov.ae", 
            "saudi": "https://laws.boe.gov.sa",
            "uk": "https://www.legislation.gov.uk",
            "eu": "https://eur-lex.europa.eu"
        }
    
    def search_cases(self, query: str, jurisdiction: str = None) -> List[Dict]:
        """Scrape legal databases for cases"""
        # Mock implementation for demonstration
        return self._mock_scraped_cases(query, jurisdiction)
    
    def search_statutes(self, query: str, jurisdiction: str = None) -> List[Dict]:
        """Scrape legal databases for statutes"""
        return self._mock_scraped_statutes(query, jurisdiction)
    
    def get_citation_format(self, legal_id: str, style: str = "local") -> str:
        """Format citation according to local jurisdiction standards"""
        return f"Custom Citation for {legal_id} ({style})"
    
    def _mock_scraped_cases(self, query: str, jurisdiction: str) -> List[Dict]:
        """Mock scraped case results"""
        if jurisdiction == "jordan":
            return [
                {
                    "id": "jordan_case_001",
                    "title": "قضية الشركة التجارية ضد المؤسسة الحديثة",
                    "court": "محكمة العدل العليا",
                    "year": 2023,
                    "jurisdiction": "jordan",
                    "citation": "قرار رقم 123/2023",
                    "relevance": 0.91,
                    "summary": "قضية مهمة في القانون التجاري الأردني..."
                }
            ]
        return []
    
    def _mock_scraped_statutes(self, query: str, jurisdiction: str) -> List[Dict]:
        """Mock scraped statute results"""
        if jurisdiction == "jordan":
            return [
                {
                    "id": "jordan_statute_001", 
                    "title": "قانون الشركات التجارية الأردني رقم 22 لسنة 1997",
                    "year": 1997,
                    "jurisdiction": "jordan",
                    "citation": "قانون رقم 22/1997",
                    "relevance": 0.94,
                    "summary": "القانون الأساسي للشركات التجارية في الأردن..."
                }
            ]
        return []


class CitationFormatter:
    """Formats citations according to different legal styles"""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0.1)
    
    def format_citation(self, citation_data: Dict, style: str = "bluebook") -> str:
        """Format citation according to specified style"""
        
        if style.lower() == "bluebook":
            return self._format_bluebook(citation_data)
        elif style.lower() == "alwd":
            return self._format_alwd(citation_data)
        elif style.lower() == "local":
            return self._format_local(citation_data)
        else:
            return self._ai_format_citation(citation_data, style)
    
    def _format_bluebook(self, data: Dict) -> str:
        """Format according to Bluebook style"""
        if data.get("type") == "case":
            return f"{data['title']}, {data['citation']} ({data['court']} {data['year']})"
        elif data.get("type") == "statute":
            return f"{data['citation']} ({data['year']})"
        return data.get("citation", "Citation unavailable")
    
    def _format_alwd(self, data: Dict) -> str:
        """Format according to ALWD style"""
        if data.get("type") == "case":
            return f"{data['title']}, {data['citation']} ({data['year']})"
        elif data.get("type") == "statute":
            return f"{data['title']} {data['citation']} ({data['year']})"
        return data.get("citation", "Citation unavailable")
    
    def _format_local(self, data: Dict) -> str:
        """Format according to local jurisdiction standards"""
        jurisdiction = data.get("jurisdiction", "general")
        
        if jurisdiction == "jordan":
            if data.get("type") == "case":
                return f"{data['title']}، {data['citation']} ({data['year']})"
            else:
                return f"{data['title']}، {data['citation']}"
        elif jurisdiction in ["uae", "saudi"]:
            # Arabic format for Gulf countries
            return f"{data.get('title', '')}، {data.get('citation', '')}"
        else:
            return self._format_bluebook(data)
    
    def _ai_format_citation(self, data: Dict, style: str) -> str:
        """Use AI to format citations for complex or custom styles"""
        system_prompt = f"""You are a legal citation formatting expert.

Format the following legal source according to {style} citation style.

Provide only the properly formatted citation, nothing else.

Legal Source Data:
{json.dumps(data, indent=2)}

Citation Style: {style}
"""

        response = self.llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content="Format this citation.")
        ])
        
        return response.content.strip()


class CitationValidator:
    """Validates and verifies legal citations"""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0.1)
    
    def validate_citation(self, citation: str, expected_format: str = None) -> Dict:
        """Validate a legal citation for accuracy and format"""
        
        validation_result = {
            "is_valid": False,
            "format_correct": False,
            "content_accurate": False,
            "issues": [],
            "suggestions": [],
            "confidence_score": 0.0
        }
        
        # Format validation
        if self._check_citation_format(citation, expected_format):
            validation_result["format_correct"] = True
        else:
            validation_result["issues"].append("Citation format does not match expected style")
        
        # AI-powered content validation
        content_validation = self._ai_validate_content(citation)
        validation_result.update(content_validation)
        
        # Overall validation
        if validation_result["format_correct"] and validation_result["content_accurate"]:
            validation_result["is_valid"] = True
        
        return validation_result
    
    def _check_citation_format(self, citation: str, format_style: str) -> bool:
        """Check if citation follows proper format patterns"""
        
        # Basic format patterns
        patterns = {
            "bluebook_case": r"^.+,\s+\d+\s+[A-Z][^,]+\s+\d+\s+\(\d{4}\)$",
            "bluebook_statute": r"^\d+\s+[A-Z]\.[A-Z]\.[A-Z]\.?\s+§\s+\d+",
            "year_pattern": r"\(\d{4}\)",
            "volume_pattern": r"^\d+\s+"
        }
        
        if not format_style:
            # Basic validation - check for year and reasonable structure
            return bool(re.search(patterns["year_pattern"], citation))
        
        pattern_key = f"{format_style.lower()}_case"
        if pattern_key in patterns:
            return bool(re.match(patterns[pattern_key], citation))
        
        return True  # Default to valid if no specific pattern
    
    def _ai_validate_content(self, citation: str) -> Dict:
        """Use AI to validate citation content accuracy"""
        
        system_prompt = """You are a legal citation validation expert.

Analyze the given citation for:
1. Content accuracy and completeness
2. Proper legal authority identification  
3. Reasonable year and court information
4. Overall citation quality

Respond with JSON:
{
    "content_accurate": true/false,
    "issues": ["list of specific issues found"],
    "suggestions": ["list of improvement suggestions"], 
    "confidence_score": 0.85
}"""

        response = self.llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Validate this citation: {citation}")
        ])
        
        try:
            result = json.loads(response.content)
            return result
        except:
            return {
                "content_accurate": False,
                "issues": ["Unable to validate citation content"],
                "suggestions": ["Manual review recommended"],
                "confidence_score": 0.0
            }


class AutoCitationSystem:
    """Main auto-citation system integrating all components"""
    
    def __init__(self, lexis_api_key: str = None, justia_api_key: str = None):
        self.providers = []
        
        # Initialize providers
        if justia_api_key:
            self.providers.append(JustiaProvider(justia_api_key))
        
        if lexis_api_key:
            self.providers.append(LexisNexisProvider(lexis_api_key))
        
        # Always add custom scraping provider
        self.providers.append(CustomScrapingProvider())
        
        self.formatter = CitationFormatter()
        self.validator = CitationValidator()
        
    def auto_cite(self, legal_proposition: str, context: CitationContext) -> List[LegalCitation]:
        """Automatically generate citations for a legal proposition"""
        
        citations = []
        
        # Search across all providers
        for provider in self.providers:
            try:
                # Search cases
                cases = provider.search_cases(legal_proposition, context.jurisdiction)
                for case in cases[:3]:  # Limit to top 3 results per provider
                    citation = self._create_citation_from_result(case, "case", context)
                    if citation:
                        citations.append(citation)
                
                # Search statutes
                statutes = provider.search_statutes(legal_proposition, context.jurisdiction) 
                for statute in statutes[:2]:  # Limit to top 2 statutes
                    citation = self._create_citation_from_result(statute, "statute", context)
                    if citation:
                        citations.append(citation)
                        
            except Exception as e:
                print(f"Error with provider {type(provider).__name__}: {e}")
        
        # Remove duplicates and rank by relevance
        unique_citations = self._deduplicate_citations(citations)
        ranked_citations = sorted(unique_citations, key=lambda x: x.reliability_score, reverse=True)
        
        return ranked_citations[:5]  # Return top 5 citations
    
    def _create_citation_from_result(self, result: Dict, citation_type: str, 
                                   context: CitationContext) -> Optional[LegalCitation]:
        """Create LegalCitation object from search result"""
        
        try:
            # Format citation in different styles
            bluebook = self.formatter.format_citation({**result, "type": citation_type}, "bluebook")
            alwd = self.formatter.format_citation({**result, "type": citation_type}, "alwd")  
            local = self.formatter.format_citation({**result, "type": citation_type}, "local")
            
            # Validate primary citation
            validation = self.validator.validate_citation(bluebook, "bluebook")
            
            citation = LegalCitation(
                id=result.get("id", f"{citation_type}_{datetime.now().timestamp()}"),
                citation_text=result.get("citation", ""),
                full_title=result.get("title", ""),
                jurisdiction=result.get("jurisdiction", context.jurisdiction),
                court=result.get("court"),
                year=result.get("year", 2024),
                citation_type=citation_type,
                reliability_score=result.get("relevance", 0.5) * validation.get("confidence_score", 0.5),
                url=result.get("url"),
                access_date=date.today().isoformat(),
                verified=validation.get("is_valid", False),
                bluebook_format=bluebook,
                alwd_format=alwd,
                local_format=local
            )
            
            return citation
            
        except Exception as e:
            print(f"Error creating citation: {e}")
            return None
    
    def _deduplicate_citations(self, citations: List[LegalCitation]) -> List[LegalCitation]:
        """Remove duplicate citations based on similarity"""
        unique_citations = []
        seen_titles = set()
        
        for citation in citations:
            # Simple deduplication based on title similarity
            title_key = citation.full_title.lower().strip()
            if title_key not in seen_titles:
                unique_citations.append(citation)
                seen_titles.add(title_key)
        
        return unique_citations
    
    def cite_document(self, document_content: str, context: CitationContext) -> Dict:
        """Automatically cite an entire legal document"""
        
        # Extract legal propositions from document
        propositions = self._extract_legal_propositions(document_content)
        
        document_citations = {}
        
        for i, proposition in enumerate(propositions):
            citations = self.auto_cite(proposition, context)
            document_citations[f"proposition_{i+1}"] = {
                "text": proposition,
                "citations": [asdict(citation) for citation in citations]
            }
        
        return {
            "document_length": len(document_content),
            "propositions_found": len(propositions),
            "total_citations": sum(len(prop["citations"]) for prop in document_citations.values()),
            "citations_by_proposition": document_citations,
            "citation_context": asdict(context),
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def _extract_legal_propositions(self, text: str) -> List[str]:
        """Extract legal propositions that need citations"""
        
        # Use AI to identify legal statements that need citations
        system_prompt = """You are a legal writing expert.

Extract legal propositions from the text that require citations.

Return a JSON list of legal statements that need supporting citations:
["legal proposition 1", "legal proposition 2", ...]

Focus on:
- Legal rules or principles stated as fact
- References to laws, cases, or regulations
- Legal conclusions or interpretations
- Statements of legal authority"""

        response = self.formatter.llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Extract legal propositions requiring citations:\n\n{text}")
        ])
        
        try:
            propositions = json.loads(response.content)
            return propositions if isinstance(propositions, list) else []
        except:
            # Fallback: basic sentence extraction
            sentences = text.split(".")
            return [s.strip() for s in sentences if len(s.strip()) > 50 and any(word in s.lower() for word in ["law", "court", "statute", "regulation", "case", "decision"])]


# Example usage and testing
if __name__ == "__main__":
    # Initialize citation system
    citation_system = AutoCitationSystem()
    
    # Create citation context
    context = CitationContext(
        legal_proposition="Commercial companies must register with the appropriate authority",
        document_type="contract",
        jurisdiction="jordan",
        citation_style="bluebook",
        author="Legal AI System",
        publication_date=date.today()
    )
    
    # Test auto-citation
    citations = citation_system.auto_cite(
        "Commercial companies must file annual reports", 
        context
    )
    
    print("Auto-Generated Citations:")
    for citation in citations:
        print(f"- {citation.bluebook_format} (Reliability: {citation.reliability_score:.2f})")
    
    # Test document citation
    sample_document = """
    Commercial entities operating in Jordan must comply with the Commercial Companies Law.
    The law requires annual financial reporting and board composition standards.
    Failure to comply may result in penalties as specified in the regulations.
    """
    
    document_citations = citation_system.cite_document(sample_document, context)
    print(f"\nDocument Citations: {document_citations['total_citations']} citations generated")
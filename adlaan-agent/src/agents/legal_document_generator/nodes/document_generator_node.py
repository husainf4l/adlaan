"""
Document generator node for creating document content.
"""
from typing import Dict, Any
from datetime import datetime
from src.core.logging import get_logger
from ..tools import DocumentFormattingTool
from src.utils.agent_helpers import validate_document_structure

logger = get_logger(__name__)


class DocumentGeneratorNode:
    """Node for generating document content."""
    
    def __init__(self, agent_instance):
        self.agent = agent_instance
        self.logger = logger
        self.formatting_tool = DocumentFormattingTool()
    
    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Process document generation."""
        self.logger.info("📝 Document generator node: Creating document content")
        
        requirements = state.get("requirements", {})
        legal_research = state.get("legal_research", {})
        document_type = state.get("document_type", "contract")
        
        # Generate content based on requirements and research
        generated_content = await self._generate_content(requirements, legal_research, document_type)
        
        # Format the generated content
        formatting_result = await self.formatting_tool.format_document(
            generated_content, 
            format_type="legal"
        )
        
        # Validate the generated document
        validation_result = validate_document_structure(formatting_result["formatted_content"])
        
        state.update({
            "generated_content": {
                "raw_content": generated_content,
                "formatted_content": formatting_result["formatted_content"],
                "validation": validation_result,
                "generation_timestamp": datetime.now().isoformat(),
                "document_type": document_type
            },
            "content_ready": validation_result.get("valid", False)
        })
        
        return state
    
    async def _generate_content(self, requirements: Dict[str, Any], research: Dict[str, Any], document_type: str) -> str:
        """Generate document content based on requirements and research."""
        # Create structured content based on document type
        content_templates = {
            "contract": self._generate_contract_content,
            "agreement": self._generate_agreement_content,
            "legal_notice": self._generate_legal_notice_content,
            "memorandum": self._generate_memorandum_content
        }
        
        generator = content_templates.get(document_type, self._generate_contract_content)
        return await generator(requirements, research)
    
    async def _generate_contract_content(self, requirements: Dict[str, Any], research: Dict[str, Any]) -> str:
        """Generate contract content."""
        parties = requirements.get("parties", ["Party A", "Party B"])
        terms = requirements.get("terms", {})
        
        content = f"""
CONTRACT AGREEMENT

This Contract Agreement is entered into between {parties[0]} and {parties[1]}.

TERMS AND CONDITIONS:

1. Purpose: {terms.get('purpose', 'General agreement between parties')}

2. Duration: {terms.get('duration', 'To be determined')}

3. Obligations:
   - {parties[0]}: {terms.get('party1_obligations', 'Fulfill contractual obligations')}
   - {parties[1]}: {terms.get('party2_obligations', 'Fulfill contractual obligations')}

4. Payment Terms: {terms.get('payment_terms', 'As agreed between parties')}

5. Termination: {terms.get('termination', 'Either party may terminate with written notice')}

6. Governing Law: This contract shall be governed by the laws of {requirements.get('jurisdiction', 'Jordan')}.

7. Signatures:
   {parties[0]}: _____________________ Date: _______
   {parties[1]}: _____________________ Date: _______
"""
        
        return content.strip()
    
    async def _generate_agreement_content(self, requirements: Dict[str, Any], research: Dict[str, Any]) -> str:
        """Generate agreement content."""
        return "AGREEMENT\n\nThis agreement outlines the terms between the parties..."
    
    async def _generate_legal_notice_content(self, requirements: Dict[str, Any], research: Dict[str, Any]) -> str:
        """Generate legal notice content."""
        return "LEGAL NOTICE\n\nThis notice serves to inform..."
    
    async def _generate_memorandum_content(self, requirements: Dict[str, Any], research: Dict[str, Any]) -> str:
        """Generate memorandum content."""
        return "MEMORANDUM\n\nTo: Recipient\nFrom: Sender\nSubject: Legal Matter..."
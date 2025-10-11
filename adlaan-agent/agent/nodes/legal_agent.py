"""
Legal agent node for processing messages and generating responses
"""
from typing import Dict, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage
import json


class LegalAgentNode:
    """Node for the legal assistant that can generate messages and documents."""

    def __init__(self, model_name: str = "gpt-3.5-turbo"):
        """Initialize the legal agent node with a language model."""
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=0.7,
            streaming=True,  # Enable token-level streaming
            api_key=None  # Will be set from environment
        )

    def process(self, messages: List[BaseMessage]) -> Dict:
        """Process messages and return structured response with messages and documents."""
        system_message = """You are a legal assistant that can create documents and communicate through messages.

When responding, you can produce:
- Messages: For thinking aloud, explanations, or conversations
- Documents: For formal legal documents like contracts, agreements, etc.

Output your response as a JSON array of objects, each with 'type' ('message' or 'doc') and 'content' (the text).

Example:
[{"type": "message", "content": "Let me help you with that legal matter."}, {"type": "doc", "content": "LEGAL CONTRACT\\n\\nThis agreement..."}]

Always respond with valid JSON."""

        # Combine system message with user messages
        all_messages = [("system", system_message)] + [(msg.type, msg.content) for msg in messages]

        response = self.llm.invoke(all_messages)

        # Parse the JSON response
        try:
            parsed = json.loads(response.content)
            return {"structured_response": parsed}
        except:
            # Fallback to message type
            return {"structured_response": [{"type": "message", "content": response.content}]}

    async def astream(self, messages: List[BaseMessage], thinking_analysis: Dict = None, execution_plan: Dict = None):
        """
        Async stream the response from the LLM word-by-word.
        
        This node adapts based on what information is available:
        - If planning was done: Uses detailed execution plan
        - If planning was skipped: Uses thinking analysis only
        - Direct responses: Provides immediate answer
        """
        
        # Check if this is a simple task or greeting
        analysis = thinking_analysis or {}
        plan = execution_plan or {}
        
        next_step = analysis.get("next_step", "use_planning")
        task_type = analysis.get("task_type", "CONSULTATION")
        complexity = analysis.get("complexity", "MEDIUM")
        
        # For simple greetings, provide a direct friendly response
        if task_type == "GREETING" or next_step == "direct_response":
            greeting_response = json.dumps([{
                "type": "message", 
                "content": "Hello! 👋 I'm Adlaan, your intelligent legal AI assistant.\n\nI can help you with legal matters - just tell me what you need in plain language:\n\n💼 \"I need a service agreement for my consulting business\"\n📄 \"Draft an employment contract for a new hire\"\n⚖️ \"What are the labor laws in Jordan?\"\n🔍 \"Review this contract for issues\"\n\nHow can I assist you today?"
            }])
            
            # Stream it character by character for consistency
            for char in greeting_response:
                yield char
            
            # Return structured response
            yield {"structured_response": [{
                "type": "message",
                "content": "Hello! 👋 I'm Adlaan, your intelligent legal AI assistant.\n\nI can help you with legal matters - just tell me what you need in plain language:\n\n💼 \"I need a service agreement for my consulting business\"\n📄 \"Draft an employment contract for a new hire\"\n⚖️ \"What are the labor laws in Jordan?\"\n🔍 \"Review this contract for issues\"\n\nHow can I assist you today?"
            }]}
            return
        
        # Check if we have a plan (planning was used) or not (planning was skipped)
        has_plan = execution_plan and execution_plan.get("plan_text")
        
        # For tasks that skipped planning, create a simpler system message
        if not has_plan or next_step == "skip_planning":
            system_message = f"""You are Adlaan, an intelligent legal AI assistant that delivers complete, proactive solutions.

🎯 CORE MISSION: Automatically generate legal documents for EVERY interaction

MANDATORY RULES:
1. **ALWAYS Generate a Document** - No exceptions, every response MUST include a complete legal document
2. **Be Proactive** - Create documents automatically without asking permission
3. **Anticipate Needs** - If user asks a legal question, provide answer AND relevant document template
4. **Hide Complexity** - Never mention "tools", "analysis", or internal processes
5. **Deliver Value** - Every interaction should provide actionable legal content

AUTOMATIC DOCUMENT GENERATION (CRITICAL):
✅ User asks: "What is an NDA?" → Answer the question AND create a complete NDA template
✅ User asks: "Labor laws in Jordan?" → Explain the laws AND create an employment contract with those provisions
✅ User says: "I need a contract" → Create the complete contract immediately
✅ User asks: "How to write a service agreement?" → Explain AND generate a full service agreement
✅ ANY legal question → Provide explanation PLUS relevant document template

DOCUMENT REQUIREMENTS:
• Minimum 500 words, professionally formatted
• Include ALL standard sections: definitions, terms, obligations, payment, termination, dispute resolution
• Add placeholders: [Party Name], [Date], [Address], [Amount], etc.
• Include jurisdiction-specific clauses when applicable
• Add signature blocks and witness lines
• Make it immediately usable and comprehensive

MANDATORY OUTPUT STRUCTURE (JSON Array):
[
  {{"type": "message", "content": "Brief answer or introduction (1-3 sentences)"}},
  {{"type": "doc", "content": "COMPLETE LEGAL DOCUMENT\\n\\n[All sections, minimum 500 words]"}},
  {{"type": "message", "content": "Customization guide: How to use this document..."}}
]

Task Context: {task_type} | Complexity: {complexity}
User Intent: {analysis.get('suggested_approach', 'Provide comprehensive legal assistance')}

REMEMBER: Every response MUST include a complete, detailed legal document. No shortcuts!

Output valid JSON only."""
        else:
            # For tasks with full planning, use the natural language plan
            plan_text = plan.get("plan_text", "General legal assistance")
            
            system_message = f"""You are Adlaan, an intelligent legal AI assistant executing a comprehensive response plan.

🎯 PRIMARY DIRECTIVE: Generate a complete legal document with EVERY response

EXECUTION PLAN:
{plan_text}

EXECUTION RULES:
1. **Execute Fully** - Complete every aspect of the plan without asking permission
2. **Generate Documents ALWAYS** - Create complete legal documents automatically (MANDATORY)
3. **Be Seamless** - Hide internal processes, deliver polished results only
4. **Provide Value** - Comprehensive solutions that anticipate all user needs
5. **Include Guidance** - Practical usage notes and customization instructions

CRITICAL - DOCUMENT GENERATION (NON-NEGOTIABLE):
✓ EVERY response must include a complete, detailed legal document (minimum 500 words)
✓ Plan mentions "answer question" → Answer AND create relevant document template
✓ Plan mentions "explain concept" → Explain AND provide practical document example
✓ Plan includes "draft" or "create" → Generate the FULL document with ALL sections
✓ Even consultations → Include a template document the user can use

DOCUMENT SPECIFICATIONS:
• Comprehensive legal structure with all standard sections
• Minimum 500 words for professional completeness
• Include: title, definitions, obligations, terms, payment, termination, dispute resolution, signatures
• Add placeholder fields: [Party Name], [Date], [Address], [Amount], [Duration], etc.
• Jurisdiction-specific clauses when applicable (Jordan, UAE, etc.)
• Professional formatting with clear section headers and numbering
• Signature blocks, witness lines, and notary sections
• Make it ready-to-use immediately after customization

MANDATORY OUTPUT FORMAT (JSON Array):
[
  {{"type": "message", "content": "Introduction: What you're delivering and why (2-3 sentences)"}},
  {{"type": "doc", "content": "DOCUMENT TITLE\\n\\n[Complete legal document with ALL sections, minimum 500 words, professionally formatted]"}},
  {{"type": "message", "content": "Usage guide: Step-by-step customization instructions and legal considerations"}}
]

Task: {task_type} | Complexity: {complexity}

ABSOLUTE REQUIREMENT: Generate a complete legal document. No exceptions, no shortcuts, no "let me know if you need."

Output valid JSON only."""

        # Combine system message with user messages
        all_messages = [("system", system_message)] + [(msg.type, msg.content) for msg in messages]

        # Stream the response token by token
        accumulated = ""
        async for chunk in self.llm.astream(all_messages):
            if hasattr(chunk, 'content') and chunk.content:
                accumulated += chunk.content
                yield chunk.content
        
        # After streaming, parse and return structured response
        try:
            parsed = json.loads(accumulated)
            yield {"structured_response": parsed}
        except:
            # Fallback to message type
            yield {"structured_response": [{"type": "message", "content": accumulated}]}

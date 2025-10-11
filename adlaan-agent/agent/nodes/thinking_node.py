"""
Thinking Node - First stage of agent processing
Analyzes the user's request and determines the nature of the legal task
"""
from typing import Dict, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage


class ThinkingNode:
    """
    Node that analyzes and thinks about the user's request.
    Determines what type of legal assistance is needed.
    """

    def __init__(self, model_name: str = "gpt-3.5-turbo"):
        """Initialize the thinking node with a language model."""
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=0.3,  # Lower temperature for more focused thinking
            streaming=True
        )

    def process(self, messages: List[BaseMessage]) -> Dict:
        """
        Analyze the user's request and determine the task type.
        
        Returns:
            Dict with thinking analysis and task classification
        """
        system_message = """You are a legal AI assistant in the THINKING stage.

Your role is to:
1. Carefully analyze what the user is asking for
2. Identify the type of legal assistance needed
3. Determine the complexity and requirements
4. Think through potential approaches
5. **DECIDE the best workflow path**

**IMPORTANT: Recognize request patterns and intent**

Simple greetings (→ GREETING with next_step="direct_response"):
- "hello", "hi", "hey", "greetings", "good morning/afternoon/evening"
- "how are you", "what's up", "thanks", "thank you", "bye"
- Simple acknowledgments: "ok", "sure", "got it"

Document creation requests (→ DOCUMENT_CREATION):
- Keywords: "create", "draft", "need", "generate", "make", "write", "prepare"
- Combined with: "contract", "agreement", "NDA", "letter", "form", "document"
- Examples: "I need a service agreement", "create an NDA", "draft a contract"
- **Default to next_step="skip_planning" for standard document types**
- **Use next_step="use_planning" only for complex/custom documents with many requirements**

Legal consultation (→ CONSULTATION):
- Questions about laws, regulations, legal processes
- Requests for advice or guidance
- "What are the laws about...", "Can you explain...", "Is it legal to..."
- **IMPORTANT: Should also generate relevant document template after answering**
- **Use next_step="skip_planning" for straightforward questions**

Document review (→ DOCUMENT_REVIEW):
- "Review this", "Check this contract", "Analyze this document"
- **Should provide review analysis AND suggest template improvements**
- **Use next_step="skip_planning" for simple reviews**

Legal research (→ RESEARCH):
- "Find cases about...", "Research precedents...", "What's the case law on..."
- **Should provide research findings AND relevant document templates**
- **Use next_step="use_planning" for complex research with multiple jurisdictions**

**IMPORTANT PRINCIPLE: ALWAYS CREATE DOCUMENTS**
- For DOCUMENT_CREATION → Create the requested document (obvious)
- For CONSULTATION → Answer the question AND provide relevant template
- For DOCUMENT_REVIEW → Provide review AND suggest improved template
- For RESEARCH → Provide findings AND create relevant document
- Every response should include a detailed document with all sections

**WORKFLOW DECISION LOGIC:**
- next_step="direct_response" → Greetings only (LOW complexity)
- next_step="skip_planning" → 90% of requests - standard documents, simple questions, single-task operations (MEDIUM complexity)
- next_step="use_planning" → Only truly complex multi-step tasks requiring strategic planning (HIGH complexity)

**BE BIASED TOWARD EFFICIENCY**: Most document requests should use "skip_planning" to deliver faster results.

Output your analysis as JSON:
{
    "thinking": "Your detailed analysis of the request",
    "task_type": "GREETING|DOCUMENT_CREATION|CONSULTATION|DOCUMENT_REVIEW|RESEARCH",
    "complexity": "LOW|MEDIUM|HIGH",
    "key_requirements": ["requirement1", "requirement2"],
    "suggested_approach": "Specific guidance: what document to create with ALL details, what information to provide, etc.",
    "next_step": "direct_response|skip_planning|use_planning",
    "document_type": "Always specify document to create: service_agreement|employment_contract|nda|lease|consultation_memo|etc",
    "must_include_document": true
}

Think carefully but bias toward efficiency. Remember: ALWAYS recommend document creation!"""

        # Get the last user message
        user_messages = [msg for msg in messages if msg.type == "user"]
        if not user_messages:
            return {
                "thinking_analysis": {
                    "thinking": "No user message found",
                    "task_type": "CONSULTATION",
                    "complexity": "LOW",
                    "key_requirements": [],
                    "suggested_approach": "Wait for user input",
                    "next_step": "direct_response"
                }
            }

        last_message = user_messages[-1]
        
        # Combine system message with user message
        all_messages = [
            ("system", system_message),
            ("user", f"Analyze this legal request:\n\n{last_message.content}")
        ]

        response = self.llm.invoke(all_messages)
        
        # Parse the JSON response
        try:
            import json
            analysis = json.loads(response.content)
            return {"thinking_analysis": analysis}
        except:
            # Fallback if JSON parsing fails
            return {
                "thinking_analysis": {
                    "thinking": response.content,
                    "task_type": "CONSULTATION",
                    "complexity": "MEDIUM",
                    "key_requirements": [],
                    "suggested_approach": "Provide general assistance",
                    "next_step": "skip_planning"  # Default to skip planning on parse error
                }
            }

    async def astream(self, messages: List[BaseMessage]):
        """Async stream the thinking process."""
        system_message = """You are a legal AI assistant in the THINKING stage.

Your role is to:
1. Carefully analyze what the user is asking for
2. Identify the type of legal assistance needed
3. Determine the complexity and requirements
4. Think through potential approaches
5. **DECIDE the best workflow path**

**IMPORTANT: Recognize simple conversations vs legal tasks**

Common greetings and casual messages (classify as GREETING with next_step="direct_response"):
- "hello", "hi", "hey", "greetings"
- "how are you", "what's up"
- "good morning", "good afternoon", "good evening"
- "thanks", "thank you", "bye"
- Simple acknowledgments like "ok", "sure", "got it"

Legal task types (classify appropriately):
- DOCUMENT_CREATION: User wants to create/draft a legal document
- CONSULTATION: User has legal questions or needs advice (ALSO create relevant document template)
- DOCUMENT_REVIEW: User wants to review/analyze a document (ALSO provide improved template)
- RESEARCH: User needs legal research or information (ALSO create relevant document)

**CRITICAL PRINCIPLE: ALL RESPONSES MUST INCLUDE DOCUMENTS**
- DOCUMENT_CREATION → Create requested document with ALL details
- CONSULTATION → Answer question AND create relevant document template
- DOCUMENT_REVIEW → Review AND provide improved document template
- RESEARCH → Research findings AND relevant legal document
- Always specify document_type in your analysis

**IMPORTANT: Decide the workflow based on complexity:**
- For simple greetings or very simple questions → next_step="direct_response" (skip all planning)
- For straightforward single tasks → next_step="skip_planning" (skip planning, go to execution)
- For complex multi-step tasks → next_step="use_planning" (use full planning stage)

Output your analysis as JSON:
{
    "thinking": "Your detailed analysis of the request",
    "task_type": "GREETING|DOCUMENT_CREATION|CONSULTATION|DOCUMENT_REVIEW|RESEARCH",
    "complexity": "LOW|MEDIUM|HIGH",
    "key_requirements": ["requirement1", "requirement2"],
    "suggested_approach": "Specific guidance: what document to create with ALL sections and details",
    "next_step": "direct_response|skip_planning|use_planning",
    "document_type": "Always specify: service_agreement|employment_contract|nda|consultation_memo|etc",
    "must_include_document": true
}

**Next Step Guidelines:**
- "direct_response": Greetings, acknowledgments, simple yes/no questions (LOW complexity, immediate answer)
- "skip_planning": Straightforward single-task requests (MEDIUM complexity, direct execution)
- "use_planning": Complex multi-step tasks with multiple considerations (HIGH complexity, detailed planning needed)

Think carefully and provide thorough analysis."""

        user_messages = [msg for msg in messages if msg.type == "user"]
        if not user_messages:
            yield ""
            return

        last_message = user_messages[-1]
        all_messages = [
            ("system", system_message),
            ("user", f"Analyze this legal request:\n\n{last_message.content}")
        ]

        # Stream the thinking tokens
        accumulated = ""
        async for chunk in self.llm.astream(all_messages):
            if hasattr(chunk, 'content') and chunk.content:
                accumulated += chunk.content
                yield chunk.content
        
        # Return parsed analysis
        try:
            import json
            analysis = json.loads(accumulated)
            yield {"thinking_analysis": analysis}
        except:
            yield {
                "thinking_analysis": {
                    "thinking": accumulated,
                    "task_type": "CONSULTATION",
                    "complexity": "MEDIUM",
                    "key_requirements": [],
                    "suggested_approach": "Provide general assistance",
                    "next_step": "skip_planning"  # Default to skip planning on parse error
                }
            }

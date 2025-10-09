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

**IMPORTANT: Recognize simple conversations vs legal tasks**

Common greetings and casual messages (classify as GREETING with next_step="direct_response"):
- "hello", "hi", "hey", "greetings"
- "how are you", "what's up"  
- "good morning", "good afternoon", "good evening"
- "thanks", "thank you", "bye"
- Simple acknowledgments like "ok", "sure", "got it"

Legal task types (classify appropriately):
- DOCUMENT_CREATION: User wants to create/draft a legal document
- CONSULTATION: User has legal questions or needs advice
- DOCUMENT_REVIEW: User wants to review/analyze a document
- RESEARCH: User needs legal research or information

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
    "suggested_approach": "How to best handle this request",
    "next_step": "direct_response|skip_planning|use_planning"
}

**Next Step Guidelines:**
- "direct_response": Greetings, acknowledgments, simple yes/no questions (LOW complexity, immediate answer)
- "skip_planning": Straightforward single-task requests (MEDIUM complexity, direct execution)
- "use_planning": Complex multi-step tasks with multiple considerations (HIGH complexity, detailed planning needed)

Think carefully and provide thorough analysis."""

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
- CONSULTATION: User has legal questions or needs advice
- DOCUMENT_REVIEW: User wants to review/analyze a document
- RESEARCH: User needs legal research or information

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
    "suggested_approach": "How to best handle this request",
    "next_step": "direct_response|skip_planning|use_planning"
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

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
                "content": "Hello! 👋 I'm Adlaan, your legal AI assistant. I can help you with:\n\n• Legal document creation (contracts, agreements, letters)\n• Legal consultations and advice\n• Document review and analysis\n• Legal research\n\nWhat can I assist you with today?"
            }])
            
            # Stream it character by character for consistency
            for char in greeting_response:
                yield char
            
            # Return structured response
            yield {"structured_response": [{
                "type": "message",
                "content": "Hello! 👋 I'm Adlaan, your legal AI assistant. I can help you with:\n\n• Legal document creation (contracts, agreements, letters)\n• Legal consultations and advice\n• Document review and analysis\n• Legal research\n\nWhat can I assist you with today?"
            }]}
            return
        
        # Check if we have a plan (planning was used) or not (planning was skipped)
        has_plan = execution_plan and execution_plan.get("plan_text")
        
        # For tasks that skipped planning, create a simpler system message
        if not has_plan or next_step == "skip_planning":
            system_message = f"""You are Adlaan, a legal AI assistant handling a {task_type.lower()} task.

Task Details:
- Type: {task_type}
- Complexity: {complexity}
- Approach: {analysis.get('suggested_approach', 'Provide helpful legal assistance')}

Respond directly and helpfully. Output your response as a JSON array:
[{{"type": "message", "content": "Your helpful response here"}}]

For documents, use: {{"type": "doc", "content": "Document content"}}

Always respond with valid JSON."""
        else:
            # For tasks with full planning, use the natural language plan
            plan_text = plan.get("plan_text", "General legal assistance")
            
            system_message = f"""You are Adlaan, a legal AI assistant executing a planned legal task.

**Planning Stage Output:**
{plan_text}

**Your Task:**
Now execute this plan and provide the complete response. Follow the approach outlined in the planning stage.

Task Details:
- Type: {task_type}
- Complexity: {complexity}

Output your response as a JSON array of objects with 'type' and 'content':
- Messages: {{"type": "message", "content": "Explanatory text"}}
- Documents: {{"type": "doc", "content": "Formal document text"}}

Example: [{{"type": "message", "content": "Here's your contract:"}}, {{"type": "doc", "content": "EMPLOYMENT CONTRACT\\n\\n..."}}]

Always respond with valid JSON. Execute the plan now."""

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

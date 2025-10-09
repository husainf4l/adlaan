"""
Planning Node - Second stage of agent processing
Creates a detailed plan based on the thinking analysis
"""
from typing import Dict, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage


class PlanningNode:
    """
    Node that creates a structured plan for handling the user's request.
    Takes the thinking analysis and creates actionable steps.
    """

    def __init__(self, model_name: str = "gpt-3.5-turbo"):
        """Initialize the planning node with a language model."""
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=0.4,  # Moderate temperature for creative planning
            streaming=True
        )

    def process(self, messages: List[BaseMessage], thinking_analysis: Dict = None) -> Dict:
        """
        Create a detailed plan based on the thinking analysis.
        
        This node is only called when thinking decides planning is needed.
        The routing in agent.py skips this node for simple tasks.
        
        Args:
            messages: Message history
            thinking_analysis: Output from the thinking node
        
        Returns:
            Dict with execution plan as natural language
        """
        # Get the thinking analysis
        analysis = thinking_analysis or {}
        task_type = analysis.get("task_type", "CONSULTATION")
        complexity = analysis.get("complexity", "MEDIUM")
        requirements = analysis.get("key_requirements", [])
        
        system_message = """You are a legal AI assistant in the PLANNING stage.

You have received a thinking analysis of the user's request. Your job is to create a clear, actionable execution plan.

**Write your plan in natural, conversational language - NOT as JSON or structured data.**

Explain your planning thoughts clearly:
1. What approach you'll take to handle this request
2. What key steps or considerations are involved
3. What you'll need to focus on in the execution stage
4. Any legal considerations or important points to keep in mind

Write your plan as if you're thinking through the problem out loud. Be practical and clear.

Example styles:
- For a document: "I'll draft a comprehensive employment contract. I need to include sections on compensation, benefits, termination clauses, and non-compete agreements. I'll make sure to tailor it for [jurisdiction] and include standard protective clauses for the employer."

- For a consultation: "Let me analyze this contract dispute from multiple angles. First, I'll examine the breach of contract claims. Then I'll look at potential defenses and remedies. I need to consider the statute of limitations and jurisdictional issues."

- For complex matters: "This requires careful planning. First, I'll research the relevant case law on [topic]. Then I'll draft the initial sections covering [X]. I'll need to address [Y] with special attention to [Z]. Finally, I'll provide recommendations on next steps."

Be natural, practical, and conversational. Think like a lawyer planning their approach."""
        
        # Get the original user request
        user_messages = [msg for msg in messages if msg.type == "user"]
        user_request = user_messages[-1].content if user_messages else ""

        prompt = f"""Original Request: {user_request}

Thinking Analysis:
- Task Type: {task_type}
- Complexity: {complexity}
- Requirements: {', '.join(requirements)}
- Suggested Approach: {analysis.get('suggested_approach', 'General assistance')}

Now create your execution plan in natural language. Explain your approach clearly and practically."""

        all_messages = [
            ("system", system_message),
            ("user", prompt)
        ]

        response = self.llm.invoke(all_messages)
        
        # Return the plan as natural language text
        return {
            "execution_plan": {
                "plan_text": response.content,
                "task_type": task_type,
                "complexity": complexity
            }
        }

    async def astream(self, messages: List[BaseMessage], thinking_analysis: Dict = None):
        """
        Async stream the planning process.
        
        This node is only called when thinking decides planning is needed.
        The routing in agent.py skips this node for simple tasks.
        """
        # Get the thinking analysis
        analysis = thinking_analysis or {}
        task_type = analysis.get("task_type", "CONSULTATION")
        complexity = analysis.get("complexity", "MEDIUM")
        requirements = analysis.get("key_requirements", [])
        
        system_message = """You are a legal AI assistant in the PLANNING stage.

You have received a thinking analysis of the user's request. Your job is to create a clear, actionable execution plan.

**Write your plan in natural, conversational language - NOT as JSON or structured data.**

Explain your planning thoughts clearly:
1. What approach you'll take to handle this request
2. What key steps or considerations are involved
3. What you'll need to focus on in the execution stage
4. Any legal considerations or important points to keep in mind

Write your plan as if you're thinking through the problem out loud. Be practical and clear.

Example styles:
- For a document: "I'll draft a comprehensive employment contract. I need to include sections on compensation, benefits, termination clauses, and non-compete agreements. I'll make sure to tailor it for [jurisdiction] and include standard protective clauses for the employer."

- For a consultation: "Let me analyze this contract dispute from multiple angles. First, I'll examine the breach of contract claims. Then I'll look at potential defenses and remedies. I need to consider the statute of limitations and jurisdictional issues."

- For complex matters: "This requires careful planning. First, I'll research the relevant case law on [topic]. Then I'll draft the initial sections covering [X]. I'll need to address [Y] with special attention to [Z]. Finally, I'll provide recommendations on next steps."

Be natural, practical, and conversational. Think like a lawyer planning their approach."""
        
        user_messages = [msg for msg in messages if msg.type == "user"]
        user_request = user_messages[-1].content if user_messages else ""

        prompt = f"""Original Request: {user_request}

Thinking Analysis:
- Task Type: {task_type}
- Complexity: {complexity}
- Requirements: {', '.join(requirements)}
- Suggested Approach: {analysis.get('suggested_approach', 'General assistance')}

Now create your execution plan in natural language. Explain your approach clearly and practically."""

        all_messages = [
            ("system", system_message),
            ("user", prompt)
        ]

        # Stream the planning tokens
        accumulated = ""
        async for chunk in self.llm.astream(all_messages):
            if hasattr(chunk, 'content') and chunk.content:
                accumulated += chunk.content
                yield chunk.content
        
        # Return the plan as natural language
        yield {
            "execution_plan": {
                "plan_text": accumulated,
                "task_type": task_type,
                "complexity": complexity
            }
        }

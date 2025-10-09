"""
Legal Agent - AI-powered legal document creation and consultation with persistent memory
Uses a three-stage approach: Thinking → Planning → Execution
"""
from typing import TypedDict, Annotated, List, Dict, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage
import os
import uuid
from dotenv import load_dotenv

from .nodes import LegalAgentNode
from .nodes.thinking_node import ThinkingNode
from .nodes.planning_node import PlanningNode
from .checkpointer import create_postgres_checkpointer

# Load environment variables
load_dotenv()


class State(TypedDict):
    """The state of our legal agent graph."""
    messages: Annotated[list[BaseMessage], add_messages]
    thinking_analysis: Optional[Dict]  # Output from thinking node
    execution_plan: Optional[Dict]  # Output from planning node
    structured_response: List[Dict]  # Final output from execution node


class Agent:
    """A legal document creation agent using LangGraph with PostgreSQL persistence."""

    def __init__(self, model_name: str = "gpt-5-mini", use_checkpointing: bool = True):
        """
        Initialize the legal agent with optional checkpointing.
        
        Args:
            model_name: The LLM model to use (default: gpt-5-mini)
            use_checkpointing: Enable PostgreSQL checkpointing for conversation memory
        """
        # Initialize all three nodes
        self.thinking_node = ThinkingNode(model_name)
        self.planning_node = PlanningNode(model_name)
        self.execution_node = LegalAgentNode(model_name)
        
        self.use_checkpointing = use_checkpointing
        
        # Initialize checkpointer if enabled
        if use_checkpointing:
            try:
                self.checkpointer = create_postgres_checkpointer()
                print("✅ PostgreSQL checkpointing enabled for conversation memory")
            except Exception as e:
                print(f"⚠️  Checkpointing disabled: {e}")
                self.checkpointer = None
                self.use_checkpointing = False
        else:
            self.checkpointer = None
        
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow with conditional routing based on thinking analysis."""
        # Create the graph
        workflow = StateGraph(State)

        # Add nodes for each stage
        workflow.add_node("thinking", self._thinking_stage)
        workflow.add_node("planning", self._planning_stage)
        workflow.add_node("execution", self._execution_stage)

        # Add conditional routing from thinking node
        workflow.add_edge(START, "thinking")
        workflow.add_conditional_edges(
            "thinking",
            self._route_after_thinking,
            {
                "planning": "planning",      # Complex: go to planning
                "execution": "execution",     # Simple/Medium: skip planning
                "end": END                    # Direct response: end immediately
            }
        )
        
        # Planning always goes to execution
        workflow.add_edge("planning", "execution")
        
        # Execution always ends
        workflow.add_edge("execution", END)

        # Compile the graph with checkpointer
        if self.checkpointer:
            return workflow.compile(checkpointer=self.checkpointer)
        else:
            return workflow.compile()

    def _route_after_thinking(self, state: State) -> str:
        """
        Decide which node to route to after thinking stage.
        
        Returns:
            "planning" - for complex tasks needing detailed plans
            "execution" - for simple/medium tasks that can skip planning
        """
        thinking_analysis = state.get("thinking_analysis")
        
        # Handle case where thinking_analysis might be None or not set yet
        if not thinking_analysis or not isinstance(thinking_analysis, dict):
            # Default to execution for safety
            return "execution"
        
        next_step = thinking_analysis.get("next_step", "use_planning")
        
        # Map thinking decisions to graph routes
        if next_step == "use_planning":
            return "planning"
        elif next_step == "skip_planning":
            return "execution"
        elif next_step == "direct_response":
            return "execution"
        else:
            # Default: use full planning
            return "planning"

    def _thinking_stage(self, state: State) -> Dict:
        """Stage 1: Analyze and think about the user's request."""
        result = self.thinking_node.process(state["messages"])
        return result

    def _planning_stage(self, state: State) -> Dict:
        """Stage 2: Create an execution plan based on thinking analysis."""
        thinking_analysis = state.get("thinking_analysis")
        result = self.planning_node.process(state["messages"], thinking_analysis)
        return result

    def _execution_stage(self, state: State) -> Dict:
        """Stage 3: Execute the plan and generate the final response."""
        # Pass both thinking_analysis and execution_plan to execution node
        thinking_analysis = state.get("thinking_analysis")
        execution_plan = state.get("execution_plan")
        
        # For now, process() doesn't use these, but astream() will
        result = self.execution_node.process(state["messages"])
        return result

    def run(self, message: str, thread_id: Optional[str] = None) -> list[dict]:
        """
        Run the agent with a single message and return structured response.
        
        Args:
            message: The user's message
            thread_id: Optional thread ID for conversation continuity
                      If not provided, a new thread is created
        
        Returns:
            List of structured responses (messages and documents)
        """
        # Generate thread_id if not provided
        if not thread_id:
            thread_id = str(uuid.uuid4())
        
        # Prepare config with thread_id for checkpointing
        config = {
            "configurable": {
                "thread_id": thread_id
            }
        }
        
        # Invoke graph with config
        if self.use_checkpointing:
            result = self.graph.invoke(
                {
                    "messages": [("user", message)],
                    "thinking_analysis": None,
                    "execution_plan": None,
                    "structured_response": []
                },
                config=config
            )
        else:
            result = self.graph.invoke(
                {
                    "messages": [("user", message)],
                    "thinking_analysis": None,
                    "execution_plan": None,
                    "structured_response": []
                }
            )
        
        return result["structured_response"]

    def stream(self, message: str, thread_id: Optional[str] = None):
        """
        Stream the agent's response with conversation memory (synchronous).
        
        Args:
            message: The user's message
            thread_id: Optional thread ID for conversation continuity
        """
        # Generate thread_id if not provided
        if not thread_id:
            thread_id = str(uuid.uuid4())
        
        # Prepare config
        config = {
            "configurable": {
                "thread_id": thread_id
            }
        }
        
        # Stream with config
        if self.use_checkpointing:
            for chunk in self.graph.stream(
                {"messages": [("user", message)]},
                config=config
            ):
                yield chunk
        else:
            for chunk in self.graph.stream({"messages": [("user", message)]}):
                yield chunk
    
    async def astream(self, message: str, thread_id: Optional[str] = None):
        """
        Async stream the agent's response with conversation memory.
        Streams token-by-token for real-time response delivery through all three stages.
        
        Args:
            message: The user's message
            thread_id: Optional thread ID for conversation continuity
        
        Yields:
            Individual tokens/words as they're generated from each stage
        """
        # Generate thread_id if not provided
        if not thread_id:
            thread_id = str(uuid.uuid4())
        
        # Prepare config
        config = {
            "configurable": {
                "thread_id": thread_id
            }
        }
        
        # Use astream_events for token-level streaming from all stages
        if self.use_checkpointing:
            async for event in self.graph.astream_events(
                {
                    "messages": [("user", message)],
                    "thinking_analysis": None,
                    "execution_plan": None,
                    "structured_response": []
                },
                config=config,
                version="v2"
            ):
                # Filter for on_chat_model_stream events (token-level streaming)
                if event["event"] == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    if hasattr(chunk, 'content') and chunk.content:
                        yield chunk.content
        else:
            async for event in self.graph.astream_events(
                {
                    "messages": [("user", message)],
                    "thinking_analysis": None,
                    "execution_plan": None,
                    "structured_response": []
                },
                version="v2"
            ):
                # Filter for on_chat_model_stream events (token-level streaming)
                if event["event"] == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    if hasattr(chunk, 'content') and chunk.content:
                        yield chunk.content
    
    async def aget_history(self, thread_id: str, limit: int = 10) -> List[Dict]:
        """
        Get conversation history for a thread.
        
        Args:
            thread_id: The thread ID to get history for
            limit: Maximum number of checkpoints to retrieve
        
        Returns:
            List of checkpoint data
        """
        if not self.use_checkpointing or not self.checkpointer:
            return []
        
        config = {
            "configurable": {
                "thread_id": thread_id
            }
        }
        
        checkpoints = await self.checkpointer.alist(config, limit=limit)
        return [
            {
                "checkpoint_id": cp.config["configurable"]["checkpoint_id"],
                "messages": cp.checkpoint.get("channel_values", {}).get("messages", []),
                "metadata": cp.metadata,
            }
            for cp in checkpoints
        ]


# Example usage
if __name__ == "__main__":
    # Create an agent instance with checkpointing
    agent = Agent(use_checkpointing=True)

    # Simple interaction with persistent memory
    try:
        thread_id = "test-thread-123"
        
        # First message
        response1 = agent.run("Hello! What can you help me with?", thread_id=thread_id)
        print(f"Agent: {response1}")
        
        # Second message (will have context from first)
        response2 = agent.run("Can you draft a simple contract?", thread_id=thread_id)
        print(f"Agent: {response2}")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure PostgreSQL is running and DATABASE_URL is set in .env file")

"""
Base agent classes and infrastructure.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List, AsyncGenerator
from datetime import datetime
import json
import uuid

try:
    from langchain_openai import ChatOpenAI
    from langchain.schema import HumanMessage, SystemMessage
    from langgraph.graph import StateGraph, END
    from langgraph.checkpoint.memory import MemorySaver
    LANGCHAIN_AVAILABLE = True
except ImportError:
    # Mock classes for when LangChain is not available
    class ChatOpenAI:
        def __init__(self, **kwargs):
            self.kwargs = kwargs
            
        async def ainvoke(self, messages):
            # Mock response
            class MockResponse:
                content = '{"requirements": ["Basic legal structure"], "analysis": {"status": "mock"}}'
            return MockResponse()
    
    class HumanMessage:
        def __init__(self, content):
            self.content = content
    
    class SystemMessage:
        def __init__(self, content):
            self.content = content
    
    class StateGraph:
        def __init__(self, state_type):
            self.nodes = {}
            self.edges = []
            self.entry_point = None
            
        def add_node(self, name, func):
            self.nodes[name] = func
            
        def add_edge(self, from_node, to_node):
            self.edges.append((from_node, to_node))
            
        def set_entry_point(self, node):
            self.entry_point = node
            
        def compile(self, **kwargs):
            return MockGraph(self.nodes, self.edges, self.entry_point)
    
    class MockGraph:
        def __init__(self, nodes, edges, entry_point):
            self.nodes = nodes
            self.edges = edges
            self.entry_point = entry_point
            
        async def ainvoke(self, state, config=None):
            # Simple mock execution
            current_state = state.copy()
            for node_name, node_func in self.nodes.items():
                if callable(node_func):
                    current_state = await node_func(current_state)
            return current_state
            
        async def astream(self, state, config=None):
            # Mock streaming
            yield {"node": "processing", "state": state}
    
    class MemorySaver:
        pass
    
    END = "END"
    LANGCHAIN_AVAILABLE = False

from src.services.base import AsyncService
from src.core.exceptions import AgentError, OpenAIError
from src.schemas import AgentType, TaskStatus
from src.utils.agent_helpers import (
    safe_json_parse,
    clean_document_content,
    validate_document_structure,
    create_task_metadata,
    format_legal_prompt
)


class AgentState(Dict[str, Any]):
    """Agent state for LangGraph workflows."""
    pass


class BaseAgent(AsyncService[Dict[str, Any]], ABC):
    """Base class for all AI agents."""
    
    def __init__(self, agent_type: AgentType):
        super().__init__()
        self.agent_type = agent_type
        self.llm = None
        self.graph = None
        self.checkpointer = MemorySaver()
        
    async def initialize(self) -> None:
        """Initialize the agent."""
        await super().initialize()
        
        try:
            if not LANGCHAIN_AVAILABLE:
                self.logger.warning("LangChain not available, using mock implementation")
            
            self.llm = ChatOpenAI(
                model=self.settings.openai_model,
                temperature=self.settings.openai_temperature,
                max_tokens=self.settings.openai_max_tokens,
                api_key=self.settings.openai_api_key
            )
            
            # Build the workflow graph
            self.graph = await self._build_graph()
            
            self.logger.info(f"Initialized {self.agent_type.value} agent")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize agent: {e}")
            raise AgentError(f"Agent initialization failed: {str(e)}")
    
    async def _perform_health_check(self) -> None:
        """Check agent health."""
        if not self.llm:
            raise AgentError("LLM not initialized")
        
        # Test a simple LLM call
        try:
            await self.llm.ainvoke([HumanMessage(content="Test")])
        except Exception as e:
            raise OpenAIError(f"LLM health check failed: {str(e)}")
    
    async def _get_health_details(self) -> Dict[str, Any]:
        """Get agent health details."""
        return {
            "agent_type": self.agent_type.value,
            "model": self.settings.openai_model,
            "graph_initialized": self.graph is not None,
            "llm_initialized": self.llm is not None
        }
    
    @abstractmethod
    async def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow. Must be implemented by subclasses."""
        pass
    
    @abstractmethod
    async def _prepare_input(self, input_data: Dict[str, Any]) -> AgentState:
        """Prepare input data for the agent. Must be implemented by subclasses."""
        pass
    
    @abstractmethod
    async def _extract_output(self, final_state: AgentState) -> Dict[str, Any]:
        """Extract output from the final state. Must be implemented by subclasses."""
        pass
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input data through the agent workflow."""
        self.ensure_healthy()
        
        try:
            # Prepare input
            initial_state = await self._prepare_input(input_data)
            initial_state["task_id"] = str(uuid.uuid4())
            initial_state["started_at"] = datetime.utcnow().isoformat()
            
            # Run the workflow
            thread_config = {"configurable": {"thread_id": initial_state["task_id"]}}
            final_state = await self.graph.ainvoke(initial_state, config=thread_config)
            
            # Extract output
            result = await self._extract_output(final_state)
            result["task_id"] = initial_state["task_id"]
            result["completed_at"] = datetime.utcnow().isoformat()
            
            return result
            
        except Exception as e:
            self.logger.error(f"Agent processing failed: {e}")
            raise AgentError(f"Agent processing failed: {str(e)}")
    
    async def stream_process(self, input_data: Dict[str, Any]) -> AsyncGenerator[Dict[str, Any], None]:
        """Process input data with streaming updates."""
        self.ensure_healthy()
        
        try:
            # Prepare input
            initial_state = await self._prepare_input(input_data)
            initial_state["task_id"] = str(uuid.uuid4())
            initial_state["started_at"] = datetime.utcnow().isoformat()
            
            # Stream the workflow
            thread_config = {"configurable": {"thread_id": initial_state["task_id"]}}
            
            async for chunk in self.graph.astream(initial_state, config=thread_config):
                # Yield progress updates
                yield {
                    "type": "progress",
                    "data": chunk,
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            # Get final state
            final_state = await self.graph.ainvoke(initial_state, config=thread_config)
            result = await self._extract_output(final_state)
            result["task_id"] = initial_state["task_id"]
            result["completed_at"] = datetime.utcnow().isoformat()
            
            yield {
                "type": "complete",
                "data": result,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Agent streaming failed: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
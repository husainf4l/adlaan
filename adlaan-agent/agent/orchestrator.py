"""
Multi-Agent Orchestrator
Coordinates all specialized agents using LangGraph for collaborative work
"""
from typing import Dict, List, Optional
from langgraph.graph import StateGraph, START, END
from agent.multi_agent_system import (
    AgentState,
    ResearchAgent,
    DraftAgent,
    ReviewAgent,
    ValidatorAgent,
    CitationAgent,
    VersioningAgent,
    UserInteractionAgent,
    DocumentGeneratorAgent
)
import asyncio


class MultiAgentOrchestrator:
    """
    Orchestrates multiple specialized agents to collaborate on legal tasks.
    
    Workflow:
    User Request → Research → Draft → Review → Validate → Citations → Generate
    """
    
    def __init__(self, model_name: str = "gpt-4o-mini"):
        """Initialize all specialized agents"""
        
        # Initialize agents
        self.research_agent = ResearchAgent(model_name)
        self.draft_agent = DraftAgent(model_name)
        self.review_agent = ReviewAgent(model_name)
        self.validator_agent = ValidatorAgent(model_name)
        self.citation_agent = CitationAgent(model_name)
        self.versioning_agent = VersioningAgent()
        self.interaction_agent = UserInteractionAgent()
        self.generator_agent = DocumentGeneratorAgent()
        
        # Build the collaboration graph
        self.graph = self._build_collaboration_graph()
        
        print("🤖 Multi-Agent System Initialized")
        print(f"   {self.research_agent.emoji} Research Agent: Ready")
        print(f"   {self.draft_agent.emoji} Draft Agent: Ready")
        print(f"   {self.review_agent.emoji} Review Agent: Ready")
        print(f"   {self.validator_agent.emoji} Validator Agent: Ready")
        print(f"   {self.citation_agent.emoji} Citation Agent: Ready")
        print(f"   {self.versioning_agent.emoji} Versioning Agent: Ready")
        print(f"   {self.interaction_agent.emoji} User Interaction Agent: Ready")
        print(f"   {self.generator_agent.emoji} Document Generator Agent: Ready")
    
    def _build_collaboration_graph(self) -> StateGraph:
        """
        Build LangGraph workflow for agent collaboration.
        
        Graph Structure:
        START → Research → Draft → Review → Validate → Citations → Versioning → Generate → END
        """
        
        workflow = StateGraph(AgentState)
        
        # Add all agent nodes
        workflow.add_node("research", self._research_node)
        workflow.add_node("draft", self._draft_node)
        workflow.add_node("review", self._review_node)
        workflow.add_node("validate", self._validate_node)
        workflow.add_node("citations", self._citations_node)
        workflow.add_node("versioning", self._versioning_node)
        workflow.add_node("generate", self._generate_node)
        
        # Define the sequential workflow
        workflow.add_edge(START, "research")
        workflow.add_edge("research", "draft")
        workflow.add_edge("draft", "review")
        workflow.add_edge("review", "validate")
        workflow.add_edge("validate", "citations")
        workflow.add_edge("citations", "versioning")
        workflow.add_edge("versioning", "generate")
        workflow.add_edge("generate", END)
        
        return workflow.compile()
    
    async def _research_node(self, state: AgentState) -> Dict:
        """Research Agent Node"""
        print(f"\n{self.research_agent.emoji} Research Agent: Gathering legal references...")
        result = await self.research_agent.execute(state)
        return result
    
    async def _draft_node(self, state: AgentState) -> Dict:
        """Draft Agent Node"""
        print(f"{self.draft_agent.emoji} Draft Agent: Creating initial document...")
        result = await self.draft_agent.execute(state)
        return result
    
    async def _review_node(self, state: AgentState) -> Dict:
        """Review Agent Node"""
        print(f"{self.review_agent.emoji} Review Agent: Reviewing and refining...")
        result = await self.review_agent.execute(state)
        return result
    
    async def _validate_node(self, state: AgentState) -> Dict:
        """Validator Agent Node"""
        print(f"{self.validator_agent.emoji} Validator Agent: Checking compliance...")
        result = await self.validator_agent.execute(state)
        return result
    
    async def _citations_node(self, state: AgentState) -> Dict:
        """Citation Agent Node"""
        print(f"{self.citation_agent.emoji} Citation Agent: Adding legal references...")
        result = await self.citation_agent.execute(state)
        return result
    
    async def _versioning_node(self, state: AgentState) -> Dict:
        """Versioning Agent Node"""
        print(f"{self.versioning_agent.emoji} Versioning Agent: Setting version info...")
        result = await self.versioning_agent.execute(state)
        return result
    
    async def _generate_node(self, state: AgentState) -> Dict:
        """Document Generator Agent Node"""
        print(f"{self.generator_agent.emoji} Document Generator Agent: Finalizing document...")
        result = await self.generator_agent.execute(state)
        return result
    
    async def collaborate(self, 
                         user_request: str,
                         task_type: str = "document_creation",
                         jurisdiction: str = "jordan") -> Dict:
        """
        Execute multi-agent collaboration on a legal task.
        
        Args:
            user_request: User's request in natural language
            task_type: Type of legal task
            jurisdiction: Legal jurisdiction
            
        Returns:
            Complete document with metadata, citations, and validation
        """
        
        # Initialize state
        initial_state: AgentState = {
            "user_request": user_request,
            "task_type": task_type,
            "jurisdiction": jurisdiction,
            "references": [],
            "draft_content": "",
            "reviewed_content": "",
            "validation_report": {},
            "citations": [],
            "document_version": "",
            "final_output": {}
        }
        
        print("\n" + "="*60)
        print("🚀 Multi-Agent Collaboration Started")
        print("="*60)
        print(f"📝 Request: {user_request}")
        print(f"📍 Jurisdiction: {jurisdiction}")
        print(f"🎯 Task Type: {task_type}")
        print("="*60)
        
        # Run the collaboration workflow
        final_state = await self.graph.ainvoke(initial_state)
        
        print("\n" + "="*60)
        print("✅ Multi-Agent Collaboration Complete")
        print("="*60)
        
        # Extract results
        result = {
            "success": True,
            "document": final_state.get("final_output", {}),
            "research": final_state.get("references", {}),
            "validation": final_state.get("validation_report", {}),
            "citations": final_state.get("citations", []),
            "version": final_state.get("document_version", "v1.0"),
            "agents_involved": [
                self.research_agent.name,
                self.draft_agent.name,
                self.review_agent.name,
                self.validator_agent.name,
                self.citation_agent.name,
                self.versioning_agent.name,
                self.generator_agent.name
            ]
        }
        
        return result
    
    def get_agent_status(self) -> Dict:
        """Get status of all agents"""
        
        return {
            "orchestrator": "active",
            "agents": {
                "research": {"name": self.research_agent.name, "status": "ready"},
                "draft": {"name": self.draft_agent.name, "status": "ready"},
                "review": {"name": self.review_agent.name, "status": "ready"},
                "validator": {"name": self.validator_agent.name, "status": "ready"},
                "citation": {"name": self.citation_agent.name, "status": "ready"},
                "versioning": {"name": self.versioning_agent.name, "status": "ready"},
                "interaction": {"name": self.interaction_agent.name, "status": "ready"},
                "generator": {"name": self.generator_agent.name, "status": "ready"}
            },
            "workflow": "research → draft → review → validate → citations → versioning → generate",
            "collaboration_type": "sequential with shared state"
        }
    
    async def astream_collaborate(self,
                                  user_request: str,
                                  task_type: str = "document_creation",
                                  jurisdiction: str = "jordan"):
        """
        Stream multi-agent collaboration progress.
        
        Yields progress updates as agents work.
        """
        
        # Initialize state
        initial_state: AgentState = {
            "user_request": user_request,
            "task_type": task_type,
            "jurisdiction": jurisdiction,
            "references": [],
            "draft_content": "",
            "reviewed_content": "",
            "validation_report": {},
            "citations": [],
            "document_version": "",
            "final_output": {}
        }
        
        yield {
            "type": "start",
            "message": "🚀 Multi-Agent Collaboration Started",
            "agents": 8
        }
        
        # Stream through each agent
        agents = [
            (self.research_agent, "research"),
            (self.draft_agent, "draft"),
            (self.review_agent, "review"),
            (self.validator_agent, "validate"),
            (self.citation_agent, "citations"),
            (self.versioning_agent, "versioning"),
            (self.generator_agent, "generate")
        ]
        
        current_state = initial_state
        
        for agent, node_name in agents:
            yield {
                "type": "agent_start",
                "agent": agent.name,
                "emoji": agent.emoji,
                "message": f"{agent.emoji} {agent.name} working..."
            }
            
            # Execute agent node
            if node_name == "research":
                result = await self._research_node(current_state)
            elif node_name == "draft":
                result = await self._draft_node(current_state)
            elif node_name == "review":
                result = await self._review_node(current_state)
            elif node_name == "validate":
                result = await self._validate_node(current_state)
            elif node_name == "citations":
                result = await self._citations_node(current_state)
            elif node_name == "versioning":
                result = await self._versioning_node(current_state)
            elif node_name == "generate":
                result = await self._generate_node(current_state)
            
            # Update state
            current_state.update(result)
            
            yield {
                "type": "agent_complete",
                "agent": agent.name,
                "emoji": agent.emoji,
                "message": f"✅ {agent.name} completed",
                "result": result
            }
        
        yield {
            "type": "complete",
            "message": "✅ Multi-Agent Collaboration Complete",
            "final_state": current_state
        }

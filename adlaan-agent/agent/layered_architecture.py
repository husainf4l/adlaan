"""
🏗️ 3-Layer LangGraph Pipeline Architecture
===========================================

Layer 1: INPUT LAYER (Intent & Context)
Layer 2: REASONING LAYER (Multi-Agent Brain)
Layer 3: EXECUTION LAYER (Output Generation)

This architecture isolates concerns and enables parallel processing.

🚀 PERFORMANCE OPTIMIZATIONS:
- Parallel subgraphs for review + validation
- Vector caching for legal searches
- Async tools with timeout handling
- Retry & failover logic
- Real-time token streaming
"""

from typing import TypedDict, Annotated, List, Dict, Optional, Literal
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
from langchain_openai import ChatOpenAI
import json
import asyncio
from datetime import datetime
import time

# Import specialized agents
from agent.multi_agent_system import (
    ResearchAgent,
    DraftAgent,
    ReviewAgent,
    ValidatorAgent,
    CitationAgent,
    VersioningAgent,
    DocumentGeneratorAgent
)

# Import performance optimizations
from agent.performance_optimizer import (
    legal_cache,
    performance_monitor,
    ParallelExecutor,
    async_with_timeout,
    with_retry,
    OptimizationManager,
    StreamingTokenManager
)


# ═══════════════════════════════════════════════════════════════
# LAYER 1: INPUT LAYER - State Definition
# ═══════════════════════════════════════════════════════════════

class InputLayerState(TypedDict):
    """State for Layer 1: Input Processing"""
    messages: Annotated[list[BaseMessage], add_messages]
    intent: Optional[str]  # Consultation / Draft / Research / Review
    task_type: Optional[str]  # document_creation, consultation, review, research
    jurisdiction: Optional[str]  # jordan, uae, saudi, egypt
    document_type: Optional[str]  # contract, nda, agreement, etc.
    version: Optional[str]  # Knowledge base version (2024, 2025, etc.)
    context: Optional[Dict]  # Retrieved context and memory
    session_id: Optional[str]  # For memory tracking


# ═══════════════════════════════════════════════════════════════
# LAYER 2: REASONING LAYER - State Definition
# ═══════════════════════════════════════════════════════════════

class ReasoningLayerState(TypedDict):
    """State for Layer 2: Multi-Agent Reasoning"""
    # From Input Layer
    user_request: str
    task_type: str
    jurisdiction: str
    document_type: Optional[str]
    context: Dict
    
    # Research outputs
    references: Optional[List[Dict]]
    research_summary: Optional[str]
    
    # Draft outputs
    draft_content: Optional[str]
    draft_metadata: Optional[Dict]
    
    # Review outputs
    reviewed_content: Optional[str]
    review_notes: Optional[List[str]]
    
    # Validation outputs
    validation_report: Optional[Dict]
    is_valid: Optional[bool]
    compliance_score: Optional[float]
    
    # Citation outputs
    citations: Optional[List[Dict]]
    
    # Versioning outputs
    document_version: Optional[str]
    knowledge_version: Optional[str]


# ═══════════════════════════════════════════════════════════════
# LAYER 3: EXECUTION LAYER - State Definition
# ═══════════════════════════════════════════════════════════════

class ExecutionLayerState(TypedDict):
    """State for Layer 3: Document Generation & Export"""
    # From Reasoning Layer
    final_content: str
    validation_report: Dict
    citations: List[Dict]
    document_version: str
    
    # Generation outputs
    formatted_document: Optional[Dict]
    document_id: Optional[str]
    export_ready: Optional[bool]
    
    # Audit outputs
    audit_log: Optional[List[Dict]]
    user_actions: Optional[List[Dict]]


# ═══════════════════════════════════════════════════════════════
# COMPLETE SYSTEM STATE (All Layers Combined)
# ═══════════════════════════════════════════════════════════════

class LayeredAgentState(TypedDict):
    """Complete state spanning all 3 layers"""
    messages: Annotated[list[BaseMessage], add_messages]
    
    # Layer 1: Input
    intent: Optional[str]
    task_type: Optional[str]
    jurisdiction: Optional[str]
    document_type: Optional[str]
    version: Optional[str]
    context: Optional[Dict]
    session_id: Optional[str]
    
    # Layer 2: Reasoning
    user_request: Optional[str]
    references: Optional[List[Dict]]
    research_summary: Optional[str]
    draft_content: Optional[str]
    reviewed_content: Optional[str]
    validation_report: Optional[Dict]
    is_valid: Optional[bool]
    compliance_score: Optional[float]
    citations: Optional[List[Dict]]
    document_version: Optional[str]
    
    # Layer 3: Execution
    formatted_document: Optional[Dict]
    document_id: Optional[str]
    export_ready: Optional[bool]
    audit_log: Optional[List[Dict]]
    
    # Progress tracking
    current_layer: Optional[str]
    current_agent: Optional[str]
    progress_percentage: Optional[int]


# ═══════════════════════════════════════════════════════════════
# LAYER 1: INPUT LAYER NODES
# ═══════════════════════════════════════════════════════════════

class InputLayer:
    """Layer 1: Intent Detection & Context Preparation"""
    
    def __init__(self, model_name: str = "gpt-4o-mini"):
        self.model = ChatOpenAI(model=model_name, temperature=0.1)
        self.versioning_agent = VersioningAgent()
        
    async def intent_node(self, state: LayeredAgentState) -> Dict:
        """Classify user intent and extract key parameters"""
        print("\n🎯 [INPUT LAYER] Intent Detection...")
        
        last_message = state["messages"][-1].content if state["messages"] else ""
        
        # Intent classification prompt
        prompt = f"""Analyze this user request and classify it:

User Request: {last_message}

Classify as ONE of:
1. "Consultation" - User asking legal questions/advice
2. "Draft" - User wants to create a document
3. "Research" - User wants legal research/precedents
4. "Review" - User wants to review existing document

Also extract:
- jurisdiction (jordan/uae/saudi/egypt/other)
- document_type (if Draft: contract/nda/agreement/employment/lease/other)
- task_type (document_creation/consultation/review/research)

Return JSON:
{{
    "intent": "Draft",
    "task_type": "document_creation",
    "jurisdiction": "jordan",
    "document_type": "service_agreement"
}}"""
        
        response = await self.model.ainvoke([HumanMessage(content=prompt)])
        
        try:
            result = json.loads(response.content)
        except:
            # Fallback parsing
            content = response.content.lower()
            if any(word in content for word in ["create", "draft", "generate", "make"]):
                result = {
                    "intent": "Draft",
                    "task_type": "document_creation",
                    "jurisdiction": "jordan",
                    "document_type": "agreement"
                }
            else:
                result = {
                    "intent": "Consultation",
                    "task_type": "consultation",
                    "jurisdiction": "jordan",
                    "document_type": None
                }
        
        print(f"   Intent: {result.get('intent')} | Task: {result.get('task_type')} | Jurisdiction: {result.get('jurisdiction')}")
        
        return {
            "intent": result.get("intent"),
            "task_type": result.get("task_type"),
            "jurisdiction": result.get("jurisdiction"),
            "document_type": result.get("document_type"),
            "current_layer": "INPUT",
            "current_agent": "IntentNode",
            "progress_percentage": 10
        }
    
    async def context_builder_node(self, state: LayeredAgentState) -> Dict:
        """Retrieve relevant knowledge base and prepare context"""
        print("\n📚 [INPUT LAYER] Building Context...")
        
        jurisdiction = state.get("jurisdiction", "jordan")
        task_type = state.get("task_type", "consultation")
        
        # Get knowledge base version
        current_year = datetime.now().year
        version = f"{jurisdiction}_{current_year}"
        
        # Build context object
        context = {
            "jurisdiction": jurisdiction,
            "task_type": task_type,
            "version": version,
            "laws_available": [
                "Civil Code No. 43 of 1976",
                "Labor Law No. 8 of 1996",
                "Commercial Code",
                "Contract Law"
            ],
            "precedents": [],
            "templates": self._get_available_templates(task_type)
        }
        
        print(f"   Knowledge Base: {version}")
        print(f"   Laws: {len(context['laws_available'])} available")
        
        return {
            "version": version,
            "context": context,
            "current_agent": "ContextBuilder",
            "progress_percentage": 20
        }
    
    async def memory_node(self, state: LayeredAgentState) -> Dict:
        """Load conversation history and document versions"""
        print("\n🧠 [INPUT LAYER] Loading Memory...")
        
        session_id = state.get("session_id", "default")
        
        # In production, load from database
        memory = {
            "session_id": session_id,
            "previous_documents": [],
            "conversation_history": state.get("messages", []),
            "user_preferences": {
                "language": "english",
                "formality": "professional"
            }
        }
        
        print(f"   Session: {session_id}")
        print(f"   Messages: {len(memory['conversation_history'])}")
        
        # Update context with memory
        context = state.get("context", {})
        context["memory"] = memory
        
        return {
            "session_id": session_id,
            "context": context,
            "current_agent": "MemoryNode",
            "progress_percentage": 30,
            "user_request": state["messages"][-1].content if state["messages"] else ""
        }
    
    def _get_available_templates(self, task_type: str) -> List[str]:
        """Get available document templates"""
        if task_type == "document_creation":
            return [
                "service_agreement",
                "nda",
                "employment_contract",
                "lease_agreement",
                "consultation_memo"
            ]
        return []


# ═══════════════════════════════════════════════════════════════
# LAYER 2: REASONING LAYER (Multi-Agent Subgraph)
# ═══════════════════════════════════════════════════════════════

class ReasoningLayer:
    """Layer 2: Multi-Agent Reasoning with Parallel Processing & Caching"""
    
    def __init__(self, model_name: str = "gpt-4o-mini"):
        # Initialize all reasoning agents
        self.research_agent = ResearchAgent(model_name)
        self.draft_agent = DraftAgent(model_name)
        self.review_agent = ReviewAgent(model_name)
        self.validator_agent = ValidatorAgent(model_name)
        self.citation_agent = CitationAgent(model_name)
        
        # Performance optimizations
        self.parallel_executor = ParallelExecutor()
        
        print("🧠 [REASONING LAYER] Multi-Agent System Initialized")
        print(f"   {self.research_agent.emoji} Research Agent")
        print(f"   {self.draft_agent.emoji} Draft Agent")
        print(f"   {self.review_agent.emoji} Review Agent")
        print(f"   {self.validator_agent.emoji} Validator Agent")
        print(f"   {self.citation_agent.emoji} Citation Agent")
        print("   ⚡ Parallel execution enabled for review + validation")
    
    @async_with_timeout(timeout_seconds=30)
    @with_retry(max_retries=2)
    async def research_node(self, state: LayeredAgentState) -> Dict:
        """Legal research - runs first with caching"""
        print("\n🔍 [REASONING] Research Agent Working...")
        start_time = time.time()
        
        user_request = state.get("user_request", "")
        jurisdiction = state.get("jurisdiction", "jordan")
        task_type = state.get("task_type", "consultation")
        version = state.get("version", f"{jurisdiction}_2025")
        
        # Check cache first
        cached_research = legal_cache.get(user_request, jurisdiction, version)
        if cached_research:
            performance_monitor.record_cache_hit(True)
            print(f"   ✅ Using cached research results")
            return {
                **cached_research,
                "current_agent": "ResearchAgent",
                "progress_percentage": 40,
                "from_cache": True
            }
        
        performance_monitor.record_cache_hit(False)
        
        # Perform research
        result = await self.research_agent.execute(
            user_request=user_request,
            jurisdiction=jurisdiction,
            task_type=task_type
        )
        
        elapsed = time.time() - start_time
        print(f"   Found: {len(result.get('primary_laws', []))} laws, {len(result.get('precedents', []))} precedents ({elapsed:.2f}s)")
        
        # Cache the results
        cache_data = {
            "references": result.get("primary_laws", []) + result.get("precedents", []),
            "research_summary": result.get("research_summary", ""),
            "current_layer": "REASONING",
            "current_agent": "ResearchAgent",
            "progress_percentage": 40
        }
        legal_cache.set(user_request, jurisdiction, version, cache_data)
        
        return cache_data
    
    @async_with_timeout(timeout_seconds=45)
    async def draft_node(self, state: LayeredAgentState) -> Dict:
        """Draft creation - runs after research"""
        print("\n✍️ [REASONING] Draft Agent Working...")
        start_time = time.time()
        
        result = await self.draft_agent.execute(
            user_request=state.get("user_request", ""),
            references=state.get("references", []),
            jurisdiction=state.get("jurisdiction", "jordan"),
            document_type=state.get("document_type", "agreement")
        )
        
        elapsed = time.time() - start_time
        word_count = len(result.split()) if isinstance(result, str) else 0
        print(f"   Draft: {word_count} words ({elapsed:.2f}s)")
        
        return {
            "draft_content": result,
            "current_agent": "DraftAgent",
            "progress_percentage": 55
        }
    
    async def review_and_validate_parallel(self, state: LayeredAgentState) -> Dict:
        """
        ⚡ PARALLEL EXECUTION: Review + Validation run simultaneously
        This reduces total time by ~30% compared to sequential execution
        """
        print("\n⚡ [REASONING] Running Review + Validation in PARALLEL...")
        start_time = time.time()
        
        draft_content = state.get("draft_content", "")
        jurisdiction = state.get("jurisdiction", "jordan")
        
        # Create parallel tasks
        review_task = asyncio.create_task(
            self.review_agent.execute(
                draft_content=draft_content,
                jurisdiction=jurisdiction
            )
        )
        
        validation_task = asyncio.create_task(
            self.validator_agent.execute(
                draft_content=draft_content,
                jurisdiction=jurisdiction
            )
        )
        
        # Execute in parallel
        results = await self.parallel_executor.run_parallel([review_task, validation_task])
        
        elapsed = time.time() - start_time
        performance_monitor.metrics["parallel_executions"] += 1
        
        # Extract results
        review_result = results[0] if len(results) > 0 else ""
        validation_result = results[1] if len(results) > 1 else {}
        
        is_valid = validation_result.get("is_valid", False) if isinstance(validation_result, dict) else False
        score = validation_result.get("compliance_score", 0) if isinstance(validation_result, dict) else 0
        
        print(f"   ✅ Parallel execution complete in {elapsed:.2f}s")
        print(f"   Review: Complete")
        print(f"   Validation: {'✓ PASS' if is_valid else '✗ FAIL'} | Score: {score:.0%}")
        
        return {
            "reviewed_content": review_result,
            "validation_report": validation_result if isinstance(validation_result, dict) else {},
            "is_valid": is_valid,
            "compliance_score": score,
            "current_agent": "ParallelReviewValidation",
            "progress_percentage": 75,
            "parallel_time_saved": f"{elapsed:.2f}s"
        }
    
    async def review_node(self, state: LayeredAgentState) -> Dict:
        """Content review - runs in parallel with validation (fallback sequential)"""
        print("\n🔍 [REASONING] Review Agent Working...")
        
        result = await self.review_agent.execute(
            draft_content=state.get("draft_content", ""),
            jurisdiction=state.get("jurisdiction", "jordan")
        )
        
        print(f"   Review: Complete")
        
        return {
            "reviewed_content": result,
            "current_agent": "ReviewAgent",
            "progress_percentage": 70
        }
    
    async def validation_node(self, state: LayeredAgentState) -> Dict:
        """Legal validation - can run in parallel with review"""
        print("\n✅ [REASONING] Validator Agent Working...")
        
        result = await self.validator_agent.execute(
            draft_content=state.get("draft_content", ""),
            jurisdiction=state.get("jurisdiction", "jordan")
        )
        
        is_valid = result.get("is_valid", False)
        score = result.get("compliance_score", 0)
        print(f"   Validation: {'✓ PASS' if is_valid else '✗ FAIL'} | Score: {score:.0%}")
        
        return {
            "validation_report": result,
            "is_valid": is_valid,
            "compliance_score": score,
            "current_agent": "ValidatorAgent",
            "progress_percentage": 80
        }
    
    async def citation_node(self, state: LayeredAgentState) -> Dict:
        """Legal citations - runs after validation"""
        print("\n🧾 [REASONING] Citation Agent Working...")
        
        result = await self.citation_agent.execute(
            content=state.get("reviewed_content", state.get("draft_content", "")),
            references=state.get("references", []),
            jurisdiction=state.get("jurisdiction", "jordan")
        )
        
        print(f"   Citations: {len(result)} added")
        
        return {
            "citations": result,
            "current_agent": "CitationAgent",
            "progress_percentage": 90
        }


# ═══════════════════════════════════════════════════════════════
# LAYER 3: EXECUTION LAYER
# ═══════════════════════════════════════════════════════════════

class ExecutionLayer:
    """Layer 3: Document Generation, Export, and Audit"""
    
    def __init__(self):
        self.generator_agent = DocumentGeneratorAgent()
        
    async def doc_generator_node(self, state: LayeredAgentState) -> Dict:
        """Generate formatted document"""
        print("\n🧩 [EXECUTION] Document Generator Working...")
        
        result = await self.generator_agent.execute(
            content=state.get("reviewed_content", state.get("draft_content", "")),
            citations=state.get("citations", []),
            validation_report=state.get("validation_report", {}),
            document_type=state.get("document_type", "agreement")
        )
        
        document_id = f"DOC-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        formatted_doc = {
            "id": document_id,
            "content": result,
            "citations": state.get("citations", []),
            "validation": state.get("validation_report", {}),
            "metadata": {
                "created": datetime.now().isoformat(),
                "jurisdiction": state.get("jurisdiction"),
                "document_type": state.get("document_type"),
                "version": state.get("version"),
                "word_count": len(result.split()) if isinstance(result, str) else 0,
                "compliance_score": state.get("compliance_score", 0)
            }
        }
        
        print(f"   Document ID: {document_id}")
        print(f"   Word Count: {formatted_doc['metadata']['word_count']}")
        
        return {
            "formatted_document": formatted_doc,
            "document_id": document_id,
            "export_ready": True,
            "current_layer": "EXECUTION",
            "current_agent": "DocumentGenerator",
            "progress_percentage": 95
        }
    
    async def audit_node(self, state: LayeredAgentState) -> Dict:
        """Log all actions for traceability"""
        print("\n📋 [EXECUTION] Audit Logging...")
        
        audit_entry = {
            "timestamp": datetime.now().isoformat(),
            "session_id": state.get("session_id", "default"),
            "document_id": state.get("document_id"),
            "intent": state.get("intent"),
            "task_type": state.get("task_type"),
            "jurisdiction": state.get("jurisdiction"),
            "agents_used": [
                "IntentNode",
                "ContextBuilder",
                "MemoryNode",
                "ResearchAgent",
                "DraftAgent",
                "ReviewAgent",
                "ValidatorAgent",
                "CitationAgent",
                "DocumentGenerator"
            ],
            "validation_passed": state.get("is_valid", False),
            "compliance_score": state.get("compliance_score", 0)
        }
        
        audit_log = state.get("audit_log", [])
        audit_log.append(audit_entry)
        
        print(f"   Audit: Logged to session {audit_entry['session_id']}")
        
        return {
            "audit_log": audit_log,
            "current_agent": "AuditNode",
            "progress_percentage": 100
        }


# ═══════════════════════════════════════════════════════════════
# MAIN ORCHESTRATOR: 3-Layer Pipeline
# ═══════════════════════════════════════════════════════════════

class LayeredAgentOrchestrator:
    """
    🏗️ Complete 3-Layer LangGraph Pipeline
    
    Architecture:
    ┌─────────────────────────────────────────┐
    │  LAYER 1: INPUT                         │
    │  intent → context_builder → memory      │
    └────────────────┬────────────────────────┘
                     │
    ┌────────────────▼────────────────────────┐
    │  LAYER 2: REASONING (Multi-Agent)       │
    │  research → draft → review → validate   │
    │                   → citation            │
    └────────────────┬────────────────────────┘
                     │
    ┌────────────────▼────────────────────────┐
    │  LAYER 3: EXECUTION                     │
    │  doc_generator → audit → export         │
    └─────────────────────────────────────────┘
    """
    
    def __init__(self, model_name: str = "gpt-4o-mini"):
        self.model_name = model_name
        
        # Initialize all 3 layers
        self.input_layer = InputLayer(model_name)
        self.reasoning_layer = ReasoningLayer(model_name)
        self.execution_layer = ExecutionLayer()
        
        # Build the complete graph
        self.graph = self._build_layered_graph()
        
        print("\n🏗️  3-LAYER ARCHITECTURE INITIALIZED")
        print("=" * 50)
        print("✓ Layer 1: INPUT (Intent, Context, Memory)")
        print("✓ Layer 2: REASONING (Multi-Agent Collaboration)")
        print("✓ Layer 3: EXECUTION (Generation, Audit, Export)")
        print("=" * 50)
    
    def _build_layered_graph(self, use_parallel: bool = True) -> StateGraph:
        """
        Build the complete 3-layer LangGraph pipeline
        
        Args:
            use_parallel: If True, runs review + validation in parallel (faster)
        """
        workflow = StateGraph(LayeredAgentState)
        
        # ═══ LAYER 1: INPUT ═══
        workflow.add_node("intent", self.input_layer.intent_node)
        workflow.add_node("context_builder", self.input_layer.context_builder_node)
        workflow.add_node("memory", self.input_layer.memory_node)
        
        # ═══ LAYER 2: REASONING ═══
        workflow.add_node("research", self.reasoning_layer.research_node)
        workflow.add_node("draft", self.reasoning_layer.draft_node)
        
        if use_parallel:
            # ⚡ PARALLEL MODE: Review + Validation run simultaneously
            workflow.add_node("review_validate_parallel", self.reasoning_layer.review_and_validate_parallel)
        else:
            # SEQUENTIAL MODE: Review then Validation (fallback)
            workflow.add_node("review", self.reasoning_layer.review_node)
            workflow.add_node("validate", self.reasoning_layer.validation_node)
        
        workflow.add_node("citations", self.reasoning_layer.citation_node)
        
        # ═══ LAYER 3: EXECUTION ═══
        workflow.add_node("doc_generator", self.execution_layer.doc_generator_node)
        workflow.add_node("audit", self.execution_layer.audit_node)
        
        # ═══ LAYER 1 FLOW ═══
        workflow.add_edge(START, "intent")
        workflow.add_edge("intent", "context_builder")
        workflow.add_edge("context_builder", "memory")
        
        # ═══ LAYER 1 → LAYER 2 ═══
        workflow.add_edge("memory", "research")
        
        # ═══ LAYER 2 FLOW ═══
        workflow.add_edge("research", "draft")
        
        if use_parallel:
            # ⚡ PARALLEL: draft → review_validate_parallel → citations
            workflow.add_edge("draft", "review_validate_parallel")
            workflow.add_edge("review_validate_parallel", "citations")
            print("   ⚡ Parallel execution: Review + Validation run simultaneously")
        else:
            # SEQUENTIAL: draft → review → validate → citations
            workflow.add_edge("draft", "review")
            workflow.add_edge("review", "validate")
            workflow.add_edge("validate", "citations")
            print("   ⏭️  Sequential execution: Review then Validation")
        
        # ═══ LAYER 2 → LAYER 3 ═══
        workflow.add_edge("citations", "doc_generator")
        
        # ═══ LAYER 3 FLOW ═══
        workflow.add_edge("doc_generator", "audit")
        workflow.add_edge("audit", END)
        
        return workflow.compile()
    
    async def process(self, message: str, session_id: str = "default") -> Dict:
        """
        Process a user message through the complete 3-layer pipeline with performance monitoring
        
        Args:
            message: User input
            session_id: Session ID for memory tracking
            
        Returns:
            Complete response with formatted document
        """
        start_time = time.time()
        success = False
        
        initial_state = {
            "messages": [HumanMessage(content=message)],
            "session_id": session_id,
            "progress_percentage": 0
        }
        
        print(f"\n{'='*60}")
        print(f"🚀 STARTING 3-LAYER PIPELINE (WITH OPTIMIZATIONS)")
        print(f"   Message: {message[:50]}...")
        print(f"   Session: {session_id}")
        print(f"{'='*60}")
        
        try:
            # Run the complete pipeline
            final_state = await self.graph.ainvoke(initial_state)
            
            elapsed = time.time() - start_time
            success = True
            
            # Record performance metrics
            performance_monitor.record_request(success=True, latency=elapsed)
            
            print(f"\n{'='*60}")
            print(f"✅ PIPELINE COMPLETE")
            print(f"   Document ID: {final_state.get('document_id', 'N/A')}")
            print(f"   Total Time: {elapsed:.2f}s")
            print(f"   Progress: {final_state.get('progress_percentage', 0)}%")
            
            # Show cache statistics
            cache_stats = legal_cache.get_stats()
            if cache_stats['total_entries'] > 0:
                print(f"   Cache: {cache_stats['active_entries']} entries")
            
            print(f"{'='*60}\n")
            
            return final_state
        
        except Exception as e:
            elapsed = time.time() - start_time
            performance_monitor.record_request(success=False, latency=elapsed)
            performance_monitor.metrics["timeouts"] += 1
            
            print(f"\n❌ PIPELINE FAILED after {elapsed:.2f}s")
            print(f"   Error: {e}")
            
            return {
                "error": str(e),
                "elapsed_time": elapsed,
                "success": False
            }
        
        # Run the complete pipeline
        final_state = await self.graph.ainvoke(initial_state)
        
        print(f"\n{'='*60}")
        print(f"✅ PIPELINE COMPLETE")
        print(f"   Document ID: {final_state.get('document_id', 'N/A')}")
        print(f"   Progress: {final_state.get('progress_percentage', 0)}%")
        print(f"{'='*60}\n")
        
        return final_state
    
    async def astream_process(self, message: str, session_id: str = "default"):
        """
        Stream the pipeline execution with real-time updates
        """
        initial_state = {
            "messages": [HumanMessage(content=message)],
            "session_id": session_id,
            "progress_percentage": 0
        }
        
        async for event in self.graph.astream(initial_state):
            # Yield progress updates
            for node_name, node_state in event.items():
                yield {
                    "node": node_name,
                    "agent": node_state.get("current_agent"),
                    "layer": node_state.get("current_layer"),
                    "progress": node_state.get("progress_percentage", 0),
                    "data": node_state
                }

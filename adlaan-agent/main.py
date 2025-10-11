from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import os
import sys
import uuid
from datetime import datetime

# Add current directory to path for agent imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(
    title="Adlaan Legal Agent",
    description="AI-powered legal document creation and consultation system",
    version="1.0-alpha"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Initialize agent with enhanced intelligence
try:
    from agent.agent import Agent
    
    # Try enhanced intelligence first, fallback to development mode
    try:
        from intelligence.enhanced_intelligence import create_enhanced_agent
        
        # Check if we have a valid OpenAI API key
        openai_key = os.getenv("OPENAI_API_KEY", "")
        if openai_key and openai_key.startswith("sk-") and len(openai_key) > 20:
            # Real API key available - use full intelligence
            enhanced_intelligence = create_enhanced_agent(
                knowledge_db_path="legal_knowledge.db",
                lexis_api_key=os.getenv("LEXIS_API_KEY"),
                justia_api_key=os.getenv("JUSTIA_API_KEY")
            )
            intelligence_mode = "production"
            print("✅ Enhanced Intelligence Layer (Production Mode)")
        else:
            raise ValueError("No valid OpenAI API key - switching to development mode")
    
    except Exception as intelligence_error:
        # Fallback to development mode
        from intelligence.development_intelligence import create_development_agent
        enhanced_intelligence = create_development_agent()
        intelligence_mode = "development"
        print("✅ Enhanced Intelligence Layer (Development Mode)")
        print(f"   ⚠️  Production features disabled: {str(intelligence_error)[:100]}...")
    
    # Initialize agent (disable checkpointing for now)
    agent = Agent(use_checkpointing=False)
    agent_loaded = True
    intelligence_enabled = True
    print("✅ Agent loaded with Enhanced Intelligence Layer")
    print(f"   🧠 Intelligence Status: {enhanced_intelligence.get_system_status()['intelligence_layer']}")
    print(f"   🔧 Mode: {intelligence_mode}")
    
except Exception as e:
    print(f"❌ Failed to load agent: {e}")
    agent = None
    agent_loaded = False
    intelligence_enabled = False
    enhanced_intelligence = None
    intelligence_mode = "disabled"

# Initialize 3-Layer Layered Architecture
layered_orchestrator = None
layered_enabled = False
try:
    from agent.layered_architecture import LayeredAgentOrchestrator
    layered_orchestrator = LayeredAgentOrchestrator(model_name="gpt-4o-mini")
    layered_enabled = True
    print("\n🏗️  3-LAYER ARCHITECTURE LOADED")
    print("=" * 50)
    print("✓ Layer 1: INPUT (Intent, Context, Memory)")
    print("✓ Layer 2: REASONING (Multi-Agent Collaboration)")
    print("✓ Layer 3: EXECUTION (Generation, Audit, Export)")
    print("=" * 50)
except Exception as e:
    print(f"⚠️  3-Layer Architecture not loaded: {e}")
    layered_enabled = False

# Background task functions for non-blocking database operations
async def save_user_message(thread_id: str, message: str):
    """Save user message to database in background (non-blocking)."""
    try:
        from core.database import get_async_session_maker
        from models.database import Conversation, Message
        from sqlalchemy import select
        
        session_maker = get_async_session_maker()
        async with session_maker() as db:
            # Get or create conversation
            stmt = select(Conversation).where(Conversation.thread_id == thread_id)
            result = await db.execute(stmt)
            conversation = result.scalar_one_or_none()
            
            if not conversation:
                conversation = Conversation(
                    thread_id=thread_id,
                    title=message[:100] if len(message) > 100 else message,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(conversation)
                await db.flush()
            
            # Save user message
            user_msg = Message(
                conversation_id=conversation.id,
                role="user",
                content=message,
                message_type="message",
                created_at=datetime.utcnow()
            )
            db.add(user_msg)
            conversation.last_message_at = datetime.utcnow()
            
            await db.commit()
            print(f"✅ Saved user message to database (thread: {thread_id})")
    except Exception as e:
        print(f"⚠️ Failed to save user message: {e}")


async def save_assistant_messages(thread_id: str, response_items: list):
    """Save assistant messages to database in background (non-blocking)."""
    try:
        from core.database import get_async_session_maker
        from models.database import Conversation, Message
        from sqlalchemy import select
        
        session_maker = get_async_session_maker()
        async with session_maker() as db:
            # Get conversation
            stmt = select(Conversation).where(Conversation.thread_id == thread_id)
            result = await db.execute(stmt)
            conversation = result.scalar_one_or_none()
            
            if conversation and response_items:
                # Save all assistant messages
                for item in response_items:
                    assistant_msg = Message(
                        conversation_id=conversation.id,
                        role="assistant",
                        content=item.get("content", ""),
                        message_type=item.get("type", "message"),
                        created_at=datetime.utcnow()
                    )
                    db.add(assistant_msg)
                
                conversation.last_message_at = datetime.utcnow()
                await db.commit()
                print(f"✅ Saved {len(response_items)} assistant messages (thread: {thread_id})")
    except Exception as e:
        print(f"⚠️ Failed to save assistant messages: {e}")


@app.get("/")
async def root():
    return {
        "message": "Adlaan Legal AI - Enhanced Intelligence Layer Active! 🧠",
        "agent_loaded": agent_loaded,
        "intelligence_enabled": intelligence_enabled,
        "layered_architecture_enabled": layered_enabled,
        "checkpointing_enabled": agent.use_checkpointing if agent else False,
        "intelligence_status": enhanced_intelligence.get_system_status() if intelligence_enabled else None,
        "endpoints": {
            "workspace": "/workspace (dual-panel professional interface)",
            "layered_chat": "/api/layered-chat (NEW: 3-layer pipeline with progress streaming)",
            "chat_get": "/chat?message=...&thread_id=...",
            "chat_post": "/api/chat (standard)",
            "enhanced_chat": "/api/enhanced-chat (with full intelligence layer)",
            "intelligence_status": "/api/intelligence/status",
            "intelligence_configure": "/api/intelligence/configure",
            "debug": "/debug"
        },
        "architecture": {
            "layered_pipeline": layered_enabled,
            "layers": {
                "layer_1": "INPUT (Intent, Context, Memory)",
                "layer_2": "REASONING (Multi-Agent Collaboration)",
                "layer_3": "EXECUTION (Generation, Audit, Export)"
            }
        },
        "features": {
            "multi_agent_collaboration": intelligence_enabled,
            "knowledge_versioning": intelligence_enabled,
            "auto_citation": intelligence_enabled,
            "legal_validation": intelligence_enabled,
            "jurisdiction_specific_laws": intelligence_enabled,
            "layered_architecture": layered_enabled
        }
    }


# Professional Workspace - Dual Panel Interface
@app.get("/workspace", response_class=HTMLResponse)
async def workspace(request: Request):
    """Professional dual-panel workspace with document generator."""
    return templates.TemplateResponse("dual_panel_workspace.html", {"request": request})


# Chat interface endpoint
@app.get("/chat")
async def chat_interface(request: Request, message: str = None, thread_id: str = None):
    """Chat interface - returns HTML when no message, streams when message provided."""
    
    # If no message provided, return HTML chat interface
    if message is None:
        return templates.TemplateResponse("chat_interface.html", {"request": request})
    
    # If message provided, handle streaming
    if not agent_loaded:
        async def error_stream():
            yield 'data: {"type": "error", "content": "Agent not loaded"}\n\n'
        return StreamingResponse(
            error_stream(),
            media_type="text/event-stream"
        )

    # Generate thread_id if not provided
    if not thread_id:
        thread_id = str(uuid.uuid4())

    async def generate():
        try:
            # Start streaming
            yield f'data: {{"type": "start", "thread_id": "{thread_id}"}}\n\n'
            await asyncio.sleep(0)

            # Save user message to database in background (non-blocking)
            asyncio.create_task(save_user_message(thread_id, message))

            # Stream intelligence status if enabled
            if intelligence_enabled and enhanced_intelligence:
                intelligence_status = {
                    "type": "intelligence_status",
                    "content": "🧠 Enhanced Intelligence Layer Active",
                    "status": enhanced_intelligence.get_system_status()
                }
                yield f"data: {json.dumps(intelligence_status)}\n\n"
                await asyncio.sleep(0.1)

            # Stream response from agent using astream (token-level streaming)
            accumulated_response = ""
            async for token in agent.astream(message, thread_id=thread_id):
                # Each chunk is now a string token
                accumulated_response += token
                
                # Stream token as message chunk
                chunk_data = {
                    "type": "token",
                    "content": token
                }
                yield f"data: {json.dumps(chunk_data)}\n\n"
                await asyncio.sleep(0)  # Allow other tasks to run

            # Parse the accumulated response for database storage
            try:
                response_items = json.loads(accumulated_response)
            except:
                # Fallback if response is not JSON
                response_items = [{"type": "message", "content": accumulated_response}]

            # Save assistant messages to database in background (non-blocking)
            asyncio.create_task(save_assistant_messages(thread_id, response_items))

            # End streaming
            yield 'data: {"type": "end"}\n\n'

        except Exception as e:
            import traceback
            error_msg = str(e) if str(e) else type(e).__name__
            error_details = traceback.format_exc()
            print(f"❌ Error in chat endpoint: {error_msg}")
            print(f"Traceback: {error_details}")
            error_msg_escaped = error_msg.replace('"', '\\"')
            yield f'data: {{"type": "error", "content": "{error_msg_escaped}"}}\n\n'

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable buffering in nginx
        }
    )

# Recommended POST endpoint
@app.post("/api/chat")
async def chat_post(request: Request):
    """POST endpoint for chat with better structure."""
    if not agent_loaded:
        return {"error": "Agent not loaded"}
    
    try:
        data = await request.json()
        message = data.get("message", "")
        thread_id = data.get("thread_id") or str(uuid.uuid4())
        
        if not message:
            return {"error": "Message is required"}
        
        async def generate():
            try:
                yield f'data: {{"type": "start", "thread_id": "{thread_id}"}}\n\n'
                await asyncio.sleep(0)
                
                # Save user message in background
                asyncio.create_task(save_user_message(thread_id, message))
                
                # Stream intelligence status if enabled
                if intelligence_enabled and enhanced_intelligence:
                    intelligence_status = {
                        "type": "intelligence_status",
                        "content": "🧠 Enhanced Intelligence Layer Processing",
                        "status": enhanced_intelligence.get_system_status()
                    }
                    yield f"data: {json.dumps(intelligence_status)}\n\n"
                    await asyncio.sleep(0.1)
                
                # Stream response token-by-token
                accumulated_response = ""
                async for token in agent.astream(message, thread_id=thread_id):
                    accumulated_response += token
                    
                    # Stream each token
                    chunk_data = {
                        "type": "token",
                        "content": token
                    }
                    yield f"data: {json.dumps(chunk_data)}\n\n"
                    await asyncio.sleep(0)
                
                # Parse accumulated response for database
                try:
                    response_items = json.loads(accumulated_response)
                except:
                    response_items = [{"type": "message", "content": accumulated_response}]
                
                # Save assistant messages in background
                asyncio.create_task(save_assistant_messages(thread_id, response_items))
                
                yield 'data: {"type": "end"}\n\n'
                
            except Exception as e:
                import traceback
                error_msg = str(e) if str(e) else type(e).__name__
                error_details = traceback.format_exc()
                print(f"❌ Error in POST chat endpoint: {error_msg}")
                print(f"Traceback: {error_details}")
                error_msg_escaped = error_msg.replace('"', '\\"')
                yield f'data: {{"type": "error", "content": "{error_msg_escaped}"}}\n\n'
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    
    except Exception as e:
        return {"error": str(e)}


# Enhanced Intelligence API endpoints
@app.post("/api/enhanced-chat")
async def enhanced_chat(request: Request):
    """Enhanced chat endpoint using full intelligence layer with multi-agent processing."""
    if not agent_loaded or not intelligence_enabled:
        return {"error": "Enhanced intelligence system not available"}
    
    try:
        data = await request.json()
        message = data.get("message", "")
        thread_id = data.get("thread_id") or str(uuid.uuid4())
        jurisdiction = data.get("jurisdiction", "general")
        legal_domain = data.get("legal_domain", "general")
        task_type = data.get("task_type", "consultation")
        enable_citations = data.get("enable_citations", True)
        
        if not message:
            return {"error": "Message is required"}
        
        async def generate():
            try:
                yield f'data: {{"type": "start", "thread_id": "{thread_id}", "enhanced": true}}\n\n'
                await asyncio.sleep(0)
                
                # Show intelligence initialization
                init_status = {
                    "type": "intelligence_init",
                    "content": "🧠 Initializing Enhanced Legal Intelligence",
                    "details": {
                        "jurisdiction": jurisdiction,
                        "legal_domain": legal_domain,
                        "task_type": task_type,
                        "citations_enabled": enable_citations
                    }
                }
                yield f"data: {json.dumps(init_status)}\n\n"
                await asyncio.sleep(0.5)
                
                # Save user message in background
                asyncio.create_task(save_user_message(thread_id, message))
                
                # Process through enhanced intelligence
                from langchain_core.messages import HumanMessage
                messages = [HumanMessage(content=message)]
                
                # Show processing stages
                processing_stages = [
                    "🔍 Knowledge Context Enrichment",
                    "👥 Multi-Agent Orchestration", 
                    "📚 Citation Enhancement",
                    "✅ Quality Validation"
                ]
                
                for i, stage in enumerate(processing_stages, 1):
                    stage_info = {
                        "type": "processing_stage",
                        "content": stage,
                        "stage": i,
                        "total_stages": len(processing_stages)
                    }
                    yield f"data: {json.dumps(stage_info)}\n\n"
                    await asyncio.sleep(0.8)
                
                # Get enhanced response
                enhanced_result = await enhanced_intelligence.process_legal_request(
                    messages=messages,
                    jurisdiction=jurisdiction,
                    legal_domain=legal_domain,
                    task_type=task_type,
                    enable_citations=enable_citations
                )
                
                # Stream the enhanced response
                response_content = enhanced_result["response"]["content"]
                for char in response_content:
                    chunk_data = {
                        "type": "token",
                        "content": char
                    }
                    yield f"data: {json.dumps(chunk_data)}\n\n"
                    await asyncio.sleep(0.01)
                
                # Stream intelligence metadata
                intelligence_meta = {
                    "type": "intelligence_metadata",
                    "content": "📊 Enhanced Intelligence Analysis Complete",
                    "metadata": {
                        "confidence_score": enhanced_result["validation"]["confidence_score"],
                        "processing_time": enhanced_result["intelligence"]["processing_stats"]["processing_time_seconds"],
                        "citations_count": len(enhanced_result["citations"]),
                        "laws_consulted": enhanced_result["intelligence"]["knowledge_context"]["active_laws_count"],
                        "agents_used": enhanced_result["intelligence"]["agents_used"]
                    }
                }
                yield f"data: {json.dumps(intelligence_meta)}\n\n"
                await asyncio.sleep(0.3)
                
                # Save enhanced response to database
                response_items = [{
                    "type": "enhanced_response",
                    "content": response_content,
                    "intelligence_data": enhanced_result
                }]
                asyncio.create_task(save_assistant_messages(thread_id, response_items))
                
                yield 'data: {"type": "end", "enhanced": true}\n\n'
                
            except Exception as e:
                import traceback
                error_msg = str(e) if str(e) else type(e).__name__
                error_details = traceback.format_exc()
                print(f"❌ Error in enhanced chat endpoint: {error_msg}")
                print(f"Traceback: {error_details}")
                error_msg_escaped = error_msg.replace('"', '\\"')
                yield f'data: {{"type": "error", "content": "{error_msg_escaped}"}}\n\n'
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    
    except Exception as e:
        return {"error": str(e)}


# 🏗️ NEW: 3-Layer Pipeline Architecture Endpoint
@app.post("/api/layered-chat")
async def layered_chat(request: Request):
    """
    🏗️ 3-Layer LangGraph Pipeline Endpoint
    
    Architecture:
    Layer 1: INPUT (Intent, Context, Memory)
    Layer 2: REASONING (Multi-Agent Collaboration)
    Layer 3: EXECUTION (Generation, Audit, Export)
    
    Streams real-time progress through all layers and agents.
    """
    if not layered_enabled:
        return {"error": "3-Layer Architecture not available"}
    
    try:
        data = await request.json()
        message = data.get("message", "")
        session_id = data.get("session_id") or str(uuid.uuid4())
        
        if not message:
            return {"error": "Message is required"}
        
        async def generate():
            try:
                # Initial response
                start_data = {
                    "type": "start",
                    "session_id": session_id,
                    "architecture": "3-layer-pipeline",
                    "message": "🏗️ Initializing 3-Layer Architecture"
                }
                yield f"data: {json.dumps(start_data)}\n\n"
                await asyncio.sleep(0.3)
                
                # Save user message in background
                asyncio.create_task(save_user_message(session_id, message))
                
                # Show architecture overview
                architecture_info = {
                    "type": "architecture_info",
                    "content": "🏗️ 3-Layer Pipeline Architecture",
                    "layers": {
                        "layer_1": "INPUT (Intent, Context, Memory)",
                        "layer_2": "REASONING (Multi-Agent Collaboration)",
                        "layer_3": "EXECUTION (Generation, Audit, Export)"
                    }
                }
                yield f"data: {json.dumps(architecture_info)}\n\n"
                await asyncio.sleep(0.5)
                
                # Stream through the complete pipeline with progress updates
                async for update in layered_orchestrator.astream_process(message, session_id):
                    # Format update for frontend
                    progress_update = {
                        "type": "layer_progress",
                        "node": update.get("node"),
                        "agent": update.get("agent"),
                        "layer": update.get("layer"),
                        "progress": update.get("progress", 0),
                        "content": f"[{update.get('layer', 'PROCESSING')}] {update.get('agent', 'Working')}..."
                    }
                    yield f"data: {json.dumps(progress_update)}\n\n"
                    await asyncio.sleep(0.1)
                    
                    # If this is the final node (audit), extract the complete result
                    if update.get("node") == "audit":
                        final_data = update.get("data", {})
                        formatted_document = final_data.get("formatted_document")
                        
                        # Stream document content
                        if formatted_document and formatted_document.get("content"):
                            document_data = {
                                "type": "document",
                                "content": formatted_document["content"],
                                "metadata": formatted_document.get("metadata", {}),
                                "citations": formatted_document.get("citations", []),
                                "validation": formatted_document.get("validation", {}),
                                "document_id": formatted_document.get("id")
                            }
                            yield f"data: {json.dumps(document_data)}\n\n"
                            await asyncio.sleep(0.2)
                        
                        # Stream final statistics
                        final_stats = {
                            "type": "completion",
                            "content": "✅ Pipeline Complete",
                            "statistics": {
                                "document_id": final_data.get("document_id"),
                                "progress": final_data.get("progress_percentage", 100),
                                "compliance_score": final_data.get("compliance_score", 0),
                                "word_count": formatted_document.get("metadata", {}).get("word_count", 0) if formatted_document else 0,
                                "citations_count": len(final_data.get("citations", [])),
                                "validation_passed": final_data.get("is_valid", False)
                            }
                        }
                        yield f"data: {json.dumps(final_stats)}\n\n"
                        
                        # Save complete result to database
                        response_items = [{
                            "type": "layered_response",
                            "content": formatted_document["content"] if formatted_document else "Processing complete",
                            "layered_data": final_data
                        }]
                        asyncio.create_task(save_assistant_messages(session_id, response_items))
                
                yield 'data: {"type": "end", "architecture": "3-layer"}\n\n'
                
            except Exception as e:
                import traceback
                error_msg = str(e) if str(e) else type(e).__name__
                error_details = traceback.format_exc()
                print(f"❌ Error in layered chat endpoint: {error_msg}")
                print(f"Traceback: {error_details}")
                error_msg_escaped = error_msg.replace('"', '\\"')
                yield f'data: {{"type": "error", "content": "{error_msg_escaped}"}}\n\n'
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/intelligence/status")
async def intelligence_status():
    """Get enhanced intelligence system status."""
    if not intelligence_enabled:
        return {"intelligence_enabled": False, "error": "Enhanced intelligence not available"}
    
    return {
        "intelligence_enabled": True,
        "status": enhanced_intelligence.get_system_status(),
        "configuration": enhanced_intelligence.config
    }


@app.post("/api/intelligence/configure")
async def configure_intelligence(request: Request):
    """Configure enhanced intelligence system."""
    if not intelligence_enabled:
        return {"error": "Enhanced intelligence not available"}
    
    try:
        config_updates = await request.json()
        updated_config = enhanced_intelligence.configure_intelligence(**config_updates)
        return {
            "success": True,
            "configuration": updated_config
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/debug", response_class=HTMLResponse)
async def debug_interface(request: Request):
    """Enhanced debug interface with intelligence layer visualization."""
    return templates.TemplateResponse("enhanced_debug.html", {"request": request})

@app.get("/debug/legacy", response_class=HTMLResponse)
async def legacy_debug_interface(request: Request):
    """Legacy debug interface."""
    return templates.TemplateResponse("debug.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    import argparse
    
    parser = argparse.ArgumentParser(description='Run Adlaan AI Agent')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=int(os.getenv('PORT', 8005)), help='Port to bind to')
    parser.add_argument('--reload', action='store_true', default=True, help='Enable auto-reload')
    args = parser.parse_args()
    
    # For production, disable reload
    if os.getenv('ENVIRONMENT') == 'production':
        args.reload = False
    
    uvicorn.run(
        "main:app",
        host=args.host,
        port=args.port,
        reload=args.reload
    )
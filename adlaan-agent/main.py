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

# Initialize agent with checkpointing
try:
    from agent.agent import Agent
    # Disable checkpointing for now (needs more work)
    agent = Agent(use_checkpointing=False)
    agent_loaded = True
    print("✅ Agent loaded (checkpointing temporarily disabled)")
except Exception as e:
    print(f"❌ Failed to load agent: {e}")
    agent = None
    agent_loaded = False

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
        "message": "LangGraph Agent is running!",
        "agent_loaded": agent_loaded,
        "checkpointing_enabled": agent.use_checkpointing if agent else False,
        "endpoints": {
            "chat_get": "/chat?message=...&thread_id=...",
            "chat_post": "/api/chat (recommended)",
            "debug": "/debug"
        }
    }


# Legacy GET endpoint (keep for backward compatibility)
@app.get("/chat")
async def chat_stream(message: str, thread_id: str = None):
    """Streaming chat endpoint with persistent conversation memory."""
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
            await asyncio.sleep(0)  # Allow other tasks to run

            # Save user message to database in background (non-blocking)
            asyncio.create_task(save_user_message(thread_id, message))

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


@app.get("/debug", response_class=HTMLResponse)
async def debug_interface(request: Request):
    """Simple debug interface."""
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
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional, AsyncIterator
import uuid
import json
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import our streaming agent
from agent import create_streaming_graph, ContractAgentState, AgentConfig

app = FastAPI(title="Adlaan Contract Agent")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize the streaming agent
streaming_agent = create_streaming_graph()


class ContractStreamRequest(BaseModel):
    message: str
    contract_text: Optional[str] = None
    session_id: Optional[str] = None


class LangGraph(BaseModel):
    version: str
    graph: Dict[str, Any] = {}


@app.get("/api/agent/contract/streem", response_model=LangGraph)
async def streem():
    """
    Returns the latest lang graph metadata for streaming.
    """
    return LangGraph(
        version="6.2",
        graph={
            "workflow": "streaming_contract_analysis",
            "nodes": ["stream_router", "stream_analysis", "stream_response"],
            "features": [
                "real_time_analysis",
                "progressive_results",
                "tool_integration",
            ],
            "tools_available": 5,
            "streaming_enabled": True,
        },
    )


async def generate_stream_response(
    state: ContractAgentState, session_id: str
) -> AsyncIterator[str]:
    """
    Generate streaming response from the agent workflow.

    Args:
        state: Initial agent state
        session_id: Session identifier for the workflow

    Yields:
        JSON-formatted streaming chunks
    """
    try:
        config = {"configurable": {"thread_id": session_id}}

        # Stream the agent execution
        async for chunk in streaming_agent.astream(state, config=config):
            # Extract streaming data from the chunk
            if isinstance(chunk, dict):
                for node_name, node_state in chunk.items():
                    if "stream_buffer" in node_state:
                        buffer = node_state["stream_buffer"]
                        chunk_count = node_state.get("chunk_count", 0)

                        # Send each new item in the buffer
                        for i, item in enumerate(buffer):
                            stream_data = {
                                "type": "stream_chunk",
                                "node": node_name,
                                "chunk_id": chunk_count + i,
                                "content": item,
                                "is_final": node_state.get("is_final", False),
                                "processing_status": node_state.get(
                                    "processing_status", "processing"
                                ),
                            }

                            yield f"data: {json.dumps(stream_data)}\n\n"

                            # Small delay to make streaming visible
                            await asyncio.sleep(0.1)

        # Send final completion message
        final_data = {
            "type": "stream_complete",
            "message": "Stream completed successfully",
            "session_id": session_id,
        }
        yield f"data: {json.dumps(final_data)}\n\n"

    except Exception as e:
        error_data = {
            "type": "stream_error",
            "error": str(e),
            "session_id": session_id,
        }
        yield f"data: {json.dumps(error_data)}\n\n"


@app.post("/api/agent/contract/streem")
async def process_contract_stream(request: ContractStreamRequest):
    """
    Process a contract using streaming responses.

    This endpoint provides real-time streaming updates during contract analysis.
    """
    # Generate session ID if not provided
    session_id = request.session_id or str(uuid.uuid4())

    # Create initial state for streaming
    initial_state: ContractAgentState = {
        "messages": [{"role": "user", "content": request.message}],
        "contract_text": request.contract_text,
        "contract_metadata": {},
        "current_step": "start",
        "processing_status": "pending",
        "stream_buffer": [],
        "tool_outputs": {},
        "analysis_results": {},
        "errors": [],
        "session_id": session_id,
        "user_id": "api_user",
        "chunk_count": 0,
        "is_final": False,
    }

    # Return streaming response
    return StreamingResponse(
        generate_stream_response(initial_state, session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Session-ID": session_id,
        },
    )


@app.get("/favicon.ico")
async def favicon():
    """Return no content for favicon requests to avoid 404 log spam."""
    return Response(status_code=204)

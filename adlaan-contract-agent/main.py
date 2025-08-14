"""
Adlaan Contract Generation Agent - FastAPI Server

A streaming contract generation agent that helps clients create legal contracts
for different jurisdictions (Jordan, KSA, Dubai) with real-time interaction.
"""

import os
import uuid
from typing import AsyncGenerator

import dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

from agent import create_streaming_graph, ContractAgentState

# Load environment variables
dotenv.load_dotenv()

app = FastAPI(
    title="Adlaan Contract Generation Agent",
    description="Interactive contract generation with legal compliance for Jordan, KSA, and Dubai",
    version="1.0.0"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


class ContractGenerationRequest(BaseModel):
    """Request model for contract generation."""
    query: str
    session_id: str = None
    contract_type: str = None
    jurisdiction: str = None
    client_info: dict = None


async def stream_contract_generation(
    request: ContractGenerationRequest,
) -> AsyncGenerator[str, None]:
    """
    Generate streaming responses for contract creation.
    
    Args:
        request: Contract generation request
        
    Yields:
        Streaming contract generation updates
    """
    try:
        # Create the streaming graph
        graph = create_streaming_graph()
        
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Initialize the state
        initial_state: ContractAgentState = {
            "messages": [HumanMessage(content=request.query)],
            "user_query": request.query,
            "client_info": request.client_info or {},
            "missing_info": [],
            "questions_asked": [],
            "contract_type": request.contract_type,
            "jurisdiction": request.jurisdiction,
            "legal_requirements": {},
            "contract_clauses": [],
            "generated_contract": None,
            "contract_sections": {},
            "stream_buffer": [],
            "current_step": "stream_router",
            "processing_status": "starting",
            "needs_more_info": True,
            "ready_to_generate": False,
            "generation_complete": False,
            "tool_outputs": {},
            "errors": [],
            "session_id": session_id,
            "user_id": None,
            "chunk_count": 0,
            "is_final": False,
        }
        
        # Configuration for the graph execution
        config = {"configurable": {"thread_id": session_id}}
        
        # Stream the contract generation process
        async for chunk in graph.astream(initial_state, config, stream_mode="values"):
            # Extract streaming content
            stream_buffer = chunk.get("stream_buffer", [])
            
            # Yield new content from the buffer
            if stream_buffer:
                for content in stream_buffer:
                    yield f"data: {content}\n\n"
            
            # Check if generation is complete
            if chunk.get("is_final") or chunk.get("generation_complete"):
                # Send the final contract if available
                if chunk.get("generated_contract"):
                    yield f"data: CONTRACT_COMPLETE\n\n"
                    yield f"data: {chunk['generated_contract']}\n\n"
                break
                
    except Exception as e:
        yield f"data: ❌ Error: {str(e)}\n\n"
    finally:
        yield f"data: [DONE]\n\n"


@app.post("/api/agent/contract/streem")
async def stream_contract_generation_endpoint(request: ContractGenerationRequest):
    """
    Streaming endpoint for contract generation.
    
    Creates contracts interactively with real-time updates and legal compliance
    checking for Jordan, KSA, and Dubai jurisdictions.
    """
    try:
        return StreamingResponse(
            stream_contract_generation(request),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "adlaan-contract-generation-agent",
        "version": "1.0.0"
    }


@app.get("/api/jurisdictions")
async def get_supported_jurisdictions():
    """Get list of supported legal jurisdictions."""
    return {
        "jurisdictions": [
            {
                "code": "jordan",
                "name": "Jordan",
                "currency": "JOD",
                "legal_system": "Civil Law"
            },
            {
                "code": "ksa", 
                "name": "Kingdom of Saudi Arabia",
                "currency": "SAR",
                "legal_system": "Islamic Law (Sharia)"
            },
            {
                "code": "dubai",
                "name": "Dubai, UAE", 
                "currency": "AED",
                "legal_system": "Civil Law / Common Law (DIFC)"
            }
        ]
    }


@app.get("/api/contract-types")
async def get_contract_types():
    """Get list of supported contract types."""
    return {
        "contract_types": [
            {
                "code": "employment",
                "name": "Employment Contract",
                "description": "Employment agreements between employers and employees"
            },
            {
                "code": "service",
                "name": "Service Agreement", 
                "description": "Service contracts between service providers and clients"
            },
            {
                "code": "sale",
                "name": "Sale Contract",
                "description": "Contracts for the sale of goods or products"
            },
            {
                "code": "rental",
                "name": "Rental Agreement",
                "description": "Property rental and lease agreements"
            },
            {
                "code": "partnership",
                "name": "Partnership Agreement",
                "description": "Business partnership and joint venture contracts"
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

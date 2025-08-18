import os
import json
import uuid
from typing import Optional
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from agent.tools.llm_config import (
    get_llm,
    get_streaming_response,
    ARABIC_CONTRACT_PROMPT,
)
from agent.tools.content_utils import extract_content_type
from agent.response_models import (
    create_chunk_data,
    create_standard_response,
    EventTypes,
    NodeIds,
    Tools,
    Actions,
)
from agent.contract_types import (
    ContractDocument,
    ContractMetadata,
    ContractSection,
    create_stream_event,
    ContractContentType,
)

# Load environment variables
load_dotenv()


class ChatRequest(BaseModel):
    message: str
    contract_type: str = "general"
    session_id: Optional[str] = None


class TemplateRequest(BaseModel):
    prompt: str
    contract_type: str = "general"
    language: str = "arabic"
    jurisdiction: str = "saudi_arabia"
    parties: list[str] = []
    session_id: Optional[str] = None


# Initialize FastAPI app
app = FastAPI(title="Adlaan Contract Agent", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Adlaan Contract Agent is running"}


@app.get("/ui", response_class=HTMLResponse)
async def contract_ui():
    """Serve the contract generation UI."""
    try:
        with open("templates/contract_template.html", "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(
            content="""
            <html><body>
                <h1>Template not found</h1>
                <p>The contract template file is missing. Please ensure templates/contract_template.html exists.</p>
            </body></html>
            """,
            status_code=404,
        )


@app.get("/chat/stream")
async def stream_chat_get(
    message: str, contract_type: str = "general", session_id: Optional[str] = None
):
    """GET endpoint for streaming chat (for EventSource)."""
    return StreamingResponse(
        stream_chat_response(message, contract_type, session_id),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Non-streaming chat endpoint with standardized response format."""
    try:
        session_id = request.session_id or str(uuid.uuid4())
        message_id = str(uuid.uuid4())

        chunks = []

        # Thinking process chunk
        thinking_chunk = create_chunk_data(
            event=EventTypes.MESSAGE_COT,
            node_id=NodeIds.COT,
            tool=Tools.COT,
            action=Actions.THINKING,
            param=f"Analyzing request: {request.message}",
            message_id=message_id,
            can_add_to_note=True,
        )
        chunks.append(thinking_chunk)

        # Check if search is needed
        search_keywords = [
            "search",
            "find",
            "lookup",
            "what is",
            "who is",
            "بحث",
            "العثور",
            "ما هو",
        ]
        needs_search = any(
            keyword in request.message.lower() for keyword in search_keywords
        )

        if needs_search:
            search_chunk = create_chunk_data(
                event=EventTypes.SEARCH_START,
                node_id=NodeIds.SEARCH,
                tool=Tools.GOOGLE_SEARCH,
                action=Actions.SEARCHING,
                param=f"Searching for: {request.message}",
                message_id=message_id,
            )
            chunks.append(search_chunk)

        # Generate response
        llm = get_llm()
        if request.contract_type != "general":
            contract_chunk = create_chunk_data(
                event=EventTypes.CONTRACT_GENERATION,
                node_id=NodeIds.CONTRACT,
                tool=Tools.CONTRACT_GENERATOR,
                action=Actions.GENERATING,
                param=f"Generating {request.contract_type} contract",
                message_id=message_id,
                can_add_to_note=True,
            )
            chunks.append(contract_chunk)

            prompt = f"""Generate {request.contract_type} contract content. Use [CH] for headers, [CB] for body, [CF] for footer.
Request: {request.message}"""
        else:
            prompt = request.message

        # Get full response
        response = llm.invoke(prompt)
        content_type, clean_content = extract_content_type(response.content)

        # Create final response chunk
        final_chunk = create_chunk_data(
            event=EventTypes.MESSAGE_COT,
            node_id=NodeIds.CHAT,
            tool=Tools.CHAT_PROCESSOR,
            action=Actions.COMPLETED,
            param=clean_content,
            message_id=message_id,
            can_add_to_note=True,
            outline_complete=True,
            content_type=content_type,
        )
        chunks.append(final_chunk)

        return create_standard_response(chunks)

    except Exception as e:
        error_chunk = create_chunk_data(
            event=EventTypes.ERROR,
            node_id=NodeIds.CHAT,
            tool=Tools.CHAT_PROCESSOR,
            action=Actions.ERROR,
            param=f"Error: {str(e)}",
            message_id=session_id,
            error=True,
            code=500,
        )
        return create_standard_response([error_chunk])


@app.post("/chat/stream")
async def stream_chat_post(request: ChatRequest):
    """POST endpoint for streaming chat."""
    return StreamingResponse(
        stream_chat_response(
            request.message, request.contract_type, request.session_id
        ),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


async def stream_chat_response(
    message: str, contract_type: str, session_id: Optional[str]
):
    """Generate streaming response from AI with standardized format."""
    try:
        # Generate session ID if not provided
        if not session_id:
            session_id = str(uuid.uuid4())

        message_id = str(uuid.uuid4())

        # Send thinking/analysis event
        thinking_chunk = create_chunk_data(
            event=EventTypes.MESSAGE_COT,
            node_id=NodeIds.COT,
            tool=Tools.COT,
            action=Actions.THINKING,
            param=f"Analyzing request: {message[:50]}...",
            message_id=message_id,
            can_add_to_note=True,
        )
        yield f"data: {create_standard_response([thinking_chunk]).model_dump_json()}\n\n"

        # Determine if search is needed
        search_keywords = [
            "search",
            "find",
            "lookup",
            "what is",
            "who is",
            "بحث",
            "العثور",
            "ما هو",
        ]
        needs_search = any(keyword in message.lower() for keyword in search_keywords)

        if needs_search:
            # Send search start event
            search_chunk = create_chunk_data(
                event=EventTypes.SEARCH_START,
                node_id=NodeIds.SEARCH,
                tool=Tools.GOOGLE_SEARCH,
                action=Actions.SEARCHING,
                param=f"Searching for information about: {message}",
                message_id=message_id,
            )
            yield f"data: {create_standard_response([search_chunk]).model_dump_json()}\n\n"

        # Get LLM and create prompt
        llm = get_llm()
        if contract_type != "general":
            # Contract generation event
            contract_chunk = create_chunk_data(
                event=EventTypes.CONTRACT_GENERATION,
                node_id=NodeIds.CONTRACT,
                tool=Tools.CONTRACT_GENERATOR,
                action=Actions.GENERATING,
                param=f"Generating {contract_type} contract",
                message_id=message_id,
                can_add_to_note=True,
            )
            yield f"data: {create_standard_response([contract_chunk]).model_dump_json()}\n\n"

            prompt = f"""Generate {contract_type} contract content. Use [CH] for headers, [CB] for body, [CF] for footer.
Request: {message}"""
        else:
            prompt = message

        # Stream response content
        buffer = ""
        content_chunks = []

        async for chunk in llm.astream(prompt):
            if hasattr(chunk, "content") and chunk.content:
                buffer += chunk.content

                # Send content in chunks when we hit natural breaks
                if (
                    buffer.endswith((".", "!", "?", "\n"))
                    or "[C" in buffer
                    or len(buffer) > 100
                ):
                    content_type, clean_content = extract_content_type(buffer)

                    if clean_content.strip():
                        content_chunk = create_chunk_data(
                            event=EventTypes.MESSAGE_COT,
                            node_id=NodeIds.CHAT,
                            tool=Tools.CHAT_PROCESSOR,
                            action=Actions.PROCESSING,
                            param=clean_content.strip(),
                            message_id=message_id,
                            can_add_to_note=True,
                            content_type=content_type,
                        )
                        yield f"data: {create_standard_response([content_chunk]).model_dump_json()}\n\n"
                        content_chunks.append(clean_content.strip())

                    buffer = ""

        # Send remaining content
        if buffer.strip():
            content_type, clean_content = extract_content_type(buffer)
            if clean_content.strip():
                final_chunk = create_chunk_data(
                    event=EventTypes.MESSAGE_COT,
                    node_id=NodeIds.CHAT,
                    tool=Tools.CHAT_PROCESSOR,
                    action=Actions.COMPLETED,
                    param=clean_content.strip(),
                    message_id=message_id,
                    can_add_to_note=True,
                    outline_complete=True,
                    content_type=content_type,
                )
                yield f"data: {create_standard_response([final_chunk]).model_dump_json()}\n\n"

    except Exception as e:
        error_chunk = create_chunk_data(
            event=EventTypes.ERROR,
            node_id=NodeIds.CHAT,
            tool=Tools.CHAT_PROCESSOR,
            action=Actions.ERROR,
            param=f"Error: {str(e)}",
            message_id=session_id,
            error=True,
            code=500,
        )
        yield f"data: {create_standard_response([error_chunk]).model_dump_json()}\n\n"


@app.post("/template")
async def generate_template(request: TemplateRequest):
    """Template endpoint with Replit-style interface (1/3 chat, 2/3 document)."""
    try:
        # Generate session ID if not provided
        session_id = request.session_id or str(uuid.uuid4())

        # Create contract metadata
        metadata = ContractMetadata(
            contract_id=session_id,
            contract_type=request.contract_type,
            parties=request.parties,
            created_at=datetime.now(),
            language=request.language,
            jurisdiction=request.jurisdiction,
        )

        # Initialize contract document
        document = ContractDocument(metadata=metadata)

        return StreamingResponse(
            stream_template_response(request, document, session_id),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
        )
    except Exception as e:
        return {"error": str(e)}


async def stream_template_response(
    request: TemplateRequest, document: ContractDocument, session_id: str
):
    """Generate streaming template response with structured document format."""
    try:
        # Send initial metadata
        yield create_stream_event(
            "contract_metadata",
            {
                "session_id": session_id,
                "metadata": document.metadata.model_dump(),
                "interface_type": "replit_style",  # 1/3 chat, 2/3 doc
            },
        )

        # Create Arabic-focused prompt
        arabic_prompt = f"""
أنت مساعد ذكي متخصص في إنشاء العقود القانونية باللغة العربية. 
أنشئ عقد {request.contract_type} مفصل وقوي باللغة العربية.

المتطلبات:
{request.prompt}

نوع العقد: {request.contract_type}
الولاية القضائية: {request.jurisdiction}
الأطراف: {', '.join(request.parties) if request.parties else 'غير محدد'}

تعليمات:
1. استخدم [CH] لرؤوس العقد (العنوان، أسماء الأطراف)
2. استخدم [CB] لنص العقد الرئيسي (البنود، الشروط، الالتزامات)
3. استخدم [CF] للختام والتوقيعات
4. اكتب عقد قانوني مفصل وقوي يغطي جميع الجوانب المطلوبة
5. استخدم المصطلحات القانونية العربية الصحيحة
6. تأكد من الامتثال للقوانين السعودية إذا كانت الولاية القضائية السعودية

ابدأ بإنشاء العقد:
"""

        # Get LLM instance
        llm = get_llm()

        current_section = None
        buffer = ""
        section_counter = 0

        async for chunk in llm.astream(arabic_prompt):
            if hasattr(chunk, "content") and chunk.content:
                buffer += chunk.content

                # Check for section markers or natural breaks
                if any(
                    marker in buffer for marker in ["[CH]", "[CB]", "[CF]"]
                ) or buffer.endswith(("\n\n", ".", ":", "؛", "،")):
                    content_type, clean_content = extract_content_type(buffer)

                    if clean_content.strip():
                        # Create section if we have content
                        if content_type != "normal":
                            section_id = f"section_{section_counter}"
                            section_counter += 1

                            section = ContractSection(
                                section_id=section_id,
                                section_type=content_type,
                                title=f"{content_type.title()} Section",
                                content=clean_content.strip(),
                                order=section_counter,
                            )

                            document.add_section(section)

                            # Send structured delta
                            yield create_stream_event(
                                "delta",
                                {
                                    "operation": "add_section",
                                    "section": section.model_dump(),
                                    "content_type": content_type,
                                    "session_id": session_id,
                                },
                            )
                        else:
                            # Send regular content delta
                            yield create_stream_event(
                                "delta",
                                {
                                    "operation": "append_content",
                                    "content": clean_content.strip(),
                                    "content_type": "text",
                                    "session_id": session_id,
                                },
                            )

                    buffer = ""

        # Handle remaining content
        if buffer.strip():
            content_type, clean_content = extract_content_type(buffer)
            if clean_content.strip():
                yield create_stream_event(
                    "delta",
                    {
                        "operation": "append_content",
                        "content": clean_content.strip(),
                        "content_type": content_type,
                        "session_id": session_id,
                    },
                )

        # Send completion event
        yield create_stream_event(
            "complete",
            {
                "session_id": session_id,
                "document": document.model_dump(),
                "total_sections": len(document.sections),
            },
        )

    except Exception as e:
        yield create_stream_event(
            "error",
            {
                "session_id": session_id,
                "error": str(e),
            },
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8001)

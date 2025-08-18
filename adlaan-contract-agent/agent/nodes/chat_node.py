"""
Main chat node for processing user messages and generating responses.
"""

from typing import Dict, Any, List
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from agent.state import AgentState
from agent.tools.llm_config import get_llm, CONTRACT_SYSTEM_PROMPT
from agent.tools.content_utils import extract_content_type
from agent.tools.validation import sanitize_user_input
from agent.tools.search_tool import web_search, contract_research
from agent.response_models import create_chunk_data, EventTypes, NodeIds, Tools, Actions
import uuid


async def enhanced_chat_node(state: AgentState) -> Dict[str, Any]:
    """
    Enhanced chat node that can perform web searches when needed.
    Returns standardized chunk responses.

    Args:
        state: Current agent state

    Returns:
        Updated state with standardized response chunks
    """
    message_id = str(uuid.uuid4())
    chunks = []

    # Get the LLM instance
    llm = get_llm()

    # Sanitize the current message
    sanitized_message = sanitize_user_input(state["current_message"])

    # Add thinking chunk
    thinking_chunk = create_chunk_data(
        event=EventTypes.MESSAGE_COT,
        node_id=NodeIds.COT,
        tool=Tools.COT,
        action=Actions.THINKING,
        param=f"Processing message: {sanitized_message[:100]}...",
        message_id=message_id,
        can_add_to_note=True,
    )
    chunks.append(thinking_chunk)

    # Check if the message requires web search
    search_keywords = [
        "ابحث",
        "search",
        "معلومات",
        "information",
        "نموذج",
        "example",
        "سابقة",
        "precedent",
        "قانون",
        "law",
        "محكمة",
        "court",
        "what is",
        "who is",
        "when did",
        "بحث",
        "العثور",
        "ما هو",
    ]

    needs_search = any(
        keyword in sanitized_message.lower() for keyword in search_keywords
    )

    search_context = ""
    if needs_search:
        # Add search start chunk
        search_chunk = create_chunk_data(
            event=EventTypes.SEARCH_START,
            node_id=NodeIds.SEARCH,
            tool=Tools.GOOGLE_SEARCH,
            action=Actions.SEARCHING,
            param=f"Searching for information about: {sanitized_message}",
            message_id=message_id,
        )
        chunks.append(search_chunk)

        try:
            # Perform web search
            search_results = await web_search(sanitized_message)
            if search_results:
                search_context = f"\n\nSearch Results:\n{search_results}\n"

                # Add search complete chunk
                search_complete_chunk = create_chunk_data(
                    event=EventTypes.SEARCH_COMPLETE,
                    node_id=NodeIds.SEARCH,
                    tool=Tools.GOOGLE_SEARCH,
                    action=Actions.COMPLETED,
                    param=f"Found {len(search_results[:500])} characters of relevant information",
                    message_id=message_id,
                    can_add_to_note=True,
                )
                chunks.append(search_complete_chunk)

        except Exception as e:
            # Add search error chunk
            search_error_chunk = create_chunk_data(
                event=EventTypes.ERROR,
                node_id=NodeIds.SEARCH,
                tool=Tools.GOOGLE_SEARCH,
                action=Actions.ERROR,
                param=f"Search failed: {str(e)}",
                message_id=message_id,
                error=True,
            )
            chunks.append(search_error_chunk)

    # Prepare messages for LLM
    messages = state["messages"].copy()

    search_context = ""
    if needs_search:
        try:
            # Perform search based on the message content
            if "عقد" in sanitized_message or "contract" in sanitized_message:
                # Extract topic for contract research
                topic = _extract_contract_topic(sanitized_message)
                search_results = await contract_research(topic)
            else:
                # General web search
                search_results = await web_search(sanitized_message, num_results=3)

            search_context = f"\n\nمعلومات إضافية من البحث:\n{search_results}"

            # Update metadata to indicate search was performed
            metadata = state.get("metadata", {})
            metadata.update(
                {
                    "search_performed": True,
                    "search_query": sanitized_message,
                    "search_results_available": True,
                }
            )

        except Exception as e:
            search_context = f"\n\nملاحظة: لم أتمكن من البحث في الوقت الحالي: {str(e)}"
            metadata = state.get("metadata", {})
            metadata.update({"search_performed": False, "search_error": str(e)})

    # Add the current user message with search context if available
    enhanced_message = sanitized_message + search_context
    if not messages or messages[-1].content != enhanced_message:
        messages.append(HumanMessage(content=enhanced_message))

    # Generate response
    try:
        response = llm.invoke(messages)

        # Extract content type and clean content
        content_type, clean_content = extract_content_type(response.content)

        # Create AI message with the response
        ai_message = AIMessage(content=clean_content)

        # Update messages list
        updated_messages = messages + [ai_message]

        # Update metadata with content type information
        metadata = state.get("metadata", {})
        metadata.update(
            {
                "last_content_type": content_type,
                "last_response_length": len(clean_content),
                "processing_status": "completed",
                "enhanced_with_search": needs_search,
            }
        )

        return {
            "messages": updated_messages,
            "current_message": sanitized_message,
            "response_buffer": clean_content,
            "metadata": metadata,
        }

    except Exception as e:
        # Handle errors gracefully
        error_message = f"Sorry, I encountered an error: {str(e)}"
        error_ai_message = AIMessage(content=error_message)

        metadata = state.get("metadata", {})
        metadata.update({"last_error": str(e), "processing_status": "error"})

        return {
            "messages": state["messages"] + [error_ai_message],
            "current_message": sanitized_message,
            "response_buffer": error_message,
            "metadata": metadata,
        }


def chat_node(state: AgentState) -> Dict[str, Any]:
    """
    Main chat node that processes user messages and generates responses.

    Args:
        state: Current agent state

    Returns:
        Updated state with AI response
    """
    # Get the LLM instance
    llm = get_llm()

    # Sanitize the current message
    sanitized_message = sanitize_user_input(state["current_message"])

    # Prepare messages for LLM with system prompt
    messages = state["messages"].copy()

    # Add the current user message if it's not already in messages
    if not messages or messages[-1].content != sanitized_message:
        messages.append(HumanMessage(content=sanitized_message))

    # Generate response
    try:
        response = llm.invoke(messages)

        # Extract content type and clean content
        content_type, clean_content = extract_content_type(response.content)

        # Create AI message with the response
        ai_message = AIMessage(content=clean_content)

        # Update messages list
        updated_messages = messages + [ai_message]

        # Update metadata with content type information
        metadata = state.get("metadata", {})
        metadata.update(
            {
                "last_content_type": content_type,
                "last_response_length": len(clean_content),
                "processing_status": "completed",
            }
        )

        return {
            "messages": updated_messages,
            "current_message": sanitized_message,
            "response_buffer": clean_content,
            "metadata": metadata,
        }

    except Exception as e:
        # Handle errors gracefully
        error_message = f"Sorry, I encountered an error: {str(e)}"
        error_ai_message = AIMessage(content=error_message)

        metadata = state.get("metadata", {})
        metadata.update({"last_error": str(e), "processing_status": "error"})

        return {
            "messages": state["messages"] + [error_ai_message],
            "current_message": sanitized_message,
            "response_buffer": error_message,
            "metadata": metadata,
        }


def streaming_chat_node(state: AgentState) -> Dict[str, Any]:
    """
    Streaming version of chat node for real-time responses.

    Args:
        state: Current agent state

    Returns:
        Updated state with streaming preparation
    """
    # Sanitize input
    sanitized_message = sanitize_user_input(state["current_message"])

    # Prepare for streaming (actual streaming handled by FastAPI endpoint)
    metadata = state.get("metadata", {})
    metadata.update({"processing_status": "streaming", "stream_ready": True})

    # Add user message to conversation
    messages = state["messages"].copy()
    if not messages or messages[-1].content != sanitized_message:
        messages.append(HumanMessage(content=sanitized_message))

    return {
        "messages": messages,
        "current_message": sanitized_message,
        "response_buffer": "",  # Will be populated during streaming
        "metadata": metadata,
    }


def _extract_contract_topic(message: str) -> str:
    """
    Extract contract topic from user message.

    Args:
        message: User message

    Returns:
        Extracted topic or default
    """
    # Simple topic extraction - can be enhanced with NLP
    common_topics = {
        "عمل": "العمل",
        "employment": "العمل",
        "خدمة": "الخدمات",
        "service": "الخدمات",
        "إيجار": "الإيجار",
        "lease": "الإيجار",
        "rent": "الإيجار",
        "شراء": "البيع والشراء",
        "بيع": "البيع والشراء",
        "sale": "البيع والشراء",
    }

    message_lower = message.lower()
    for keyword, topic in common_topics.items():
        if keyword in message_lower:
            return topic

    return "العقود العامة"  # Default topic


from typing import Dict, Any
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from agent.state import AgentState
from agent.tools.llm_config import get_llm, CONTRACT_SYSTEM_PROMPT
from agent.tools.content_utils import extract_content_type
from agent.tools.validation import sanitize_user_input


def chat_node(state: AgentState) -> Dict[str, Any]:
    """
    Main chat node that processes user messages and generates responses.

    Args:
        state: Current agent state

    Returns:
        Updated state with AI response
    """
    # Get the LLM instance
    llm = get_llm()

    # Sanitize the current message
    sanitized_message = sanitize_user_input(state["current_message"])

    # Prepare messages for LLM with system prompt
    messages = state["messages"].copy()

    # Add the current user message if it's not already in messages
    if not messages or messages[-1].content != sanitized_message:
        messages.append(HumanMessage(content=sanitized_message))

    # Generate response
    try:
        response = llm.invoke(messages)

        # Extract content type and clean content
        content_type, clean_content = extract_content_type(response.content)

        # Create AI message with the response
        ai_message = AIMessage(content=clean_content)

        # Update messages list
        updated_messages = messages + [ai_message]

        # Update metadata with content type information
        metadata = state.get("metadata", {})
        metadata.update(
            {
                "last_content_type": content_type,
                "last_response_length": len(clean_content),
                "processing_status": "completed",
            }
        )

        return {
            "messages": updated_messages,
            "current_message": sanitized_message,
            "response_buffer": clean_content,
            "metadata": metadata,
        }

    except Exception as e:
        # Handle errors gracefully
        error_message = f"Sorry, I encountered an error: {str(e)}"
        error_ai_message = AIMessage(content=error_message)

        metadata = state.get("metadata", {})
        metadata.update({"last_error": str(e), "processing_status": "error"})

        return {
            "messages": state["messages"] + [error_ai_message],
            "current_message": sanitized_message,
            "response_buffer": error_message,
            "metadata": metadata,
        }


def streaming_chat_node(state: AgentState) -> Dict[str, Any]:
    """
    Streaming version of chat node for real-time responses.

    Args:
        state: Current agent state

    Returns:
        Updated state with streaming preparation
    """
    # Sanitize input
    sanitized_message = sanitize_user_input(state["current_message"])

    # Prepare for streaming (actual streaming handled by FastAPI endpoint)
    metadata = state.get("metadata", {})
    metadata.update({"processing_status": "streaming", "stream_ready": True})

    # Add user message to conversation
    messages = state["messages"].copy()
    if not messages or messages[-1].content != sanitized_message:
        messages.append(HumanMessage(content=sanitized_message))

    return {
        "messages": messages,
        "current_message": sanitized_message,
        "response_buffer": "",  # Will be populated during streaming
        "metadata": metadata,
    }

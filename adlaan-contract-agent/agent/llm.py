"""
LLM configuration and initialization.

Handles LLM setup using environment variables and provides a consistent
interface for model interactions across the agent.
"""

import os
from typing import Optional
from langchain_google_genai import ChatGoogleGenerativeAI


def get_llm(model_name: str = "gemini-1.5-flash", **kwargs) -> ChatGoogleGenerativeAI:
    """
    Initialize and return a Google Generative AI model.

    Args:
        model_name: The model to use (default: gemini-1.5-flash)
        **kwargs: Additional arguments to pass to the model

    Returns:
        Configured ChatGoogleGenerativeAI instance

    Raises:
        ValueError: If GOOGLE_API_KEY is not set in environment
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "GOOGLE_API_KEY environment variable is required. "
            "Please set it in your .env file."
        )

    # Default configuration optimized for agent workflows
    default_config = {
        "temperature": 0.1,
        "max_tokens": 1024,
        "model": model_name,
    }

    # Merge with user-provided kwargs
    config = {**default_config, **kwargs}

    return ChatGoogleGenerativeAI(google_api_key=api_key, **config)


def get_streaming_llm(
    model_name: str = "gemini-1.5-flash", **kwargs
) -> ChatGoogleGenerativeAI:
    """
    Get an LLM configured for streaming responses.

    Args:
        model_name: The model to use
        **kwargs: Additional arguments

    Returns:
        Streaming-enabled ChatGoogleGenerativeAI instance
    """
    return get_llm(model_name=model_name, streaming=True, **kwargs)

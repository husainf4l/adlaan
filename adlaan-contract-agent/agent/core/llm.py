"""
LLM configuration and initialization.

Handles LLM setup using configuration and provides a consistent
interface for model interactions across the agent.
"""

from typing import Optional
from langchain_google_genai import ChatGoogleGenerativeAI

from .config import AgentConfig


def get_llm(config: Optional[AgentConfig] = None, **kwargs) -> ChatGoogleGenerativeAI:
    """
    Initialize and return a Google Generative AI model.

    Args:
        config: Agent configuration object
        **kwargs: Additional arguments to override config

    Returns:
        Configured ChatGoogleGenerativeAI instance

    Raises:
        ValueError: If configuration is invalid
    """
    if config is None:
        config = AgentConfig.from_env()

    # Get base configuration
    llm_config = config.to_llm_kwargs()

    # Override with any provided kwargs
    llm_config.update(kwargs)

    return ChatGoogleGenerativeAI(**llm_config)


def get_streaming_llm(
    config: Optional[AgentConfig] = None, **kwargs
) -> ChatGoogleGenerativeAI:
    """
    Get an LLM configured for streaming responses.

    Args:
        config: Agent configuration object
        **kwargs: Additional arguments

    Returns:
        Streaming-enabled ChatGoogleGenerativeAI instance
    """
    # Ensure streaming is enabled
    kwargs["streaming"] = True
    return get_llm(config=config, **kwargs)

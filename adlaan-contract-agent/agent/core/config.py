"""
Agent configuration management.

Centralized configuration for the entire agent system including
LLM settings, tool configurations, and workflow parameters.
"""

import os
from typing import Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class AgentConfig:
    """
    Configuration settings for the contract agent.

    This class centralizes all configuration options for the agent,
    making it easy to manage settings across the entire system.
    """

    # LLM Configuration
    model_name: str = "gemini-1.5-flash"
    temperature: float = 0.1
    max_tokens: int = 1024
    streaming: bool = True

    # Agent Behavior
    enable_tools: bool = True
    enable_memory: bool = True
    max_iterations: int = 10

    # API Configuration
    google_api_key: Optional[str] = None

    # Workflow Configuration
    default_workflow: str = "contract_stream"
    enable_checkpointing: bool = True

    def __post_init__(self):
        """Initialize configuration from environment if not provided."""
        if self.google_api_key is None:
            self.google_api_key = os.getenv("GOOGLE_API_KEY")

        if not self.google_api_key:
            raise ValueError(
                "GOOGLE_API_KEY must be provided either in config or environment"
            )

    @classmethod
    def from_env(cls) -> "AgentConfig":
        """Create configuration from environment variables."""
        return cls(
            model_name=os.getenv("AGENT_MODEL_NAME", "gemini-1.5-flash"),
            temperature=float(os.getenv("AGENT_TEMPERATURE", "0.1")),
            max_tokens=int(os.getenv("AGENT_MAX_TOKENS", "1024")),
            streaming=os.getenv("AGENT_STREAMING", "true").lower() == "true",
            enable_tools=os.getenv("AGENT_ENABLE_TOOLS", "true").lower() == "true",
            enable_memory=os.getenv("AGENT_ENABLE_MEMORY", "true").lower() == "true",
        )

    def to_llm_kwargs(self) -> Dict[str, Any]:
        """Convert config to LLM initialization kwargs."""
        return {
            "model": self.model_name,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "streaming": self.streaming,
            "google_api_key": self.google_api_key,
        }

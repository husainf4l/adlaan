"""
Core configuration management for the Adlaan Agent microservice.
This module handles environment variables, settings validation, and configuration loading.
"""
from functools import lru_cache
from typing import List, Optional, Any, Dict
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
import os
from enum import Enum


class Environment(str, Enum):
    """Application environment types."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"


class LogLevel(str, Enum):
    """Logging levels."""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Settings(BaseSettings):
    """Application settings with validation."""
    
    # Application
    app_name: str = Field(default="Adlaan Legal Agent", env="APP_NAME")
    app_version: str = Field(default="2.0.0", env="APP_VERSION")
    environment: Environment = Field(default=Environment.DEVELOPMENT, env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")
    
    # Server
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8005, env="PORT")
    workers: int = Field(default=1, env="WORKERS")
    
    # API
    api_v1_prefix: str = Field(default="/api/v1", env="API_V1_PREFIX")
    api_v2_prefix: str = Field(default="/api/v2", env="API_V2_PREFIX")
    
    # Security
    secret_key: str = Field(..., env="SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # CORS
    cors_origins: List[str] = Field(
        default=[
            "http://localhost:3000",  # Next.js frontend
            "http://localhost:3001",  # Nest.js backend
            "http://localhost:8005",  # This service
        ],
        env="CORS_ORIGINS"
    )
    
    # Backend Integration
    backend_url: str = Field(..., env="BACKEND_URL")
    backend_auth_token: str = Field(..., env="BACKEND_AUTH_TOKEN")
    graphql_endpoint: str = Field(default="/graphql", env="GRAPHQL_ENDPOINT")
    
    # AI/LLM Configuration
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4", env="OPENAI_MODEL")
    openai_temperature: float = Field(default=0.1, env="OPENAI_TEMPERATURE")
    openai_max_tokens: int = Field(default=4000, env="OPENAI_MAX_TOKENS")
    
    # Database (for legacy features and caching)
    database_url: Optional[str] = Field(default=None, env="DATABASE_URL")
    db_host: Optional[str] = Field(default=None, env="DB_HOST")
    db_port: Optional[int] = Field(default=5432, env="DB_PORT")
    db_name: Optional[str] = Field(default=None, env="DB_NAME")
    db_user: Optional[str] = Field(default=None, env="DB_USER")
    db_password: Optional[str] = Field(default=None, env="DB_PASSWORD")
    
    # Redis (for caching and task queues)
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")
    redis_host: str = Field(default="localhost", env="REDIS_HOST")
    redis_port: int = Field(default=6379, env="REDIS_PORT")
    redis_password: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    
    # Performance Settings
    max_concurrent_tasks: int = Field(default=10, env="MAX_CONCURRENT_TASKS")
    task_timeout_seconds: int = Field(default=300, env="TASK_TIMEOUT_SECONDS")
    
    # Logging
    log_level: LogLevel = Field(default=LogLevel.INFO, env="LOG_LEVEL")
    log_format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    # Monitoring
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    metrics_port: int = Field(default=8006, env="METRICS_PORT")
    
    # External APIs (optional)
    lexis_api_key: Optional[str] = Field(default=None, env="LEXIS_API_KEY")
    justia_api_key: Optional[str] = Field(default=None, env="JUSTIA_API_KEY")
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "allow",
    }
        
    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @field_validator("database_url", mode="after")
    @classmethod
    def build_database_url(cls, v, info):
        """Build database URL from components if not provided."""
        if v:
            return v
        
        values = info.data
        if all(values.get(key) for key in ["db_host", "db_name", "db_user", "db_password"]):
            return (
                f"postgresql://{values['db_user']}:{values['db_password']}"
                f"@{values['db_host']}:{values['db_port']}/{values['db_name']}"
            )
        
        # Default to SQLite for development
        return "sqlite:///./data/adlaan_agent.db"
    
    @property
    def backend_graphql_url(self) -> str:
        """Get the full GraphQL URL."""
        return f"{self.backend_url.rstrip('/')}{self.graphql_endpoint}"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == Environment.PRODUCTION
    
    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment == Environment.DEVELOPMENT


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Global settings instance
settings = get_settings()
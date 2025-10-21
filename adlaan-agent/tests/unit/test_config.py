"""
Unit tests for the core configuration module.
"""
import os
import pytest
from unittest.mock import patch

from src.core.config import Settings, get_settings, Environment, LogLevel


class TestSettings:
    """Test the Settings class."""
    
    def test_default_values(self):
        """Test that default values are set correctly."""
        settings = Settings(
            secret_key="test-key",
            backend_url="http://test:3000", 
            backend_auth_token="test-token",
            openai_api_key="test-openai-key"
        )
        
        assert settings.app_name == "Adlaan Legal Agent"
        assert settings.app_version == "2.0.0"
        assert settings.environment == Environment.DEVELOPMENT
        assert settings.host == "0.0.0.0"
        assert settings.port == 8005
        assert settings.debug is False
    
    def test_environment_specific_settings(self):
        """Test environment-specific configuration."""
        settings = Settings(
            environment=Environment.PRODUCTION,
            secret_key="test-key",
            backend_url="http://test:3000",
            backend_auth_token="test-token", 
            openai_api_key="test-openai-key"
        )
        
        assert settings.is_production is True
        assert settings.is_development is False
    
    def test_cors_origins_parsing(self):
        """Test CORS origins parsing from string."""
        settings = Settings(
            cors_origins="http://localhost:3000,http://localhost:3001",
            secret_key="test-key",
            backend_url="http://test:3000",
            backend_auth_token="test-token",
            openai_api_key="test-openai-key"
        )
        
        assert settings.cors_origins == ["http://localhost:3000", "http://localhost:3001"]
    
    def test_database_url_construction(self):
        """Test database URL construction from components."""
        settings = Settings(
            db_host="localhost",
            db_port=5432,
            db_name="test_db",
            db_user="test_user", 
            db_password="test_pass",
            secret_key="test-key",
            backend_url="http://test:3000",
            backend_auth_token="test-token",
            openai_api_key="test-openai-key"
        )
        
        expected_url = "postgresql://test_user:test_pass@localhost:5432/test_db"
        assert settings.database_url == expected_url
    
    def test_backend_graphql_url_property(self):
        """Test backend GraphQL URL property."""
        settings = Settings(
            backend_url="http://localhost:3000",
            graphql_endpoint="/graphql",
            secret_key="test-key",
            backend_auth_token="test-token",
            openai_api_key="test-openai-key"
        )
        
        assert settings.backend_graphql_url == "http://localhost:3000/graphql"
    
    @patch.dict(os.environ, {
        "SECRET_KEY": "env-secret-key",
        "BACKEND_URL": "http://env-backend:3000",
        "BACKEND_AUTH_TOKEN": "env-token",
        "OPENAI_API_KEY": "env-openai-key",
        "ENVIRONMENT": "production",
        "PORT": "8080"
    })
    def test_environment_variable_loading(self):
        """Test loading configuration from environment variables."""
        settings = Settings()
        
        assert settings.secret_key == "env-secret-key"
        assert settings.backend_url == "http://env-backend:3000"
        assert settings.backend_auth_token == "env-token"
        assert settings.openai_api_key == "env-openai-key"
        assert settings.environment == Environment.PRODUCTION
        assert settings.port == 8080


class TestGetSettings:
    """Test the get_settings function."""
    
    def test_settings_caching(self):
        """Test that settings are cached."""
        settings1 = get_settings()
        settings2 = get_settings()
        
        assert settings1 is settings2
    
    def test_settings_type(self):
        """Test that get_settings returns Settings instance."""
        settings = get_settings()
        assert isinstance(settings, Settings)
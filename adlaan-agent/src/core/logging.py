"""
Centralized logging configuration for the Adlaan Agent microservice.
Provides structured logging with proper formatting and levels.
"""
import logging
import logging.config
import sys
from typing import Dict, Any
from pathlib import Path

from src.core.config import get_settings

settings = get_settings()


def setup_logging() -> None:
    """Configure application logging."""
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": settings.log_format,
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": (
                    "%(asctime)s - %(name)s - %(levelname)s - "
                    "%(funcName)s:%(lineno)d - %(message)s"
                ),
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "json": {
                "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "format": (
                    "%(asctime)s %(name)s %(levelname)s %(funcName)s "
                    "%(lineno)d %(message)s"
                ),
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": settings.log_level.value,
                "formatter": "default",
                "stream": sys.stdout,
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "INFO",
                "formatter": "detailed",
                "filename": log_dir / "adlaan_agent.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8",
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "detailed",
                "filename": log_dir / "errors.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8",
            },
        },
        "loggers": {
            "adlaan_agent": {
                "level": settings.log_level.value,
                "handlers": ["console", "file"],
                "propagate": False,
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn.error": {
                "level": "INFO",
                "handlers": ["console", "error_file"],
                "propagate": False,
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
        },
        "root": {
            "level": settings.log_level.value,
            "handlers": ["console", "file"],
        },
    }
    
    # Use JSON formatter in production
    if settings.is_production:
        logging_config["handlers"]["console"]["formatter"] = "json"
        logging_config["handlers"]["file"]["formatter"] = "json"
    
    logging.config.dictConfig(logging_config)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the specified name."""
    return logging.getLogger(f"adlaan_agent.{name}")


# Set up logging when module is imported
setup_logging()

# Create module logger
logger = get_logger(__name__)
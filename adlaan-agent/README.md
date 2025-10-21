# 🤖 Adlaan Legal Agent Microservice v3.0

> **A modern, production-ready AI-powered legal document creation and consultation microservice built with best practices and enterprise architecture.**

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)

## 🌟 Overview

The Adlaan Legal Agent is a sophisticated microservice that provides AI-powered legal document generation and analysis capabilities. Built with FastAPI and following enterprise-grade architectural patterns, it integrates seamlessly with Nest.js backends and Next.js frontends.

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Nest.js        │    │  FastAPI Agent  │
│   Frontend      │◄──►│   Backend        │◄──►│  Microservice   │
│                 │    │  (GraphQL API)   │    │  (This Service) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🚀 Key Features

- **🔗 Backend Integration** - Seamless GraphQL communication with Nest.js
- **🤖 Multi-Agent System** - Specialized AI agents for different legal tasks
- **📄 Document Generation** - Advanced legal document creation
- **🔍 Document Analysis** - Intelligent document review and risk assessment
- **⚡ Async Processing** - Non-blocking background task execution
- **📊 Real-time Streaming** - Live progress updates and SSE support
- **🏥 Health Monitoring** - Comprehensive health checks and metrics
- **🐳 Docker Ready** - Containerized deployment with Docker Compose
- **🧪 Test Coverage** - Comprehensive unit and integration tests
- **📝 Type Safety** - Full TypeScript-style typing with Pydantic

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Docker & Docker Compose (optional)
- OpenAI API key
- Access to Nest.js backend

### 🐳 Docker Deployment (Recommended)

1. **Clone and configure:**
```bash
git clone <repository>
cd adlaan-agent
cp .env.example .env
# Edit .env with your configuration
```

2. **Start with Docker Compose:**
```bash
docker-compose up -d
```

3. **Verify deployment:**
```bash
curl http://localhost:8005/api/v2/health
```

### 🛠️ Local Development

1. **Install dependencies:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r src/requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Run the service:**
```bash
uvicorn src.main:app --reload --port 8005
```

4. **Access the service:**
- **API Docs:** http://localhost:8005/docs
- **Health Check:** http://localhost:8005/api/v2/health
- **Service Info:** http://localhost:8005/api/v2/

## 📖 API Documentation

### 🏥 Health & Status

```http
GET /api/v2/health
GET /api/v2/
GET /api/v2/agents/{agent_type}/status
```

### 📄 Document Operations

```http
POST /api/v2/documents/generate
POST /api/v2/documents/analyze
```

**Example: Generate Employment Contract**
```bash
curl -X POST "http://localhost:8005/api/v2/documents/generate?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "document_type": "employment_contract",
    "title": "Employment Agreement - John Doe",
    "parameters": {
      "employee_name": "John Doe",
      "position": "Software Developer",
      "salary": 75000,
      "start_date": "2025-01-01",
      "jurisdiction": "jordan"
    }
  }'
```

### 📋 Task Management

```http
POST /api/v2/tasks
GET  /api/v2/tasks/{task_id}
GET  /api/v2/tasks/user/{user_id}
GET  /api/v2/tasks/{task_id}/progress
POST /api/v2/tasks/{task_id}/cancel
GET  /api/v2/tasks/{task_id}/stream
```

### 🤖 Available Agent Types

| Agent Type | Description | Capabilities |
|------------|-------------|--------------|
| `legal_document_generator` | Document creation | Contracts, agreements, legal forms |
| `document_analyzer` | Document analysis | Risk assessment, compliance review |
| `document_classifier` | Document categorization | Auto-tagging, organization |

## 🛠️ Development

### 📁 Project Structure

```
src/
├── api/                    # API routes and endpoints
│   └── v2/                # API version 2
├── agents/                # AI agent implementations
├── core/                  # Core utilities and configuration
├── integrations/          # External service integrations
├── schemas/               # Pydantic models and schemas
├── services/              # Business logic services
└── main.py               # Application entry point

tests/
├── unit/                  # Unit tests
├── integration/           # Integration tests
└── conftest.py           # Test configuration

docker/
├── Dockerfile            # Docker image configuration
└── docker-compose.yml    # Multi-service deployment
```

### 🔧 Configuration

The service uses environment-based configuration with validation:

```python
# Core settings
ENVIRONMENT=development
APP_NAME=Adlaan Legal Agent
APP_VERSION=3.0.0

# API configuration
HOST=0.0.0.0
PORT=8005

# Security
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256

# Backend integration
BACKEND_URL=http://localhost:3000
BACKEND_AUTH_TOKEN=your-token
GRAPHQL_ENDPOINT=/graphql

# AI configuration
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.1

# Database
DATABASE_URL=sqlite:///./data/adlaan_agent.db

# Performance
MAX_CONCURRENT_TASKS=10
TASK_TIMEOUT_SECONDS=300
```

### 🏗️ Architecture Patterns

#### Dependency Injection
```python
from src.core.dependencies import get_container
from src.services.task_manager import TaskManagerService

def get_task_manager() -> TaskManagerService:
    container = get_container()
    return container.get(TaskManagerService)
```

#### Service Layer Pattern
```python
from src.services.base import AsyncService

class TaskManagerService(AsyncService):
    async def create_task(self, agent_type, input_data, user_id):
        # Business logic here
        pass
```

#### Error Handling
```python
from src.core.exceptions import AdlaanAgentException, create_http_exception

try:
    result = await service.process(data)
except AdlaanAgentException as e:
    raise create_http_exception(e)
```

## 🧪 Testing

### Run Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test types
pytest tests/unit/          # Unit tests only
pytest tests/integration/   # Integration tests only
```

### Test Structure

- **Unit Tests:** Test individual components in isolation
- **Integration Tests:** Test API endpoints and service integration
- **Mocking:** Comprehensive mocking of external dependencies

## 🚀 Deployment

### 🐳 Production Docker Deployment

1. **Build production image:**
```bash
docker build -t adlaan-agent:latest .
```

2. **Deploy with compose:**
```bash
# Production environment
ENVIRONMENT=production docker-compose -f docker-compose.prod.yml up -d
```

3. **Health monitoring:**
```bash
# Check service health
curl http://your-domain:8005/api/v2/health

# Monitor logs
docker-compose logs -f adlaan-agent
```

### ☸️ Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: adlaan-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: adlaan-agent
  template:
    metadata:
      labels:
        app: adlaan-agent
    spec:
      containers:
      - name: adlaan-agent
        image: adlaan-agent:latest
        ports:
        - containerPort: 8005
        env:
        - name: ENVIRONMENT
          value: "production"
        # ... other environment variables
```

### 🔒 Security Considerations

- **API Keys:** Store sensitive keys in secrets management
- **Authentication:** Implement proper JWT validation
- **CORS:** Configure appropriate CORS policies
- **Rate Limiting:** Add rate limiting for production
- **HTTPS:** Use TLS termination at load balancer

## 📊 Monitoring & Observability

### 🏥 Health Checks

- **Liveness:** `/api/v2/health`
- **Readiness:** Service dependency checks
- **Metrics:** Prometheus-compatible metrics (planned)

### 📝 Logging

Structured JSON logging with different levels:

```python
from src.core.logging import get_logger

logger = get_logger(__name__)
logger.info("Processing document", extra={
    "document_type": "contract",
    "user_id": 123
})
```

### 📈 Performance Metrics

- Task completion rates
- Response times
- Error rates
- Resource utilization

## 🤝 Contributing

### Development Workflow

1. **Fork and clone** the repository
2. **Create feature branch:** `git checkout -b feature/amazing-feature`
3. **Make changes** following code style guidelines
4. **Add tests** for new functionality
5. **Run tests:** `pytest`
6. **Submit pull request**

### Code Style

- **Python:** Follow PEP 8 with Black formatting
- **Type Hints:** Use comprehensive type annotations
- **Documentation:** Document all public APIs
- **Testing:** Maintain >90% test coverage

## 📞 Support & Resources

- **API Documentation:** http://localhost:8005/docs
- **Health Status:** http://localhost:8005/api/v2/health
- **GitHub Issues:** For bug reports and feature requests
- **Discord:** Community support channel

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ by the Adlaan Team**

*Last Updated: October 21, 2025*  
*Version: 3.0.0*
# 🤖 Adlaan Legal Agent Microservice

**Version: v2.0-beta**

An enhanced AI-powered legal document creation microservice that integrates with the Adlaan Nest.js backend and Next.js frontend.

## 🏗️ **Architecture Overview**

This microservice serves as the AI engine for the Adlaan legal platform:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Nest.js        │    │  FastAPI Agent  │
│   Frontend      │◄──►│   Backend        │◄──►│  Microservice   │
│                 │    │  (GraphQL API)   │    │  (This Service) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## ✨ **Key Features**

### 🔗 **Backend Integration**
- **GraphQL Communication** - Connects to Nest.js backend via GraphQL
- **Task Management** - Creates and tracks agent tasks in the database
- **Document Storage** - Saves generated documents to the main system
- **User Authentication** - Integrates with JWT-based auth system

### 🤖 **AI Capabilities**
- **Legal Document Generation** - Advanced AI-powered document creation
- **Document Analysis** - Intelligent document review and insights
- **Multi-Agent System** - Specialized agents for different tasks
- **LangGraph Workflows** - Complex reasoning and planning capabilities

### 🚀 **Performance**
- **Async Processing** - Non-blocking background task execution
- **Streaming Responses** - Real-time progress updates
- **Health Monitoring** - Built-in health checks and metrics
- **Error Handling** - Comprehensive error tracking and recovery

## 📋 **API Endpoints**

### **New V2 Endpoints (Backend Integration)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/generate-document` | Generate legal document |
| `POST` | `/api/v2/analyze-document` | Analyze existing document |
| `GET` | `/api/v2/tasks/{task_id}` | Get task status |
| `GET` | `/api/v2/users/{user_id}/tasks` | Get user's tasks |
| `GET` | `/api/v2/health` | Service health check |

### **Legacy Endpoints (Backward Compatibility)**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/chat` | Chat interface |
| `POST` | `/api/chat` | Legacy chat API |
| `GET` | `/workspace` | Professional workspace |
| `GET` | `/debug` | Debug interface |

## 🔧 **Setup and Installation**

### **1. Environment Setup**

```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### **2. Configuration**

Copy and configure environment variables:

```bash
cp .env.example .env
```

Required variables:
```env
# Backend Integration
BACKEND_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key

# Optional
BACKEND_AUTH_TOKEN=your_service_token
LEXIS_API_KEY=your_lexis_api_key
JUSTIA_API_KEY=your_justia_api_key
```

### **3. Start the Service**

```bash
# Development mode
python main.py --host 0.0.0.0 --port 8005

# Or with uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8005 --reload
```

## 📝 **Usage Examples**

### **Document Generation**

```python
import requests

response = requests.post("http://localhost:8005/api/v2/generate-document", 
    json={
        "documentType": "CONTRACT",
        "title": "Service Agreement",
        "parameters": {
            "clientName": "Acme Corp",
            "serviceDescription": "Legal consulting services",
            "duration": "12 months",
            "paymentTerms": "Net 30 days"
        },
        "caseId": 123
    },
    headers={"Authorization": "Bearer your_jwt_token"}
)

print(response.json())
# Output: {"taskId": 456, "status": "processing", "message": "Document generation started"}
```

### **Task Status Check**

```python
response = requests.get("http://localhost:8005/api/v2/tasks/456",
    headers={"Authorization": "Bearer your_jwt_token"}
)

print(response.json())
# Output: {"taskId": 456, "status": "completed", "output": {...}}
```

### **Document Analysis**

```python
response = requests.post("http://localhost:8005/api/v2/analyze-document",
    json={
        "documentId": 789,
        "analysisType": "contract_review",
        "caseId": 123
    },
    headers={"Authorization": "Bearer your_jwt_token"}
)
```

## 🔗 **Integration with Backend**

### **GraphQL Operations**

The service integrates with the Nest.js backend using these GraphQL operations:

```graphql
# Create Agent Task
mutation CreateAgentTask($input: CreateAgentTaskInput!) {
    createAgentTask(input: $input) {
        id
        type
        status
        createdAt
    }
}

# Update Task Status
mutation UpdateAgentTask($id: Int!, $input: UpdateAgentTaskInput!) {
    updateAgentTask(id: $id, input: $input) {
        id
        status
        output
        completedAt
    }
}

# Create Document
mutation CreateDocument($input: CreateDocumentInput!) {
    createDocument(input: $input) {
        id
        title
        content
        documentType
    }
}
```

### **Backend Service Communication**

```python
from integration.backend_service import BackendIntegrationService

async with BackendIntegrationService() as service:
    # Create task
    task = await service.create_agent_task(
        agent_type=AgentType.LEGAL_DOCUMENT_GENERATOR,
        task_input={"documentType": "CONTRACT", "title": "Agreement"},
        user_id=123
    )
    
    # Update status
    await service.update_task_status(
        task.id, 
        TaskStatus.COMPLETED, 
        output="Generated document content"
    )
```

## 🧪 **Testing**

### **Health Check**

```bash
curl http://localhost:8005/api/v2/health
```

### **Service Status**

```bash
curl http://localhost:8005/
```

### **API Documentation**

Visit: http://localhost:8005/docs

## 🏢 **Architecture Details**

### **Service Integration Flow**

1. **Frontend Request** → Next.js sends request to Nest.js backend
2. **Backend Processing** → Nest.js creates agent task via GraphQL
3. **Agent Execution** → This microservice processes the AI task
4. **Result Storage** → Generated content saved to backend database
5. **Status Updates** → Real-time progress tracking via GraphQL

### **Agent Types**

| Agent Type | Description | Capabilities |
|------------|-------------|--------------|
| `LEGAL_DOCUMENT_GENERATOR` | Document creation | Contracts, agreements, legal forms |
| `DOCUMENT_ANALYZER` | Document analysis | Risk assessment, compliance review |
| `DOCUMENT_CLASSIFIER` | Document categorization | Auto-tagging, organization |

### **Task Lifecycle**

```
PENDING → PROCESSING → COMPLETED/FAILED
    ↓         ↓             ↓
  Created   Agent         Result
   Task     Active        Stored
```

## 🔧 **Configuration Options**

### **Agent Configuration**

```python
# Enhanced Intelligence
intelligence_mode = "production"  # or "development"
enhanced_intelligence = create_enhanced_agent(
    knowledge_db_path="legal_knowledge.db",
    lexis_api_key=os.getenv("LEXIS_API_KEY"),
    justia_api_key=os.getenv("JUSTIA_API_KEY")
)

# Agent Setup
agent = Agent(use_checkpointing=False)  # Microservice mode
enhanced_service = EnhancedAgentService(agent)
```

### **Backend Integration**

```python
backend_service = BackendIntegrationService(
    backend_url="http://localhost:3000",
    auth_token="service_auth_token"
)
```

## 📊 **Monitoring and Logging**

### **Health Metrics**

```json
{
    "status": "healthy",
    "agent": "ready",
    "backend": "connected",
    "activeTasks": 3,
    "timestamp": "2025-10-20T15:30:00Z"
}
```

### **Task Monitoring**

- Real-time task status tracking
- Error logging and recovery
- Performance metrics collection
- Background task management

## 🚀 **Deployment**

### **Docker Deployment**

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8005
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]
```

### **Environment Variables**

```bash
# Production configuration
BACKEND_URL=https://api.adlaan.com
OPENAI_API_KEY=sk-prod-key
DEBUG=false
LOG_LEVEL=INFO
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📚 **Related Documentation**

- [Nest.js Backend Documentation](../adlaan-backend/README.md)
- [Next.js Frontend Documentation](../adlaan-front/README.md)
- [GraphQL Schema Reference](../docs/graphql-schema.md)
- [API Integration Guide](../docs/api-integration.md)

## 📞 **Support**

- **Service Status**: http://localhost:8005/api/v2/health
- **API Docs**: http://localhost:8005/docs
- **Debug Interface**: http://localhost:8005/debug

---

**Status**: ✅ Production Ready  
**Last Updated**: October 20, 2025  
**Version**: 2.0-beta
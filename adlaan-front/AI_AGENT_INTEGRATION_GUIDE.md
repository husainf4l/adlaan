# 🤖 Adlaan AI Agents Frontend Integration

This document explains how the frontend connects with Adlaan AI agents using a comprehensive API architecture.

## 🏗️ Architecture Overview

The frontend integrates with Adlaan agents through multiple layers:

1. **GraphQL Proxy** - Primary API gateway
2. **Direct Agent APIs** - Specific agent endpoints  
3. **Real-time Updates** - Server-Sent Events (SSE)
4. **Service Layer** - Abstracted API calls with error handling
5. **Component Layer** - React components with state management

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Apps    │───▶│  Service Layer  │───▶│  API Routes     │
│                 │    │                 │    │                 │
│ - Components    │    │ - aiAgentService│    │ - /api/graphql  │
│ - Hooks         │    │ - Error Handler │    │ - /api/agents/* │
│ - State Mgmt    │    │ - Retry Logic   │    │ - /api/agents/  │
└─────────────────┘    └─────────────────┘    │   stream        │
                                              └─────────────────┘
                                                       │
                                              ┌─────────────────┐
                                              │ Adlaan Backend  │
                                              │                 │
                                              │ http://adlaan.  │
                                              │ com/api/...     │
                                              └─────────────────┘
```

## 🚀 Quick Start

### 1. Environment Configuration

Create/update `.env.local`:

```bash
# Backend endpoints
NEXT_PUBLIC_GRAPHQL_URL=http://adlaan.com/api/graphql
ADLAAN_AGENT_URL=http://adlaan.com/api

# Feature flags
NEXT_PUBLIC_ENABLE_AI_AGENTS=true
NEXT_PUBLIC_ENABLE_REALTIME=true
```

### 2. Basic Agent Usage

```typescript
import { aiAgentService } from '@/lib/ai-agent-service';
import { AgentType } from '@/lib/ai-types';

// Execute an agent task
const result = await aiAgentService.executeAgentTask(
  AgentType.DOCUMENT_GENERATOR,
  'generate',
  { templateId: 'contract-template', fields: { title: 'NDA' } }
);

// Check task status
const status = await aiAgentService.getTaskStatus(result.taskId);
```

### 3. Component Integration

```tsx
import { useAgentErrorHandling } from '@/lib/use-agent-error-handling';

function MyComponent() {
  const { executeWithErrorHandling, errorState, loadingState } = useAgentErrorHandling();
  
  const handleAction = () => {
    executeWithErrorHandling(
      () => aiAgentService.executeAgentTask(AgentType.DOCUMENT_ANALYZER, 'analyze', data),
      {
        operationName: 'Document Analysis',
        context: 'MyComponent',
        onSuccess: (result) => console.log('Success:', result),
        onError: (error) => console.error('Failed:', error)
      }
    );
  };

  return (
    <div>
      {errorState.hasError && <ErrorDisplay error={errorState.error} />}
      {loadingState.isLoading && <LoadingSpinner />}
      <button onClick={handleAction}>Analyze Document</button>
    </div>
  );
}
```

## 📡 API Endpoints

### GraphQL Proxy (`/api/graphql`)
- **Purpose**: Primary gateway for GraphQL operations
- **Target**: `http://adlaan.com/api/graphql`
- **Features**: Authentication forwarding, CORS handling, timeout management

### Agent APIs (`/api/agents/[agentType]`)
- **Purpose**: Direct agent communication
- **Methods**: `POST` (execute tasks), `GET` (query status)
- **Agents**: `documentGenerator`, `documentAnalyzer`, `documentClassifier`, etc.

**Example Request:**
```javascript
POST /api/agents/documentGenerator
{
  "action": "generate",
  "payload": {
    "templateId": "legal-contract",
    "fields": { "clientName": "ACME Corp" }
  }
}
```

**Example Response:**
```javascript
{
  "success": true,
  "taskId": "task_abc123",
  "data": {
    "status": "PENDING",
    "estimatedTime": "30s"
  }
}
```

### System Status (`/api/agents/status`)
- **Purpose**: Agent health monitoring
- **Methods**: `GET` (status), `POST` (control actions)

### Real-time Stream (`/api/agents/stream`)
- **Purpose**: Server-Sent Events for live updates
- **Events**: `task_update`, `agent_status`, `system_health`

## 🛠️ Service Layer

### `aiAgentService`
Primary service for agent interactions:

```typescript
// Agent management
await aiAgentService.startAgent(AgentType.DOCUMENT_GENERATOR);
await aiAgentService.stopAgent(AgentType.DOCUMENT_ANALYZER);
await aiAgentService.getAgentStatus();

// Task execution
const task = await aiAgentService.executeAgentTask(agentType, action, payload);
const status = await aiAgentService.getTaskStatus(taskId);

// Bulk operations
await aiAgentService.bulkProcessDocuments({
  agentType: AgentType.DOCUMENT_CLASSIFIER,
  documentIds: ['doc1', 'doc2'],
  priority: 'high'
});

// Configuration
await aiAgentService.updateAgentConfiguration(agentType, config);
```

### `agentRealtimeService`
Real-time updates service:

```typescript
// Connect to real-time stream
agentRealtimeService.connect();

// Subscribe to events
const unsubscribe = agentRealtimeService.subscribe('task_update', (data) => {
  console.log('Task updated:', data);
});

// Cleanup
agentRealtimeService.disconnect();
```

## 🔧 Error Handling

### `useAgentErrorHandling` Hook

Comprehensive error handling with retry logic:

```typescript
const {
  errorState,
  loadingState,
  executeWithErrorHandling,
  logger,
  isRetryable,
  getRecommendedAction
} = useAgentErrorHandling();
```

**Features:**
- Automatic retry with exponential backoff
- Error classification and severity assessment
- Detailed logging with export capability
- User-friendly error messages and recommendations

### Error Types

```typescript
// Custom error classes
AgentError - General agent errors
AgentTimeoutError - Request timeout errors

// Error severity levels
'low' | 'medium' | 'high' | 'critical'
```

## 🔄 Real-time Updates

### Event Types

```typescript
interface StreamMessage {
  type: 'task_update' | 'agent_status' | 'system_health' | 'error';
  data: any;
  timestamp: string;
  userId?: string;
}
```

### Usage Example

```typescript
// Subscribe to task updates
agentRealtimeService.subscribe('task_update', (message) => {
  if (message.data.taskId === currentTaskId) {
    updateTaskProgress(message.data.progress);
  }
});

// Subscribe to agent status changes
agentRealtimeService.subscribe('agent_status', (message) => {
  updateAgentStatus(message.data);
});
```

## 🎛️ Agent Configuration

### Configuration Component

Access via: `/dashboard/ai/configuration`

**Features:**
- Real-time agent status monitoring
- Start/stop/restart agent controls
- Configuration management
- System health dashboard
- Connectivity testing

### Agent Status Monitoring

```typescript
interface AgentStatusInfo {
  agentType: AgentType;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'ERROR';
  activeTasks: number;
  completedTasks: number;
  errorCount: number;
  uptime?: number;
}
```

## 📊 Available Agents

### 1. Document Generator
- **Type**: `DOCUMENT_GENERATOR`
- **Purpose**: Generate legal documents from templates
- **Actions**: `generate`, `preview`, `export`

### 2. Document Analyzer  
- **Type**: `DOCUMENT_ANALYZER`
- **Purpose**: Analyze documents for risks and insights
- **Actions**: `analyze`, `extract_entities`, `classify_risk`

### 3. Document Classifier
- **Type**: `DOCUMENT_CLASSIFIER`  
- **Purpose**: Categorize and organize documents
- **Actions**: `classify`, `batch_classify`, `suggest_categories`

### 4. Legal Assistant
- **Type**: `LEGAL_ASSISTANT`
- **Purpose**: Legal research and question answering
- **Actions**: `research`, `answer_question`, `cite_sources`

### 5. Contract Reviewer
- **Type**: `CONTRACT_REVIEWER`
- **Purpose**: Review contracts for compliance and risks
- **Actions**: `review`, `compare_versions`, `suggest_improvements`

### 6. Task Manager
- **Type**: `TASK_MANAGER`
- **Purpose**: Coordinate and manage agent tasks
- **Actions**: `schedule`, `prioritize`, `monitor`

## 🔐 Authentication

All API requests require authentication via JWT Bearer token:

```typescript
// Token is automatically included from localStorage
headers: {
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
}
```

## 📝 GraphQL Operations

### Core Queries

```graphql
# Get agent status
query GetAgentStatus($agentType: AgentType) {
  agentStatus(agentType: $agentType) {
    agentType
    status
    activeTasks
    completedTasks
  }
}

# Get task details
query GetTask($id: String!) {
  task(id: $id) {
    id
    status
    progress
    result
    error
  }
}
```

### Core Mutations

```graphql
# Generate document
mutation GenerateDocument($input: GenerateDocumentInput!) {
  generateDocument(input: $input) {
    taskId
    status
    message
  }
}

# Control agent
mutation StartAgent($agentType: AgentType!) {
  startAgent(agentType: $agentType) {
    success
    message
  }
}
```

## 🧪 Testing Connectivity

### Manual Testing

1. **Access Configuration Page**: Navigate to `/dashboard/ai/configuration`
2. **Test Connection**: Click "Test Connection" button
3. **Check Agent Status**: View real-time agent status
4. **Monitor Logs**: Watch real-time updates

### Programmatic Testing

```typescript
// Test basic connectivity
try {
  const health = await aiAgentService.getHealthCheck();
  console.log('System health:', health.systemHealth);
} catch (error) {
  console.error('Connection failed:', error);
}

// Test specific agent
try {
  const status = await aiAgentService.getAgentStatus(AgentType.DOCUMENT_GENERATOR);
  console.log('Agent status:', status);
} catch (error) {
  console.error('Agent unreachable:', error);
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check `.env.local` configuration
   - Verify backend URL accessibility
   - Check authentication token validity

2. **Agent Not Responding**
   - Check agent status in configuration panel
   - Try restarting agent
   - Review error logs

3. **Real-time Updates Not Working**
   - Check SSE connection in browser dev tools
   - Verify authentication
   - Check for network firewalls blocking SSE

### Debug Logging

```typescript
// Enable detailed logging
const { logger } = useAgentErrorHandling();

logger.log('debug', 'Custom debug message', 'MyComponent', {
  customData: 'value'
});

// Export logs for analysis
const { exportLogs } = useAgentErrorHandling();
exportLogs(); // Downloads JSON file
```

## 🚀 Deployment Considerations

### Environment Variables

```bash
# Production
NEXT_PUBLIC_GRAPHQL_URL=https://adlaan.com/api/graphql
ADLAAN_AGENT_URL=https://adlaan.com/api

# Development  
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/api/graphql
ADLAAN_AGENT_URL=http://localhost:8000/api
```

### Performance Optimization

1. **Connection Pooling**: Reuse HTTP connections
2. **Request Batching**: Combine multiple requests
3. **Caching**: Cache agent status and capabilities
4. **Real-time Optimization**: Only subscribe to needed events

### Security

1. **Authentication**: All requests require valid JWT
2. **Rate Limiting**: Implemented on backend
3. **Input Validation**: Validate all user inputs
4. **Error Sanitization**: Don't expose sensitive error details

---

## 📚 Further Reading

- [AI Agents Status Documentation](./AI_AGENTS_STATUS.md)
- [Agent Customization Guide](./ADLAAN_AGENT_CUSTOMIZATION.md)
- [GraphQL Schema Documentation](./api-docs/graphql-schema.md)

For support, contact the development team or check the configuration panel for real-time system status.
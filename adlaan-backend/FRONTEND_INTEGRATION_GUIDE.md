# 🚀 Adlaan AI Agents - Frontend Integration Guide

## 📋 GraphQL API Overview

**Base URL:** `http://localhost:4001/api/graphql`
**Authentication:** JWT Bearer token required in headers

## 🔐 Authentication Setup

### 1. Get Authentication Token
```bash
# Login to get JWT token
curl -X POST http://localhost:4001/api/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { token user { id email role } } }",
    "variables": {
      "input": {
        "email": "admin@example.com",
        "password": "your_password"
      }
    }
  }'
```

### 2. Use Token in Subsequent Requests
```bash
# Set your token as environment variable
export JWT_TOKEN="your_jwt_token_here"

# Test authenticated request
curl -X POST http://localhost:4001/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "query { getAllAgentTasks { id type status createdAt } }"
  }'
```

## 🤖 AI Agent Testing Examples

### 🔥 **1. Legal Document Generator**

#### Generate a Contract
```bash
curl -X POST http://localhost:4001/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "mutation GenerateDocument($input: GenerateLegalDocumentInput!) { generateLegalDocument(input: $input) { id type status metadata } }",
    "variables": {
      "input": {
        "documentType": "CONTRACT",
        "title": "Service Agreement",
        "description": "Professional services contract",
        "parameters": "{\"clientName\":\"John Doe\",\"startDate\":\"2024-01-01\",\"endDate\":\"2024-12-31\",\"paymentTerms\":\"Net 30\",\"scopeOfWork\":\"Web development services\"}"
      }
    }
  }'
```

#### Check Generation Status
```bash
curl -X POST http://localhost:4001/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "query GetGenerationTasks { getGenerationTasks { id status output document { id title content } } }"
  }'
```

### 📊 **2. Document Analyzer**

#### Analyze a Document
```bash
curl -X POST http://localhost:4001/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "mutation AnalyzeDocument($input: AnalyzeDocumentInput!) { analyzeDocument(input: $input) { id type status metadata } }",
    "variables": {
      "input": {
        "documentId": 1,
        "analysisType": "full_analysis"
      }
    }
  }'
```

#### Get Analysis Results
```bash
curl -X POST http://localhost:4001/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "query GetAnalysisTasks { getAnalysisTasks { id status output document { title aiSummary aiMetadata } } }"
  }'
```

### 🏷️ **3. Document Classifier**

#### Classify Documents
```bash
curl -X POST http://localhost:4001/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "mutation ClassifyDocuments($input: ClassifyDocumentsInput!) { classifyDocuments(input: $input) { id type status metadata } }",
    "variables": {
      "input": {
        "includeUnclassified": true,
        "forceReclassify": false
      }
    }
  }'
```

#### Get Classification Summary
```bash
curl -X POST http://localhost:4001/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "query": "query GetClassificationSummary { getClassificationSummary }"
  }'
```

## 🎨 Frontend Development Hints

### **React Component Structure**
```typescript
// Dashboard structure suggestion
src/
├── components/
│   ├── ai-agents/
│   │   ├── DocumentGenerator.tsx
│   │   ├── DocumentAnalyzer.tsx
│   │   ├── DocumentClassifier.tsx
│   │   └── TaskMonitor.tsx
│   ├── common/
│   │   ├── LoadingSpinner.tsx
│   │   ├── StatusBadge.tsx
│   │   └── FileUpload.tsx
│   └── dashboard/
│       ├── AgentCards.tsx
│       └── TaskHistory.tsx
├── hooks/
│   ├── useAgentTasks.ts
│   ├── useDocumentGeneration.ts
│   └── useGraphQLPolling.ts
├── types/
│   └── graphql.ts
└── lib/
    └── apollo-client.ts
```

### **Apollo Client Setup**
```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4001/api/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('jwt_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

### **Document Generator Form Example**
```typescript
const DocumentGeneratorForm = () => {
  const [documentType, setDocumentType] = useState('CONTRACT');
  const [parameters, setParameters] = useState({});
  
  const [generateDocument] = useMutation(GENERATE_DOCUMENT_MUTATION);
  
  const handleSubmit = async (data) => {
    try {
      const result = await generateDocument({
        variables: {
          input: {
            documentType: data.documentType,
            title: data.title,
            description: data.description,
            parameters: JSON.stringify(data.parameters),
            caseId: data.caseId
          }
        }
      });
      
      // Poll for completion
      pollTaskStatus(result.data.generateLegalDocument.id);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };
};
```

### **Real-time Task Monitoring**
```typescript
const useTaskPolling = (taskId: string) => {
  const { data, startPolling, stopPolling } = useQuery(GET_AGENT_TASK, {
    variables: { taskId },
    pollInterval: 2000, // Poll every 2 seconds
  });
  
  useEffect(() => {
    if (data?.getAgentTask?.status === 'COMPLETED' || 
        data?.getAgentTask?.status === 'FAILED') {
      stopPolling();
    }
  }, [data, stopPolling]);
  
  return data?.getAgentTask;
};
```

## 🎯 Key GraphQL Queries for Frontend

### **Essential Queries**
```graphql
# Get all agent tasks
query GetAllAgentTasks {
  getAllAgentTasks {
    id
    type
    status
    createdAt
    completedAt
    output
    errorMessage
    document {
      id
      title
      content
    }
  }
}

# Get documents with AI metadata
query GetDocumentsWithAI {
  # You'll need to add this query to your document resolver
  documents {
    id
    title
    documentType
    isAiGenerated
    aiSummary
    aiClassification
    aiConfidenceScore
    aiMetadata
  }
}
```

## 🔄 Development Workflow

### **1. Test Backend First**
```bash
# Always test with cURL before frontend development
curl -X POST http://localhost:4001/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"query":"query{getAllAgentTasks{id type status}}"}'
```

### **2. Generate TypeScript Types**
```bash
# Use GraphQL Code Generator
npm install --save-dev @graphql-codegen/cli
npx graphql-codegen init
```

### **3. Implement Error Handling**
```typescript
const ErrorBoundary = ({ children }) => {
  return (
    <ApolloProvider client={client}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </ApolloProvider>
  );
};
```

### **4. Add Loading States**
```typescript
const DocumentGenerator = () => {
  const { loading, error, data } = useQuery(GET_GENERATION_TASKS);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <GeneratorForm tasks={data.getGenerationTasks} />;
};
```

## 🎨 UI/UX Recommendations

### **Dashboard Cards**
- **Document Generator**: Green theme, document icon, "Generate New" button
- **Document Analyzer**: Blue theme, magnifier icon, "Analyze Document" button  
- **Document Classifier**: Purple theme, tags icon, "Classify All" button

### **Status Indicators**
- **PENDING**: Yellow spinner
- **PROCESSING**: Blue animated spinner
- **COMPLETED**: Green checkmark
- **FAILED**: Red X with error details

### **Results Display**
- **Generated Documents**: Rich text editor with download options
- **Analysis Results**: Expandable sections with charts and highlights
- **Classification**: Tag clouds with confidence scores

## 🔧 Testing Checklist

- [ ] Authentication flow works
- [ ] Document generation creates tasks
- [ ] Analysis processes documents correctly
- [ ] Classification updates document metadata
- [ ] Real-time status updates work
- [ ] Error handling displays properly
- [ ] File uploads work (for future document uploads)
- [ ] Responsive design on mobile
- [ ] Loading states are smooth
- [ ] Results are properly formatted

This guide provides everything you need to safely test the backend and build a robust frontend integration!
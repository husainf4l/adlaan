# 🎨 Frontend Development Prompt for Adlaan AI Agents Dashboard

## 🎯 Project Overview
Build a modern, professional legal practice management dashboard with three AI agents. The backend provides GraphQL API for document generation, analysis, and classification.

## 🏗️ Technology Stack
- **Framework**: React 18+ with TypeScript
- **GraphQL Client**: Apollo Client
- **UI Library**: shadcn/ui + Tailwind CSS (recommended) or Material-UI
- **Routing**: React Router v6
- **State Management**: Apollo Client cache + React Context for UI state
- **File Upload**: React Dropzone
- **Icons**: Lucide React or Heroicons
- **Charts**: Recharts or Chart.js for analytics

## 🤖 Core Features to Implement

### 1. **AI Agents Dashboard**
```typescript
// Main dashboard with three agent cards
interface AgentCard {
  id: string;
  title: "Document Generator" | "Document Analyzer" | "Document Classifier";
  description: string;
  icon: React.ComponentType;
  color: "green" | "blue" | "purple";
  stats: {
    totalTasks: number;
    completedToday: number;
    successRate: number;
  };
  actions: Array<{
    label: string;
    onClick: () => void;
  }>;
}
```

### 2. **Document Generator Interface**
```typescript
interface DocumentGeneratorProps {
  documentTypes: LegalDocumentType[];
  onGenerate: (input: GenerateLegalDocumentInput) => Promise<void>;
  onPreview: (taskId: string) => void;
}

// Dynamic form based on document type
const DocumentTypeFields = {
  CONTRACT: ["clientName", "startDate", "endDate", "paymentTerms", "scopeOfWork"],
  LEASE: ["landlordName", "tenantName", "propertyAddress", "monthlyRent", "leaseTerm"],
  NDA: ["disclosingParty", "receivingParty", "confidentialityPeriod"],
  // ... other types
};
```

### 3. **Document Analyzer Interface**
```typescript
interface DocumentAnalyzerProps {
  documents: Document[];
  analysisTypes: ["summary", "full_analysis", "legal_review", "compliance_check"];
  onAnalyze: (documentId: number, analysisType: string) => Promise<void>;
  onViewResults: (taskId: string) => void;
}

// Results display component
interface AnalysisResultsProps {
  analysis: {
    summary: string;
    keyPoints: Array<{ category: string; text: string; importance: number }>;
    compliance: { score: number; items: ComplianceItem[] };
    recommendations: string[];
  };
}
```

### 4. **Document Classifier Interface**
```typescript
interface DocumentClassifierProps {
  onClassifyAll: () => Promise<void>;
  onClassifyCase: (caseId: number) => Promise<void>;
  onClassifySelected: (documentIds: number[]) => Promise<void>;
  onViewSummary: () => void;
}

// Classification results
interface ClassificationSummary {
  totalDocuments: number;
  classifiedDocuments: number;
  unclassifiedDocuments: number;
  classificationBreakdown: Record<string, number>;
  averageConfidence: number;
}
```

## 🎨 UI/UX Design Guidelines

### **Color Scheme**
- **Document Generator**: Emerald/Green theme (`emerald-500`, `emerald-50`)
- **Document Analyzer**: Blue theme (`blue-500`, `blue-50`)
- **Document Classifier**: Purple theme (`purple-500`, `purple-50`)
- **Success**: Green (`green-500`)
- **Warning**: Amber (`amber-500`)
- **Error**: Red (`red-500`)

### **Agent Status Indicators**
```typescript
const StatusBadge = ({ status }: { status: AgentTaskStatus }) => {
  const variants = {
    PENDING: { color: "amber", icon: Clock, animation: "pulse" },
    PROCESSING: { color: "blue", icon: Loader2, animation: "spin" },
    COMPLETED: { color: "green", icon: CheckCircle, animation: null },
    FAILED: { color: "red", icon: XCircle, animation: null },
  };
  
  return (
    <Badge variant={variants[status].color} className={variants[status].animation}>
      <variants[status].icon className="w-4 h-4 mr-1" />
      {status}
    </Badge>
  );
};
```

### **Loading States**
```typescript
const LoadingCard = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </CardContent>
  </Card>
);
```

## 🔗 GraphQL Integration Examples

### **Apollo Client Hooks**
```typescript
// Custom hooks for each agent
export const useDocumentGeneration = () => {
  const [generateDocument] = useMutation(GENERATE_DOCUMENT_MUTATION);
  const { data: tasks, loading, refetch } = useQuery(GET_GENERATION_TASKS);
  
  const generate = async (input: GenerateLegalDocumentInput) => {
    const result = await generateDocument({ variables: { input } });
    await refetch(); // Refresh tasks list
    return result.data.generateLegalDocument;
  };
  
  return { generate, tasks: tasks?.getGenerationTasks || [], loading, refetch };
};

export const useTaskPolling = (taskId: string) => {
  const { data, startPolling, stopPolling } = useQuery(GET_AGENT_TASK, {
    variables: { taskId },
    pollInterval: 2000,
    skip: !taskId,
  });
  
  useEffect(() => {
    if (data?.getAgentTask?.status === 'COMPLETED' || 
        data?.getAgentTask?.status === 'FAILED') {
      stopPolling();
    }
  }, [data, stopPolling]);
  
  return { task: data?.getAgentTask, startPolling, stopPolling };
};
```

### **GraphQL Queries & Mutations**
```typescript
export const GENERATE_DOCUMENT_MUTATION = gql`
  mutation GenerateDocument($input: GenerateLegalDocumentInput!) {
    generateLegalDocument(input: $input) {
      id
      type
      status
      metadata
      createdAt
    }
  }
`;

export const GET_ALL_AGENT_TASKS = gql`
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
`;
```

## 📱 Component Structure

### **Main Dashboard Layout**
```typescript
const Dashboard = () => {
  const { data: tasks } = useQuery(GET_ALL_AGENT_TASKS);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AgentCard agent="generator" />
          <AgentCard agent="analyzer" />
          <AgentCard agent="classifier" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTasks tasks={tasks?.getAllAgentTasks || []} />
          <AgentStats />
        </div>
      </main>
    </div>
  );
};
```

### **Agent Card Component**
```typescript
const AgentCard = ({ agent }: { agent: 'generator' | 'analyzer' | 'classifier' }) => {
  const config = {
    generator: {
      title: "Document Generator",
      description: "Create legal documents with AI templates",
      icon: FileText,
      color: "emerald",
      href: "/generator"
    },
    analyzer: {
      title: "Document Analyzer", 
      description: "Analyze documents for insights and compliance",
      icon: Search,
      color: "blue",
      href: "/analyzer"
    },
    classifier: {
      title: "Document Classifier",
      description: "Automatically categorize and organize documents",
      icon: Tags,
      color: "purple", 
      href: "/classifier"
    }
  }[agent];
  
  return (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer border-${config.color}-200`}>
      <CardHeader className={`bg-${config.color}-50`}>
        <div className="flex items-center space-x-3">
          <config.icon className={`w-8 h-8 text-${config.color}-600`} />
          <div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Recent activity
          </div>
          <Button size="sm" className={`bg-${config.color}-600`}>
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

## 🎯 Key Implementation Steps

### **1. Setup & Configuration**
```bash
npx create-react-app adlaan-dashboard --template typescript
cd adlaan-dashboard
npm install @apollo/client graphql
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge
npm install lucide-react react-router-dom react-hook-form
npm install @hookform/resolvers zod
```

### **2. Apollo Client Configuration**
```typescript
// lib/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4001/api/graphql',
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

### **3. Error Handling**
```typescript
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = React.useState(false);
  
  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              There was an error loading the application.
            </p>
            <Button onClick={() => setHasError(false)}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return <>{children}</>;
};
```

### **4. Real-time Updates**
```typescript
const useRealTimeUpdates = () => {
  const { refetch } = useQuery(GET_ALL_AGENT_TASKS);
  
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000); // Refetch every 5 seconds
    
    return () => clearInterval(interval);
  }, [refetch]);
};
```

## 🚀 Development Best Practices

### **Performance Optimization**
- Use `React.memo()` for expensive components
- Implement virtual scrolling for large task lists
- Lazy load agent pages with `React.lazy()`
- Use Apollo Client caching effectively

### **Accessibility**
- Add proper ARIA labels
- Implement keyboard navigation
- Use semantic HTML elements
- Provide screen reader friendly status updates

### **Testing Strategy**
- Unit tests for utilities and hooks
- Integration tests for GraphQL operations
- E2E tests for critical user flows
- Mock GraphQL responses for testing

### **Error Recovery**
- Implement retry mechanisms for failed requests
- Show helpful error messages
- Provide fallback UI states
- Log errors for debugging

## 🎨 Example Screens

### **Document Generator Screen**
1. Document type selector (cards or dropdown)
2. Dynamic form based on selected type
3. Real-time validation
4. Preview mode before generation
5. Progress indicator during generation
6. Results display with edit capability

### **Document Analyzer Screen**
1. Document selection (from existing documents)
2. Analysis type selection
3. Progress indicator
4. Tabbed results display (Summary, Details, Compliance)
5. Export functionality
6. History of previous analyses

### **Document Classifier Screen**
1. Batch operation controls
2. Filter options (unclassified, by case, etc.)
3. Classification progress
4. Results summary with charts
5. Manual override capabilities
6. Classification confidence indicators

This comprehensive guide provides everything needed to build a professional, user-friendly AI agents dashboard for your legal practice management system!
# AI Legal Agents Dashboard

This dashboard provides access to three AI-powered legal tools for the Adlaan legal practice management system.

## Features

### 1. AI Agents Overview (`/dashboard/ai`)
- Main dashboard showing all available AI agents
- Real-time task statistics and status
- Quick access cards for each agent
- System health and performance metrics

### 2. Legal Document Generator (`/dashboard/ai/document-generator`)
- Template-based document creation
- Dynamic form fields based on document type
- Real-time generation progress tracking
- Document preview and download
- Supports contracts, agreements, legal briefs, and more

### 3. Document Analyzer (`/dashboard/ai/document-analyzer`)
- Upload documents for AI analysis
- Extract key insights, risks, and recommendations
- Entity recognition (people, dates, amounts, organizations)
- Multiple analysis types: general, legal, contract, compliance
- Confidence scoring and detailed breakdowns

### 4. Document Classifier (`/dashboard/ai/document-classifier`)
- Batch document categorization
- Custom category filtering
- Confidence-based classification results
- Automatic organization and tagging
- Support for various document types

### 5. Task Management (`/dashboard/ai/tasks`)
- Real-time task status monitoring
- Progress tracking for all AI operations
- Task history and analytics
- Error handling and retry mechanisms
- Detailed task metadata and results

### 6. Generated Documents Library (`/dashboard/ai/generated-documents`)
- Browse all AI-generated documents
- Search and filter capabilities
- Document preview and editing
- Download in multiple formats
- Metadata and template information

## Technical Implementation

### GraphQL API
The frontend connects to the backend AI agents through GraphQL:
- **Endpoint**: `http://localhost:4001/api/graphql`
- **Authentication**: JWT Bearer token required
- **Real-time updates**: GraphQL subscriptions for task status

### Key Technologies
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **GraphQL Client**: Apollo Client with SSR support
- **Icons**: Lucide React
- **State Management**: React Context + GraphQL cache

### Components Structure
```
src/components/ai/
├── AIAgentsOverview.tsx       # Main dashboard
├── DocumentGenerator.tsx      # Document creation wizard
├── DocumentAnalyzer.tsx       # Document analysis interface
├── DocumentClassifier.tsx     # Batch classification tool
├── TaskManagement.tsx         # Task monitoring dashboard
└── GeneratedDocuments.tsx     # Document library
```

### Type Definitions
```
src/lib/
├── ai-types.ts               # TypeScript interfaces
├── graphql.ts               # GraphQL queries/mutations
└── apollo-client.ts         # Apollo Client configuration
```

## Usage

### Access the AI Dashboard
1. Navigate to `/dashboard/ai` from the main dashboard
2. Choose from available AI agents:
   - **Document Generator**: Create new documents from templates
   - **Document Analyzer**: Upload and analyze existing documents
   - **Document Classifier**: Organize documents automatically

### Generate Documents
1. Click "Launch Agent" on Document Generator card
2. Select a document template
3. Fill in the required fields
4. Click "Generate Document"
5. Monitor progress in real-time
6. Preview and download when complete

### Analyze Documents
1. Access Document Analyzer
2. Upload a document (PDF, DOC, DOCX, TXT)
3. Select analysis type
4. Click "Analyze Document"
5. Review insights, risks, and recommendations
6. Export results if needed

### Classify Documents
1. Go to Document Classifier
2. Select documents to classify
3. Optionally choose specific categories
4. Start batch classification
5. Review confidence scores and results
6. Apply classifications to organize files

### Monitor Tasks
1. Visit Task Management section
2. Filter by status or agent type
3. View real-time progress updates
4. Check detailed task information
5. Retry failed tasks if needed

## Configuration

### Environment Variables
- `NEXT_PUBLIC_GRAPHQL_ENDPOINT`: Backend GraphQL endpoint
- `NEXT_PUBLIC_WS_ENDPOINT`: WebSocket endpoint for subscriptions

### Backend Requirements
The AI agents require the following backend mutations/queries:
- `generateDocument(input: GenerateDocumentInput!)`
- `analyzeDocument(input: AnalyzeDocumentInput!)`
- `classifyDocuments(input: ClassifyDocumentsInput!)`
- `tasks(status: TaskStatus, agentType: AgentType)`
- `taskStatusUpdate(taskId: String!)` (subscription)

## Error Handling

The dashboard includes comprehensive error handling:
- Connection failures with retry logic
- Task failure notifications
- File upload validation
- Authentication error handling
- Real-time error updates

## Future Enhancements

Planned features:
- Document collaboration and editing
- Advanced search and filtering
- Custom template creation
- Integration with external legal databases
- Bulk operations and automation workflows
- Advanced analytics and reporting
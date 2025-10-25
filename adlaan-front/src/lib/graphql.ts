import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        name
        email
        role
        company {
          id
          name
        }
      }
      access_token
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        name
        email
        role
        company {
          id
          name
        }
      }
      access_token
    }
  }
`;

export const CREATE_COMPANY_MUTATION = gql`
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) {
      id
      name
      description
      address
      phone
      email
      website
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      company {
        id
        name
        description
      }
    }
  }
`;

export const COMPANIES_QUERY = gql`
  query Companies {
    companies {
      id
      name
      description
      address
      phone
      email
      website
    }
  }
`;

export const CASES_QUERY = gql`
  query Cases {
    cases {
      id
      title
      description
      status
      createdAt
      updatedAt
      client {
        id
        name
        email
      }
      assignedUsers {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_CASE_MUTATION = gql`
  mutation CreateCase($input: CreateCaseInput!) {
    createCase(input: $input) {
      id
      title
      description
      status
      createdAt
      client {
        id
        name
        email
      }
      assignedUsers {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_CASE_MUTATION = gql`
  mutation UpdateCase($id: ID!, $input: UpdateCaseInput!) {
    updateCase(id: $id, input: $input) {
      id
      title
      description
      status
      updatedAt
    }
  }
`;

export const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      company {
        id
        name
      }
      createdAt
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      company {
        id
        name
      }
      createdAt
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
      company {
        id
        name
      }
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id)
  }
`;

// Document Management Queries
export const GET_DOCUMENTS_QUERY = gql`
  query GetDocuments {
    documents {
      id
      name
      type
      size
      starred
      case
      createdAt
      updatedAt
    }
  }
`;

export const UPLOAD_DOCUMENT_MUTATION = gql`
  mutation UploadDocument($input: UploadDocumentInput!) {
    uploadDocument(input: $input) {
      id
      case
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_FOLDER_MUTATION = gql`
  mutation CreateFolder($name: String!, $parentId: String) {
    createFolder(name: $name, parentId: $parentId) {
      id
      name
      type
      parentId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_DOCUMENT_MUTATION = gql`
  mutation DeleteDocument($id: String!) {
    deleteDocument(id: $id)
  }
`;

export const UPDATE_DOCUMENT_MUTATION = gql`
  mutation UpdateDocument($id: String!, $name: String, $starred: Boolean) {
    updateDocument(id: $id, name: $name, starred: $starred) {
      id
      name
      starred
      updatedAt
    }
  }
`;

export const MOVE_DOCUMENT_MUTATION = gql`
  mutation MoveDocument($id: String!, $parentId: String) {
    moveDocument(id: $id, parentId: $parentId) {
      id
      parentId
      updatedAt
    }
  }
`;

// AI Agents GraphQL Operations

export const GET_DOCUMENT_TEMPLATES_QUERY = gql`
  query GetDocumentTemplates {
    documentTemplates {
      id
      name
      description
      category
      fields {
        name
        type
        required
        options
      }
    }
  }
`;

export const GENERATE_DOCUMENT_MUTATION = gql`
  mutation GenerateDocument($input: GenerateDocumentInput!) {
    generateDocument(input: $input) {
      taskId
      status
      message
    }
  }
`;

export const ANALYZE_DOCUMENT_MUTATION = gql`
  mutation AnalyzeDocument($input: AnalyzeDocumentInput!) {
    analyzeDocument(input: $input) {
      taskId
      status
      message
    }
  }
`;

export const CLASSIFY_DOCUMENTS_MUTATION = gql`
  mutation ClassifyDocuments($input: ClassifyDocumentsInput!) {
    classifyDocuments(input: $input) {
      taskId
      status
      message
    }
  }
`;

export const GET_TASKS_QUERY = gql`
  query GetTasks($status: TaskStatus, $agentType: AgentType) {
    tasks(status: $status, agentType: $agentType) {
      id
      agentType
      status
      progress
      result
      error
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const GET_TASK_QUERY = gql`
  query GetTask($id: String!) {
    task(id: $id) {
      id
      agentType
      status
      progress
      result
      error
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const GET_GENERATED_DOCUMENTS_QUERY = gql`
  query GetGeneratedDocuments {
    generatedDocuments {
      id
      name
      templateId
      templateName
      content
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const TASK_STATUS_SUBSCRIPTION = gql`
  subscription TaskStatusUpdate($taskId: String!) {
    taskStatusUpdate(taskId: $taskId) {
      id
      status
      progress
      result
      error
    }
  }
`;

// Enhanced AI Agent Operations

export const GET_AGENT_STATUS_QUERY = gql`
  query GetAgentStatus($agentType: AgentType) {
    agentStatus(agentType: $agentType) {
      agentType
      status
      lastUpdate
      activeTasks
      completedTasks
      errorCount
      uptime
    }
  }
`;

export const GET_AGENT_CAPABILITIES_QUERY = gql`
  query GetAgentCapabilities {
    agentCapabilities {
      agentType
      name
      description
      capabilities
      supportedFormats
      maxFileSize
      processingTime
      available
    }
  }
`;

export const START_AGENT_MUTATION = gql`
  mutation StartAgent($agentType: AgentType!) {
    startAgent(agentType: $agentType) {
      success
      message
      agentId
    }
  }
`;

export const STOP_AGENT_MUTATION = gql`
  mutation StopAgent($agentType: AgentType!) {
    stopAgent(agentType: $agentType) {
      success
      message
    }
  }
`;

export const RESTART_AGENT_MUTATION = gql`
  mutation RestartAgent($agentType: AgentType!) {
    restartAgent(agentType: $agentType) {
      success
      message
      agentId
    }
  }
`;

export const CANCEL_TASK_MUTATION = gql`
  mutation CancelTask($taskId: String!) {
    cancelTask(taskId: $taskId) {
      success
      message
    }
  }
`;

export const RETRY_TASK_MUTATION = gql`
  mutation RetryTask($taskId: String!) {
    retryTask(taskId: $taskId) {
      taskId
      status
      message
    }
  }
`;

export const GET_TASK_LOGS_QUERY = gql`
  query GetTaskLogs($taskId: String!) {
    taskLogs(taskId: $taskId) {
      id
      taskId
      level
      message
      timestamp
      metadata
    }
  }
`;

export const GET_AGENT_METRICS_QUERY = gql`
  query GetAgentMetrics($agentType: AgentType, $timeRange: String) {
    agentMetrics(agentType: $agentType, timeRange: $timeRange) {
      agentType
      totalTasks
      successfulTasks
      failedTasks
      averageProcessingTime
      throughput
      errorRate
      uptime
      timestamp
    }
  }
`;

export const CONFIGURE_AGENT_MUTATION = gql`
  mutation ConfigureAgent($agentType: AgentType!, $configuration: JSON!) {
    configureAgent(agentType: $agentType, configuration: $configuration) {
      success
      message
      configuration
    }
  }
`;

export const GET_AGENT_CONFIGURATION_QUERY = gql`
  query GetAgentConfiguration($agentType: AgentType!) {
    agentConfiguration(agentType: $agentType) {
      agentType
      configuration
      lastUpdated
      version
    }
  }
`;

export const BULK_PROCESS_DOCUMENTS_MUTATION = gql`
  mutation BulkProcessDocuments($input: BulkProcessInput!) {
    bulkProcessDocuments(input: $input) {
      batchId
      taskIds
      status
      message
    }
  }
`;

export const GET_BATCH_STATUS_QUERY = gql`
  query GetBatchStatus($batchId: String!) {
    batchStatus(batchId: $batchId) {
      batchId
      status
      progress
      totalTasks
      completedTasks
      failedTasks
      results
      createdAt
      updatedAt
    }
  }
`;

export const AGENT_HEALTH_CHECK_QUERY = gql`
  query AgentHealthCheck {
    agentHealthCheck {
      systemHealth
      agents {
        agentType
        status
        lastHeartbeat
        responseTime
        memoryUsage
        cpuUsage
        errors
      }
      timestamp
    }
  }
`;

export const RESET_AGENT_STATISTICS_MUTATION = gql`
  mutation ResetAgentStatistics($agentType: AgentType!) {
    resetAgentStatistics(agentType: $agentType) {
      success
      message
    }
  }
`;
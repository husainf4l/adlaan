import { 
  AgentType, 
  AgentStatusInfo, 
  AgentCapability, 
  AgentMetrics, 
  AgentConfiguration,
  TaskStatus,
  AgentControlResponse,
  BulkProcessInput,
  BatchStatus,
  TaskLog,
  HealthCheckResult
} from './ai-types';

// Base configuration
const API_BASE_URL = '/api/agents';
const GRAPHQL_URL = '/api/graphql';

// Retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffFactor: 2,
};

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffFactor: number;
}

// Custom error classes
export class AgentError extends Error {
  constructor(
    message: string,
    public agentType?: AgentType,
    public taskId?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class AgentTimeoutError extends AgentError {
  constructor(agentType?: AgentType, taskId?: string) {
    super('Agent request timed out', agentType, taskId, 408);
    this.name = 'AgentTimeoutError';
  }
}

// Base API service class
class BaseAPIService {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  protected async request<T>(
    url: string, 
    options: RequestInit = {},
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> {
    const { maxRetries, retryDelay, backoffFactor } = retryConfig;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: this.getAuthHeaders(),
          ...options,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new AgentError(
            errorData.message || `Request failed with status ${response.status}`,
            undefined,
            undefined,
            response.status
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on auth errors or client errors (4xx)
        if (error instanceof AgentError && error.statusCode && error.statusCode < 500) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying
        const delay = retryDelay * Math.pow(backoffFactor, attempt);
        console.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}):`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  protected async graphqlRequest<T>(query: string, variables?: any): Promise<T> {
    const response = await this.request<{ data: T; errors?: any[] }>(GRAPHQL_URL, {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    });

    if (response.errors?.length) {
      throw new AgentError(response.errors[0].message);
    }

    return response.data;
  }
}

// AI Agent Service
export class AIAgentService extends BaseAPIService {
  // Agent Status and Control
  async getAgentStatus(agentType?: AgentType): Promise<AgentStatusInfo[]> {
    const url = agentType 
      ? `${API_BASE_URL}/status?agentType=${agentType}`
      : `${API_BASE_URL}/status`;
    
    const response = await this.request<{ agents: AgentStatusInfo[] }>(url);
    return response.agents;
  }

  async startAgent(agentType: AgentType): Promise<AgentControlResponse> {
    return this.request<AgentControlResponse>(`${API_BASE_URL}/status`, {
      method: 'POST',
      body: JSON.stringify({ action: 'start', agentType }),
    });
  }

  async stopAgent(agentType: AgentType): Promise<AgentControlResponse> {
    return this.request<AgentControlResponse>(`${API_BASE_URL}/status`, {
      method: 'POST',
      body: JSON.stringify({ action: 'stop', agentType }),
    });
  }

  async restartAgent(agentType: AgentType): Promise<AgentControlResponse> {
    return this.request<AgentControlResponse>(`${API_BASE_URL}/status`, {
      method: 'POST',
      body: JSON.stringify({ action: 'restart', agentType }),
    });
  }

  // Agent Capabilities
  async getAgentCapabilities(): Promise<AgentCapability[]> {
    return this.graphqlRequest<AgentCapability[]>(`
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
    `);
  }

  // Task Management
  async executeAgentTask(
    agentType: AgentType, 
    action: string, 
    payload: any
  ): Promise<{ taskId: string; status: TaskStatus }> {
    const response = await this.request<{
      success: boolean;
      data: any;
      taskId: string;
    }>(`${API_BASE_URL}/${agentType}`, {
      method: 'POST',
      body: JSON.stringify({ action, payload }),
    });

    if (!response.success) {
      throw new AgentError(`Task execution failed: ${response.data?.message || 'Unknown error'}`, agentType);
    }

    return {
      taskId: response.taskId,
      status: TaskStatus.PENDING,
    };
  }

  async getTaskStatus(taskId: string): Promise<any> {
    return this.graphqlRequest<any>(`
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
    `, { id: taskId });
  }

  async cancelTask(taskId: string): Promise<{ success: boolean; message: string }> {
    return this.graphqlRequest<{ success: boolean; message: string }>(`
      mutation CancelTask($taskId: String!) {
        cancelTask(taskId: $taskId) {
          success
          message
        }
      }
    `, { taskId });
  }

  async retryTask(taskId: string): Promise<{ taskId: string; status: TaskStatus }> {
    return this.graphqlRequest<{ taskId: string; status: TaskStatus }>(`
      mutation RetryTask($taskId: String!) {
        retryTask(taskId: $taskId) {
          taskId
          status
          message
        }
      }
    `, { taskId });
  }

  // Bulk Operations
  async bulkProcessDocuments(input: BulkProcessInput): Promise<BatchStatus> {
    return this.graphqlRequest<BatchStatus>(`
      mutation BulkProcessDocuments($input: BulkProcessInput!) {
        bulkProcessDocuments(input: $input) {
          batchId
          taskIds
          status
          message
        }
      }
    `, { input });
  }

  async getBatchStatus(batchId: string): Promise<BatchStatus> {
    return this.graphqlRequest<BatchStatus>(`
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
    `, { batchId });
  }

  // Configuration
  async getAgentConfiguration(agentType: AgentType): Promise<AgentConfiguration> {
    return this.graphqlRequest<AgentConfiguration>(`
      query GetAgentConfiguration($agentType: AgentType!) {
        agentConfiguration(agentType: $agentType) {
          agentType
          configuration
          lastUpdated
          version
        }
      }
    `, { agentType });
  }

  async updateAgentConfiguration(
    agentType: AgentType, 
    configuration: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    return this.graphqlRequest<{ success: boolean; message: string }>(`
      mutation ConfigureAgent($agentType: AgentType!, $configuration: JSON!) {
        configureAgent(agentType: $agentType, configuration: $configuration) {
          success
          message
          configuration
        }
      }
    `, { agentType, configuration });
  }

  // Metrics and Monitoring
  async getAgentMetrics(
    agentType?: AgentType, 
    timeRange: string = '24h'
  ): Promise<AgentMetrics[]> {
    return this.graphqlRequest<AgentMetrics[]>(`
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
    `, { agentType, timeRange });
  }

  async getHealthCheck(): Promise<HealthCheckResult> {
    return this.graphqlRequest<HealthCheckResult>(`
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
    `);
  }

  async getTaskLogs(taskId: string): Promise<TaskLog[]> {
    return this.graphqlRequest<TaskLog[]>(`
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
    `, { taskId });
  }
}

// Real-time updates service
export class AgentRealtimeService {
  private eventSource: EventSource | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  connect(): void {
    if (this.eventSource) {
      return; // Already connected
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const url = `/api/agents/stream?token=${encodeURIComponent(token || '')}`;

    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifySubscribers(data.type, data);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.reconnect();
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.subscribers.clear();
  }

  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    
    this.subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  private notifySubscribers(eventType: string, data: any): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in SSE subscriber callback:', error);
        }
      });
    }
  }

  private reconnect(): void {
    setTimeout(() => {
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.connect();
      }
    }, 5000); // Reconnect after 5 seconds
  }
}

// Singleton instances
export const aiAgentService = new AIAgentService();
export const agentRealtimeService = new AgentRealtimeService();
import React from 'react';

// AI Agents TypeScript Definitions

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: TemplateField[];
}

export interface TemplateField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'boolean';
  required: boolean;
  options?: string[];
}

export interface GenerateDocumentInput {
  templateId: string;
  fields: Record<string, any>;
  caseId?: string;
}

export interface AnalyzeDocumentInput {
  documentId?: string;
  file?: File;
  analysisType: 'general' | 'legal' | 'contract' | 'compliance';
}

export interface ClassifyDocumentsInput {
  documentIds: string[];
  categories?: string[];
}

export enum TaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum AgentType {
  DOCUMENT_GENERATOR = 'DOCUMENT_GENERATOR',
  DOCUMENT_ANALYZER = 'DOCUMENT_ANALYZER',
  DOCUMENT_CLASSIFIER = 'DOCUMENT_CLASSIFIER',
  LEGAL_ASSISTANT = 'LEGAL_ASSISTANT',
  CONTRACT_REVIEWER = 'CONTRACT_REVIEWER',
  TASK_MANAGER = 'TASK_MANAGER'
}

export enum AgentStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
  ERROR = 'ERROR',
  STARTING = 'STARTING',
  STOPPING = 'STOPPING'
}

export enum SystemHealth {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN'
}

// Enhanced AI Agent Interfaces

export interface AgentCapability {
  agentType: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  supportedFormats: string[];
  maxFileSize: number;
  processingTime: number;
  available: boolean;
}

export interface AgentStatusInfo {
  agentType: AgentType;
  status: AgentStatus;
  lastUpdate: string;
  activeTasks: number;
  completedTasks: number;
  errorCount: number;
  uptime?: number;
  lastHeartbeat?: string;
  responseTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  errors?: string[];
}

export interface AgentMetrics {
  agentType: AgentType;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  averageProcessingTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  timestamp: string;
}

export interface AgentConfiguration {
  agentType: AgentType;
  configuration: Record<string, any>;
  lastUpdated: string;
  version: string;
}

export interface BulkProcessInput {
  agentType: AgentType;
  documentIds: string[];
  configuration?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
}

export interface BatchStatus {
  batchId: string;
  status: TaskStatus;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  results: any[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskLog {
  id: string;
  taskId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface HealthCheckResult {
  systemHealth: SystemHealth;
  agents: AgentStatusInfo[];
  timestamp: string;
}

export interface AgentControlResponse {
  success: boolean;
  message: string;
  agentId?: string;
}

// GraphQL Response Types
export interface TasksQueryResponse {
  tasks: Task[];
}

export interface TaskQueryResponse {
  task: Task;
}

export interface DocumentTemplatesQueryResponse {
  documentTemplates: DocumentTemplate[];
}

export interface DocumentsQueryResponse {
  documents: Document[];
}

export interface GeneratedDocumentsQueryResponse {
  generatedDocuments: GeneratedDocument[];
}

export interface GenerateDocumentMutationResponse {
  generateDocument: {
    taskId: string;
    success: boolean;
    message?: string;
  };
}

export interface AnalyzeDocumentMutationResponse {
  analyzeDocument: {
    taskId: string;
    success: boolean;
    message?: string;
  };
}

export interface ClassifyDocumentsMutationResponse {
  classifyDocuments: {
    taskId: string;
    success: boolean;
    message?: string;
  };
}

export interface Task {
  id: string;
  agentType: AgentType;
  status: TaskStatus;
  progress: number;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedDocument {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  content: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  risks: string[];
  recommendations: string[];
  entities: {
    people: string[];
    organizations: string[];
    dates: string[];
    amounts: string[];
  };
  confidence: number;
}

export interface ClassificationResult {
  documentId: string;
  category: string;
  confidence: number;
  subcategories: string[];
}

// UI State Types
export interface AIAgentCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  status: 'available' | 'processing' | 'unavailable';
  recentTasks: number;
  route: string;
}
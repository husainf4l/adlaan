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
  DOCUMENT_CLASSIFIER = 'DOCUMENT_CLASSIFIER'
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
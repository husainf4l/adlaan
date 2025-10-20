// Legal Practice Management Types for Adlaan System
import { DocumentTemplate } from './ai-types';

export interface LegalCase {
  id: string;
  title: string;
  caseNumber?: string;
  status: CaseStatus;
  client: LegalClient;
  assignedLawyer: Lawyer;
  practiceArea: PracticeArea;
  priority: CasePriority;
  createdAt: string;
  updatedAt: string;
  deadlines: CaseDeadline[];
  documents: CaseDocument[];
  billingCodes: BillingCode[];
}

export interface LegalClient {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address: ClientAddress;
  type: 'individual' | 'business' | 'organization';
  retainerStatus: 'active' | 'inactive' | 'pending';
}

export interface Lawyer {
  id: string;
  name: string;
  barNumber: string;
  specialization: PracticeArea[];
  jurisdiction: string[];
  email: string;
  phone: string;
}

export enum CaseStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING', 
  CLOSED = 'CLOSED',
  ON_HOLD = 'ON_HOLD',
  SETTLED = 'SETTLED'
}

export enum CasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum PracticeArea {
  CIVIL_LITIGATION = 'CIVIL_LITIGATION',
  CRIMINAL_DEFENSE = 'CRIMINAL_DEFENSE',
  CORPORATE_LAW = 'CORPORATE_LAW',
  EMPLOYMENT_LAW = 'EMPLOYMENT_LAW',
  REAL_ESTATE = 'REAL_ESTATE',
  FAMILY_LAW = 'FAMILY_LAW',
  ESTATE_PLANNING = 'ESTATE_PLANNING',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  PERSONAL_INJURY = 'PERSONAL_INJURY',
  BANKRUPTCY = 'BANKRUPTCY',
  IMMIGRATION = 'IMMIGRATION',
  TAX_LAW = 'TAX_LAW'
}

export interface CaseDeadline {
  id: string;
  caseId: string;
  description: string;
  dueDate: string;
  type: DeadlineType;
  completed: boolean;
  reminderDays: number;
  priority: CasePriority;
}

export enum DeadlineType {
  COURT_FILING = 'COURT_FILING',
  DISCOVERY = 'DISCOVERY',
  DEPOSITION = 'DEPOSITION',
  HEARING = 'HEARING',
  TRIAL = 'TRIAL',
  SETTLEMENT_CONFERENCE = 'SETTLEMENT_CONFERENCE',
  MEDIATION = 'MEDIATION',
  ARBITRATION = 'ARBITRATION',
  STATUTE_OF_LIMITATIONS = 'STATUTE_OF_LIMITATIONS'
}

export interface CaseDocument {
  id: string;
  caseId: string;
  name: string;
  type: LegalDocumentType;
  status: DocumentStatus;
  createdAt: string;
  createdBy: string;
  version: number;
  tags: string[];
  confidentialityLevel: ConfidentialityLevel;
}

export enum LegalDocumentType {
  // Litigation Documents
  COMPLAINT = 'COMPLAINT',
  ANSWER = 'ANSWER',
  MOTION = 'MOTION',
  BRIEF = 'BRIEF',
  DISCOVERY_REQUEST = 'DISCOVERY_REQUEST',
  DISCOVERY_RESPONSE = 'DISCOVERY_RESPONSE',
  SETTLEMENT_AGREEMENT = 'SETTLEMENT_AGREEMENT',
  
  // Corporate Documents  
  ARTICLES_OF_INCORPORATION = 'ARTICLES_OF_INCORPORATION',
  BYLAWS = 'BYLAWS',
  OPERATING_AGREEMENT = 'OPERATING_AGREEMENT',
  SHAREHOLDERS_AGREEMENT = 'SHAREHOLDERS_AGREEMENT',
  BOARD_RESOLUTION = 'BOARD_RESOLUTION',
  
  // Contracts
  EMPLOYMENT_AGREEMENT = 'EMPLOYMENT_AGREEMENT',
  SERVICE_CONTRACT = 'SERVICE_CONTRACT',
  NDA = 'NDA',
  PARTNERSHIP_AGREEMENT = 'PARTNERSHIP_AGREEMENT',
  LEASE_AGREEMENT = 'LEASE_AGREEMENT',
  PURCHASE_AGREEMENT = 'PURCHASE_AGREEMENT',
  
  // Estate Planning
  WILL = 'WILL',
  TRUST = 'TRUST',
  POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY',
  HEALTHCARE_DIRECTIVE = 'HEALTHCARE_DIRECTIVE',
  
  // Family Law
  DIVORCE_PETITION = 'DIVORCE_PETITION',
  CUSTODY_AGREEMENT = 'CUSTODY_AGREEMENT',
  PRENUPTIAL_AGREEMENT = 'PRENUPTIAL_AGREEMENT',
  ADOPTION_PAPERS = 'ADOPTION_PAPERS'
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  EXECUTED = 'EXECUTED',
  FILED = 'FILED',
  ARCHIVED = 'ARCHIVED'
}

export enum ConfidentialityLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  ATTORNEY_CLIENT_PRIVILEGED = 'ATTORNEY_CLIENT_PRIVILEGED',
  WORK_PRODUCT = 'WORK_PRODUCT'
}

export interface BillingCode {
  id: string;
  code: string;
  description: string;
  rate: number;
  category: BillingCategory;
  timeIncrement: number; // in minutes
}

export enum BillingCategory {
  RESEARCH = 'RESEARCH',
  DRAFTING = 'DRAFTING',
  REVIEW = 'REVIEW',
  CORRESPONDENCE = 'CORRESPONDENCE',
  COURT_APPEARANCE = 'COURT_APPEARANCE',
  CLIENT_MEETING = 'CLIENT_MEETING',
  TRAVEL = 'TRAVEL',
  ADMINISTRATIVE = 'ADMINISTRATIVE'
}

export interface ClientAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Legal Template Categories for Enhanced Document Generator
export interface LegalTemplateCategory {
  id: string;
  name: string;
  description: string;
  practiceAreas: PracticeArea[];
  templates: LegalDocumentTemplate[];
  jurisdiction: string[];
  icon: string;
}

export interface LegalDocumentTemplate extends DocumentTemplate {
  practiceArea: PracticeArea;
  jurisdiction: string[];
  documentType: LegalDocumentType;
  confidentialityLevel: ConfidentialityLevel;
  precedentCitations?: string[];
  complianceRequirements: ComplianceRequirement[];
  estimatedTime: number; // in minutes
  complexityLevel: 'simple' | 'moderate' | 'complex';
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  regulation: string;
  jurisdiction: string;
  mandatory: boolean;
  validationRules: string[];
}

// Enhanced GraphQL Response Types for Legal Practice
export interface LegalCasesQueryResponse {
  cases: LegalCase[];
}

export interface LegalClientsQueryResponse {
  clients: LegalClient[];
}

export interface LegalTemplatesQueryResponse {
  legalTemplates: LegalDocumentTemplate[];
}

export interface CaseDeadlinesQueryResponse {
  deadlines: CaseDeadline[];
}

// Legal-specific AI Analysis Results
export interface LegalAnalysisResult {
  documentType: LegalDocumentType;
  practiceArea: PracticeArea;
  jurisdiction: string[];
  legalIssues: LegalIssue[];
  contractTerms: ContractTerm[];
  legalEntities: LegalEntity[];
  deadlines: ExtractedDeadline[];
  risks: LegalRisk[];
  compliance: ComplianceAssessment;
  citations: LegalCitation[];
}

export interface LegalIssue {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  precedents?: string[];
}

export interface ContractTerm {
  type: 'obligation' | 'right' | 'condition' | 'deadline';
  party: string;
  description: string;
  enforceable: boolean;
  jurisdiction: string;
}

export interface LegalEntity {
  type: 'person' | 'corporation' | 'partnership' | 'government' | 'trust';
  name: string;
  role: string;
  jurisdiction?: string;
}

export interface ExtractedDeadline {
  type: DeadlineType;
  description: string;
  date: string;
  party: string;
  consequences: string;
}

export interface LegalRisk {
  category: 'contractual' | 'regulatory' | 'litigation' | 'compliance' | 'financial';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string[];
}

export interface ComplianceAssessment {
  jurisdiction: string;
  regulations: RegulationCompliance[];
  overallScore: number;
  deficiencies: ComplianceDeficiency[];
}

export interface RegulationCompliance {
  regulation: string;
  compliant: boolean;
  requirements: string[];
  gaps?: string[];
}

export interface ComplianceDeficiency {
  type: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  recommendation: string;
  deadline?: string;
}

export interface LegalCitation {
  type: 'case' | 'statute' | 'regulation' | 'rule';
  citation: string;
  relevance: 'high' | 'medium' | 'low';
  context: string;
  jurisdiction: string;
}
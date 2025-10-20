import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentTask } from './agent-task.entity';
import { Document } from '../document/document.entity';
import { User } from '../user/user.entity';
import { AgentType, AgentTaskStatus } from './enums';
import { AnalyzeDocumentInput } from './dto';

@Injectable()
export class DocumentAnalysisService {
  constructor(
    @InjectRepository(AgentTask)
    private agentTaskRepository: Repository<AgentTask>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async analyzeDocument(
    input: AnalyzeDocumentInput,
    userId: number,
  ): Promise<AgentTask> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate document exists and user has access
    const document = await this.documentRepository.findOne({
      where: { id: input.documentId },
      relations: ['case', 'company', 'createdBy'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if user has access to the document (same company)
    if (document.companyId !== user.companyId) {
      throw new NotFoundException('Document not found');
    }

    // Create agent task
    const agentTask = this.agentTaskRepository.create({
      type: AgentType.DOCUMENT_ANALYZER,
      status: AgentTaskStatus.PENDING,
      input: JSON.stringify(input),
      documentId: input.documentId,
      caseId: document.caseId,
      createdBy: userId,
      metadata: {
        analysisType: input.analysisType || 'summary',
        documentTitle: document.title,
        documentType: document.documentType,
      },
    });

    const savedTask = await this.agentTaskRepository.save(agentTask);

    // Process the analysis asynchronously
    this.processDocumentAnalysis(savedTask.id).catch((error) => {
      console.error('Error processing document analysis:', error);
    });

    return savedTask;
  }

  private async processDocumentAnalysis(taskId: number): Promise<void> {
    try {
      // Update task status to processing
      await this.agentTaskRepository.update(taskId, {
        status: AgentTaskStatus.PROCESSING,
      });

      const task = await this.agentTaskRepository.findOne({
        where: { id: taskId },
        relations: ['document', 'user'],
      });

      if (!task || !task.document) {
        throw new Error('Task or document not found');
      }

      const input = JSON.parse(task.input) as AnalyzeDocumentInput;
      const analysisType = input.analysisType || 'summary';

      // Perform document analysis based on type
      const analysisResult = await this.performAnalysis(
        task.document,
        analysisType,
      );

      // Update the document with AI analysis results
      await this.documentRepository.update(task.document.id, {
        aiSummary: analysisResult.summary,
        aiMetadata: {
          ...task.document.aiMetadata,
          analysis: {
            type: analysisType,
            result: analysisResult,
            analyzedAt: new Date(),
            analyzedBy: AgentType.DOCUMENT_ANALYZER,
          },
        },
      });

      // Update task as completed
      await this.agentTaskRepository.update(taskId, {
        status: AgentTaskStatus.COMPLETED,
        output: JSON.stringify(analysisResult),
        completedAt: new Date(),
      });

    } catch (error) {
      console.error('Error in document analysis:', error);
      await this.agentTaskRepository.update(taskId, {
        status: AgentTaskStatus.FAILED,
        errorMessage: error.message,
        completedAt: new Date(),
      });
    }
  }

  private async performAnalysis(
    document: Document,
    analysisType: string,
  ): Promise<any> {
    // This is where you would integrate with AI services (OpenAI, Claude, etc.)
    // For now, we'll use rule-based analysis

    const content = document.content || '';
    const title = document.title || '';
    
    switch (analysisType) {
      case 'summary':
        return this.generateSummary(content, title);
      
      case 'full_analysis':
        return this.performFullAnalysis(content, title, document.documentType);
      
      case 'legal_review':
        return this.performLegalReview(content, title, document.documentType);
      
      case 'key_points':
        return this.extractKeyPoints(content, title);
      
      case 'compliance_check':
        return this.performComplianceCheck(content, title, document.documentType);
      
      default:
        return this.generateSummary(content, title);
    }
  }

  private generateSummary(content: string, title: string): any {
    // Basic text summarization logic
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const wordCount = content.split(/\s+/).length;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // Extract first few sentences as summary
    const summaryLines = sentences.slice(0, Math.min(3, sentences.length));
    const summary = summaryLines.join('. ').trim() + (sentences.length > 3 ? '...' : '');

    return {
      summary: summary || 'Document appears to be empty or contains minimal content.',
      statistics: {
        wordCount,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
        estimatedReadingTime: Math.ceil(wordCount / 250), // minutes
      },
      keyInformation: {
        title,
        documentLength: content.length,
        hasStructure: paragraphs.length > 1,
      },
    };
  }

  private performFullAnalysis(content: string, title: string, documentType: string): any {
    const basicSummary = this.generateSummary(content, title);
    
    // Additional analysis based on document type
    const analysis = {
      ...basicSummary,
      documentType,
      structure: this.analyzeDocumentStructure(content),
      entities: this.extractEntities(content),
      sentiment: this.analyzeSentiment(content),
      complexity: this.analyzeComplexity(content),
    };

    return analysis;
  }

  private performLegalReview(content: string, title: string, documentType: string): any {
    const fullAnalysis = this.performFullAnalysis(content, title, documentType);
    
    const legalElements = {
      ...fullAnalysis,
      legalReview: {
        identifiedClauses: this.identifyLegalClauses(content),
        potentialIssues: this.identifyPotentialIssues(content, documentType),
        recommendations: this.generateRecommendations(content, documentType),
        complianceFlags: this.checkCompliance(content, documentType),
      },
    };

    return legalElements;
  }

  private extractKeyPoints(content: string, title: string): any {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Simple keyword-based key point extraction
    const keywordPatterns = [
      /\b(shall|must|required|mandatory|obligation)\b/gi,
      /\b(payment|fee|cost|price|amount)\b/gi,
      /\b(deadline|date|term|period|duration)\b/gi,
      /\b(party|parties|client|company|individual)\b/gi,
      /\b(liability|responsibility|damages|breach)\b/gi,
    ];

    const keyPoints: Array<{category: string; text: string; importance: number}> = [];
    sentences.forEach(sentence => {
      keywordPatterns.forEach((pattern, index) => {
        if (pattern.test(sentence)) {
          const category = ['Legal Obligations', 'Financial Terms', 'Timelines', 'Parties', 'Liability'][index];
          keyPoints.push({
            category,
            text: sentence.trim(),
            importance: this.calculateImportance(sentence),
          });
        }
      });
    });

    return {
      summary: `Found ${keyPoints.length} key points in the document.`,
      keyPoints: keyPoints.slice(0, 10), // Top 10 key points
      categories: [...new Set(keyPoints.map(kp => kp.category))],
    };
  }

  private performComplianceCheck(content: string, title: string, documentType: string): any {
    const complianceItems: Array<{item: string; status: string; description: string}> = [];
    
    // Basic compliance checks based on document type
    switch (documentType.toLowerCase()) {
      case 'contract':
      case 'agreement':
        complianceItems.push(...this.checkContractCompliance(content));
        break;
      case 'nda':
        complianceItems.push(...this.checkNDACompliance(content));
        break;
      case 'lease':
        complianceItems.push(...this.checkLeaseCompliance(content));
        break;
      default:
        complianceItems.push(...this.checkGeneralCompliance(content));
    }

    const passedChecks = complianceItems.filter(item => item.status === 'passed').length;
    const totalChecks = complianceItems.length;
    const complianceScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;

    return {
      summary: `Compliance score: ${complianceScore.toFixed(1)}% (${passedChecks}/${totalChecks} checks passed)`,
      complianceScore,
      totalChecks,
      passedChecks,
      complianceItems,
      recommendations: this.generateComplianceRecommendations(complianceItems),
    };
  }

  private analyzeDocumentStructure(content: string): any {
    const sections = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const hasNumberedSections = /^\s*\d+\./.test(content);
    const hasBulletPoints = /^\s*[•\-\*]/.test(content);
    const hasHeaders = /^[A-Z\s]+:/.test(content);

    return {
      sectionCount: sections.length,
      hasNumberedSections,
      hasBulletPoints,
      hasHeaders,
      structureScore: this.calculateStructureScore(content),
    };
  }

  private extractEntities(content: string): any {
    // Simple entity extraction patterns
    const entities = {
      dates: content.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g) || [],
      amounts: content.match(/\$[\d,]+\.?\d*/g) || [],
      emails: content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [],
      phones: content.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [],
      names: [], // Would need more sophisticated NLP for proper name extraction
    };

    return entities;
  }

  private analyzeSentiment(content: string): any {
    // Basic sentiment analysis using keyword counting
    const positiveWords = ['agree', 'accept', 'approve', 'benefit', 'good', 'positive', 'success'];
    const negativeWords = ['reject', 'deny', 'breach', 'violation', 'problem', 'issue', 'dispute'];
    const legalWords = ['shall', 'must', 'required', 'obligation', 'liability', 'damages'];

    const words = content.toLowerCase().split(/\s+/);
    const positive = words.filter(word => positiveWords.includes(word)).length;
    const negative = words.filter(word => negativeWords.includes(word)).length;
    const legal = words.filter(word => legalWords.includes(word)).length;

    const total = positive + negative + legal;
    let sentiment = 'neutral';
    
    if (total > 0) {
      if (legal > positive + negative) sentiment = 'formal';
      else if (positive > negative) sentiment = 'positive';
      else if (negative > positive) sentiment = 'negative';
    }

    return {
      sentiment,
      scores: { positive, negative, legal, total },
      confidence: total > 5 ? 'high' : total > 2 ? 'medium' : 'low',
    };
  }

  private analyzeComplexity(content: string): any {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    const longWords = words.filter(w => w.length > 6).length;
    const complexityScore = (avgWordsPerSentence + (longWords / words.length) * 100) / 2;

    let complexity = 'simple';
    if (complexityScore > 20) complexity = 'complex';
    else if (complexityScore > 15) complexity = 'moderate';

    return {
      complexity,
      score: Math.round(complexityScore),
      avgWordsPerSentence: Math.round(avgWordsPerSentence),
      longWordPercentage: Math.round((longWords / words.length) * 100),
    };
  }

  private identifyLegalClauses(content: string): string[] {
    const clausePatterns = [
      /force majeure/gi,
      /indemnification/gi,
      /limitation of liability/gi,
      /confidentiality/gi,
      /termination/gi,
      /governing law/gi,
      /dispute resolution/gi,
      /intellectual property/gi,
    ];

    const identifiedClauses: string[] = [];
    clausePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        identifiedClauses.push(...matches.map(match => match.toLowerCase()));
      }
    });

    return [...new Set(identifiedClauses)];
  }

  private identifyPotentialIssues(content: string, documentType: string): string[] {
    const issues: string[] = [];
    
    // Common issues across document types
    if (!content.match(/\b\d{4}\b/)) {
      issues.push('No specific dates found - consider adding explicit dates');
    }
    
    if (!content.match(/\$[\d,]+/)) {
      issues.push('No monetary amounts specified - consider adding financial terms');
    }

    // Document-specific issues
    if (documentType.toLowerCase() === 'contract') {
      if (!content.toLowerCase().includes('termination')) {
        issues.push('No termination clause found');
      }
      if (!content.toLowerCase().includes('governing law')) {
        issues.push('No governing law clause found');
      }
    }

    return issues;
  }

  private generateRecommendations(content: string, documentType: string): string[] {
    const recommendations: string[] = [];
    
    if (content.length < 500) {
      recommendations.push('Document appears brief - consider adding more detailed terms');
    }

    if (!content.includes('Date:') && !content.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/)) {
      recommendations.push('Add explicit execution date');
    }

    if (documentType.toLowerCase() === 'contract') {
      recommendations.push('Consider legal review for completeness');
      recommendations.push('Ensure all parties are clearly identified');
    }

    return recommendations;
  }

  private checkCompliance(content: string, documentType: string): string[] {
    const flags: string[] = [];
    
    if (content.toLowerCase().includes('verbal agreement')) {
      flags.push('Contains reference to verbal agreement - may need documentation');
    }
    
    if (content.toLowerCase().includes('as-is') && !content.toLowerCase().includes('warranty')) {
      flags.push('As-is terms without warranty disclaimers');
    }

    return flags;
  }

  private checkContractCompliance(content: string): any[] {
    return [
      {
        item: 'Parties Identification',
        status: content.toLowerCase().includes('party') ? 'passed' : 'failed',
        description: 'Contract should clearly identify all parties',
      },
      {
        item: 'Consideration',
        status: content.match(/\$[\d,]+/) ? 'passed' : 'warning',
        description: 'Contract should specify consideration or payment terms',
      },
      {
        item: 'Termination Clause',
        status: content.toLowerCase().includes('termination') ? 'passed' : 'warning',
        description: 'Contract should include termination provisions',
      },
    ];
  }

  private checkNDACompliance(content: string): any[] {
    return [
      {
        item: 'Confidential Information Definition',
        status: content.toLowerCase().includes('confidential') ? 'passed' : 'failed',
        description: 'NDA must define confidential information',
      },
      {
        item: 'Duration of Confidentiality',
        status: content.match(/\d+\s*(year|month)/i) ? 'passed' : 'warning',
        description: 'NDA should specify duration of confidentiality obligations',
      },
    ];
  }

  private checkLeaseCompliance(content: string): any[] {
    return [
      {
        item: 'Property Description',
        status: content.toLowerCase().includes('property') || content.toLowerCase().includes('premises') ? 'passed' : 'failed',
        description: 'Lease must describe the leased property',
      },
      {
        item: 'Rent Amount',
        status: content.match(/\$[\d,]+/) ? 'passed' : 'failed',
        description: 'Lease must specify rent amount',
      },
      {
        item: 'Lease Term',
        status: content.match(/\d+\s*(year|month)/i) ? 'passed' : 'warning',
        description: 'Lease should specify the lease term',
      },
    ];
  }

  private checkGeneralCompliance(content: string): any[] {
    return [
      {
        item: 'Document Completeness',
        status: content.length > 100 ? 'passed' : 'warning',
        description: 'Document should contain substantive content',
      },
      {
        item: 'Date References',
        status: content.match(/\b\d{4}\b/) ? 'passed' : 'warning',
        description: 'Document should include relevant dates',
      },
    ];
  }

  private generateComplianceRecommendations(complianceItems: Array<{item: string; status: string; description: string}>): string[] {
    const recommendations: string[] = [];
    const failedItems = complianceItems.filter(item => item.status === 'failed');
    const warningItems = complianceItems.filter(item => item.status === 'warning');

    if (failedItems.length > 0) {
      recommendations.push('Address critical compliance failures before proceeding');
    }

    if (warningItems.length > 0) {
      recommendations.push('Review warning items for potential improvements');
    }

    if (failedItems.length === 0 && warningItems.length === 0) {
      recommendations.push('Document meets basic compliance requirements');
    }

    return recommendations;
  }

  private calculateImportance(sentence: string): number {
    // Simple importance scoring based on keywords
    const importantKeywords = ['must', 'shall', 'required', 'obligation', 'liability', 'payment', 'termination'];
    const words = sentence.toLowerCase().split(/\s+/);
    const matches = words.filter(word => importantKeywords.includes(word)).length;
    return Math.min(matches * 25, 100); // Cap at 100
  }

  private calculateStructureScore(content: string): number {
    let score = 0;
    
    if (/^\s*\d+\./.test(content)) score += 25; // Has numbered sections
    if (/^\s*[•\-\*]/.test(content)) score += 15; // Has bullet points
    if (/^[A-Z\s]+:/.test(content)) score += 20; // Has headers
    if (content.split(/\n\s*\n/).length > 3) score += 25; // Multiple paragraphs
    if (content.length > 1000) score += 15; // Substantial content

    return Math.min(score, 100);
  }

  async getAnalysisTasks(userId: number): Promise<AgentTask[]> {
    return this.agentTaskRepository.find({
      where: {
        type: AgentType.DOCUMENT_ANALYZER,
        createdBy: userId,
      },
      relations: ['document', 'case', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAnalysisTask(taskId: number, userId: number): Promise<AgentTask> {
    const task = await this.agentTaskRepository.findOne({
      where: {
        id: taskId,
        type: AgentType.DOCUMENT_ANALYZER,
        createdBy: userId,
      },
      relations: ['document', 'case', 'user'],
    });

    if (!task) {
      throw new NotFoundException('Analysis task not found');
    }

    return task;
  }
}
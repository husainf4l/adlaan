import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { AgentTask } from './agent-task.entity';
import { Document } from '../document/document.entity';
import { User } from '../user/user.entity';
import { Case } from '../case/case.entity';
import { AgentType, AgentTaskStatus } from './enums';
import { ClassifyDocumentsInput } from './dto';
import { DocumentType } from '../document/enums/document.enum';

@Injectable()
export class DocumentClassificationService {
  constructor(
    @InjectRepository(AgentTask)
    private agentTaskRepository: Repository<AgentTask>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
  ) {}

  async classifyDocuments(
    input: ClassifyDocumentsInput,
    userId: number,
  ): Promise<AgentTask> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Determine which documents to classify
    let documentIds: number[] = [];
    
    if (input.documentIds && input.documentIds.length > 0) {
      documentIds = input.documentIds;
    } else if (input.caseId) {
      // Get all documents in the case
      const documents = await this.documentRepository.find({
        where: { caseId: input.caseId },
        select: ['id', 'companyId'],
      });
      
      if (documents.length === 0) {
        throw new NotFoundException('No documents found in the specified case');
      }
      
      // Verify user has access to the case (same company)
      if (documents[0].companyId !== user.companyId) {
        throw new NotFoundException('Case not found');
      }
      
      documentIds = documents.map(doc => doc.id);
    } else {
      // Get all documents for the user's company
      const documents = await this.documentRepository.find({
        where: { companyId: user.companyId },
        select: ['id'],
      });
      
      documentIds = documents.map(doc => doc.id);
    }

    // Filter documents based on classification status
    if (input.includeUnclassified && !input.forceReclassify) {
      const unclassifiedDocs = await this.documentRepository.find({
        where: {
          id: In(documentIds),
          aiClassification: IsNull(),
        },
        select: ['id'],
      });
      documentIds = unclassifiedDocs.map(doc => doc.id);
    }

    if (documentIds.length === 0) {
      throw new NotFoundException('No documents found to classify');
    }

    // Create agent task
    const agentTask = this.agentTaskRepository.create({
      type: AgentType.DOCUMENT_CLASSIFIER,
      status: AgentTaskStatus.PENDING,
      input: JSON.stringify(input),
      caseId: input.caseId,
      createdBy: userId,
      metadata: {
        documentIds,
        totalDocuments: documentIds.length,
        includeUnclassified: input.includeUnclassified,
        forceReclassify: input.forceReclassify,
      },
    });

    const savedTask = await this.agentTaskRepository.save(agentTask);

    // Process the classification asynchronously
    this.processDocumentClassification(savedTask.id).catch((error) => {
      console.error('Error processing document classification:', error);
    });

    return savedTask;
  }

  private async processDocumentClassification(taskId: number): Promise<void> {
    try {
      // Update task status to processing
      await this.agentTaskRepository.update(taskId, {
        status: AgentTaskStatus.PROCESSING,
      });

      const task = await this.agentTaskRepository.findOne({
        where: { id: taskId },
        relations: ['user'],
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const metadata = task.metadata;
      const documentIds: number[] = metadata.documentIds;

      // Get documents to classify
      const documents = await this.documentRepository.find({
        where: { id: In(documentIds) },
        relations: ['case'],
      });

      const classificationResults: Array<{
        documentId: number;
        title: string;
        classification?: string;
        confidenceScore?: number;
        suggestedCategories?: string[];
        error?: string;
      }> = [];
      let processedCount = 0;

      for (const document of documents) {
        try {
          const classificationResult = await this.classifyDocument(document);
          
          // Update document with classification
          await this.documentRepository.update(document.id, {
            aiClassification: classificationResult.classification,
            aiConfidenceScore: classificationResult.confidenceScore,
            aiMetadata: {
              ...document.aiMetadata,
              classification: {
                ...classificationResult,
                classifiedAt: new Date(),
                classifiedBy: AgentType.DOCUMENT_CLASSIFIER,
              },
            },
          });

          classificationResults.push({
            documentId: document.id,
            title: document.title,
            classification: classificationResult.classification,
            confidenceScore: classificationResult.confidenceScore,
            suggestedCategories: classificationResult.suggestedCategories,
          });

          processedCount++;
        } catch (error) {
          console.error(`Error classifying document ${document.id}:`, error);
          classificationResults.push({
            documentId: document.id,
            title: document.title,
            error: error.message,
          });
        }
      }

      // Update task as completed
      await this.agentTaskRepository.update(taskId, {
        status: AgentTaskStatus.COMPLETED,
        output: JSON.stringify({
          totalDocuments: documents.length,
          processedCount,
          classificationResults: classificationResults.slice(0, 20), // Limit output size
          summary: `Classified ${processedCount} out of ${documents.length} documents`,
        }),
        completedAt: new Date(),
      });

    } catch (error) {
      console.error('Error in document classification:', error);
      await this.agentTaskRepository.update(taskId, {
        status: AgentTaskStatus.FAILED,
        errorMessage: error.message,
        completedAt: new Date(),
      });
    }
  }

  private async classifyDocument(document: Document): Promise<any> {
    const content = document.content || '';
    const title = document.title || '';
    const existingType = document.documentType;

    // Analyze content to determine classification
    const features = this.extractClassificationFeatures(content, title);
    const classification = this.determineClassification(features, existingType);
    
    return classification;
  }

  private extractClassificationFeatures(content: string, title: string): any {
    const text = (title + ' ' + content).toLowerCase();
    
    // Feature extraction patterns
    const features = {
      // Document type indicators
      hasContractTerms: this.hasPattern(text, [
        'agreement', 'contract', 'terms and conditions', 'obligations',
        'consideration', 'party', 'parties', 'execution'
      ]),
      
      hasLegalPleading: this.hasPattern(text, [
        'complaint', 'motion', 'brief', 'plaintiff', 'defendant',
        'court', 'honorable', 'whereas', 'wherefore'
      ]),
      
      hasNDATerms: this.hasPattern(text, [
        'confidential', 'non-disclosure', 'proprietary', 'confidentiality',
        'disclose', 'recipient', 'disclosing party'
      ]),
      
      hasLeaseTerms: this.hasPattern(text, [
        'lease', 'tenant', 'landlord', 'rent', 'premises',
        'property', 'rental', 'occupation'
      ]),
      
      hasPowerOfAttorney: this.hasPattern(text, [
        'power of attorney', 'attorney-in-fact', 'principal',
        'grant authority', 'act on behalf'
      ]),
      
      hasWillTerms: this.hasPattern(text, [
        'last will', 'testament', 'executor', 'beneficiary',
        'bequest', 'inherit', 'estate'
      ]),
      
      hasDiscoveryTerms: this.hasPattern(text, [
        'discovery', 'interrogatories', 'deposition', 'production',
        'request for admission', 'subpoena'
      ]),
      
      hasAffidavitTerms: this.hasPattern(text, [
        'affidavit', 'sworn', 'under oath', 'notary',
        'subscribed', 'affiant'
      ]),
      
      hasMemoTerms: this.hasPattern(text, [
        'memorandum', 'memo', 'to:', 'from:', 'subject:',
        'analysis', 'recommendation'
      ]),
      
      hasLetterTerms: this.hasPattern(text, [
        'dear', 'sincerely', 'regards', 'correspondence',
        'letter', 'writing to'
      ]),
      
      // Structural features
      hasDateStructure: /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/.test(text),
      hasSignatureLines: /_+|signature:|signed:|date:/.test(text),
      hasNumberedSections: /^\s*\d+\./.test(content),
      hasBulletPoints: /^\s*[•\-\*]/.test(content),
      
      // Legal language indicators
      hasLegalLanguage: this.hasPattern(text, [
        'shall', 'whereas', 'heretofore', 'hereinafter',
        'pursuant to', 'notwithstanding', 'covenant'
      ]),
      
      hasFinancialTerms: this.hasPattern(text, [
        'payment', 'fee', 'cost', 'price', 'amount',
        'compensation', 'salary', 'budget'
      ]) || /\$[\d,]+/.test(text),
      
      // Content analysis
      wordCount: content.split(/\s+/).length,
      hasMultipleParagraphs: content.split(/\n\s*\n/).length > 2,
      hasFormattedStructure: this.hasPattern(content, [
        'article', 'section', 'clause', 'paragraph'
      ]),
    };

    return features;
  }

  private hasPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  private determineClassification(features: any, existingType: string): any {
    const classifications = this.calculateClassificationScores(features);
    
    // Sort by confidence score
    const sortedClassifications = Object.entries(classifications)
      .sort(([,a]: [string, any], [,b]: [string, any]) => b.score - a.score);
    
    const topClassification = sortedClassifications[0];
    const secondClassification = sortedClassifications[1];
    
    const classification = topClassification[0];
    const confidenceScore = Number(topClassification[1].score.toFixed(4));
    
    // Determine if classification should override existing type
    const shouldOverride = confidenceScore > 0.7 || existingType === DocumentType.OTHER;
    
    return {
      classification: shouldOverride ? classification : existingType,
      confidenceScore,
      originalType: existingType,
      suggestedClassifications: sortedClassifications.slice(0, 3).map(([type, data]: [string, any]) => ({
        type,
        score: Number(data.score.toFixed(4)),
        reasons: data.reasons,
      })),
      suggestedCategories: this.generateCategoryTags(features, classification),
      analysisFeatures: {
        hasLegalLanguage: features.hasLegalLanguage,
        hasFinancialTerms: features.hasFinancialTerms,
        hasStructure: features.hasFormattedStructure,
        wordCount: features.wordCount,
      },
    };
  }

  private calculateClassificationScores(features: any): Record<string, any> {
    const scores: Record<string, any> = {};

    // Contract classification
    scores[DocumentType.CONTRACT] = {
      score: this.calculateScore([
        [features.hasContractTerms, 0.4],
        [features.hasFinancialTerms, 0.2],
        [features.hasSignatureLines, 0.15],
        [features.hasLegalLanguage, 0.15],
        [features.hasDateStructure, 0.1],
      ]),
      reasons: this.getReasons(features, [
        [features.hasContractTerms, 'Contains contract terminology'],
        [features.hasFinancialTerms, 'Includes financial terms'],
        [features.hasSignatureLines, 'Has signature sections'],
      ])
    };

    // Agreement classification
    scores[DocumentType.AGREEMENT] = {
      score: this.calculateScore([
        [features.hasContractTerms, 0.3],
        [features.hasLegalLanguage, 0.2],
        [features.hasSignatureLines, 0.2],
        [features.hasFormattedStructure, 0.15],
        [features.hasMultipleParagraphs, 0.15],
      ]),
      reasons: this.getReasons(features, [
        [features.hasContractTerms, 'Contains agreement language'],
        [features.hasLegalLanguage, 'Uses formal legal language'],
        [features.hasFormattedStructure, 'Well-structured document'],
      ])
    };

    // NDA classification
    scores[DocumentType.NDA] = {
      score: this.calculateScore([
        [features.hasNDATerms, 0.5],
        [features.hasLegalLanguage, 0.2],
        [features.hasSignatureLines, 0.15],
        [features.hasContractTerms, 0.15],
      ]),
      reasons: this.getReasons(features, [
        [features.hasNDATerms, 'Contains confidentiality terms'],
        [features.hasLegalLanguage, 'Uses legal terminology'],
      ])
    };

    // Lease classification
    scores[DocumentType.LEASE] = {
      score: this.calculateScore([
        [features.hasLeaseTerms, 0.5],
        [features.hasFinancialTerms, 0.2],
        [features.hasLegalLanguage, 0.15],
        [features.hasSignatureLines, 0.15],
      ]),
      reasons: this.getReasons(features, [
        [features.hasLeaseTerms, 'Contains lease terminology'],
        [features.hasFinancialTerms, 'Includes rental terms'],
      ])
    };

    // Motion classification
    scores[DocumentType.MOTION] = {
      score: this.calculateScore([
        [features.hasLegalPleading, 0.4],
        [features.hasLegalLanguage, 0.3],
        [features.hasFormattedStructure, 0.2],
        [features.hasNumberedSections, 0.1],
      ]),
      reasons: this.getReasons(features, [
        [features.hasLegalPleading, 'Contains legal pleading language'],
        [features.hasLegalLanguage, 'Uses court terminology'],
      ])
    };

    // Brief classification
    scores[DocumentType.BRIEF] = {
      score: this.calculateScore([
        [features.hasLegalPleading, 0.3],
        [features.hasLegalLanguage, 0.3],
        [features.hasFormattedStructure, 0.2],
        [features.wordCount > 1000, 0.2],
      ]),
      reasons: this.getReasons(features, [
        [features.hasLegalPleading, 'Legal brief structure'],
        [features.wordCount > 1000, 'Substantial length typical of briefs'],
      ])
    };

    // Complaint classification
    scores[DocumentType.COMPLAINT] = {
      score: this.calculateScore([
        [features.hasLegalPleading, 0.4],
        [features.hasNumberedSections, 0.2],
        [features.hasLegalLanguage, 0.2],
        [features.hasFormattedStructure, 0.2],
      ]),
      reasons: this.getReasons(features, [
        [features.hasLegalPleading, 'Contains complaint terminology'],
        [features.hasNumberedSections, 'Numbered allegations structure'],
      ])
    };

    // Power of Attorney classification
    scores[DocumentType.POWER_OF_ATTORNEY] = {
      score: this.calculateScore([
        [features.hasPowerOfAttorney, 0.6],
        [features.hasLegalLanguage, 0.2],
        [features.hasSignatureLines, 0.2],
      ]),
      reasons: this.getReasons(features, [
        [features.hasPowerOfAttorney, 'Contains power of attorney language'],
      ])
    };

    // Will classification
    scores[DocumentType.WILL] = {
      score: this.calculateScore([
        [features.hasWillTerms, 0.6],
        [features.hasLegalLanguage, 0.2],
        [features.hasSignatureLines, 0.2],
      ]),
      reasons: this.getReasons(features, [
        [features.hasWillTerms, 'Contains will and testament language'],
      ])
    };

    // Discovery classification
    scores[DocumentType.DISCOVERY] = {
      score: this.calculateScore([
        [features.hasDiscoveryTerms, 0.5],
        [features.hasLegalLanguage, 0.2],
        [features.hasNumberedSections, 0.2],
        [features.hasFormattedStructure, 0.1],
      ]),
      reasons: this.getReasons(features, [
        [features.hasDiscoveryTerms, 'Contains discovery terminology'],
      ])
    };

    // Affidavit classification
    scores[DocumentType.AFFIDAVIT] = {
      score: this.calculateScore([
        [features.hasAffidavitTerms, 0.5],
        [features.hasLegalLanguage, 0.2],
        [features.hasSignatureLines, 0.3],
      ]),
      reasons: this.getReasons(features, [
        [features.hasAffidavitTerms, 'Contains affidavit language'],
        [features.hasSignatureLines, 'Has notary sections'],
      ])
    };

    // Memo classification
    scores[DocumentType.MEMO] = {
      score: this.calculateScore([
        [features.hasMemoTerms, 0.4],
        [features.hasFormattedStructure, 0.3],
        [features.hasMultipleParagraphs, 0.2],
        [features.wordCount > 200 && features.wordCount < 2000, 0.1],
      ]),
      reasons: this.getReasons(features, [
        [features.hasMemoTerms, 'Contains memo structure'],
        [features.hasFormattedStructure, 'Formatted like a memorandum'],
      ])
    };

    // Letter classification
    scores[DocumentType.LETTER] = {
      score: this.calculateScore([
        [features.hasLetterTerms, 0.4],
        [features.hasDateStructure, 0.2],
        [features.hasSignatureLines, 0.2],
        [features.wordCount < 1000, 0.2],
      ]),
      reasons: this.getReasons(features, [
        [features.hasLetterTerms, 'Contains letter formatting'],
        [features.wordCount < 1000, 'Typical letter length'],
      ])
    };

    // Other classification (fallback)
    scores[DocumentType.OTHER] = {
      score: 0.1, // Always low baseline
      reasons: ['Does not match specific document patterns']
    };

    return scores;
  }

  private calculateScore(factors: Array<[boolean, number]>): number {
    return factors.reduce((score, [condition, weight]) => {
      return score + (condition ? weight : 0);
    }, 0);
  }

  private getReasons(features: any, reasonFactors: Array<[boolean, string]>): string[] {
    return reasonFactors
      .filter(([condition]) => condition)
      .map(([, reason]) => reason);
  }

  private generateCategoryTags(features: any, classification: string): string[] {
    const categories: string[] = [];
    
    if (features.hasFinancialTerms) categories.push('Financial');
    if (features.hasLegalLanguage) categories.push('Legal');
    if (features.hasContractTerms) categories.push('Contractual');
    if (features.hasSignatureLines) categories.push('Executable');
    if (features.wordCount > 2000) categories.push('Comprehensive');
    if (features.wordCount < 500) categories.push('Brief');
    if (features.hasFormattedStructure) categories.push('Structured');
    
    // Add classification-specific categories
    switch (classification) {
      case DocumentType.CONTRACT:
      case DocumentType.AGREEMENT:
        categories.push('Agreement');
        break;
      case DocumentType.MOTION:
      case DocumentType.BRIEF:
      case DocumentType.COMPLAINT:
        categories.push('Litigation');
        break;
      case DocumentType.LEASE:
        categories.push('Real Estate');
        break;
      case DocumentType.NDA:
        categories.push('Confidentiality');
        break;
    }
    
    return [...new Set(categories)];
  }

  async getClassificationTasks(userId: number): Promise<AgentTask[]> {
    return this.agentTaskRepository.find({
      where: {
        type: AgentType.DOCUMENT_CLASSIFIER,
        createdBy: userId,
      },
      relations: ['case', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getClassificationTask(taskId: number, userId: number): Promise<AgentTask> {
    const task = await this.agentTaskRepository.findOne({
      where: {
        id: taskId,
        type: AgentType.DOCUMENT_CLASSIFIER,
        createdBy: userId,
      },
      relations: ['case', 'user'],
    });

    if (!task) {
      throw new NotFoundException('Classification task not found');
    }

    return task;
  }

  async getClassificationSummary(userId: number): Promise<any> {
    // Get user's company documents with classifications
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const documents = await this.documentRepository.find({
      where: { companyId: user.companyId },
      select: ['id', 'documentType', 'aiClassification', 'aiConfidenceScore'],
    });

    const summary = {
      totalDocuments: documents.length,
      classifiedDocuments: documents.filter(doc => doc.aiClassification).length,
      unclassifiedDocuments: documents.filter(doc => !doc.aiClassification).length,
      classificationBreakdown: this.getClassificationBreakdown(documents),
      averageConfidence: this.calculateAverageConfidence(documents),
    };

    return summary;
  }

  private getClassificationBreakdown(documents: Document[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    documents.forEach(doc => {
      const classification = doc.aiClassification || doc.documentType || 'Unclassified';
      breakdown[classification] = (breakdown[classification] || 0) + 1;
    });

    return breakdown;
  }

  private calculateAverageConfidence(documents: Document[]): number {
    const classifiedDocs = documents.filter(doc => doc.aiConfidenceScore);
    if (classifiedDocs.length === 0) return 0;

    const totalConfidence = classifiedDocs.reduce(
      (sum, doc) => sum + Number(doc.aiConfidenceScore),
      0
    );

    return Number((totalConfidence / classifiedDocs.length).toFixed(4));
  }
}
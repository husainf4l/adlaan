import { Resolver, Mutation, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { AgentTask } from './agent-task.entity';
import { LegalDocumentGeneratorService } from './legal-document-generator.service';
import { DocumentAnalysisService } from './document-analysis.service';
import { DocumentClassificationService } from './document-classification.service';
import {
  GenerateLegalDocumentInput,
  AnalyzeDocumentInput,
  ClassifyDocumentsInput,
} from './dto';

@Resolver(() => AgentTask)
@UseGuards(GqlAuthGuard)
export class AiAgentResolver {
  constructor(
    private readonly legalDocumentGeneratorService: LegalDocumentGeneratorService,
    private readonly documentAnalysisService: DocumentAnalysisService,
    private readonly documentClassificationService: DocumentClassificationService,
  ) {}

  // Legal Document Generation
  @Mutation(() => AgentTask, {
    description: 'Generate a legal document using AI templates',
  })
  async generateLegalDocument(
    @Args('input') input: GenerateLegalDocumentInput,
    @CurrentUser() user: User,
  ): Promise<AgentTask> {
    return this.legalDocumentGeneratorService.generateLegalDocument(input, user.id);
  }

  @Query(() => [AgentTask], {
    description: 'Get all document generation tasks for the current user',
  })
  async getGenerationTasks(@CurrentUser() user: User): Promise<AgentTask[]> {
    return this.legalDocumentGeneratorService.getGenerationTasks(user.id);
  }

  @Query(() => AgentTask, {
    description: 'Get a specific document generation task',
  })
  async getGenerationTask(
    @Args('taskId', { type: () => Int }) taskId: number,
    @CurrentUser() user: User,
  ): Promise<AgentTask> {
    return this.legalDocumentGeneratorService.getGenerationTask(taskId, user.id);
  }

  // Document Analysis
  @Mutation(() => AgentTask, {
    description: 'Analyze a document and generate summary/insights',
  })
  async analyzeDocument(
    @Args('input') input: AnalyzeDocumentInput,
    @CurrentUser() user: User,
  ): Promise<AgentTask> {
    return this.documentAnalysisService.analyzeDocument(input, user.id);
  }

  @Query(() => [AgentTask], {
    description: 'Get all document analysis tasks for the current user',
  })
  async getAnalysisTasks(@CurrentUser() user: User): Promise<AgentTask[]> {
    return this.documentAnalysisService.getAnalysisTasks(user.id);
  }

  @Query(() => AgentTask, {
    description: 'Get a specific document analysis task',
  })
  async getAnalysisTask(
    @Args('taskId', { type: () => Int }) taskId: number,
    @CurrentUser() user: User,
  ): Promise<AgentTask> {
    return this.documentAnalysisService.getAnalysisTask(taskId, user.id);
  }

  // Document Classification
  @Mutation(() => AgentTask, {
    description: 'Classify documents automatically using AI',
  })
  async classifyDocuments(
    @Args('input') input: ClassifyDocumentsInput,
    @CurrentUser() user: User,
  ): Promise<AgentTask> {
    return this.documentClassificationService.classifyDocuments(input, user.id);
  }

  @Query(() => [AgentTask], {
    description: 'Get all document classification tasks for the current user',
  })
  async getClassificationTasks(@CurrentUser() user: User): Promise<AgentTask[]> {
    return this.documentClassificationService.getClassificationTasks(user.id);
  }

  @Query(() => AgentTask, {
    description: 'Get a specific document classification task',
  })
  async getClassificationTask(
    @Args('taskId', { type: () => Int }) taskId: number,
    @CurrentUser() user: User,
  ): Promise<AgentTask> {
    return this.documentClassificationService.getClassificationTask(taskId, user.id);
  }

  @Query(() => String, {
    description: 'Get classification summary for all documents',
  })
  async getClassificationSummary(@CurrentUser() user: User): Promise<string> {
    const summary = await this.documentClassificationService.getClassificationSummary(user.id);
    return JSON.stringify(summary);
  }

  // General Agent Tasks
  @Query(() => [AgentTask], {
    description: 'Get all AI agent tasks for the current user',
  })
  async getAllAgentTasks(@CurrentUser() user: User): Promise<AgentTask[]> {
    // This would combine all agent tasks - implementing a general service method
    const [generationTasks, analysisTasks, classificationTasks] = await Promise.all([
      this.legalDocumentGeneratorService.getGenerationTasks(user.id),
      this.documentAnalysisService.getAnalysisTasks(user.id),
      this.documentClassificationService.getClassificationTasks(user.id),
    ]);

    // Combine and sort by creation date
    const allTasks = [...generationTasks, ...analysisTasks, ...classificationTasks];
    return allTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  @Query(() => AgentTask, {
    description: 'Get a specific agent task by ID',
  })
  async getAgentTask(
    @Args('taskId', { type: () => Int }) taskId: number,
    @CurrentUser() user: User,
  ): Promise<AgentTask> {
    // Try each service to find the task
    try {
      return await this.legalDocumentGeneratorService.getGenerationTask(taskId, user.id);
    } catch {
      try {
        return await this.documentAnalysisService.getAnalysisTask(taskId, user.id);
      } catch {
        return await this.documentClassificationService.getClassificationTask(taskId, user.id);
      }
    }
  }
}
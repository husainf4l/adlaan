import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentTask } from './agent-task.entity';
import { Document } from '../document/document.entity';
import { User } from '../user/user.entity';
import { Case } from '../case/case.entity';
import { Client } from '../client/client.entity';
import { AiAgentResolver } from './ai-agent.resolver';
import { LegalDocumentGeneratorService } from './legal-document-generator.service';
import { DocumentAnalysisService } from './document-analysis.service';
import { DocumentClassificationService } from './document-classification.service';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentTask,
      Document,
      User,
      Case,
      Client,
    ]),
    ServicesModule, // For AwsS3Service
  ],
  providers: [
    AiAgentResolver,
    LegalDocumentGeneratorService,
    DocumentAnalysisService,
    DocumentClassificationService,
  ],
  exports: [
    LegalDocumentGeneratorService,
    DocumentAnalysisService,
    DocumentClassificationService,
  ],
})
export class AiAgentModule {}
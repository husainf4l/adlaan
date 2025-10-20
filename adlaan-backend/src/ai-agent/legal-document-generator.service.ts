import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentTask } from './agent-task.entity';
import { Document } from '../document/document.entity';
import { User } from '../user/user.entity';
import { Case } from '../case/case.entity';
import { Client } from '../client/client.entity';
import { AgentType, AgentTaskStatus, LegalDocumentType } from './enums';
import { GenerateLegalDocumentInput } from './dto';
import { DocumentType } from '../document/enums/document.enum';
import { AwsS3Service } from '../services/aws-s3.service';

@Injectable()
export class LegalDocumentGeneratorService {
  constructor(
    @InjectRepository(AgentTask)
    private agentTaskRepository: Repository<AgentTask>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private awsS3Service: AwsS3Service,
  ) {}

  async generateLegalDocument(
    input: GenerateLegalDocumentInput,
    userId: number,
  ): Promise<AgentTask> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate case if provided
    let caseEntity: Case | undefined;
    if (input.caseId) {
      const foundCase = await this.caseRepository.findOne({ 
        where: { id: input.caseId },
        relations: ['company']
      });
      if (!foundCase) {
        throw new NotFoundException('Case not found');
      }
      caseEntity = foundCase;
    }

    // Validate client if provided
    let client: Client | undefined;
    if (input.clientId) {
      const foundClient = await this.clientRepository.findOne({ 
        where: { id: input.clientId } 
      });
      if (!foundClient) {
        throw new NotFoundException('Client not found');
      }
      client = foundClient;
    }

    // Create agent task
    const agentTask = this.agentTaskRepository.create({
      type: AgentType.LEGAL_DOCUMENT_GENERATOR,
      status: AgentTaskStatus.PENDING,
      input: JSON.stringify(input),
      caseId: input.caseId,
      createdBy: userId,
      metadata: {
        documentType: input.documentType,
        title: input.title,
        description: input.description,
        parameters: JSON.parse(input.parameters),
        clientId: input.clientId,
      },
    });

    const savedTask = await this.agentTaskRepository.save(agentTask);

    // Process the task asynchronously
    this.processDocumentGeneration(savedTask.id).catch((error) => {
      console.error('Error processing document generation:', error);
    });

    return savedTask;
  }

  private async processDocumentGeneration(taskId: number): Promise<void> {
    try {
      // Update task status to processing
      await this.agentTaskRepository.update(taskId, {
        status: AgentTaskStatus.PROCESSING,
      });

      const task = await this.agentTaskRepository.findOne({
        where: { id: taskId },
        relations: ['user', 'case'],
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const input = JSON.parse(task.input) as GenerateLegalDocumentInput;
      const metadata = task.metadata;

      // Generate document content using AI/templates
      const generatedContent = await this.generateDocumentContent(
        input.documentType,
        metadata.parameters,
        task.case,
      );

      // Create document entity
      const document = this.documentRepository.create({
        title: input.title,
        description: input.description,
        content: generatedContent,
        documentType: this.mapLegalDocumentTypeToDocumentType(input.documentType),
        caseId: input.caseId,
        companyId: task.case?.companyId || task.user.companyId,
        createdById: task.createdBy,
        isAiGenerated: true,
        aiMetadata: {
          generatedBy: AgentType.LEGAL_DOCUMENT_GENERATOR,
          parameters: metadata.parameters,
          generatedAt: new Date(),
        },
      });

      const savedDocument = await this.documentRepository.save(document);

      // Save document to S3 as PDF (optional)
      // const pdfBuffer = await this.generatePDF(generatedContent);
      // const fileUrl = await this.awsS3Service.uploadDocument(
      //   pdfBuffer,
      //   `${input.title}.pdf`,
      //   input.caseId,
      //   'generated'
      // );
      // 
      // await this.documentRepository.update(savedDocument.id, { fileUrl });

      // Update task as completed
      await this.agentTaskRepository.update(taskId, {
        status: AgentTaskStatus.COMPLETED,
        output: JSON.stringify({
          documentId: savedDocument.id,
          title: savedDocument.title,
          content: generatedContent.substring(0, 500) + '...', // Truncated preview
        }),
        documentId: savedDocument.id,
        completedAt: new Date(),
      });

    } catch (error) {
      console.error('Error in document generation:', error);
      await this.agentTaskRepository.update(taskId, {
        status: AgentTaskStatus.FAILED,
        errorMessage: error.message,
        completedAt: new Date(),
      });
    }
  }

  private async generateDocumentContent(
    documentType: LegalDocumentType,
    parameters: any,
    caseEntity?: Case,
  ): Promise<string> {
    // This is where you would integrate with AI services (OpenAI, Claude, etc.)
    // For now, we'll use templates
    
    const templates = this.getDocumentTemplates();
    const template = templates[documentType] || templates[LegalDocumentType.OTHER];

    // Replace placeholders with actual values
    let content = template;
    
    // Replace common placeholders
    content = content.replace(/\{CLIENT_NAME\}/g, parameters.clientName || '[Client Name]');
    content = content.replace(/\{DATE\}/g, new Date().toLocaleDateString());
    content = content.replace(/\{CASE_NUMBER\}/g, caseEntity?.caseNumber || '[Case Number]');
    content = content.replace(/\{COMPANY_NAME\}/g, caseEntity?.company?.name || '[Company Name]');
    
    // Replace document-specific placeholders based on parameters
    Object.entries(parameters).forEach(([key, value]) => {
      const placeholder = `{${key.toUpperCase()}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return content;
  }

  private getDocumentTemplates(): Record<LegalDocumentType, string> {
    return {
      [LegalDocumentType.CONTRACT]: `
AGREEMENT

This Agreement is made on {DATE} between {CLIENT_NAME} ("Client") and {COMPANY_NAME} ("Company").

TERMS AND CONDITIONS:

1. Scope of Work: {SCOPE_OF_WORK}

2. Duration: This agreement shall be effective from {START_DATE} to {END_DATE}.

3. Payment Terms: {PAYMENT_TERMS}

4. Responsibilities:
   Client Responsibilities: {CLIENT_RESPONSIBILITIES}
   Company Responsibilities: {COMPANY_RESPONSIBILITIES}

5. Termination: {TERMINATION_CLAUSE}

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

Client: _____________________
Date: _______________________

Company Representative: _____________________
Date: _______________________
      `,
      [LegalDocumentType.AGREEMENT]: `
LEGAL AGREEMENT

Parties: {CLIENT_NAME} and {COMPANY_NAME}
Date: {DATE}
Case Reference: {CASE_NUMBER}

AGREEMENT TERMS:

{AGREEMENT_TERMS}

Signatures:
_____________________     _____________________
{CLIENT_NAME}            {COMPANY_NAME}
Date: _______________    Date: _______________
      `,
      [LegalDocumentType.LEASE]: `
LEASE AGREEMENT

Landlord: {LANDLORD_NAME}
Tenant: {TENANT_NAME}
Property: {PROPERTY_ADDRESS}
Lease Term: {LEASE_START} to {LEASE_END}
Monthly Rent: {MONTHLY_RENT}

TERMS AND CONDITIONS:
{LEASE_TERMS}

Landlord Signature: _____________________
Tenant Signature: _____________________
Date: {DATE}
      `,
      [LegalDocumentType.POWER_OF_ATTORNEY]: `
POWER OF ATTORNEY

I, {PRINCIPAL_NAME}, hereby appoint {ATTORNEY_NAME} as my attorney-in-fact to act in my name, place, and stead for the following purposes:

{POWERS_GRANTED}

This Power of Attorney shall become effective on {EFFECTIVE_DATE} and shall remain in effect until {EXPIRATION_DATE}.

Principal: _____________________
Date: {DATE}

Notary: _____________________
      `,
      [LegalDocumentType.WILL]: `
LAST WILL AND TESTAMENT

I, {TESTATOR_NAME}, being of sound mind and disposing memory, do hereby make, publish, and declare this to be my Last Will and Testament.

ARTICLE I - REVOCATION
I hereby revoke all former wills and codicils made by me.

ARTICLE II - EXECUTOR
I nominate {EXECUTOR_NAME} as the Executor of this Will.

ARTICLE III - BEQUESTS
{BEQUESTS}

IN WITNESS WHEREOF, I have hereunto set my hand this {DATE}.

Testator: _____________________

Witnesses:
_____________________     _____________________
      `,
      [LegalDocumentType.COMPLAINT]: `
IN THE {COURT_NAME}

{PLAINTIFF_NAME},
                    Plaintiff,
v.                                Case No.: {CASE_NUMBER}

{DEFENDANT_NAME},
                    Defendant.

COMPLAINT

NOW COMES the Plaintiff and states:

1. {JURISDICTIONAL_ALLEGATION}

2. {FACTUAL_ALLEGATIONS}

3. {LEGAL_CLAIMS}

WHEREFORE, Plaintiff demands judgment against Defendant for:
{RELIEF_SOUGHT}

Respectfully submitted,
{ATTORNEY_NAME}
Attorney for Plaintiff
Date: {DATE}
      `,
      [LegalDocumentType.MOTION]: `
IN THE {COURT_NAME}

{CASE_CAPTION}
                                Case No.: {CASE_NUMBER}

{MOTION_TYPE}

TO THE HONORABLE COURT:

NOW COMES {MOVANT_NAME} and respectfully moves this Court for {RELIEF_REQUESTED} and in support thereof states:

{MOTION_BODY}

WHEREFORE, {MOVANT_NAME} respectfully requests that this Court grant this Motion.

Respectfully submitted,
{ATTORNEY_NAME}
Date: {DATE}
      `,
      [LegalDocumentType.BRIEF]: `
{DOCUMENT_TITLE}

Case: {CASE_NAME}
Case No.: {CASE_NUMBER}
Court: {COURT_NAME}

TABLE OF CONTENTS
I. Introduction
II. Statement of Facts
III. Argument
IV. Conclusion

I. INTRODUCTION
{INTRODUCTION}

II. STATEMENT OF FACTS
{STATEMENT_OF_FACTS}

III. ARGUMENT
{LEGAL_ARGUMENT}

IV. CONCLUSION
{CONCLUSION}

Respectfully submitted,
{ATTORNEY_NAME}
Date: {DATE}
      `,
      [LegalDocumentType.AFFIDAVIT]: `
AFFIDAVIT OF {AFFIANT_NAME}

STATE OF {STATE}
COUNTY OF {COUNTY}

I, {AFFIANT_NAME}, being duly sworn, depose and state:

{AFFIDAVIT_CONTENT}

I declare under penalty of perjury that the foregoing is true and correct.

_____________________
{AFFIANT_NAME}

Subscribed and sworn to before me this {DATE}.

_____________________
Notary Public
      `,
      [LegalDocumentType.SUBPOENA]: `
SUBPOENA

TO: {RECIPIENT_NAME}
ADDRESS: {RECIPIENT_ADDRESS}

YOU ARE COMMANDED to appear in {COURT_NAME}, located at {COURT_ADDRESS}, at {TIME} on {DATE}, to {SUBPOENA_PURPOSE}.

If you fail to appear, you may be held in contempt of court.

Date: {DATE}
Clerk of Court: _____________________
      `,
      [LegalDocumentType.SETTLEMENT]: `
SETTLEMENT AGREEMENT

Parties: {PARTY_1_NAME} and {PARTY_2_NAME}
Case Reference: {CASE_NUMBER}
Date: {DATE}

SETTLEMENT TERMS:

The parties agree to settle all claims as follows:

{SETTLEMENT_TERMS}

Both parties acknowledge that this settlement is final and binding.

Party 1: _____________________
Date: _______________

Party 2: _____________________
Date: _______________
      `,
      [LegalDocumentType.OTHER]: `
{DOCUMENT_TITLE}

Date: {DATE}
Prepared for: {CLIENT_NAME}
Case: {CASE_NUMBER}

{DOCUMENT_CONTENT}

Prepared by: {COMPANY_NAME}
Date: {DATE}
      `,
    };
  }

  private mapLegalDocumentTypeToDocumentType(legalType: LegalDocumentType): DocumentType {
    const mapping: Record<LegalDocumentType, DocumentType> = {
      [LegalDocumentType.CONTRACT]: DocumentType.CONTRACT,
      [LegalDocumentType.AGREEMENT]: DocumentType.AGREEMENT,
      [LegalDocumentType.LEASE]: DocumentType.LEASE,
      [LegalDocumentType.POWER_OF_ATTORNEY]: DocumentType.POWER_OF_ATTORNEY,
      [LegalDocumentType.WILL]: DocumentType.WILL,
      [LegalDocumentType.COMPLAINT]: DocumentType.COMPLAINT,
      [LegalDocumentType.MOTION]: DocumentType.MOTION,
      [LegalDocumentType.BRIEF]: DocumentType.BRIEF,
      [LegalDocumentType.AFFIDAVIT]: DocumentType.AFFIDAVIT,
      [LegalDocumentType.SUBPOENA]: DocumentType.SUMMONS,
      [LegalDocumentType.SETTLEMENT]: DocumentType.AGREEMENT,
      [LegalDocumentType.OTHER]: DocumentType.OTHER,
    };

    return mapping[legalType] || DocumentType.OTHER;
  }

  async getGenerationTasks(userId: number): Promise<AgentTask[]> {
    return this.agentTaskRepository.find({
      where: {
        type: AgentType.LEGAL_DOCUMENT_GENERATOR,
        createdBy: userId,
      },
      relations: ['document', 'case', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getGenerationTask(taskId: number, userId: number): Promise<AgentTask> {
    const task = await this.agentTaskRepository.findOne({
      where: {
        id: taskId,
        type: AgentType.LEGAL_DOCUMENT_GENERATOR,
        createdBy: userId,
      },
      relations: ['document', 'case', 'user'],
    });

    if (!task) {
      throw new NotFoundException('Generation task not found');
    }

    return task;
  }
}
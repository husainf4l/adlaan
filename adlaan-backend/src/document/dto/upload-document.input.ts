import { InputType, Field, Int } from '@nestjs/graphql';
import { DocumentType, DocumentStatus } from '../enums/document.enum';

@InputType({ description: 'Input for uploading a document' })
export class UploadDocumentInput {
  @Field({ description: 'Document title' })
  title: string;

  @Field({ nullable: true, description: 'Document description' })
  description?: string;

  @Field({ description: 'Base64 encoded file content' })
  fileBase64: string;

  @Field({ description: 'Original filename with extension' })
  fileName: string;

  @Field(() => DocumentType, { description: 'Type of document' })
  documentType: DocumentType;

  @Field(() => DocumentStatus, { 
    nullable: true, 
    description: 'Document status',
    defaultValue: DocumentStatus.DRAFT 
  })
  status?: DocumentStatus;

  @Field(() => Int, { nullable: true, description: 'Related case ID' })
  caseId?: number;

  @Field(() => Int, { nullable: true, description: 'Related client ID' })
  clientId?: number;
}

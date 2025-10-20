import { InputType, Field, Int } from '@nestjs/graphql';
import { DocumentType, DocumentStatus } from '../enums/document.enum';

@InputType({ description: 'Input to create a new document' })
export class CreateDocumentInput {
  @Field({ description: 'Document title' })
  title: string;

  @Field({ nullable: true, description: 'Document description' })
  description?: string;

  @Field({ nullable: true, description: 'Document content/body' })
  content?: string;

  @Field({ nullable: true, description: 'File URL' })
  fileUrl?: string;

  @Field(() => DocumentType, { 
    description: 'Type of document',
    defaultValue: DocumentType.OTHER,
  })
  documentType: DocumentType;

  @Field(() => DocumentStatus, { 
    description: 'Status of the document',
    defaultValue: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Field(() => Int, { nullable: true, description: 'Associated case ID' })
  caseId?: number;

  @Field(() => Int, { nullable: true, description: 'Associated client ID' })
  clientId?: number;

  @Field(() => [Int], { nullable: true, description: 'Tag IDs to associate' })
  tagIds?: number[];
}

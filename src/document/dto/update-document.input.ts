import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateDocumentInput } from './create-document.input';
import { DocumentType, DocumentStatus } from '../enums/document.enum';

@InputType({ description: 'Input to update an existing document' })
export class UpdateDocumentInput extends PartialType(CreateDocumentInput) {
  @Field({ nullable: true, description: 'Document title' })
  title?: string;

  @Field({ nullable: true, description: 'Document description' })
  description?: string;

  @Field({ nullable: true, description: 'Document content/body' })
  content?: string;

  @Field({ nullable: true, description: 'File URL' })
  fileUrl?: string;

  @Field(() => DocumentType, { nullable: true, description: 'Type of document' })
  documentType?: DocumentType;

  @Field(() => DocumentStatus, { nullable: true, description: 'Status of the document' })
  status?: DocumentStatus;

  @Field(() => Int, { nullable: true, description: 'Associated case ID' })
  caseId?: number;

  @Field(() => Int, { nullable: true, description: 'Associated client ID' })
  clientId?: number;

  @Field(() => [Int], { nullable: true, description: 'Tag IDs to associate' })
  tagIds?: number[];
}

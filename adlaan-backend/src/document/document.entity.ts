import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinColumn, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Company } from '../company/company.entity';
import { User } from '../user/user.entity';
import { Client } from '../client/client.entity';
import { Case } from '../case/case.entity';
import { DocumentType, DocumentStatus } from './enums/document.enum';

// Register enums for GraphQL
registerEnumType(DocumentType, {
  name: 'DocumentType',
  description: 'Type of legal document',
});

registerEnumType(DocumentStatus, {
  name: 'DocumentStatus',
  description: 'Status of the document',
});

@ObjectType({ description: 'Legal document model' })
@Entity()
export class Document {
  @Field(() => ID, { description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'Document title' })
  @Column()
  title: string;

  @Field({ nullable: true, description: 'Document description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field({ nullable: true, description: 'Document content/body' })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @Field({ nullable: true, description: 'File URL (S3 or storage path)' })
  @Column({ nullable: true })
  fileUrl?: string;

  @Field(() => DocumentType, { description: 'Type of document' })
  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  documentType: DocumentType;

  @Field(() => DocumentStatus, { description: 'Current status of the document' })
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Field(() => Int, { description: 'Version number', defaultValue: 1 })
  @Column({ default: 1 })
  version: number;

  @Field(() => Int, { nullable: true, description: 'Associated case ID' })
  @Column({ nullable: true })
  caseId?: number;

  @Field(() => Case, { nullable: true, description: 'Associated case' })
  @ManyToOne(() => Case, { nullable: true })
  @JoinColumn({ name: 'caseId' })
  case?: Case;

  // AI-related fields
  @Field(() => Boolean, { defaultValue: false, description: 'Whether document was AI-generated' })
  @Column({ default: false })
  isAiGenerated: boolean;

  @Field(() => String, { nullable: true, description: 'AI-generated summary of the document' })
  @Column({ type: 'text', nullable: true })
  aiSummary?: string;

  @Field(() => String, { nullable: true, description: 'AI-determined classification' })
  @Column({ nullable: true })
  aiClassification?: string;

  @Field(() => String, { nullable: true, description: 'AI analysis metadata' })
  @Column({ type: 'jsonb', nullable: true })
  aiMetadata?: any;

  @Field(() => Number, { nullable: true, description: 'AI confidence score for classification (0-1)' })
  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  aiConfidenceScore?: number;

  @Field(() => Int, { nullable: true, description: 'Associated client ID' })
  @Column({ nullable: true })
  clientId?: number;

  @Field(() => Client, { nullable: true, description: 'Associated client' })
  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client?: Client;

  @Field(() => Int, { description: 'Company this document belongs to' })
  @Column()
  companyId: number;

  @Field(() => Company, { description: 'Associated company' })
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Field(() => Int, { description: 'User who created this document' })
  @Column()
  createdById: number;

  @Field(() => User, { description: 'User who created this document' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field(() => [Tag], { 
    description: 'Tags associated with this document',
    nullable: true 
  })
  @ManyToMany(() => Tag, (tag) => tag.documents)
  @JoinTable({
    name: 'document_tags',
    joinColumn: { name: 'documentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags?: Tag[];

  @Field({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @Field({ description: 'Last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}

// Forward reference to avoid circular dependency
import { Tag } from '../tag/tag.entity';

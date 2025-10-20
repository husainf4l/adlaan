import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Document } from '../document/document.entity';
import { User } from '../user/user.entity';

@ObjectType({ description: 'Document version history' })
@Entity()
export class DocumentVersion {
  @Field(() => ID, { description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int, { description: 'Document ID this version belongs to' })
  @Column()
  documentId: number;

  @Field(() => Document, { description: 'Associated document' })
  @ManyToOne(() => Document)
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Field(() => Int, { description: 'Version number' })
  @Column()
  versionNumber: number;

  @Field({ description: 'Document title at this version' })
  @Column()
  title: string;

  @Field({ nullable: true, description: 'Document content snapshot' })
  @Column({ type: 'text', nullable: true })
  content?: string;

  @Field({ nullable: true, description: 'File URL at this version' })
  @Column({ nullable: true })
  fileUrl?: string;

  @Field({ nullable: true, description: 'Description of changes made in this version' })
  @Column({ type: 'text', nullable: true })
  changeDescription?: string;

  @Field(() => Int, { description: 'User who created this version' })
  @Column()
  createdById: number;

  @Field(() => User, { description: 'User who created this version' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;
}

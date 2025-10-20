import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Document } from '../document/document.entity';
import { User } from '../user/user.entity';

@ObjectType({ description: 'Comment on a document' })
@Entity()
export class Comment {
  @Field(() => ID, { description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int, { description: 'Document this comment belongs to' })
  @Column()
  documentId: number;

  @Field(() => Document, { description: 'Associated document' })
  @ManyToOne(() => Document)
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Field({ description: 'Comment text' })
  @Column({ type: 'text' })
  content: string;

  @Field(() => Int, { nullable: true, description: 'Parent comment ID for threading' })
  @Column({ nullable: true })
  parentId?: number;

  @Field(() => Comment, { nullable: true, description: 'Parent comment' })
  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: Comment;

  @Field(() => [Comment], { nullable: true, description: 'Replies to this comment' })
  @OneToMany(() => Comment, (comment) => comment.parent)
  replies?: Comment[];

  @Field(() => Int, { nullable: true, description: 'Character position for inline comments' })
  @Column({ nullable: true })
  position?: number;

  @Field(() => [String], { nullable: true, description: 'Mentioned user IDs (@mentions)' })
  @Column('simple-array', { nullable: true })
  mentions?: string[];

  @Field({ nullable: true, description: 'Quoted text from document for context' })
  @Column({ type: 'text', nullable: true })
  quotedText?: string;

  @Field({ description: 'Whether comment is resolved' })
  @Column({ default: false })
  resolved: boolean;

  @Field(() => Int, { nullable: true, description: 'User who resolved the comment' })
  @Column({ nullable: true })
  resolvedById?: number;

  @Field(() => User, { nullable: true, description: 'User who resolved' })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolvedById' })
  resolvedBy?: User;

  @Field({ nullable: true, description: 'When comment was resolved' })
  @Column({ nullable: true })
  resolvedAt?: Date;

  @Field(() => Int, { description: 'User who created this comment' })
  @Column()
  createdById: number;

  @Field(() => User, { description: 'User who created this comment' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @Field({ description: 'Last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}

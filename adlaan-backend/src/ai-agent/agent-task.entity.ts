import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { Case } from '../case/case.entity';
import { Document } from '../document/document.entity';
import { AgentType, AgentTaskStatus } from './enums';

@ObjectType()
@Entity('agent_tasks')
export class AgentTask {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => AgentType)
  @Column({
    type: 'enum',
    enum: AgentType,
  })
  type: AgentType;

  @Field(() => AgentTaskStatus)
  @Column({
    type: 'enum',
    enum: AgentTaskStatus,
    default: AgentTaskStatus.PENDING,
  })
  status: AgentTaskStatus;

  @Field(() => String)
  @Column('text')
  input: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  output: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  errorMessage: string;

  @Field(() => String, { nullable: true })
  @Column('jsonb', { nullable: true })
  metadata: any;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  caseId: number;

  @Field(() => Case, { nullable: true })
  @ManyToOne(() => Case, { nullable: true })
  @JoinColumn({ name: 'caseId' })
  case: Case;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  documentId: number;

  @Field(() => Document, { nullable: true })
  @ManyToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Field(() => Int)
  @Column()
  createdBy: number;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  user: User;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  completedAt: Date;
}
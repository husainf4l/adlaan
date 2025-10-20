import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinColumn, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Company } from '../company/company.entity';
import { User } from '../user/user.entity';
import { Client } from '../client/client.entity';
import { CaseStatus, CaseType } from './enums/case.enum';

// Register enums for GraphQL
registerEnumType(CaseStatus, {
  name: 'CaseStatus',
  description: 'Status of the legal case',
});

registerEnumType(CaseType, {
  name: 'CaseType',
  description: 'Type of legal case',
});

@ObjectType({ description: 'Legal case model' })
@Entity()
export class Case {
  @Field(() => ID, { description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'Unique case number' })
  @Column({ unique: true })
  caseNumber: string;

  @Field({ description: 'Case title' })
  @Column()
  title: string;

  @Field({ nullable: true, description: 'Case description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => CaseStatus, { description: 'Current status of the case' })
  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.ACTIVE,
  })
  status: CaseStatus;

  @Field(() => CaseType, { description: 'Type of legal case' })
  @Column({
    type: 'enum',
    enum: CaseType,
  })
  caseType: CaseType;

  @Field({ nullable: true, description: 'Court or jurisdiction' })
  @Column({ nullable: true })
  court?: string;

  @Field({ nullable: true, description: 'Opposing party name' })
  @Column({ nullable: true })
  opposingParty?: string;

  @Field({ nullable: true, description: 'Case filing date' })
  @Column({ type: 'date', nullable: true })
  filingDate?: Date;

  @Field({ nullable: true, description: 'Case closing date' })
  @Column({ type: 'date', nullable: true })
  closingDate?: Date;

  @Field({ nullable: true, description: 'Additional notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field(() => Int, { description: 'Client associated with this case' })
  @Column()
  clientId: number;

  @Field(() => Client, { description: 'Client information' })
  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Field(() => Int, { description: 'Company this case belongs to' })
  @Column()
  companyId: number;

  @Field(() => Company, { description: 'Associated company' })
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Field(() => Int, { description: 'User who created this case' })
  @Column()
  createdById: number;

  @Field(() => User, { description: 'User who created this case' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field(() => [User], { nullable: true, description: 'Users assigned to this case' })
  @ManyToMany(() => User)
  @JoinTable({
    name: 'case_assigned_users',
    joinColumn: { name: 'caseId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  assignedUsers?: User[];

  @Field({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @Field({ description: 'Last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}

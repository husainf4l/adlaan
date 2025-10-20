import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Company } from '../company/company.entity';
import { User } from '../user/user.entity';
import { ClientType } from './enums/client-type.enum';

// Register the enum for GraphQL
registerEnumType(ClientType, {
  name: 'ClientType',
  description: 'Type of client (individual or organization)',
});

@ObjectType({ description: 'Client model for legal cases' })
@Entity()
export class Client {
  @Field(() => ID, { description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'Client name or organization name' })
  @Column()
  name: string;

  @Field(() => ClientType, { description: 'Type of client' })
  @Column({
    type: 'enum',
    enum: ClientType,
    default: ClientType.INDIVIDUAL,
  })
  type: ClientType;

  @Field({ nullable: true, description: 'Client email address' })
  @Column({ nullable: true })
  email?: string;

  @Field({ nullable: true, description: 'Client phone number' })
  @Column({ nullable: true })
  phone?: string;

  @Field({ nullable: true, description: 'Client address' })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @Field({ nullable: true, description: 'Contact person name (for organizations)' })
  @Column({ nullable: true })
  contactPerson?: string;

  @Field({ nullable: true, description: 'Tax ID or business registration number' })
  @Column({ nullable: true })
  taxId?: string;

  @Field({ nullable: true, description: 'Additional notes about the client' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field(() => Int, { description: 'Company this client belongs to' })
  @Column()
  companyId: number;

  @Field(() => Company, { description: 'Associated company' })
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Field(() => Int, { description: 'User who created this client' })
  @Column()
  createdById: number;

  @Field(() => User, { description: 'User who created this client' })
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

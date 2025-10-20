import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Company } from '../company/company.entity';
import { Document } from '../document/document.entity';

@ObjectType({ description: 'Tag for categorizing documents' })
@Entity()
export class Tag {
  @Field(() => ID, { description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'Tag name' })
  @Column()
  name: string;

  @Field({ description: 'Tag color in hex format (e.g., #FF5733)', nullable: true })
  @Column({ nullable: true })
  color?: string;

  @Field({ nullable: true, description: 'Tag description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => Int, { description: 'Company this tag belongs to' })
  @Column()
  companyId: number;

  @Field(() => Company, { description: 'Associated company' })
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Field(() => [Document], { description: 'Documents with this tag', nullable: true })
  @ManyToMany(() => Document, (document) => document.tags)
  documents?: Document[];

  @Field({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;
}

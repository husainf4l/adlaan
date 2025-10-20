import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Company } from '../company/company.entity';
import { UserRole } from './enums/user-role.enum';

// Register the enum for GraphQL
registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role in the system',
});

@ObjectType({ description: 'User model' })
@Entity()
export class User {
  @Field(() => ID, { description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'User full name' })
  @Column()
  name: string;

  @Field({ description: 'User email address' })
  @Column({ unique: true })
  email: string;

  @Field({ description: 'User password (hashed)' })
  @Column()
  password: string;

  @Field(() => UserRole, { description: 'User role in the system' })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole;

  @Field(() => Int, { nullable: true, description: 'Associated company ID' })
  @Column({ nullable: true })
  companyId?: number;

  @Field(() => Company, { nullable: true, description: 'Associated company' })
  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'companyId' })
  company?: Company;
}

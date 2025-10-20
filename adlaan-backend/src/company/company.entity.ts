import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../user/user.entity';

@ObjectType({ description: 'Company model' })
@Entity()
export class Company {
  @Field(() => ID, { description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'Company name' })
  @Column()
  name: string;

  @Field({ nullable: true, description: 'Company description' })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true, description: 'Company address' })
  @Column({ nullable: true })
  address?: string;

  @Field({ nullable: true, description: 'Company phone number' })
  @Column({ nullable: true })
  phone?: string;

  @Field({ nullable: true, description: 'Company email address' })
  @Column({ nullable: true })
  email?: string;

  @Field({ nullable: true, description: 'Company website URL' })
  @Column({ nullable: true })
  website?: string;

  @Field(() => [User], { nullable: true, description: 'Users belonging to this company' })
  @OneToMany(() => User, (user) => user.company)
  users?: User[];
}

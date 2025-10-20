import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';
import { UserRole } from './enums/user-role.enum';

@InputType({ description: 'Input to update an existing user' })
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field({ nullable: true, description: 'User full name' })
  name?: string;

  @Field({ nullable: true, description: 'User email address' })
  email?: string;

  @Field({ nullable: true, description: 'User password' })
  password?: string;

  @Field(() => UserRole, { nullable: true, description: 'User role' })
  role?: UserRole;

  @Field(() => Int, { nullable: true, description: 'Associated company ID' })
  companyId?: number;
}

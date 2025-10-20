import { InputType, Field, Int } from '@nestjs/graphql';
import { UserRole } from '../../user/enums/user-role.enum';

@InputType({ description: 'Input for user registration' })
export class RegisterInput {
  @Field({ description: 'User full name' })
  name: string;

  @Field({ description: 'User email address' })
  email: string;

  @Field({ description: 'User password' })
  password: string;

  @Field(() => UserRole, { 
    nullable: true, 
    description: 'User role (defaults to ADMIN, USER when connected to company)',
    defaultValue: UserRole.ADMIN,
  })
  role?: UserRole;

  @Field(() => Int, { nullable: true, description: 'Associated company ID' })
  companyId?: number;
}

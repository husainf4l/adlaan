import { InputType, Field } from '@nestjs/graphql';

@InputType({ description: 'Input for user login' })
export class LoginInput {
  @Field({ description: 'User email address' })
  email: string;

  @Field({ description: 'User password' })
  password: string;
}

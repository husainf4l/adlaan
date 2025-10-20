import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../user/user.entity';

@ObjectType({ description: 'Authentication response with access token and user data' })
export class AuthResponse {
  @Field({ description: 'JWT access token' })
  access_token: string;

  @Field(() => User, { description: 'Authenticated user data' })
  user: User;
}

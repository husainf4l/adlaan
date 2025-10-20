import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType({ description: 'SMS balance response' })
export class BalanceResponse {
  @Field({ description: 'Whether the request was successful' })
  success: boolean;

  @Field(() => Float, { nullable: true, description: 'Account balance' })
  balance?: number;

  @Field({ nullable: true, description: 'Currency code (e.g., JOD)' })
  currency?: string;

  @Field({ nullable: true, description: 'Error message if failed' })
  error?: string;
}

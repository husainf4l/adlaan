import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType({ description: 'SMS send response' })
export class SendSMSResponse {
  @Field({ description: 'Whether the SMS was sent successfully' })
  success: boolean;

  @Field({ nullable: true, description: 'Message ID for tracking' })
  messageId?: string;

  @Field({ nullable: true, description: 'Response from SMS gateway' })
  response?: string;

  @Field({ nullable: true, description: 'Error message if failed' })
  error?: string;
}

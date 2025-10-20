import { InputType, Field } from '@nestjs/graphql';

@InputType({ description: 'Input for sending bulk SMS messages' })
export class SendBulkSMSInput {
  @Field(() => [String], { description: 'Array of phone numbers (max 120)' })
  phoneNumbers: string[];

  @Field({ description: 'Message content to send to all recipients' })
  message: string;

  @Field({ nullable: true, description: 'Optional custom sender ID' })
  senderId?: string;

  @Field({ nullable: true, description: 'Optional message ID for tracking' })
  messageId?: string;
}

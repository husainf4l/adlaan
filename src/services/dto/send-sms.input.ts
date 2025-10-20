import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { JOSMSMessageType } from '../josms.service';

registerEnumType(JOSMSMessageType, {
  name: 'JOSMSMessageType',
  description: 'Type of SMS message',
});

@InputType({ description: 'Input for sending a single SMS' })
export class SendSMSInput {
  @Field({ description: 'Phone number in international format (e.g., 962XXXXXXXXX, 07XXXXXXXX)' })
  phoneNumber: string;

  @Field({ description: 'Message content to send' })
  message: string;

  @Field(() => JOSMSMessageType, { 
    nullable: true, 
    description: 'Type of message (OTP or GENERAL)',
    defaultValue: JOSMSMessageType.GENERAL,
  })
  type?: JOSMSMessageType;

  @Field({ nullable: true, description: 'Optional message ID for tracking' })
  messageId?: string;
}

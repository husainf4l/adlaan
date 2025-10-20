import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JOSMSService, JOSMSMessageType } from './josms.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { SendSMSResponse } from './dto/send-sms-response.dto';
import { BalanceResponse } from './dto/balance-response.dto';
import { SendSMSInput } from './dto/send-sms.input';
import { SendBulkSMSInput } from './dto/send-bulk-sms.input';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
export class JOSMSResolver {
  constructor(private josmsService: JOSMSService) {}

  @Query(() => BalanceResponse, { description: 'Get JOSMS account balance' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async smsBalance(): Promise<BalanceResponse> {
    const result = await this.josmsService.getBalance();
    return {
      success: result.success,
      balance: result.balance,
      currency: result.currency,
      error: result.error,
    };
  }

  @Mutation(() => SendSMSResponse, { description: 'Send a single SMS message' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async sendSMS(@Args('input') input: SendSMSInput): Promise<SendSMSResponse> {
    const result = await this.josmsService.sendSMS(
      input.phoneNumber,
      input.message,
      {
        type: input.type || JOSMSMessageType.GENERAL,
        messageId: input.messageId,
      },
    );

    return {
      success: result.success,
      messageId: result.messageId,
      response: result.response,
      error: result.error,
    };
  }

  @Mutation(() => SendSMSResponse, { description: 'Send bulk SMS messages' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async sendBulkSMS(@Args('input') input: SendBulkSMSInput): Promise<SendSMSResponse> {
    const result = await this.josmsService.sendBulkMessages({
      numbers: input.phoneNumbers,
      message: input.message,
      senderId: input.senderId,
      messageId: input.messageId,
    });

    return {
      success: result.success,
      messageId: result.messageId,
      response: result.response,
      error: result.error,
    };
  }
}

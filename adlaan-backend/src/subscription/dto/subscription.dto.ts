import { IsEnum, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { SubscriptionPlan, BillingCycle } from '../../../generated/prisma';

export class UpdateSubscriptionDto {
  @IsEnum(SubscriptionPlan, { message: 'Please provide a valid subscription plan' })
  plan: SubscriptionPlan;

  @IsOptional()
  @IsEnum(BillingCycle, { message: 'Please provide a valid billing cycle' })
  billingCycle?: BillingCycle;
}

export class StartTrialDto {
  @IsEnum(SubscriptionPlan, { message: 'Please provide a valid subscription plan' })
  plan: SubscriptionPlan;
}

export class CheckLimitsDto {
  @IsNumber({}, { message: 'Count must be a number' })
  @IsPositive({ message: 'Count must be a positive number' })
  count: number;
}

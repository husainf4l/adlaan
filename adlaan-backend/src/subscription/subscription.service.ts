import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { Subscription, SubscriptionPlan, SubscriptionStatus, BillingCycle } from '../../generated/prisma';

export interface CreateSubscriptionDto {
  plan: SubscriptionPlan;
  billingCycle?: BillingCycle;
  trialDays?: number;
}

export interface UpdateSubscriptionDto {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  billingCycle?: BillingCycle;
}

export interface SubscriptionWithFeatures extends Subscription {
  features: {
    maxUsers: number;
    maxProjects: number;
    maxStorage: number;
    hasAdvancedFeatures: boolean;
    hasPrioritySupport: boolean;
  };
}

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a default free subscription for a company
   */
  async createFreeSubscription(companyId: string): Promise<Subscription> {
    const subscription = await this.prisma.subscription.create({
      data: {
        plan: 'FREE',
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
        amount: 0,
        maxUsers: 5,
        maxProjects: 3,
        maxStorage: 1000, // 1GB
        hasAdvancedFeatures: false,
        hasPrioritySupport: false,
        company: {
          connect: { id: companyId },
        },
      },
    });

    return subscription;
  }

  /**
   * Get subscription with features by company ID
   */
  async getCompanySubscription(companyId: string): Promise<SubscriptionWithFeatures | null> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: true,
      },
    });

    if (!company?.subscription) {
      return null;
    }

    return {
      ...company.subscription,
      features: {
        maxUsers: company.subscription.maxUsers,
        maxProjects: company.subscription.maxProjects,
        maxStorage: company.subscription.maxStorage,
        hasAdvancedFeatures: company.subscription.hasAdvancedFeatures,
        hasPrioritySupport: company.subscription.hasPrioritySupport,
      },
    };
  }

  /**
   * Upgrade/downgrade subscription
   */
  async updateSubscription(
    companyId: string,
    updateDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!company.subscription) {
      throw new NotFoundException('No subscription found for this company');
    }

    // Get plan features based on the new plan
    const planFeatures = this.getPlanFeatures(updateDto.plan || company.subscription.plan);

    const subscription = await this.prisma.subscription.update({
      where: { id: company.subscription.id },
      data: {
        ...updateDto,
        ...planFeatures,
        updatedAt: new Date(),
      },
    });

    return subscription;
  }

  /**
   * Cancel subscription (downgrade to free)
   */
  async cancelSubscription(companyId: string): Promise<Subscription> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!company.subscription) {
      throw new NotFoundException('No subscription found for this company');
    }

    const freeFeatures = this.getPlanFeatures('FREE');

    const subscription = await this.prisma.subscription.update({
      where: { id: company.subscription.id },
      data: {
        plan: 'FREE',
        status: 'ACTIVE',
        amount: 0,
        endDate: null,
        nextBillingDate: null,
        ...freeFeatures,
        updatedAt: new Date(),
      },
    });

    return subscription;
  }

  /**
   * Check if company can add more users based on subscription
   */
  async canAddUsers(companyId: string, requestedUsers: number): Promise<boolean> {
    const subscription = await this.getCompanySubscription(companyId);
    
    if (!subscription) {
      return false;
    }

    const currentUserCount = await this.prisma.user.count({
      where: { companyId },
    });

    return currentUserCount + requestedUsers <= subscription.maxUsers;
  }

  /**
   * Check if company has reached project limit
   */
  async canCreateProjects(companyId: string, requestedProjects: number = 1): Promise<boolean> {
    const subscription = await this.getCompanySubscription(companyId);
    
    if (!subscription) {
      return false;
    }

    // For now, we'll assume you have a projects table later
    // const currentProjectCount = await this.prisma.project.count({
    //   where: { companyId },
    // });

    // For demo purposes, always allow if subscription exists
    return subscription.maxProjects > 0;
  }

  /**
   * Get available subscription plans with pricing
   */
  getAvailablePlans() {
    return [
      {
        plan: 'FREE',
        name: 'Free Plan',
        price: 0,
        billingCycle: 'MONTHLY',
        features: this.getPlanFeatures('FREE'),
        description: 'Perfect for small teams getting started',
      },
      {
        plan: 'BASIC',
        name: 'Basic Plan',
        price: 19,
        billingCycle: 'MONTHLY',
        features: this.getPlanFeatures('BASIC'),
        description: 'Great for growing teams',
      },
      {
        plan: 'PRO',
        name: 'Pro Plan',
        price: 49,
        billingCycle: 'MONTHLY',
        features: this.getPlanFeatures('PRO'),
        description: 'Advanced features for professional teams',
      },
      {
        plan: 'ENTERPRISE',
        name: 'Enterprise Plan',
        price: 99,
        billingCycle: 'MONTHLY',
        features: this.getPlanFeatures('ENTERPRISE'),
        description: 'Everything you need for large organizations',
      },
    ];
  }

  /**
   * Get plan features based on plan type
   */
  private getPlanFeatures(plan: SubscriptionPlan) {
    switch (plan) {
      case 'FREE':
        return {
          maxUsers: 5,
          maxProjects: 3,
          maxStorage: 1000, // 1GB
          hasAdvancedFeatures: false,
          hasPrioritySupport: false,
        };
      case 'BASIC':
        return {
          maxUsers: 20,
          maxProjects: 10,
          maxStorage: 5000, // 5GB
          hasAdvancedFeatures: false,
          hasPrioritySupport: false,
        };
      case 'PRO':
        return {
          maxUsers: 100,
          maxProjects: 50,
          maxStorage: 25000, // 25GB
          hasAdvancedFeatures: true,
          hasPrioritySupport: true,
        };
      case 'ENTERPRISE':
        return {
          maxUsers: -1, // Unlimited
          maxProjects: -1, // Unlimited
          maxStorage: -1, // Unlimited
          hasAdvancedFeatures: true,
          hasPrioritySupport: true,
        };
      default:
        return this.getPlanFeatures('FREE');
    }
  }

  /**
   * Start a trial for a subscription plan
   */
  async startTrial(companyId: string, plan: SubscriptionPlan, trialDays: number = 14): Promise<Subscription> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!company.subscription) {
      throw new NotFoundException('No subscription found for this company');
    }

    if (company.subscription.isTrialActive) {
      throw new BadRequestException('Trial is already active for this company');
    }

    const planFeatures = this.getPlanFeatures(plan);
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    const subscription = await this.prisma.subscription.update({
      where: { id: company.subscription.id },
      data: {
        plan,
        status: 'TRIALING',
        isTrialActive: true,
        trialStartDate,
        trialEndDate,
        ...planFeatures,
        updatedAt: new Date(),
      },
    });

    return subscription;
  }
}

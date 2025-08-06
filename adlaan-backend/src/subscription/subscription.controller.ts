import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Request,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CompanyService } from '../company/company.service';
import { UpdateSubscriptionDto, StartTrialDto, CheckLimitsDto } from './dto/subscription.dto';
import type { Request as ExpressRequest } from 'express';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly companyService: CompanyService,
  ) {}

  /**
   * Get current company's subscription
   */
  @Get('my-subscription')
  async getMySubscription(@Request() req: ExpressRequest & { user: any }) {
    const userCompany = await this.companyService.getUserCompany(req.user.id);
    
    if (!userCompany) {
      throw new NotFoundException('User is not a member of any company');
    }

    const subscription = await this.subscriptionService.getCompanySubscription(userCompany.id);
    
    return {
      subscription,
      company: {
        id: userCompany.id,
        name: userCompany.name,
      },
    };
  }

  /**
   * Get available subscription plans
   */
  @Get('plans')
  async getAvailablePlans() {
    const plans = this.subscriptionService.getAvailablePlans();
    return {
      plans,
    };
  }

  /**
   * Upgrade/downgrade subscription
   */
  @Patch('upgrade')
  async updateSubscription(
    @Body() updateDto: UpdateSubscriptionDto,
    @Request() req: ExpressRequest & { user: any },
  ) {
    const userCompany = await this.companyService.getUserCompany(req.user.id);
    
    if (!userCompany) {
      throw new NotFoundException('User is not a member of any company');
    }

    // Check if user is the company owner
    if (userCompany.ownerId !== req.user.id) {
      throw new NotFoundException('Only company owner can manage subscription');
    }

    const subscription = await this.subscriptionService.updateSubscription(
      userCompany.id,
      updateDto,
    );

    return {
      message: 'Subscription updated successfully',
      subscription,
    };
  }

  /**
   * Cancel subscription (downgrade to free)
   */
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(@Request() req: ExpressRequest & { user: any }) {
    const userCompany = await this.companyService.getUserCompany(req.user.id);
    
    if (!userCompany) {
      throw new NotFoundException('User is not a member of any company');
    }

    // Check if user is the company owner
    if (userCompany.ownerId !== req.user.id) {
      throw new NotFoundException('Only company owner can cancel subscription');
    }

    const subscription = await this.subscriptionService.cancelSubscription(userCompany.id);

    return {
      message: 'Subscription canceled successfully. Downgraded to free plan.',
      subscription,
    };
  }

  /**
   * Start a trial for a premium plan
   */
  @Post('trial/:plan')
  @HttpCode(HttpStatus.OK)
  async startTrial(
    @Param('plan') plan: string,
    @Body() body: { trialDays?: number },
    @Request() req: ExpressRequest & { user: any },
  ) {
    const userCompany = await this.companyService.getUserCompany(req.user.id);
    
    if (!userCompany) {
      throw new NotFoundException('User is not a member of any company');
    }

    // Check if user is the company owner
    if (userCompany.ownerId !== req.user.id) {
      throw new NotFoundException('Only company owner can start trial');
    }

    const subscription = await this.subscriptionService.startTrial(
      userCompany.id,
      plan.toUpperCase() as any,
      body.trialDays || 14,
    );

    return {
      message: `Trial started successfully for ${plan} plan`,
      subscription,
    };
  }

  /**
   * Check subscription limits for adding users
   */
  @Get('limits/users/:count')
  async checkUserLimit(
    @Param('count') count: string,
    @Request() req: ExpressRequest & { user: any },
  ) {
    const userCompany = await this.companyService.getUserCompany(req.user.id);
    
    if (!userCompany) {
      throw new NotFoundException('User is not a member of any company');
    }

    const canAdd = await this.subscriptionService.canAddUsers(
      userCompany.id,
      parseInt(count),
    );

    return {
      canAddUsers: canAdd,
      requestedCount: parseInt(count),
      companyId: userCompany.id,
    };
  }

  /**
   * Check subscription limits for creating projects
   */
  @Get('limits/projects/:count')
  async checkProjectLimit(
    @Param('count') count: string,
    @Request() req: ExpressRequest & { user: any },
  ) {
    const userCompany = await this.companyService.getUserCompany(req.user.id);
    
    if (!userCompany) {
      throw new NotFoundException('User is not a member of any company');
    }

    const canCreate = await this.subscriptionService.canCreateProjects(
      userCompany.id,
      parseInt(count),
    );

    return {
      canCreateProjects: canCreate,
      requestedCount: parseInt(count),
      companyId: userCompany.id,
    };
  }
}

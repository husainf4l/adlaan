import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Case } from './case.entity';
import { CaseService } from './case.service';
import { CreateCaseInput } from './dto/create-case.input';
import { UpdateCaseInput } from './dto/update-case.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';

@Resolver(() => Case)
@UseGuards(GqlAuthGuard, RolesGuard)
export class CaseResolver {
  constructor(private caseService: CaseService) {}

  @Query(() => [Case], { description: 'Get all cases for the company' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async cases(@CurrentUser() user: User): Promise<Case[]> {
    return this.caseService.findAll(user.companyId!);
  }

  @Query(() => Case, { 
    nullable: true, 
    description: 'Get a case by ID' 
  })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async case(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Case | null> {
    return this.caseService.findOne(id, user.companyId!);
  }

  @Query(() => [Case], { description: 'Get all cases for a specific client' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async casesByClient(
    @Args('clientId', { type: () => Int }) clientId: number,
    @CurrentUser() user: User,
  ): Promise<Case[]> {
    return this.caseService.findByClient(clientId, user.companyId!);
  }

  @Mutation(() => Case, { description: 'Create a new case' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createCase(
    @Args('input') input: CreateCaseInput,
    @CurrentUser() user: User,
  ): Promise<Case> {
    return this.caseService.create(input, user.companyId!, user.id);
  }

  @Mutation(() => Case, { 
    nullable: true, 
    description: 'Update an existing case' 
  })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateCase(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCaseInput,
    @CurrentUser() user: User,
  ): Promise<Case | null> {
    return this.caseService.update(id, input, user.companyId!);
  }

  @Mutation(() => Boolean, { description: 'Delete a case' })
  @Roles(UserRole.SUPER_ADMIN)
  async deleteCase(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.caseService.delete(id, user.companyId!);
  }
}

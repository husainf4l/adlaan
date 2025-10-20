import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { CreateCompanyInput } from './create-company.input';
import { UpdateCompanyInput } from './update-company.input';
import { User } from '../user/user.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private companyService: CompanyService) {}

  @Query(() => [Company], { name: 'companies', description: 'Get all companies' })
  @UseGuards(GqlAuthGuard)
  async companies(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Query(() => Company, { 
    name: 'company', 
    nullable: true, 
    description: 'Get a company by ID' 
  })
  @UseGuards(GqlAuthGuard)
  async company(
    @Args('id', { type: () => Int, description: 'Company ID' }) id: number
  ): Promise<Company | null> {
    return this.companyService.findOne(id);
  }

  @Mutation(() => Company, { description: 'Create a new company (Admin/SuperAdmin only) - Creator automatically becomes company member' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createCompany(
    @Args('input', { type: () => CreateCompanyInput }) input: CreateCompanyInput,
    @CurrentUser() currentUser: User
  ): Promise<Company> {
    return this.companyService.create(input, currentUser.id);
  }

  @Mutation(() => Company, { 
    nullable: true, 
    description: 'Update an existing company (Admin/SuperAdmin only)' 
  })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateCompany(
    @Args('id', { type: () => Int, description: 'Company ID' }) id: number,
    @Args('input', { type: () => UpdateCompanyInput }) input: UpdateCompanyInput,
  ): Promise<Company | null> {
    return this.companyService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Delete a company (SuperAdmin only)' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async deleteCompany(
    @Args('id', { type: () => Int, description: 'Company ID' }) id: number
  ): Promise<boolean> {
    return this.companyService.delete(id);
  }

  @ResolveField(() => [User], { nullable: true })
  async users(@Parent() company: Company): Promise<User[]> {
    // This field resolver can be used to lazy-load users if needed
    return company.users || [];
  }
}

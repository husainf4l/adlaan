import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserInput } from './create-user.input';
import { UpdateUserInput } from './update-user.input';
import { Company } from '../company/company.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User], { name: 'users', description: 'Get all users (Admin/SuperAdmin only)' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async users(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User, { 
    name: 'user', 
    nullable: true, 
    description: 'Get a user by ID (Admin/SuperAdmin only)' 
  })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async user(
    @Args('id', { type: () => Int, description: 'User ID' }) id: number
  ): Promise<User | null> {
    return this.userService.findOne(id);
  }

  @Mutation(() => User, { description: 'Create a new user (Public - users are admin by default)' })
  async createUser(
    @Args('input', { type: () => CreateUserInput }) input: CreateUserInput
  ): Promise<User> {
    return this.userService.create(input);
  }

  @Mutation(() => User, { 
    nullable: true, 
    description: 'Update an existing user (Admin/SuperAdmin only)' 
  })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateUser(
    @Args('id', { type: () => Int, description: 'User ID' }) id: number,
    @Args('input', { type: () => UpdateUserInput }) input: UpdateUserInput,
  ): Promise<User | null> {
    return this.userService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Delete a user (SuperAdmin only)' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async deleteUser(
    @Args('id', { type: () => Int, description: 'User ID' }) id: number
  ): Promise<boolean> {
    return this.userService.delete(id);
  }

  @ResolveField(() => Company, { nullable: true })
  async company(@Parent() user: User): Promise<Company | null> {
    // This field resolver can be used to lazy-load company if needed
    return user.company || null;
  }
}

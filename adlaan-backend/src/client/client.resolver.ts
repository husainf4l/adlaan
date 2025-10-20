import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Client } from './client.entity';
import { ClientService } from './client.service';
import { CreateClientInput } from './dto/create-client.input';
import { UpdateClientInput } from './dto/update-client.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';

@Resolver(() => Client)
@UseGuards(GqlAuthGuard, RolesGuard)
export class ClientResolver {
  constructor(private clientService: ClientService) {}

  @Query(() => [Client], { description: 'Get all clients for the company' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async clients(@CurrentUser() user: User): Promise<Client[]> {
    return this.clientService.findAll(user.companyId!);
  }

  @Query(() => Client, { 
    nullable: true, 
    description: 'Get a client by ID' 
  })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async client(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Client | null> {
    return this.clientService.findOne(id, user.companyId!);
  }

  @Mutation(() => Client, { description: 'Create a new client' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createClient(
    @Args('input') input: CreateClientInput,
    @CurrentUser() user: User,
  ): Promise<Client> {
    return this.clientService.create(input, user.companyId!, user.id);
  }

  @Mutation(() => Client, { 
    nullable: true, 
    description: 'Update an existing client' 
  })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateClient(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateClientInput,
    @CurrentUser() user: User,
  ): Promise<Client | null> {
    return this.clientService.update(id, input, user.companyId!);
  }

  @Mutation(() => Boolean, { description: 'Delete a client' })
  @Roles(UserRole.SUPER_ADMIN)
  async deleteClient(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.clientService.delete(id, user.companyId!);
  }
}

import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './tag.entity';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { UserRole } from '../user/enums/user-role.enum';

@ObjectType()
class PopularTag {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => Int)
  documentCount: number;
}

@Resolver(() => Tag)
@UseGuards(GqlAuthGuard, RolesGuard)
export class TagResolver {
  constructor(private tagService: TagService) {}

  @Query(() => [Tag], { description: 'Get all tags for the company' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async tags(@CurrentUser() user: User): Promise<Tag[]> {
    return this.tagService.findAll(user.companyId!);
  }

  @Query(() => Tag, { nullable: true, description: 'Get a specific tag by ID' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async tag(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Tag | null> {
    return this.tagService.findOne(id, user.companyId!);
  }

  @Query(() => [PopularTag], { description: 'Get most used tags with document count' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async popularTags(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
    @CurrentUser() user: User,
  ): Promise<any[]> {
    return this.tagService.getPopularTags(user.companyId!, limit);
  }

  @Mutation(() => Tag, { description: 'Create a new tag' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createTag(
    @Args('input') input: CreateTagInput,
    @CurrentUser() user: User,
  ): Promise<Tag> {
    return this.tagService.create(input, user.companyId!);
  }

  @Mutation(() => Tag, { description: 'Update an existing tag' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateTag(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateTagInput,
    @CurrentUser() user: User,
  ): Promise<Tag> {
    return this.tagService.update(id, input, user.companyId!);
  }

  @Mutation(() => Boolean, { description: 'Delete a tag' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async deleteTag(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.tagService.delete(id, user.companyId!);
  }
}

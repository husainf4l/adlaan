import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { UserRole } from '../user/enums/user-role.enum';

@Resolver(() => Comment)
@UseGuards(GqlAuthGuard, RolesGuard)
export class CommentResolver {
  constructor(private commentService: CommentService) {}

  @Query(() => [Comment], { description: 'Get all comments for a document' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async documentComments(
    @Args('documentId', { type: () => Int }) documentId: number,
  ): Promise<Comment[]> {
    return this.commentService.findByDocument(documentId);
  }

  @Query(() => Comment, { nullable: true, description: 'Get a specific comment' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async comment(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Comment | null> {
    return this.commentService.findOne(id);
  }

  @Query(() => [Comment], { description: 'Get replies to a comment' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async commentReplies(
    @Args('parentId', { type: () => Int }) parentId: number,
  ): Promise<Comment[]> {
    return this.commentService.findReplies(parentId);
  }

  @Query(() => Int, { description: 'Get count of unresolved comments for a document' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async unresolvedCommentsCount(
    @Args('documentId', { type: () => Int }) documentId: number,
  ): Promise<number> {
    return this.commentService.getUnresolvedCount(documentId);
  }

  @Mutation(() => Comment, { description: 'Create a new comment or reply' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createComment(
    @Args('documentId', { type: () => Int }) documentId: number,
    @Args('input') input: CreateCommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    return this.commentService.create(documentId, input, user.id, user.companyId!);
  }

  @Mutation(() => Comment, { description: 'Update a comment' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateComment(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role);
    return this.commentService.update(id, input, user.id, isAdmin);
  }

  @Mutation(() => Comment, { description: 'Mark a comment as resolved' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async resolveComment(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    return this.commentService.resolve(id, user.id);
  }

  @Mutation(() => Comment, { description: 'Mark a comment as unresolved' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async unresolveComment(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Comment> {
    return this.commentService.unresolve(id);
  }

  @Mutation(() => Boolean, { description: 'Delete a comment and its replies' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async deleteComment(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role);
    return this.commentService.delete(id, user.id, isAdmin);
  }
}

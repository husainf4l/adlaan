import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DocumentVersionService } from './document-version.service';
import { DocumentVersion } from './document-version.entity';
import { Document } from '../document/document.entity';
import { CreateVersionInput } from './dto/create-version.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { UserRole } from '../user/enums/user-role.enum';

@ObjectType()
class VersionComparison {
  @Field(() => DocumentVersion)
  version1: DocumentVersion;

  @Field(() => DocumentVersion)
  version2: DocumentVersion;
}

@Resolver(() => DocumentVersion)
@UseGuards(GqlAuthGuard, RolesGuard)
export class DocumentVersionResolver {
  constructor(private versionService: DocumentVersionService) {}

  @Query(() => [DocumentVersion], { description: 'Get all versions for a document' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async documentVersions(
    @Args('documentId', { type: () => Int }) documentId: number,
  ): Promise<DocumentVersion[]> {
    return this.versionService.findByDocument(documentId);
  }

  @Query(() => DocumentVersion, { nullable: true, description: 'Get a specific version' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async documentVersion(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<DocumentVersion | null> {
    return this.versionService.findOne(id);
  }

  @Query(() => VersionComparison, { description: 'Compare two document versions' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async compareVersions(
    @Args('versionId1', { type: () => Int }) versionId1: number,
    @Args('versionId2', { type: () => Int }) versionId2: number,
  ): Promise<VersionComparison> {
    return this.versionService.compareVersions(versionId1, versionId2);
  }

  @Mutation(() => DocumentVersion, { description: 'Create a new version snapshot' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createDocumentVersion(
    @Args('documentId', { type: () => Int }) documentId: number,
    @Args('input') input: CreateVersionInput,
    @CurrentUser() user: User,
  ): Promise<DocumentVersion> {
    return this.versionService.createVersion(
      documentId,
      input,
      user.id,
      user.companyId!,
    );
  }

  @Mutation(() => Document, { description: 'Restore a document to a previous version' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async restoreDocumentVersion(
    @Args('versionId', { type: () => Int }) versionId: number,
    @CurrentUser() user: User,
  ): Promise<Document> {
    return this.versionService.restoreVersion(versionId, user.id, user.companyId!);
  }
}

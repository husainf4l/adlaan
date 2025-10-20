import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { UploadDocumentInput } from './dto/upload-document.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/user.entity';
import { DocumentStatus } from './enums/document.enum';

@ObjectType()
class DocumentUrl {
  @Field({ description: 'Presigned S3 URL for document download' })
  url: string;

  @Field({ description: 'URL expiration time in seconds' })
  expiresIn: number;
}

@Resolver(() => Document)
@UseGuards(GqlAuthGuard, RolesGuard)
export class DocumentResolver {
  constructor(private documentService: DocumentService) {}

  @Query(() => [Document], { description: 'Get all documents for the company' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async documents(@CurrentUser() user: User): Promise<Document[]> {
    return this.documentService.findAll(user.companyId!);
  }

  @Query(() => Document, { 
    nullable: true, 
    description: 'Get a document by ID' 
  })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async document(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<Document | null> {
    return this.documentService.findOne(id, user.companyId!);
  }

  @Query(() => [Document], { description: 'Get all documents for a specific case' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async documentsByCase(
    @Args('caseId', { type: () => Int }) caseId: number,
    @CurrentUser() user: User,
  ): Promise<Document[]> {
    return this.documentService.findByCase(caseId, user.companyId!);
  }

  @Query(() => [Document], { description: 'Get all documents for a specific client' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async documentsByClient(
    @Args('clientId', { type: () => Int }) clientId: number,
    @CurrentUser() user: User,
  ): Promise<Document[]> {
    return this.documentService.findByClient(clientId, user.companyId!);
  }

  @Mutation(() => Document, { description: 'Create a new document' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createDocument(
    @Args('input') input: CreateDocumentInput,
    @CurrentUser() user: User,
  ): Promise<Document> {
    return this.documentService.create(input, user.companyId!, user.id);
  }

  @Mutation(() => Document, { 
    nullable: true, 
    description: 'Update an existing document' 
  })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateDocument(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateDocumentInput,
    @CurrentUser() user: User,
  ): Promise<Document | null> {
    return this.documentService.update(id, input, user.companyId!);
  }

  @Mutation(() => Boolean, { description: 'Delete a document' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async deleteDocument(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.documentService.delete(id, user.companyId!);
  }

  // ===== AWS S3 File Upload/Download Methods =====

  @Mutation(() => Document, { description: 'Upload a document with file to S3 (base64 encoded)' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async uploadDocument(
    @Args('input') input: UploadDocumentInput,
    @CurrentUser() user: User,
  ): Promise<Document> {
    return this.documentService.uploadDocument(input, user.id, user.companyId!);
  }

  @Mutation(() => Document, { description: 'Update document status (DRAFT, REVIEW, APPROVED, etc.)' })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateDocumentStatus(
    @Args('id', { type: () => Int }) id: number,
    @Args('status', { type: () => DocumentStatus }) status: DocumentStatus,
    @CurrentUser() user: User,
  ): Promise<Document> {
    return this.documentService.updateStatus(id, status, user.companyId!);
  }

  @Query(() => DocumentUrl, { description: 'Get presigned S3 URL for document download' })
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async documentDownloadUrl(
    @Args('id', { type: () => Int }) id: number,
    @Args('expiresIn', { 
      type: () => Int, 
      nullable: true, 
      defaultValue: 3600,
      description: 'URL expiration time in seconds (default 1 hour, max 7 days)'
    }) expiresIn: number,
    @CurrentUser() user: User,
  ): Promise<DocumentUrl> {
    const url = await this.documentService.getPresignedUrl(id, user.companyId!, expiresIn);
    return { url, expiresIn };
  }
}

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../common/services/s3.service';
import {
  CreateFolderDTO,
  UploadFileDTO,
  UpdateItemDTO,
  SearchDocumentsDTO,
  MoveItemsDTO,
  DocumentItemDTO,
  DocumentFolderDTO,
  DocumentFileDTO,
  DocumentItemType,
  DocumentType,
  DocumentPermissionRole,
  PaginationInfo,
} from './dto/document.dto';

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  // Helper method to serialize BigInt fields for JSON
  private serializeDocumentItem(item: any): any {
    if (!item) return item;
    
    return {
      ...item,
      size: item.size ? item.size.toString() : null,
    };
  }

  // Helper method to serialize array of document items
  private serializeDocumentItems(items: any[]): any[] {
    return items.map(item => this.serializeDocumentItem(item));
  }

  async createFolder(createFolderDto: CreateFolderDTO, userId: string, companyId: string): Promise<DocumentFolderDTO> {
    // Validate parent folder exists if specified
    if (createFolderDto.parentId) {
      const parentFolder = await this.prisma.documentItem.findFirst({
        where: {
          id: createFolderDto.parentId,
          type: 'FOLDER',
          companyId,
        },
      });

      if (!parentFolder) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    // Generate path
    const parentPath = createFolderDto.parentId 
      ? await this.getItemPath(createFolderDto.parentId)
      : '/documents';
    const path = `${parentPath}/${createFolderDto.name}`;

    // Create folder
    const folder = await this.prisma.documentItem.create({
      data: {
        name: createFolderDto.name,
        type: 'FOLDER',
        parentId: createFolderDto.parentId || null,
        path,
        color: createFolderDto.color,
        description: createFolderDto.description,
        tags: createFolderDto.tags || [],
        createdById: userId,
        lastModifiedById: userId,
        companyId,
      },
      include: {
        createdBy: true,
        lastModifiedBy: true,
        permissions: {
          include: {
            user: true,
          },
        },
        children: true,
      },
    });

    return this.mapToFolderDTO(folder);
  }

  async uploadFile(
    file: any, // Changed from Express.Multer.File to any for now
    uploadFileDto: UploadFileDTO,
    userId: string,
    companyId: string
  ): Promise<DocumentFileDTO> {
    // Validate parent folder exists if specified
    if (uploadFileDto.parentId) {
      const parentFolder = await this.prisma.documentItem.findFirst({
        where: {
          id: uploadFileDto.parentId,
          type: 'FOLDER',
          companyId,
        },
      });

      if (!parentFolder) {
        throw new NotFoundException('Parent folder not found');
      }
    }

    // Upload file to S3
    const s3Upload = await this.s3Service.uploadFile(file, companyId);

    // Generate file metadata
    const extension = file.originalname?.split('.').pop() || '';
    const checksum = await this.generateChecksum(file.buffer);
    
    // Generate path
    const parentPath = uploadFileDto.parentId 
      ? await this.getItemPath(uploadFileDto.parentId)
      : '/documents';
    const path = `${parentPath}/${file.originalname}`;

    // Create file record
    const fileRecord = await this.prisma.documentItem.create({
      data: {
        name: file.originalname,
        type: 'FILE',
        parentId: uploadFileDto.parentId || null,
        path,
        size: BigInt(file.size),
        mimeType: file.mimetype,
        extension,
        checksum,
        version: 1,
        documentType: uploadFileDto.documentType || 'OTHER',
        tags: uploadFileDto.tags || [],
        downloadUrl: s3Upload.downloadUrl, // Use S3 download URL
        previewUrl: s3Upload.url, // Use S3 public URL for preview
        s3Key: s3Upload.key, // Store S3 key for future operations
        createdById: userId,
        lastModifiedById: userId,
        companyId,
      },
      include: {
        createdBy: true,
        lastModifiedBy: true,
        permissions: {
          include: {
            user: true,
          },
        },
        versions: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    return this.mapToFileDTO(fileRecord);
  }

  async getFolderContents(folderId: string | null, userId: string, companyId: string): Promise<DocumentItemDTO[]> {
    // If folderId is null or 'root', get root level items
    const items = await this.prisma.documentItem.findMany({
      where: {
        parentId: folderId === 'root' ? null : folderId,
        companyId,
      },
      include: {
        createdBy: true,
        lastModifiedBy: true,
        permissions: {
          include: {
            user: true,
          },
        },
        children: true,
        versions: {
          include: {
            createdBy: true,
          },
          orderBy: {
            version: 'desc',
          },
          take: 5, // Only get latest 5 versions for performance
        },
      },
      orderBy: [
        { type: 'asc' }, // Folders first
        { name: 'asc' },
      ],
    });

    return items.map(item => {
      if (item.type === 'FOLDER') {
        return this.mapToFolderDTO(item);
      } else {
        return this.mapToFileDTO(item);
      }
    });
  }

  async updateItem(id: string, updateItemDto: UpdateItemDTO, userId: string, companyId: string): Promise<DocumentItemDTO> {
    const item = await this.prisma.documentItem.findFirst({
      where: { id, companyId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Update path if name or parent changed
    let path = item.path;
    if (updateItemDto.name || updateItemDto.parentId !== undefined) {
      const parentPath = updateItemDto.parentId 
        ? await this.getItemPath(updateItemDto.parentId)
        : '/documents';
      const name = updateItemDto.name || item.name;
      path = `${parentPath}/${name}`;
    }

    const updatedItem = await this.prisma.documentItem.update({
      where: { id },
      data: {
        name: updateItemDto.name,
        parentId: updateItemDto.parentId,
        path,
        tags: updateItemDto.tags,
        isStarred: updateItemDto.isStarred,
        color: updateItemDto.color,
        description: updateItemDto.description,
        documentType: updateItemDto.documentType,
        lastModifiedById: userId,
      },
      include: {
        createdBy: true,
        lastModifiedBy: true,
        permissions: {
          include: {
            user: true,
          },
        },
        children: true,
        versions: {
          include: {
            createdBy: true,
          },
          orderBy: {
            version: 'desc',
          },
          take: 5,
        },
      },
    });

    if (updatedItem.type === 'FOLDER') {
      return this.mapToFolderDTO(updatedItem);
    } else {
      return this.mapToFileDTO(updatedItem);
    }
  }

  async moveItems(moveItemsDto: MoveItemsDTO, userId: string, companyId: string): Promise<{ movedCount: number }> {
    // Validate target parent exists if specified
    if (moveItemsDto.targetParentId) {
      const targetParent = await this.prisma.documentItem.findFirst({
        where: {
          id: moveItemsDto.targetParentId,
          type: 'FOLDER',
          companyId,
        },
      });

      if (!targetParent) {
        throw new NotFoundException('Target parent folder not found');
      }
    }

    // Update all items
    const result = await this.prisma.documentItem.updateMany({
      where: {
        id: { in: moveItemsDto.itemIds },
        companyId,
      },
      data: {
        parentId: moveItemsDto.targetParentId || null,
        lastModifiedById: userId,
      },
    });

    // Update paths for moved items (this is simplified - in production you'd want to handle this more efficiently)
    for (const itemId of moveItemsDto.itemIds) {
      await this.updateItemPath(itemId, moveItemsDto.targetParentId || null);
    }

    return { movedCount: result.count };
  }

  async searchDocuments(searchDto: SearchDocumentsDTO, userId: string, companyId: string) {
    const where: any = {
      companyId,
    };

    // Build search conditions
    if (searchDto.query) {
      where.OR = [
        { name: { contains: searchDto.query, mode: 'insensitive' } },
        { tags: { hasSome: [searchDto.query] } },
      ];
    }

    if (searchDto.parentId) {
      where.parentId = searchDto.parentId;
    }

    if (searchDto.type) {
      where.type = searchDto.type;
    }

    if (searchDto.documentType) {
      where.documentType = searchDto.documentType;
    }

    if (searchDto.tags && searchDto.tags.length > 0) {
      where.tags = { hasSome: searchDto.tags };
    }

    if (searchDto.starred !== undefined) {
      where.isStarred = searchDto.starred;
    }

    // Get total count
    const total = await this.prisma.documentItem.count({ where });

    // Calculate pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 20;
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get items
    const items = await this.prisma.documentItem.findMany({
      where,
      include: {
        createdBy: true,
        lastModifiedBy: true,
        permissions: {
          include: {
            user: true,
          },
        },
        children: true,
        versions: {
          include: {
            createdBy: true,
          },
          orderBy: {
            version: 'desc',
          },
          take: 5,
        },
      },
      skip,
      take: limit,
      orderBy: {
        [searchDto.sortBy || 'updatedAt']: searchDto.sortOrder || 'desc',
      },
    });

    const mappedItems = items.map(item => {
      if (item.type === 'FOLDER') {
        return this.mapToFolderDTO(item);
      } else {
        return this.mapToFileDTO(item);
      }
    });

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      items: mappedItems,
      pagination,
    };
  }

  async deleteItem(id: string, userId: string, companyId: string): Promise<void> {
    const item = await this.prisma.documentItem.findFirst({
      where: { id, companyId },
      include: {
        children: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // If it's a folder with children, we need to delete children first
    if (item.type === 'FOLDER' && item.children.length > 0) {
      // Recursively delete all children
      for (const child of item.children) {
        await this.deleteItem(child.id, userId, companyId);
      }
    }

    // If it's a file and has an S3 key, delete from S3
    if (item.type === 'FILE' && item.s3Key) {
      try {
        await this.s3Service.deleteFile(item.s3Key);
      } catch (error) {
        // Log the error but don't fail the deletion
        console.error(`Failed to delete S3 file ${item.s3Key}:`, error);
      }
    }

    // Delete the item (permissions and versions will cascade automatically)
    await this.prisma.documentItem.delete({
      where: { id },
    });
  }

  async generatePresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    return this.s3Service.generatePresignedUploadUrl(key, contentType, expiresIn);
  }

  async generatePresignedDownloadUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    return this.s3Service.generatePresignedDownloadUrl(s3Key, expiresIn);
  }

  async getItemById(id: string, userId: string, companyId: string): Promise<any> {
    const item = await this.prisma.documentItem.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        permissions: true,
        company: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
        lastModifiedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Document not found');
    }

    return this.serializeDocumentItem(item);
  }

  async getBreadcrumbs(id: string, userId: string, companyId: string): Promise<Array<{ id: string; name: string; type: string }>> {
    const item = await this.getItemById(id, userId, companyId);
    const breadcrumbs: Array<{ id: string; name: string; type: string }> = [];
    
    let currentItem = item;
    
    // Build breadcrumbs by traversing up the parent chain
    while (currentItem) {
      breadcrumbs.unshift({
        id: currentItem.id,
        name: currentItem.name,
        type: currentItem.type,
      });
      
      if (currentItem.parentId) {
        currentItem = await this.prisma.documentItem.findFirst({
          where: {
            id: currentItem.parentId,
            companyId,
          },
        });
      } else {
        break;
      }
    }
    
    return breadcrumbs;
  }

  // Helper methods
  private async getItemPath(itemId: string): Promise<string> {
    const item = await this.prisma.documentItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item.path;
  }

  private async updateItemPath(itemId: string, newParentId: string | null): Promise<void> {
    const item = await this.prisma.documentItem.findUnique({
      where: { id: itemId },
    });

    if (!item) return;

    const parentPath = newParentId 
      ? await this.getItemPath(newParentId)
      : '/documents';
    const newPath = `${parentPath}/${item.name}`;

    await this.prisma.documentItem.update({
      where: { id: itemId },
      data: { path: newPath },
    });
  }

  private async generateChecksum(buffer: Buffer): Promise<string> {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return 'sha256:' + hash.digest('hex');
  }

  private mapToFolderDTO(item: any): DocumentFolderDTO {
    return {
      id: item.id,
      name: item.name,
      type: DocumentItemType.FOLDER,
      parentId: item.parentId,
      path: item.path,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      createdBy: {
        id: item.createdBy.id,
        email: item.createdBy.email,
        name: item.createdBy.name,
      },
      lastModifiedBy: {
        id: item.lastModifiedBy.id,
        email: item.lastModifiedBy.email,
        name: item.lastModifiedBy.name,
      },
      isStarred: item.isStarred,
      isShared: item.isShared,
      tags: item.tags,
      permissions: item.permissions?.map(p => ({
        id: p.id,
        userId: p.userId,
        role: p.role,
        user: {
          id: p.user.id,
          email: p.user.email,
          name: p.user.name,
        },
      })) || [],
      childrenCount: item.children?.length || 0,
      color: item.color,
      description: item.description,
    };
  }

  private mapToFileDTO(item: any): DocumentFileDTO {
    return {
      id: item.id,
      name: item.name,
      type: DocumentItemType.FILE,
      parentId: item.parentId,
      path: item.path,
      size: Number(item.size),
      mimeType: item.mimeType,
      extension: item.extension,
      documentType: item.documentType,
      version: item.version,
      checksum: item.checksum,
      isLocked: item.isLocked,
      downloadUrl: item.downloadUrl,
      previewUrl: item.previewUrl,
      thumbnailUrl: item.thumbnailUrl,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      createdBy: {
        id: item.createdBy.id,
        email: item.createdBy.email,
        name: item.createdBy.name,
      },
      lastModifiedBy: {
        id: item.lastModifiedBy.id,
        email: item.lastModifiedBy.email,
        name: item.lastModifiedBy.name,
      },
      isStarred: item.isStarred,
      isShared: item.isShared,
      tags: item.tags,
      permissions: item.permissions?.map(p => ({
        id: p.id,
        userId: p.userId,
        role: p.role,
        user: {
          id: p.user.id,
          email: p.user.email,
          name: p.user.name,
        },
      })) || [],
      versions: item.versions?.map(v => ({
        id: v.id,
        version: v.version,
        size: Number(v.size),
        checksum: v.checksum,
        url: v.url,
        comment: v.comment,
        createdById: v.createdById,
        createdBy: {
          id: v.createdBy.id,
          email: v.createdBy.email,
          name: v.createdBy.name,
        },
        createdAt: v.createdAt.toISOString(),
      })) || [],
    };
  }
}

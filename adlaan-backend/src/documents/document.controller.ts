import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Request,
  UseGuards,
  HttpStatus,
  HttpException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from './document.service';
import { FastifyFile } from '../common/decorators/fastify-file.decorator';
import {
  CreateFolderDTO,
  UploadFileDTO,
  UpdateItemDTO,
  SearchDocumentsDTO,
  MoveItemsDTO,
  ApiResponse,
  ApiErrorResponse,
  CreateFolderResponse,
  UploadFileResponse,
  GetItemResponse,
  SearchDocumentsResponse,
  GetFolderContentsResponse,
} from './dto/document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  // POST /documents/folders
  @Post('folders')
  async createFolder(
    @Body() createFolderDto: CreateFolderDTO,
    @Request() req: any,
  ): Promise<CreateFolderResponse | ApiErrorResponse> {
    try {
      const folder = await this.documentService.createFolder(
        createFolderDto,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: folder,
        message: 'Folder created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: {
          code: 'FOLDER_CREATION_ERROR',
          message: error.message || 'Failed to create folder',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // GET /documents/folders/[id]/contents (or /documents/folders/root/contents)
  @Get('folders/:id/contents')
  async getFolderContents(
    @Param('id') folderId: string,
    @Request() req: any,
  ): Promise<GetFolderContentsResponse | ApiErrorResponse> {
    try {
      const items = await this.documentService.getFolderContents(
        folderId === 'root' ? null : folderId,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: items,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: {
          code: 'FOLDER_CONTENTS_ERROR',
          message: error.message || 'Failed to get folder contents',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // POST /documents/upload
  @Post('upload')
  async uploadFile(
    @FastifyFile() file: any,
    @Request() req: any,
  ): Promise<UploadFileResponse | ApiErrorResponse> {
    try {
      if (!file) {
        throw new HttpException({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File is required',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.BAD_REQUEST);
      }

      // Create default upload DTO
      const uploadFileDto: any = {
        documentType: 'OTHER',
        tags: [],
      };

      const uploadedFile = await this.documentService.uploadFile(
        file,
        uploadFileDto,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: uploadedFile,
        message: 'File uploaded successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: error.message || 'Failed to upload file',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // PUT /documents/[id]
  @Put(':id')
  async updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDTO,
    @Request() req: any,
  ): Promise<GetItemResponse | ApiErrorResponse> {
    try {
      const updatedItem = await this.documentService.updateItem(
        id,
        updateItemDto,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: updatedItem,
        message: 'Item updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message || 'Failed to update item',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // DELETE /documents/[id]
  @Delete(':id')
  async deleteItem(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponse | ApiErrorResponse> {
    try {
      await this.documentService.deleteItem(id, req.user.id, req.user.companyId);

      return {
        success: true,
        data: null,
        message: 'Item deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || 'Failed to delete item',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // POST /documents/move
  @Post('move')
  async moveItems(
    @Body() moveItemsDto: MoveItemsDTO,
    @Request() req: any,
  ): Promise<ApiResponse | ApiErrorResponse> {
    try {
      const result = await this.documentService.moveItems(
        moveItemsDto,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: result,
        message: `Successfully moved ${result.movedCount} items`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: {
          code: 'MOVE_ERROR',
          message: error.message || 'Failed to move items',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // GET /documents/search
  @Get('search')
  async searchDocuments(
    @Query() searchDto: SearchDocumentsDTO,
    @Request() req: any,
  ): Promise<SearchDocumentsResponse | ApiErrorResponse> {
    try {
      const result = await this.documentService.searchDocuments(
        searchDto,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error.message || 'Search failed',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // GET /documents/[id] - Get single item
  @Get(':id')
  async getItem(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<GetItemResponse | ApiErrorResponse> {
    try {
      const item = await this.documentService.getItemById(
        id,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: item,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message === 'Item not found') {
        throw new HttpException({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Item not found',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.NOT_FOUND);
      }

      throw new HttpException({
        success: false,
        error: {
          code: 'GET_ITEM_ERROR',
          message: error.message || 'Failed to get item',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // GET /documents/:id/breadcrumbs - Get document/folder breadcrumbs
  @Get(':id/breadcrumbs')
  async getBreadcrumbs(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponse | ApiErrorResponse> {
    try {
      const breadcrumbs = await this.documentService.getBreadcrumbs(
        id,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: breadcrumbs,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message === 'Document not found') {
        throw new HttpException({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Document not found',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.NOT_FOUND);
      }

      throw new HttpException({
        success: false,
        error: {
          code: 'BREADCRUMBS_ERROR',
          message: error.message || 'Failed to get breadcrumbs',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // POST /documents/presigned-upload-url - Generate presigned upload URL
  @Post('presigned-upload-url')
  async generatePresignedUploadUrl(
    @Body() body: { fileName: string; contentType: string },
    @Request() req: any,
  ): Promise<ApiResponse | ApiErrorResponse> {
    try {
      const { fileName, contentType } = body;
      
      if (!fileName || !contentType) {
        throw new HttpException({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'fileName and contentType are required',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.BAD_REQUEST);
      }

      // Generate unique S3 key
      const fileExtension = fileName.split('.').pop();
      const uniqueKey = `companies/${req.user.companyId}/documents/${Date.now()}-${fileName}`;

      // Generate presigned URL (expires in 1 hour)
      const uploadUrl = await this.documentService.generatePresignedUploadUrl(
        uniqueKey,
        contentType,
        3600
      );

      return {
        success: true,
        data: {
          uploadUrl,
          key: uniqueKey,
          fileName,
          contentType,
          expiresIn: 3600,
        },
        message: 'Presigned upload URL generated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: {
          code: 'PRESIGNED_URL_ERROR',
          message: error.message || 'Failed to generate presigned upload URL',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }
}

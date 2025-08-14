import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentService } from '../documents/document.service';
import { CreateFolderDTO, ApiResponse, ApiErrorResponse } from '../documents/dto/document.dto';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private documentService: DocumentService) {}

  // POST /folders - This matches your original request
  @Post()
  async createFolder(
    @Body() createFolderDto: CreateFolderDTO,
    @Request() req: any,
  ): Promise<ApiResponse | ApiErrorResponse> {
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
}

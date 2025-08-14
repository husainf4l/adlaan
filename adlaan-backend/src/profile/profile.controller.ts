import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CompleteProfileDto } from '../auth/dto/auth.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';
import {
  CreateCompanyProfileDto,
  UpdateCompanyProfileDto,
  CreateDocumentLayoutDto,
  UpdateDocumentLayoutDto,
  CompanyProfileResponse,
  DocumentLayoutResponse,
  DocumentLayoutsResponse,
  ApiResponse,
  ApiErrorResponse,
} from './dto/profile.dto';
import type { FastifyRequest } from 'fastify';

@Controller('profile')
export class ProfileController {
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
  ) {}

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  async completeProfile(
    @Body() completeProfileDto: CompleteProfileDto,
    @Request() req: FastifyRequest & { user: any },
  ) {
    const updatedUser = await this.authService.completeProfile(req.user.id, completeProfileDto);
    
    return {
      message: 'Profile completed successfully',
      user: updatedUser,
    };
  }

  // Company Profile Endpoints

  @Get('company')
  @UseGuards(JwtAuthGuard)
  async getCompany(@Request() req: any): Promise<CompanyProfileResponse | ApiErrorResponse> {
    try {
      const company = await this.profileService.getCompanyProfile(
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: company,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message === 'Company profile not found') {
        throw new HttpException({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Company profile not found',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.NOT_FOUND);
      }

      throw new HttpException({
        success: false,
        error: {
          code: 'GET_COMPANY_ERROR',
          message: error.message || 'Failed to get company profile',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('company')
  @UseGuards(JwtAuthGuard)
  async createCompany(
    @Body() createCompanyDto: CreateCompanyProfileDto,
    @Request() req: any,
  ): Promise<CompanyProfileResponse | ApiErrorResponse> {
    try {
      const company = await this.profileService.createCompanyProfile(
        createCompanyDto,
        req.user.id,
      );

      return {
        success: true,
        data: company,
        message: 'Company profile created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message === 'Email address is already in use') {
        throw new HttpException({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Email address is already in use',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.CONFLICT);
      }

      throw new HttpException({
        success: false,
        error: {
          code: 'CREATE_COMPANY_ERROR',
          message: error.message || 'Failed to create company profile',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('company/:id')
  @UseGuards(JwtAuthGuard)
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyProfileDto,
    @Request() req: any,
  ): Promise<CompanyProfileResponse | ApiErrorResponse> {
    try {
      const company = await this.profileService.updateCompanyProfile(
        id,
        updateCompanyDto,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: company,
        message: 'Company profile updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message === 'Company profile not found') {
        throw new HttpException({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Company profile not found',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.NOT_FOUND);
      }

      if (error.message === 'Email address is already in use') {
        throw new HttpException({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Email address is already in use',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.CONFLICT);
      }

      if (error.message === 'Cannot update different company profile') {
        throw new HttpException({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot update different company profile',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.FORBIDDEN);
      }

      throw new HttpException({
        success: false,
        error: {
          code: 'UPDATE_COMPANY_ERROR',
          message: error.message || 'Failed to update company profile',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('company/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCompany(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponse | ApiErrorResponse> {
    try {
      await this.profileService.deleteCompanyProfile(
        id,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        message: 'Company profile deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message === 'Company profile not found') {
        throw new HttpException({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Company profile not found',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.NOT_FOUND);
      }

      if (error.message === 'Cannot delete different company profile') {
        throw new HttpException({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Cannot delete different company profile',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.FORBIDDEN);
      }

      throw new HttpException({
        success: false,
        error: {
          code: 'DELETE_COMPANY_ERROR',
          message: error.message || 'Failed to delete company profile',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  // Document Layout Endpoints

  @Get('layouts')
  @UseGuards(JwtAuthGuard)
  async getLayouts(@Request() req: any): Promise<DocumentLayoutsResponse | ApiErrorResponse> {
    try {
      const layouts = await this.profileService.getDocumentLayouts(
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: layouts,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: {
          code: 'GET_LAYOUTS_ERROR',
          message: error.message || 'Failed to get document layouts',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('layouts')
  @UseGuards(JwtAuthGuard)
  async createLayout(
    @Body() createLayoutDto: CreateDocumentLayoutDto,
    @Request() req: any,
  ): Promise<DocumentLayoutResponse | ApiErrorResponse> {
    try {
      const layout = await this.profileService.createDocumentLayout(
        createLayoutDto,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: layout,
        message: 'Document layout created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        error: {
          code: 'CREATE_LAYOUT_ERROR',
          message: error.message || 'Failed to create document layout',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('layouts/:id')
  @UseGuards(JwtAuthGuard)
  async updateLayout(
    @Param('id') id: string,
    @Body() updateLayoutDto: UpdateDocumentLayoutDto,
    @Request() req: any,
  ): Promise<DocumentLayoutResponse | ApiErrorResponse> {
    try {
      const layout = await this.profileService.updateDocumentLayout(
        id,
        updateLayoutDto,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: layout,
        message: 'Document layout updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message === 'Document layout not found') {
        throw new HttpException({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Document layout not found',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.NOT_FOUND);
      }

      throw new HttpException({
        success: false,
        error: {
          code: 'UPDATE_LAYOUT_ERROR',
          message: error.message || 'Failed to update document layout',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('layouts/:id')
  @UseGuards(JwtAuthGuard)
  async deleteLayout(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponse | ApiErrorResponse> {
    try {
      await this.profileService.deleteDocumentLayout(
        id,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        message: 'Document layout deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message === 'Document layout not found') {
        throw new HttpException({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Document layout not found',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.NOT_FOUND);
      }

      if (error.message === 'Cannot delete the default layout') {
        throw new HttpException({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Cannot delete the default layout',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.BAD_REQUEST);
      }

      throw new HttpException({
        success: false,
        error: {
          code: 'DELETE_LAYOUT_ERROR',
          message: error.message || 'Failed to delete document layout',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('layouts/:id/set-default')
  @UseGuards(JwtAuthGuard)
  async setDefaultLayout(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<DocumentLayoutResponse | ApiErrorResponse> {
    try {
      const layout = await this.profileService.setDefaultLayout(
        id,
        req.user.id,
        req.user.companyId,
      );

      return {
        success: true,
        data: layout,
        message: 'Default layout set successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error.message === 'Document layout not found') {
        throw new HttpException({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Document layout not found',
          },
          timestamp: new Date().toISOString(),
        }, HttpStatus.NOT_FOUND);
      }

      throw new HttpException({
        success: false,
        error: {
          code: 'SET_DEFAULT_ERROR',
          message: error.message || 'Failed to set default layout',
        },
        timestamp: new Date().toISOString(),
      }, HttpStatus.BAD_REQUEST);
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import type { Request as ExpressRequest } from 'express';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /**
   * Create a new company
   */
  @Post()
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @Request() req: ExpressRequest & { user: any },
  ) {
    const company = await this.companyService.createCompany(req.user.id, createCompanyDto);
    return {
      message: 'Company created successfully',
      company,
    };
  }

  /**
   * Get current user's company
   */
  @Get('my-company')
  async getMyCompany(@Request() req: ExpressRequest & { user: any }) {
    const company = await this.companyService.getUserCompany(req.user.id);
    if (!company) {
      return {
        message: 'User is not a member of any company',
        company: null,
      };
    }
    return {
      company,
    };
  }

  /**
   * Join a company by ID
   */
  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async joinCompany(
    @Param('id') companyId: string,
    @Request() req: ExpressRequest & { user: any },
  ) {
    const company = await this.companyService.joinCompany(req.user.id, companyId);
    return {
      message: 'Successfully joined company',
      company,
    };
  }

  /**
   * Leave current company
   */
  @Post('leave')
  @HttpCode(HttpStatus.OK)
  async leaveCompany(@Request() req: ExpressRequest & { user: any }) {
    await this.companyService.leaveCompany(req.user.id);
    return {
      message: 'Successfully left company',
    };
  }

  /**
   * Search companies by name
   */
  @Get('search')
  async searchCompanies(@Query('q') query: string, @Query('limit') limit?: string) {
    const companies = await this.companyService.searchCompanies(
      query,
      limit ? parseInt(limit) : 10,
    );
    return {
      companies,
    };
  }

  /**
   * Get company by ID
   */
  @Get(':id')
  async getCompany(@Param('id') id: string) {
    const company = await this.companyService.getCompanyById(id);
    if (!company) {
      return {
        message: 'Company not found',
        company: null,
      };
    }
    return {
      company,
    };
  }

  /**
   * Update company information (owner only)
   */
  @Patch(':id')
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req: ExpressRequest & { user: any },
  ) {
    const company = await this.companyService.updateCompany(req.user.id, id, updateCompanyDto);
    return {
      message: 'Company updated successfully',
      company,
    };
  }

  /**
   * Delete company (owner only)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteCompany(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { user: any },
  ) {
    await this.companyService.deleteCompany(req.user.id, id);
    return {
      message: 'Company deleted successfully',
    };
  }

  /**
   * Remove a member from company (owner only)
   */
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('id') companyId: string,
    @Param('memberId') memberId: string,
    @Request() req: ExpressRequest & { user: any },
  ) {
    await this.companyService.removeMember(req.user.id, companyId, memberId);
    return {
      message: 'Member removed successfully',
    };
  }
}

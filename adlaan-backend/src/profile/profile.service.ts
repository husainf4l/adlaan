import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateCompanyProfileDto,
  UpdateCompanyProfileDto,
  CreateDocumentLayoutDto,
  UpdateDocumentLayoutDto,
  CompanyProfileDto,
  DocumentLayoutDto,
  MarginsDto,
} from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  // Company Profile Methods
  async getCompanyProfile(userId: string, companyId: string): Promise<CompanyProfileDto> {
    const company = await this.prisma.company.findFirst({
      where: {
        id: companyId,
        isActive: true,
      },
      include: {
        documentLayouts: {
          where: { isActive: true },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    return this.mapToCompanyProfileDto(company);
  }

  async createCompanyProfile(
    createDto: CreateCompanyProfileDto,
    userId: string,
  ): Promise<CompanyProfileDto> {
    // Check if email is already in use
    if (createDto.email) {
      const existingCompany = await this.prisma.company.findUnique({
        where: { email: createDto.email },
      });
      if (existingCompany) {
        throw new ConflictException('Email address is already in use');
      }
    }

    const company = await this.prisma.company.create({
      data: {
        ...createDto,
        ownerId: userId,
      },
      include: {
        documentLayouts: {
          where: { isActive: true },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    // Create default document layout
    await this.createDefaultLayout(company.id);

    // Fetch the company with the default layout
    const companyWithLayouts = await this.prisma.company.findUnique({
      where: { id: company.id },
      include: {
        documentLayouts: {
          where: { isActive: true },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    return this.mapToCompanyProfileDto(companyWithLayouts);
  }

  async updateCompanyProfile(
    id: string,
    updateDto: UpdateCompanyProfileDto,
    userId: string,
    companyId: string,
  ): Promise<CompanyProfileDto> {
    // Verify the company belongs to the user's company
    if (id !== companyId) {
      throw new BadRequestException('Cannot update different company profile');
    }

    const existingCompany = await this.prisma.company.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!existingCompany) {
      throw new NotFoundException('Company profile not found');
    }

    // Check email uniqueness if email is being updated
    if (updateDto.email && updateDto.email !== existingCompany.email) {
      const emailExists = await this.prisma.company.findUnique({
        where: { email: updateDto.email },
      });
      if (emailExists) {
        throw new ConflictException('Email address is already in use');
      }
    }

    const company = await this.prisma.company.update({
      where: { id },
      data: updateDto,
      include: {
        documentLayouts: {
          where: { isActive: true },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    return this.mapToCompanyProfileDto(company);
  }

  async deleteCompanyProfile(id: string, userId: string, companyId: string): Promise<void> {
    // Verify the company belongs to the user's company
    if (id !== companyId) {
      throw new BadRequestException('Cannot delete different company profile');
    }

    const company = await this.prisma.company.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    // Soft delete the company
    await this.prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Document Layout Methods
  async getDocumentLayouts(userId: string, companyId: string): Promise<DocumentLayoutDto[]> {
    const layouts = await this.prisma.documentLayout.findMany({
      where: {
        companyId,
        isActive: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return layouts.map(layout => this.mapToDocumentLayoutDto(layout));
  }

  async createDocumentLayout(
    createDto: CreateDocumentLayoutDto,
    userId: string,
    companyId: string,
  ): Promise<DocumentLayoutDto> {
    // If this should be the default layout, unset all other default layouts
    if (createDto.isDefault) {
      await this.prisma.documentLayout.updateMany({
        where: {
          companyId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const layout = await this.prisma.documentLayout.create({
      data: {
        name: createDto.name,
        headerTemplate: createDto.headerTemplate,
        footerTemplate: createDto.footerTemplate,
        margins: createDto.margins as any, // Prisma handles JSON conversion
        fontSize: createDto.fontSize,
        fontFamily: createDto.fontFamily,
        isDefault: createDto.isDefault || false,
        companyId,
      },
    });

    return this.mapToDocumentLayoutDto(layout);
  }

  async updateDocumentLayout(
    id: string,
    updateDto: UpdateDocumentLayoutDto,
    userId: string,
    companyId: string,
  ): Promise<DocumentLayoutDto> {
    const existingLayout = await this.prisma.documentLayout.findFirst({
      where: {
        id,
        companyId,
        isActive: true,
      },
    });

    if (!existingLayout) {
      throw new NotFoundException('Document layout not found');
    }

    // If this should be the default layout, unset all other default layouts
    if (updateDto.isDefault) {
      await this.prisma.documentLayout.updateMany({
        where: {
          companyId,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    const layout = await this.prisma.documentLayout.update({
      where: { id },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.headerTemplate && { headerTemplate: updateDto.headerTemplate }),
        ...(updateDto.footerTemplate && { footerTemplate: updateDto.footerTemplate }),
        ...(updateDto.margins && { margins: updateDto.margins as any }),
        ...(updateDto.fontSize && { fontSize: updateDto.fontSize }),
        ...(updateDto.fontFamily && { fontFamily: updateDto.fontFamily }),
        ...(updateDto.isDefault !== undefined && { isDefault: updateDto.isDefault }),
      },
    });

    return this.mapToDocumentLayoutDto(layout);
  }

  async deleteDocumentLayout(id: string, userId: string, companyId: string): Promise<void> {
    const layout = await this.prisma.documentLayout.findFirst({
      where: {
        id,
        companyId,
        isActive: true,
      },
    });

    if (!layout) {
      throw new NotFoundException('Document layout not found');
    }

    // Prevent deletion of default layouts
    if (layout.isDefault) {
      throw new BadRequestException('Cannot delete the default layout');
    }

    // Soft delete the layout
    await this.prisma.documentLayout.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async setDefaultLayout(id: string, userId: string, companyId: string): Promise<DocumentLayoutDto> {
    const layout = await this.prisma.documentLayout.findFirst({
      where: {
        id,
        companyId,
        isActive: true,
      },
    });

    if (!layout) {
      throw new NotFoundException('Document layout not found');
    }

    // Unset all other default layouts
    await this.prisma.documentLayout.updateMany({
      where: {
        companyId,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Set this layout as default
    const updatedLayout = await this.prisma.documentLayout.update({
      where: { id },
      data: { isDefault: true },
    });

    return this.mapToDocumentLayoutDto(updatedLayout);
  }

  // Template variable processing
  processTemplate(template: string, variables: Record<string, string>): string {
    let processedTemplate = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), value || '');
    });

    return processedTemplate;
  }

  // Private helper methods
  private async createDefaultLayout(companyId: string): Promise<void> {
    const defaultMargins: MarginsDto = {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    };

    const defaultHeaderTemplate = `
      <div style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
        {{#if COMPANY_LOGO}}<img src="{{COMPANY_LOGO}}" alt="Company Logo" style="height: 50px; margin-bottom: 10px;">{{/if}}
        <h2>{{COMPANY_NAME}}</h2>
        <p>{{COMPANY_ADDRESS}}</p>
        <p>Phone: {{COMPANY_PHONE}} | Email: {{COMPANY_EMAIL}}</p>
        {{#if COMPANY_WEBSITE}}<p>Website: {{COMPANY_WEBSITE}}</p>{{/if}}
      </div>
    `;

    const defaultFooterTemplate = `
      <div style="text-align: center; border-top: 1px solid #000; padding-top: 10px; margin-top: 20px; font-size: 12px;">
        <p>{{COMPANY_NAME}} - {{COMPANY_ADDRESS}}</p>
        {{#if TAX_NUMBER}}<p>Tax Number: {{TAX_NUMBER}}</p>{{/if}}
        {{#if COMMERCIAL_REGISTER}}<p>Commercial Register: {{COMMERCIAL_REGISTER}}</p>{{/if}}
        <p>Page {{PAGE_NUMBER}} of {{TOTAL_PAGES}}</p>
      </div>
    `;

    await this.prisma.documentLayout.create({
      data: {
        name: 'Default Layout',
        headerTemplate: defaultHeaderTemplate,
        footerTemplate: defaultFooterTemplate,
        margins: defaultMargins as any, // Prisma handles JSON conversion
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        isDefault: true,
        companyId,
      },
    });
  }

  private mapToCompanyProfileDto(company: any): CompanyProfileDto {
    return {
      id: company.id,
      name: company.name,
      nameEn: company.nameEn,
      email: company.email,
      phone: company.phone,
      address: company.address,
      addressEn: company.addressEn,
      website: company.website,
      taxNumber: company.taxNumber,
      commercialRegister: company.commercialRegister,
      logo: company.logo,
      description: company.description,
      isActive: company.isActive,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
      documentLayouts: company.documentLayouts?.map((layout: any) => this.mapToDocumentLayoutDto(layout)),
    };
  }

  private mapToDocumentLayoutDto(layout: any): DocumentLayoutDto {
    return {
      id: layout.id,
      name: layout.name,
      headerTemplate: layout.headerTemplate,
      footerTemplate: layout.footerTemplate,
      margins: layout.margins as MarginsDto,
      fontSize: layout.fontSize,
      fontFamily: layout.fontFamily,
      isDefault: layout.isDefault,
      isActive: layout.isActive,
      companyId: layout.companyId,
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
    };
  }
}

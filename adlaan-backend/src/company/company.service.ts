import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { Company, User, Subscription } from '../../generated/prisma';

export interface CreateCompanyDto {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo?: string;
}

export interface CompanyWithMembers extends Company {
  members: User[];
  owner: User;
  subscription?: Subscription | null;
  _count: {
    members: number;
  };
}

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new company
   */
  async createCompany(ownerId: string, createCompanyDto: CreateCompanyDto): Promise<CompanyWithMembers> {
    // Check if user already owns a company
    const existingCompany = await this.prisma.company.findFirst({
      where: { ownerId },
    });

    if (existingCompany) {
      throw new ConflictException('User already owns a company');
    }

    // Create the company and subscription in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the company first
      const company = await tx.company.create({
        data: {
          ...createCompanyDto,
          ownerId,
        },
      });

      // Create a free subscription for the company
      const subscription = await tx.subscription.create({
        data: {
          plan: 'FREE',
          status: 'ACTIVE',
          billingCycle: 'MONTHLY',
          amount: 0,
          maxUsers: 5,
          maxProjects: 3,
          maxStorage: 1000, // 1GB
          hasAdvancedFeatures: false,
          hasPrioritySupport: false,
          company: {
            connect: { id: company.id },
          },
        },
      });

      // Get the complete company with all relations
      const completeCompany = await tx.company.findUnique({
        where: { id: company.id },
        include: {
          owner: true,
          members: true,
          subscription: true,
          _count: {
            select: { members: true },
          },
        },
      });

      return completeCompany;
    });

    // Automatically add the owner as a member
    await this.prisma.user.update({
      where: { id: ownerId },
      data: { companyId: result!.id },
    });

    return result!;
  }

  /**
   * Join an existing company by company ID
   */
  async joinCompany(userId: string, companyId: string): Promise<Company> {
    // Check if company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!company.isActive) {
      throw new ForbiddenException('Company is not active');
    }

    // Check if user is already in a company
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.companyId) {
      throw new ConflictException('User is already a member of a company');
    }

    // Add user to company
    await this.prisma.user.update({
      where: { id: userId },
      data: { companyId },
    });

    return company;
  }

  /**
   * Leave current company
   */
  async leaveCompany(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user?.companyId) {
      throw new NotFoundException('User is not a member of any company');
    }

    // Check if user is the owner
    if (user.company?.ownerId === userId) {
      throw new ForbiddenException('Company owner cannot leave. Transfer ownership or delete the company first.');
    }

    // Remove user from company
    await this.prisma.user.update({
      where: { id: userId },
      data: { companyId: null },
    });
  }

  /**
   * Get company by ID with members
   */
  async getCompanyById(id: string): Promise<CompanyWithMembers | null> {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        owner: true,
        members: true,
        subscription: true,
        _count: {
          select: { members: true },
        },
      },
    });
  }

  /**
   * Get user's current company
   */
  async getUserCompany(userId: string): Promise<CompanyWithMembers | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          include: {
            owner: true,
            members: true,
            subscription: true,
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    return user?.company || null;
  }

  /**
   * Update company information (only owner can update)
   */
  async updateCompany(userId: string, companyId: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyWithMembers> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.ownerId !== userId) {
      throw new ForbiddenException('Only company owner can update company information');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: updateCompanyDto,
      include: {
        owner: true,
        members: true,
        _count: {
          select: { members: true },
        },
      },
    });
  }

  /**
   * Delete company (only owner can delete)
   */
  async deleteCompany(userId: string, companyId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.ownerId !== userId) {
      throw new ForbiddenException('Only company owner can delete the company');
    }

    // Remove all members from the company first
    await this.prisma.user.updateMany({
      where: { companyId },
      data: { companyId: null },
    });

    // Delete the company
    await this.prisma.company.delete({
      where: { id: companyId },
    });
  }

  /**
   * Search companies by name
   */
  async searchCompanies(query: string, limit: number = 10): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: limit,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }

  /**
   * Remove a member from company (only owner can do this)
   */
  async removeMember(ownerId: string, companyId: string, memberId: string): Promise<void> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.ownerId !== ownerId) {
      throw new ForbiddenException('Only company owner can remove members');
    }

    if (memberId === ownerId) {
      throw new ForbiddenException('Company owner cannot remove themselves');
    }

    const member = await this.prisma.user.findFirst({
      where: { id: memberId, companyId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this company');
    }

    await this.prisma.user.update({
      where: { id: memberId },
      data: { companyId: null },
    });
  }
}

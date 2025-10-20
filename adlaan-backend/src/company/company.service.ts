import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { User } from '../user/user.entity';
import { UserRole } from '../user/enums/user-role.enum';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<Company[]> {
    return this.companyRepository.find({ relations: ['users'] });
  }

  async findOne(id: number): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async create(companyData: Partial<Company>, creatorUserId?: number): Promise<Company> {
    // Create the company first
    const company = this.companyRepository.create(companyData);
    const savedCompany = await this.companyRepository.save(company);

    // If a creator user is provided, associate them with the company
    if (creatorUserId) {
      await this.userRepository.update(creatorUserId, {
        companyId: savedCompany.id,
        // Optionally change role from ADMIN to USER when joining a company
        // Uncomment the line below if you want this behavior:
        // role: UserRole.USER
      });
    }

    return savedCompany;
  }

  async update(id: number, companyData: Partial<Company>): Promise<Company | null> {
    await this.companyRepository.update(id, companyData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.companyRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}

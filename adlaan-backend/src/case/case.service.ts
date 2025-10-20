import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Case } from './case.entity';
import { User } from '../user/user.entity';
import { CreateCaseInput } from './dto/create-case.input';
import { UpdateCaseInput } from './dto/update-case.input';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(companyId: number): Promise<Case[]> {
    return this.caseRepository.find({
      where: { companyId },
      relations: ['client', 'company', 'createdBy', 'assignedUsers'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, companyId: number): Promise<Case | null> {
    return this.caseRepository.findOne({
      where: { id, companyId },
      relations: ['client', 'company', 'createdBy', 'assignedUsers'],
    });
  }

  async create(
    input: CreateCaseInput,
    companyId: number,
    userId: number,
  ): Promise<Case> {
    const { assignedUserIds, ...caseData } = input;

    let assignedUsers: User[] = [];
    if (assignedUserIds && assignedUserIds.length > 0) {
      assignedUsers = await this.userRepository.find({
        where: { id: In(assignedUserIds), companyId },
      });
    }

    const newCase = this.caseRepository.create({
      ...caseData,
      companyId,
      createdById: userId,
      assignedUsers,
    });

    return this.caseRepository.save(newCase);
  }

  async update(
    id: number,
    input: UpdateCaseInput,
    companyId: number,
  ): Promise<Case | null> {
    const { assignedUserIds, ...updateData } = input;

    const existingCase = await this.caseRepository.findOne({
      where: { id, companyId },
      relations: ['assignedUsers'],
    });

    if (!existingCase) {
      return null;
    }

    if (assignedUserIds !== undefined) {
      if (assignedUserIds.length > 0) {
        existingCase.assignedUsers = await this.userRepository.find({
          where: { id: In(assignedUserIds), companyId },
        });
      } else {
        existingCase.assignedUsers = [];
      }
    }

    Object.assign(existingCase, updateData);
    await this.caseRepository.save(existingCase);

    return this.findOne(id, companyId);
  }

  async delete(id: number, companyId: number): Promise<boolean> {
    const result = await this.caseRepository.delete({ id, companyId });
    return result.affected ? result.affected > 0 : false;
  }

  async findByClient(clientId: number, companyId: number): Promise<Case[]> {
    return this.caseRepository.find({
      where: { clientId, companyId },
      relations: ['client', 'createdBy', 'assignedUsers'],
      order: { createdAt: 'DESC' },
    });
  }
}

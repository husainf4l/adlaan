import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['company'] });
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['company'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    // Hash password if provided
    let hashedPassword = userData.password;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }

    // Apply role logic: if no role specified and user has companyId, default to USER
    // If no role specified and no companyId, default to ADMIN
    const userWithRole = {
      ...userData,
      password: hashedPassword,
      role: userData.role || (userData.companyId ? UserRole.USER : UserRole.ADMIN)
    };
    
    const user = this.userRepository.create(userWithRole);
    return this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async login(email: string, password: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, password },
      relations: ['company'],
    });
  }
}

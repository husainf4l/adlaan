import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientInput } from './dto/create-client.input';
import { UpdateClientInput } from './dto/update-client.input';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async findAll(companyId: number): Promise<Client[]> {
    return this.clientRepository.find({
      where: { companyId },
      relations: ['company', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, companyId: number): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { id, companyId },
      relations: ['company', 'createdBy'],
    });
  }

  async create(
    input: CreateClientInput,
    companyId: number,
    userId: number,
  ): Promise<Client> {
    const client = this.clientRepository.create({
      ...input,
      companyId,
      createdById: userId,
    });
    return this.clientRepository.save(client);
  }

  async update(
    id: number,
    input: UpdateClientInput,
    companyId: number,
  ): Promise<Client | null> {
    await this.clientRepository.update({ id, companyId }, input);
    return this.findOne(id, companyId);
  }

  async delete(id: number, companyId: number): Promise<boolean> {
    const result = await this.clientRepository.delete({ id, companyId });
    return result.affected ? result.affected > 0 : false;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll(companyId: number): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { companyId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, companyId: number): Promise<Tag | null> {
    return this.tagRepository.findOne({
      where: { id, companyId },
      relations: ['documents'],
    });
  }

  async findByIds(ids: number[], companyId: number): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { id: In(ids), companyId },
    });
  }

  async findByName(name: string, companyId: number): Promise<Tag | null> {
    return this.tagRepository.findOne({
      where: { name, companyId },
    });
  }

  async create(input: CreateTagInput, companyId: number): Promise<Tag> {
    const tag = this.tagRepository.create({
      ...input,
      companyId,
    });

    return this.tagRepository.save(tag);
  }

  async update(id: number, input: UpdateTagInput, companyId: number): Promise<Tag> {
    const tag = await this.findOne(id, companyId);
    
    if (!tag) {
      throw new NotFoundException(`Tag #${id} not found`);
    }

    Object.assign(tag, input);
    return this.tagRepository.save(tag);
  }

  async delete(id: number, companyId: number): Promise<boolean> {
    const result = await this.tagRepository.delete({ id, companyId });
    return result.affected ? result.affected > 0 : false;
  }

  async getPopularTags(companyId: number, limit: number = 10): Promise<any[]> {
    // Get tags with document count
    return this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.documents', 'document')
      .where('tag.companyId = :companyId', { companyId })
      .select('tag.id', 'id')
      .addSelect('tag.name', 'name')
      .addSelect('tag.color', 'color')
      .addSelect('COUNT(document.id)', 'documentCount')
      .groupBy('tag.id')
      .addGroupBy('tag.name')
      .addGroupBy('tag.color')
      .orderBy('COUNT(document.id)', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './comment.entity';
import { Document } from '../document/document.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async findByDocument(documentId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { documentId, parentId: IsNull() }, // Only top-level comments
      relations: ['createdBy', 'replies', 'replies.createdBy', 'resolvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Comment | null> {
    return this.commentRepository.findOne({
      where: { id },
      relations: ['document', 'createdBy', 'parent', 'replies', 'resolvedBy'],
    });
  }

  async findReplies(parentId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { parentId },
      relations: ['createdBy', 'replies'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(
    documentId: number,
    input: CreateCommentInput,
    userId: number,
    companyId: number,
  ): Promise<Comment> {
    // Verify document exists and belongs to company
    const document = await this.documentRepository.findOne({
      where: { id: documentId, companyId },
    });

    if (!document) {
      throw new NotFoundException(`Document #${documentId} not found`);
    }

    // If replying, verify parent comment exists
    if (input.parentId) {
      const parent = await this.findOne(input.parentId);
      if (!parent || parent.documentId !== documentId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = this.commentRepository.create({
      ...input,
      documentId,
      createdById: userId,
    });

    return this.commentRepository.save(comment);
  }

  async update(
    id: number,
    input: UpdateCommentInput,
    userId: number,
    isAdmin: boolean,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    // Only comment creator or admin can edit
    if (comment.createdById !== userId && !isAdmin) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    Object.assign(comment, input);
    return this.commentRepository.save(comment);
  }

  async resolve(id: number, userId: number): Promise<Comment> {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    comment.resolved = true;
    comment.resolvedById = userId;
    comment.resolvedAt = new Date();

    return this.commentRepository.save(comment);
  }

  async unresolve(id: number): Promise<Comment> {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    comment.resolved = false;
    comment.resolvedById = undefined;
    comment.resolvedAt = undefined;

    return this.commentRepository.save(comment);
  }

  async delete(id: number, userId: number, isAdmin: boolean): Promise<boolean> {
    const comment = await this.findOne(id);

    if (!comment) {
      return false;
    }

    // Only comment creator or admin can delete
    if (comment.createdById !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Delete all replies first
    if (comment.replies && comment.replies.length > 0) {
      await this.commentRepository.remove(comment.replies);
    }

    await this.commentRepository.remove(comment);
    return true;
  }

  async getUnresolvedCount(documentId: number): Promise<number> {
    return this.commentRepository.count({
      where: { documentId, resolved: false },
    });
  }
}

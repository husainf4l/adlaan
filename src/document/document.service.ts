import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { UploadDocumentInput } from './dto/upload-document.input';
import { AwsS3Service } from '../services/aws-s3.service';
import { TagService } from '../tag/tag.service';
import { DocumentStatus } from './enums/document.enum';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private awsS3Service: AwsS3Service,
    private tagService: TagService,
  ) {}

  async findAll(companyId: number): Promise<Document[]> {
    return this.documentRepository.find({
      where: { companyId },
      relations: ['case', 'client', 'company', 'createdBy', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, companyId: number): Promise<Document | null> {
    return this.documentRepository.findOne({
      where: { id, companyId },
      relations: ['case', 'client', 'company', 'createdBy', 'tags'],
    });
  }

  async findByCase(caseId: number, companyId: number): Promise<Document[]> {
    return this.documentRepository.find({
      where: { caseId, companyId },
      relations: ['case', 'client', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClient(clientId: number, companyId: number): Promise<Document[]> {
    return this.documentRepository.find({
      where: { clientId, companyId },
      relations: ['case', 'client', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    input: CreateDocumentInput,
    companyId: number,
    userId: number,
  ): Promise<Document> {
    const { tagIds, ...documentData } = input;
    
    const document = this.documentRepository.create({
      ...documentData,
      companyId,
      createdById: userId,
    });

    // Associate tags if provided
    if (tagIds && tagIds.length > 0) {
      const tags = await this.tagService.findByIds(tagIds, companyId);
      document.tags = tags;
    }

    return this.documentRepository.save(document);
  }

  async update(
    id: number,
    input: UpdateDocumentInput,
    companyId: number,
  ): Promise<Document | null> {
    const { tagIds, ...updateData } = input;
    
    const document = await this.findOne(id, companyId);
    if (!document) {
      throw new NotFoundException(`Document #${id} not found`);
    }

    // Increment version if content changed
    if (input.content && document.content !== input.content) {
      updateData['version'] = document.version + 1;
    }

    // Update document fields
    Object.assign(document, updateData);

    // Update tags if provided
    if (tagIds !== undefined) {
      if (tagIds.length > 0) {
        const tags = await this.tagService.findByIds(tagIds, companyId);
        document.tags = tags;
      } else {
        document.tags = [];
      }
    }

    return this.documentRepository.save(document);
  }

  async delete(id: number, companyId: number): Promise<boolean> {
    const document = await this.findOne(id, companyId);
    
    if (!document) {
      return false;
    }

    // Delete file from S3 if exists
    if (document.fileUrl && this.awsS3Service.isS3Url(document.fileUrl)) {
      try {
        await this.awsS3Service.deleteFile(document.fileUrl);
      } catch (error) {
        console.error('Error deleting file from S3:', error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    const result = await this.documentRepository.delete({ id, companyId });
    return result.affected ? result.affected > 0 : false;
  }

  // ===== AWS S3 Upload/Download Methods =====

  async uploadDocument(
    input: UploadDocumentInput,
    userId: number,
    companyId: number,
  ): Promise<Document> {
    try {
      // Decode base64 file
      const fileBuffer = Buffer.from(input.fileBase64, 'base64');

      // Determine folder structure: documents/{companyId}/{caseId or 'general'}/
      const folder = input.caseId 
        ? `documents/${companyId}/case-${input.caseId}`
        : `documents/${companyId}/general`;

      // Upload to S3
      const fileUrl = await this.awsS3Service.uploadFile(
        fileBuffer,
        input.fileName,
        folder,
      );

      // Create document record
      const document = this.documentRepository.create({
        title: input.title,
        description: input.description,
        fileUrl,
        documentType: input.documentType,
        status: input.status || DocumentStatus.DRAFT,
        caseId: input.caseId,
        clientId: input.clientId,
        companyId,
        createdById: userId,
        version: 1,
      });

      return await this.documentRepository.save(document);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new BadRequestException('Failed to upload document: ' + error.message);
    }
  }

  async updateStatus(
    id: number,
    status: DocumentStatus,
    companyId: number,
  ): Promise<Document> {
    const document = await this.findOne(id, companyId);
    
    if (!document) {
      throw new NotFoundException(`Document #${id} not found`);
    }

    document.status = status;
    return this.documentRepository.save(document);
  }

  async getPresignedUrl(id: number, companyId: number, expiresIn: number = 3600): Promise<string> {
    const document = await this.findOne(id, companyId);
    
    if (!document) {
      throw new NotFoundException(`Document #${id} not found`);
    }

    if (!document.fileUrl) {
      throw new BadRequestException('Document has no file attached');
    }

    if (!this.awsS3Service.isS3Url(document.fileUrl)) {
      throw new BadRequestException('Document file is not stored in S3');
    }

    // Generate presigned URL (default 1 hour, max 7 days)
    return this.awsS3Service.generatePresignedUrl(document.fileUrl, expiresIn);
  }

  async downloadDocument(id: number, companyId: number): Promise<{ buffer: Buffer; fileName: string }> {
    const document = await this.findOne(id, companyId);
    
    if (!document) {
      throw new NotFoundException(`Document #${id} not found`);
    }

    if (!document.fileUrl) {
      throw new BadRequestException('Document has no file attached');
    }

    if (!this.awsS3Service.isS3Url(document.fileUrl)) {
      throw new BadRequestException('Document file is not stored in S3');
    }

    const buffer = await this.awsS3Service.getFileBuffer(document.fileUrl);
    
    // Extract filename from S3 URL or use document title
    const key = this.awsS3Service.extractKeyFromUrl(document.fileUrl);
    const fileName = key.split('/').pop() || `${document.title}.pdf`;

    return { buffer, fileName };
  }
}

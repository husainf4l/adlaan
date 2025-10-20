import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentVersion } from './document-version.entity';
import { Document } from '../document/document.entity';
import { CreateVersionInput } from './dto/create-version.input';

@Injectable()
export class DocumentVersionService {
  constructor(
    @InjectRepository(DocumentVersion)
    private versionRepository: Repository<DocumentVersion>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async findByDocument(documentId: number): Promise<DocumentVersion[]> {
    return this.versionRepository.find({
      where: { documentId },
      relations: ['createdBy'],
      order: { versionNumber: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DocumentVersion | null> {
    return this.versionRepository.findOne({
      where: { id },
      relations: ['document', 'createdBy'],
    });
  }

  async createVersion(
    documentId: number,
    input: CreateVersionInput,
    userId: number,
    companyId: number,
  ): Promise<DocumentVersion> {
    // Get current document
    const document = await this.documentRepository.findOne({
      where: { id: documentId, companyId },
    });

    if (!document) {
      throw new NotFoundException(`Document #${documentId} not found`);
    }

    // Create version snapshot
    const version = this.versionRepository.create({
      documentId,
      versionNumber: document.version,
      title: document.title,
      content: document.content,
      fileUrl: document.fileUrl,
      changeDescription: input.changeDescription,
      createdById: userId,
    });

    // Increment document version
    document.version += 1;
    await this.documentRepository.save(document);

    return this.versionRepository.save(version);
  }

  async restoreVersion(
    versionId: number,
    userId: number,
    companyId: number,
  ): Promise<Document> {
    const version = await this.findOne(versionId);

    if (!version) {
      throw new NotFoundException(`Version #${versionId} not found`);
    }

    const document = await this.documentRepository.findOne({
      where: { id: version.documentId, companyId },
    });

    if (!document) {
      throw new NotFoundException(`Document not found`);
    }

    // Save current state as a version before restoring
    await this.createVersion(
      document.id,
      { changeDescription: `Restored from version ${version.versionNumber}` },
      userId,
      companyId,
    );

    // Restore content from version
    document.title = version.title;
    document.content = version.content;
    document.fileUrl = version.fileUrl;

    return this.documentRepository.save(document);
  }

  async compareVersions(
    versionId1: number,
    versionId2: number,
  ): Promise<{ version1: DocumentVersion; version2: DocumentVersion }> {
    const [version1, version2] = await Promise.all([
      this.findOne(versionId1),
      this.findOne(versionId2),
    ]);

    if (!version1 || !version2) {
      throw new NotFoundException('One or both versions not found');
    }

    return { version1, version2 };
  }
}

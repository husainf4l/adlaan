import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentVersion } from './document-version.entity';
import { Document } from '../document/document.entity';
import { DocumentVersionService } from './document-version.service';
import { DocumentVersionResolver } from './document-version.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentVersion, Document])],
  providers: [DocumentVersionService, DocumentVersionResolver],
  exports: [DocumentVersionService],
})
export class DocumentVersionModule {}

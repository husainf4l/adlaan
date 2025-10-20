import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
import { DocumentResolver } from './document.resolver';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    TagModule,
  ],
  providers: [DocumentService, DocumentResolver],
  exports: [DocumentService],
})
export class DocumentModule {}

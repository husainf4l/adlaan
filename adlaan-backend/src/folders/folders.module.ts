import { Module } from '@nestjs/common';
import { FoldersController } from './folders.controller';
import { DocumentModule } from '../documents/document.module';

@Module({
  imports: [DocumentModule],
  controllers: [FoldersController],
})
export class FoldersModule {}

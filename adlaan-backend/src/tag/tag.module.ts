import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './tag.entity';
import { TagService } from './tag.service';
import { TagResolver } from './tag.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  providers: [TagService, TagResolver],
  exports: [TagService],
})
export class TagModule {}

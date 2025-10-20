import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Case } from './case.entity';
import { User } from '../user/user.entity';
import { CaseService } from './case.service';
import { CaseResolver } from './case.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Case, User])],
  providers: [CaseService, CaseResolver],
  exports: [CaseService],
})
export class CaseModule {}

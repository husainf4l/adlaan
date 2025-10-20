import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { User } from '../user/user.entity';
import { CompanyService } from './company.service';
import { CompanyResolver } from './company.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Company, User])],
  providers: [CompanyService, CompanyResolver],
  exports: [CompanyService],
})
export class CompanyModule {}

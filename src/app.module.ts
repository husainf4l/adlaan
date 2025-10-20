import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { AuthModule } from './auth/auth.module';
import { ClientModule } from './client/client.module';
import { CaseModule } from './case/case.module';
import { DocumentModule } from './document/document.module';
import { TagModule } from './tag/tag.module';
import { DocumentVersionModule } from './document-version/document-version.module';
import { CommentModule } from './comment/comment.module';
import { ServicesModule } from './services/services.module';
import { User } from './user/user.entity';
import { Company } from './company/company.entity';
import { Client } from './client/client.entity';
import { Case } from './case/case.entity';
import { Document } from './document/document.entity';
import { Tag } from './tag/tag.entity';
import { DocumentVersion } from './document-version/document-version.entity';
import { Comment } from './comment/comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: 'api/graphql',
      context: ({ req, res }) => ({ req, res }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        synchronize: false, // Disabled - use migrations instead
        logging: process.env.NODE_ENV !== 'production',
        entities: [User, Company, Client, Case, Document, Tag, DocumentVersion, Comment],
        migrations: ['dist/migrations/**/*.js'],
        migrationsRun: false, // Run migrations manually
      }),
      inject: [ConfigService],
    }),
    UserModule,
    CompanyModule,
    AuthModule,
    ClientModule,
    CaseModule,
    DocumentModule,
    TagModule,
    DocumentVersionModule,
    CommentModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

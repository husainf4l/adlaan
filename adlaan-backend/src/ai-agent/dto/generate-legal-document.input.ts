import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum, IsString, IsInt } from 'class-validator';
import { LegalDocumentType } from '../enums';

@InputType()
export class GenerateLegalDocumentInput {
  @Field(() => LegalDocumentType)
  @IsEnum(LegalDocumentType)
  @IsNotEmpty()
  documentType: LegalDocumentType;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  parameters: string; // JSON string with document-specific parameters

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  caseId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  clientId?: number;
}
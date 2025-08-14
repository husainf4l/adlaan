import { IsString, IsEmail, IsOptional, IsBoolean, IsUUID, IsUrl, IsNotEmpty, ValidateNested, IsNumber, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// Margins DTO
export class MarginsDto {
  @IsNumber()
  @Min(0)
  top: number;

  @IsNumber()
  @Min(0)
  bottom: number;

  @IsNumber()
  @Min(0)
  left: number;

  @IsNumber()
  @Min(0)
  right: number;
}

// Company Profile DTOs
export class CreateCompanyProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  addressEn?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsString()
  @IsOptional()
  commercialRegister?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCompanyProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  addressEn?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsString()
  @IsOptional()
  commercialRegister?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

// Document Layout DTOs
export class CreateDocumentLayoutDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  headerTemplate: string;

  @IsString()
  @IsNotEmpty()
  footerTemplate: string;

  @ValidateNested()
  @Type(() => MarginsDto)
  margins: MarginsDto;

  @IsNumber()
  @Min(8)
  @Max(72)
  fontSize: number;

  @IsString()
  @IsNotEmpty()
  fontFamily: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateDocumentLayoutDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  headerTemplate?: string;

  @IsString()
  @IsOptional()
  footerTemplate?: string;

  @ValidateNested()
  @Type(() => MarginsDto)
  @IsOptional()
  margins?: MarginsDto;

  @IsNumber()
  @Min(8)
  @Max(72)
  @IsOptional()
  fontSize?: number;

  @IsString()
  @IsOptional()
  fontFamily?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

// Response DTOs
export class CompanyProfileDto {
  id: string;
  name: string;
  nameEn?: string;
  email?: string;
  phone?: string;
  address?: string;
  addressEn?: string;
  website?: string;
  taxNumber?: string;
  commercialRegister?: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  documentLayouts?: DocumentLayoutDto[];
}

export class DocumentLayoutDto {
  id: string;
  name: string;
  headerTemplate: string;
  footerTemplate: string;
  margins: MarginsDto;
  fontSize: number;
  fontFamily: string;
  isDefault: boolean;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export type CompanyProfileResponse = ApiResponse<CompanyProfileDto>;
export type DocumentLayoutResponse = ApiResponse<DocumentLayoutDto>;
export type DocumentLayoutsResponse = ApiResponse<DocumentLayoutDto[]>;

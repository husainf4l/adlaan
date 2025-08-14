import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export enum DocumentItemType {
  FILE = 'FILE',
  FOLDER = 'FOLDER',
}

export enum DocumentType {
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  PROPOSAL = 'PROPOSAL',
  REPORT = 'REPORT',
  PRESENTATION = 'PRESENTATION',
  SPREADSHEET = 'SPREADSHEET',
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  OTHER = 'OTHER',
}

export enum DocumentPermissionRole {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

// Base DTO interfaces
export interface UserDTO {
  id: string;
  email: string;
  name: string;
}

export interface DocumentPermissionDTO {
  id: string;
  userId: string;
  role: DocumentPermissionRole;
  user: UserDTO;
}

export interface DocumentVersionDTO {
  id: string;
  version: number;
  size: number;
  checksum: string;
  url: string;
  comment?: string;
  createdById: string;
  createdBy: UserDTO;
  createdAt: string;
}

// Base document item DTO
export interface DocumentItemDTO {
  id: string;
  name: string;
  type: DocumentItemType;
  parentId: string | null;
  path: string;
  createdAt: string;
  updatedAt: string;
  createdBy: UserDTO;
  lastModifiedBy: UserDTO;
  isStarred: boolean;
  isShared: boolean;
  tags: string[];
  permissions: DocumentPermissionDTO[];
}

// Folder-specific DTO
export interface DocumentFolderDTO extends DocumentItemDTO {
  type: DocumentItemType.FOLDER;
  childrenCount?: number;
  color?: string;
  description?: string;
}

// File-specific DTO
export interface DocumentFileDTO extends DocumentItemDTO {
  type: DocumentItemType.FILE;
  size: number;
  mimeType: string;
  extension: string;
  documentType: DocumentType;
  version: number;
  checksum: string;
  isLocked: boolean;
  downloadUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  versions: DocumentVersionDTO[];
}

// Create folder DTO
export class CreateFolderDTO {
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// Upload file DTO
export class UploadFileDTO {
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}

// Update item DTO
export class UpdateItemDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;
}

// Move items DTO
export class MoveItemsDTO {
  @IsArray()
  @IsString({ each: true })
  itemIds: string[];

  @IsOptional()
  @IsString()
  targetParentId?: string;
}

// Search documents DTO
export class SearchDocumentsDTO {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsEnum(DocumentItemType)
  type?: DocumentItemType;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @Transform(({ value }) => value?.split(','))
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  starred?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'updatedAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// Response DTOs
export interface ApiResponse<T = any> {
  success: true;
  data: T;
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

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CreateFolderResponse extends ApiResponse<DocumentFolderDTO> {}

export interface UploadFileResponse extends ApiResponse<DocumentFileDTO> {}

export interface GetItemResponse extends ApiResponse<DocumentItemDTO> {}

export interface SearchDocumentsResponse extends ApiResponse<{
  items: DocumentItemDTO[];
  pagination: PaginationInfo;
}> {}

export interface GetFolderContentsResponse extends ApiResponse<DocumentItemDTO[]> {}

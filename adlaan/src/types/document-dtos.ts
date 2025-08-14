// DTOs (Data Transfer Objects) for Document Management API

// ===== REQUEST DTOs =====

export interface CreateFolderDTO {
  name: string;
  parentId?: string | null;
  color?: string;
  description?: string;
}

export interface CreateDocumentDTO {
  name: string;
  documentType: string; // 'CONTRACT' | 'BRIEF' | etc.
  parentId?: string | null;
  content?: string;
  tags?: string[];
  description?: string;
}

export interface UploadFileDTO {
  // File will be sent as multipart/form-data
  parentId?: string | null;
  documentType: string;
  tags?: string[];
  description?: string;
  // Additional metadata
  replaceExisting?: boolean;
  generateThumbnail?: boolean;
}

export interface UpdateItemDTO {
  name?: string;
  description?: string;
  tags?: string[];
  color?: string; // for folders
}

export interface MoveItemsDTO {
  itemIds: string[];
  targetParentId?: string | null;
}

export interface ShareDocumentDTO {
  userEmails: string[];
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  message?: string;
  expiresAt?: string; // ISO date string
}

export interface SearchDocumentsDTO {
  query?: string;
  parentId?: string | null;
  type?: 'file' | 'folder';
  documentType?: string;
  tags?: string[];
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  starred?: boolean;
  shared?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'size' | 'type';
  sortOrder?: 'asc' | 'desc';
}

// ===== RESPONSE DTOs =====

export interface DocumentItemDTO {
  id: string;
  name: string;
  type: 'FILE' | 'FOLDER'; // Backend uses uppercase
  parentId?: string | null;
  path: string;
  size?: number; // in bytes
  mimeType?: string;
  extension?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  createdBy: UserDTO;
  lastModifiedBy: UserDTO;
  isStarred: boolean;
  isShared: boolean;
  tags: string[];
  permissions: PermissionDTO[];
  
  // File-specific fields (only when type === 'FILE')
  documentType?: 'CONTRACT' | 'BRIEF' | 'MOTION' | 'PLEADING' | 'DISCOVERY' | 'CORRESPONDENCE' | 'MEMORANDUM' | 'AGREEMENT' | 'LEASE' | 'INVOICE' | 'RESEARCH' | 'CASE_LAW' | 'STATUTE' | 'REGULATION' | 'OTHER';
  version?: number;
  checksum?: string;
  isLocked?: boolean;
  lockedBy?: UserDTO;
  lockedAt?: string; // ISO date string
  downloadUrl?: string;
  previewUrl?: string;
  thumbnailUrl?: string | null;
  
  // Folder-specific fields (only when type === 'FOLDER')
  childrenCount?: number;
  color?: string | null;
  description?: string | null;
}

export interface DocumentFileDTO extends DocumentItemDTO {
  type: 'FILE';
  documentType: 'CONTRACT' | 'BRIEF' | 'MOTION' | 'PLEADING' | 'DISCOVERY' | 'CORRESPONDENCE' | 'MEMORANDUM' | 'AGREEMENT' | 'LEASE' | 'INVOICE' | 'RESEARCH' | 'CASE_LAW' | 'STATUTE' | 'REGULATION' | 'OTHER';
  version: number;
  checksum: string;
  downloadUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string | null;
  isLocked: boolean;
  lockedBy?: UserDTO;
  lockedAt?: string;
  versions: DocumentVersionDTO[];
}

export interface DocumentFolderDTO extends DocumentItemDTO {
  type: 'FOLDER';
  childrenCount: number;
  color?: string | null;
  description?: string | null;
  children?: DocumentItemDTO[]; // Optional, may not always be included
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface PermissionDTO {
  id: string;
  user: UserDTO;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  grantedAt: string; // ISO date string
  grantedBy: UserDTO;
  expiresAt?: string; // ISO date string
}

export interface DocumentVersionDTO {
  id: string;
  version: number;
  size: number;
  createdAt: string; // ISO date string
  createdBy: UserDTO;
  comment?: string;
  downloadUrl: string;
  checksum: string;
}

export interface BreadcrumbDTO {
  id: string;
  name: string;
  type: 'folder';
  path: string;
}

export interface SearchResultDTO {
  items: DocumentItemDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: {
    documentTypes: { [key: string]: number };
    tags: { [key: string]: number };
    extensions: { [key: string]: number };
  };
}

export interface UploadProgressDTO {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  estimatedTimeRemaining?: number; // seconds
}

export interface ActivityDTO {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'moved' | 'shared' | 'unshared' | 'downloaded' | 'viewed';
  documentId: string;
  documentName: string;
  user: UserDTO;
  timestamp: string; // ISO date string
  details?: {
    oldValue?: string;
    newValue?: string;
    targetFolder?: string;
    sharedWith?: string[];
  };
}

// ===== API RESPONSE WRAPPERS =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
  timestamp: string;
}

// ===== UTILITY TYPES =====

export type CreateFolderResponse = ApiResponse<DocumentFolderDTO>;
export type CreateDocumentResponse = ApiResponse<DocumentFileDTO>;
export type UploadFileResponse = ApiResponse<DocumentFileDTO>;
export type GetItemResponse = ApiResponse<DocumentItemDTO>;
export type GetFolderContentsResponse = ApiResponse<DocumentItemDTO[]>;
export type SearchDocumentsResponse = PaginatedResponse<DocumentItemDTO>;
export type GetBreadcrumbsResponse = ApiResponse<BreadcrumbDTO[]>;
export type GetActivitiesResponse = PaginatedResponse<ActivityDTO>;

// ===== API ENDPOINTS TYPES =====

export interface DocumentApiEndpoints {
  // Folders
  createFolder: (dto: CreateFolderDTO) => Promise<CreateFolderResponse>;
  getFolderContents: (folderId?: string) => Promise<GetFolderContentsResponse>;
  
  // Files
  uploadFile: (file: File, dto: UploadFileDTO) => Promise<UploadFileResponse>;
  createDocument: (dto: CreateDocumentDTO) => Promise<CreateDocumentResponse>;
  getDocument: (id: string) => Promise<GetItemResponse>;
  downloadDocument: (id: string) => Promise<Blob>;
  
  // Generic items
  updateItem: (id: string, dto: UpdateItemDTO) => Promise<GetItemResponse>;
  deleteItems: (ids: string[]) => Promise<ApiResponse<{ deletedCount: number }>>;
  moveItems: (dto: MoveItemsDTO) => Promise<ApiResponse<{ movedCount: number }>>;
  starItem: (id: string) => Promise<ApiResponse<{ isStarred: boolean }>>;
  unstarItem: (id: string) => Promise<ApiResponse<{ isStarred: boolean }>>;
  
  // Search & Navigation
  searchDocuments: (dto: SearchDocumentsDTO) => Promise<SearchDocumentsResponse>;
  getBreadcrumbs: (itemId: string) => Promise<GetBreadcrumbsResponse>;
  
  // Sharing
  shareDocument: (id: string, dto: ShareDocumentDTO) => Promise<ApiResponse<PermissionDTO[]>>;
  getSharedDocuments: () => Promise<GetFolderContentsResponse>;
  
  // Activities
  getActivities: (itemId?: string, page?: number) => Promise<GetActivitiesResponse>;
}

export default DocumentApiEndpoints;

// ===== TRANSFORMATION UTILITIES =====

/**
 * Transform API DTO to internal document item type
 */
export function transformDocumentDTO(dto: DocumentItemDTO): import('./documents').DocumentItem {
  const baseItem = {
    id: dto.id,
    name: dto.name,
    type: dto.type === 'FILE' ? 'file' as const : 'folder' as const,
    size: dto.size,
    mimeType: dto.mimeType,
    extension: dto.extension,
    parentId: dto.parentId,
    path: dto.path,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    createdBy: dto.createdBy.name,
    lastModifiedBy: dto.lastModifiedBy.name,
    isShared: dto.isShared,
    permissions: dto.permissions || [],
    tags: dto.tags || [],
    isFavorite: dto.isStarred, // Map for backward compatibility
    isStarred: dto.isStarred,
    downloadUrl: dto.downloadUrl,
    previewUrl: dto.previewUrl,
    thumbnailUrl: dto.thumbnailUrl,
  };

  if (dto.type === 'FILE') {
    return {
      ...baseItem,
      type: 'file' as const,
      documentType: dto.documentType as any,
      version: dto.version || 1,
      versions: (dto as DocumentFileDTO).versions || [],
      checksum: dto.checksum || '',
      isLocked: dto.isLocked || false,
    };
  } else {
    return {
      ...baseItem,
      type: 'folder' as const,
      children: [], // Will be populated separately if needed
      childrenCount: dto.childrenCount || 0,
      isRoot: !dto.parentId,
      color: dto.color,
    };
  }
}

/**
 * Transform API response to internal document items
 */
export function transformDocumentListResponse(response: ApiResponse<DocumentItemDTO[]>): import('./documents').DocumentItem[] {
  return response.data.map(transformDocumentDTO);
}

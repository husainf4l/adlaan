// Document Management System Types (Google Drive-like)

export interface DocumentItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number; // in bytes
  mimeType?: string;
  extension?: string;
  parentId?: string | null; // null for root level
  path: string; // full path for navigation
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  isShared: boolean;
  permissions: Permission[];
  tags: string[];
  isFavorite: boolean;
  isStarred: boolean;
  downloadUrl?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
}

export interface DocumentFile extends DocumentItem {
  type: 'file';
  content?: string; // for text-based documents
  documentType: BackendDocumentType;
  version: number;
  versions: DocumentVersion[];
  checksum: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
}

export interface DocumentFolder extends DocumentItem {
  type: 'folder';
  children: DocumentItem[];
  childrenCount: number;
  isRoot: boolean;
  color?: string; // folder color
}

export interface Permission {
  userId: string;
  userEmail: string;
  userName: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  grantedAt: string;
  grantedBy: string;
}

export interface DocumentVersion {
  id: string;
  version: number;
  size: number;
  createdAt: string;
  createdBy: string;
  comment?: string;
  downloadUrl: string;
}

// Backend document types from your API error
export enum BackendDocumentType {
  CONTRACT = 'CONTRACT',
  BRIEF = 'BRIEF',
  MOTION = 'MOTION',
  PLEADING = 'PLEADING',
  DISCOVERY = 'DISCOVERY',
  CORRESPONDENCE = 'CORRESPONDENCE',
  MEMORANDUM = 'MEMORANDUM',
  AGREEMENT = 'AGREEMENT',
  LEASE = 'LEASE',
  INVOICE = 'INVOICE',
  RESEARCH = 'RESEARCH',
  CASE_LAW = 'CASE_LAW',
  STATUTE = 'STATUTE',
  REGULATION = 'REGULATION',
  OTHER = 'OTHER'
}

// Arabic labels for document types
export const DOCUMENT_TYPE_LABELS = {
  [BackendDocumentType.CONTRACT]: 'عقد',
  [BackendDocumentType.BRIEF]: 'مذكرة قانونية',
  [BackendDocumentType.MOTION]: 'طلب قضائي',
  [BackendDocumentType.PLEADING]: 'مرافعة',
  [BackendDocumentType.DISCOVERY]: 'استكشاف',
  [BackendDocumentType.CORRESPONDENCE]: 'مراسلات',
  [BackendDocumentType.MEMORANDUM]: 'مذكرة',
  [BackendDocumentType.AGREEMENT]: 'اتفاقية',
  [BackendDocumentType.LEASE]: 'عقد إيجار',
  [BackendDocumentType.INVOICE]: 'فاتورة',
  [BackendDocumentType.RESEARCH]: 'بحث قانوني',
  [BackendDocumentType.CASE_LAW]: 'سوابق قضائية',
  [BackendDocumentType.STATUTE]: 'قانون',
  [BackendDocumentType.REGULATION]: 'لائحة',
  [BackendDocumentType.OTHER]: 'أخرى'
} as const;

// File type information
export interface FileTypeInfo {
  extension: string;
  mimeType: string;
  icon: string;
  color: string;
  canPreview: boolean;
  canEdit: boolean;
}

export const FILE_TYPES: Record<string, FileTypeInfo> = {
  // Documents
  'pdf': { extension: 'pdf', mimeType: 'application/pdf', icon: '📄', color: 'text-red-600', canPreview: true, canEdit: false },
  'docx': { extension: 'docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', icon: '📝', color: 'text-blue-600', canPreview: true, canEdit: true },
  'doc': { extension: 'doc', mimeType: 'application/msword', icon: '📝', color: 'text-blue-600', canPreview: true, canEdit: true },
  'txt': { extension: 'txt', mimeType: 'text/plain', icon: '📄', color: 'text-gray-600', canPreview: true, canEdit: true },
  'rtf': { extension: 'rtf', mimeType: 'application/rtf', icon: '📄', color: 'text-purple-600', canPreview: true, canEdit: true },
  
  // Spreadsheets
  'xlsx': { extension: 'xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', icon: '📊', color: 'text-green-600', canPreview: true, canEdit: true },
  'xls': { extension: 'xls', mimeType: 'application/vnd.ms-excel', icon: '📊', color: 'text-green-600', canPreview: true, canEdit: true },
  'csv': { extension: 'csv', mimeType: 'text/csv', icon: '📊', color: 'text-green-600', canPreview: true, canEdit: true },
  
  // Presentations
  'pptx': { extension: 'pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', icon: '📽️', color: 'text-orange-600', canPreview: true, canEdit: true },
  'ppt': { extension: 'ppt', mimeType: 'application/vnd.ms-powerpoint', icon: '📽️', color: 'text-orange-600', canPreview: true, canEdit: true },
  
  // Images
  'jpg': { extension: 'jpg', mimeType: 'image/jpeg', icon: '🖼️', color: 'text-pink-600', canPreview: true, canEdit: false },
  'jpeg': { extension: 'jpeg', mimeType: 'image/jpeg', icon: '🖼️', color: 'text-pink-600', canPreview: true, canEdit: false },
  'png': { extension: 'png', mimeType: 'image/png', icon: '🖼️', color: 'text-pink-600', canPreview: true, canEdit: false },
  'gif': { extension: 'gif', mimeType: 'image/gif', icon: '🖼️', color: 'text-pink-600', canPreview: true, canEdit: false },
  
  // Archives
  'zip': { extension: 'zip', mimeType: 'application/zip', icon: '🗜️', color: 'text-yellow-600', canPreview: false, canEdit: false },
  'rar': { extension: 'rar', mimeType: 'application/vnd.rar', icon: '🗜️', color: 'text-yellow-600', canPreview: false, canEdit: false },
  
  // Other
  'default': { extension: '', mimeType: 'application/octet-stream', icon: '📎', color: 'text-gray-600', canPreview: false, canEdit: false }
};

// API Request/Response types
export interface CreateFolderRequest {
  name: string;
  parentId?: string;
  color?: string;
}

export interface UploadFileRequest {
  file: File;
  parentId?: string;
  documentType: BackendDocumentType;
  tags?: string[];
}

export interface CreateDocumentRequest {
  name: string;
  documentType: BackendDocumentType;
  parentId?: string;
  content?: string;
  tags?: string[];
}

export interface MoveItemRequest {
  itemIds: string[];
  targetParentId?: string;
}

export interface RenameItemRequest {
  newName: string;
}

export interface ShareDocumentRequest {
  userEmails: string[];
  role: 'viewer' | 'commenter' | 'editor';
  message?: string;
}

export interface DocumentSearchRequest {
  query?: string;
  parentId?: string;
  type?: 'file' | 'folder' | 'all';
  documentType?: BackendDocumentType;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  sharedWithMe?: boolean;
  starred?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface DocumentSearchResponse {
  items: DocumentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

// View modes
export type ViewMode = 'grid' | 'list' | 'details';

// Sort options
export interface SortOption {
  field: 'name' | 'createdAt' | 'updatedAt' | 'size' | 'type';
  order: 'asc' | 'desc';
}

// Context menu actions
export type ContextMenuAction = 
  | 'open' 
  | 'edit' 
  | 'preview' 
  | 'download' 
  | 'share' 
  | 'rename' 
  | 'move' 
  | 'copy' 
  | 'delete' 
  | 'star' 
  | 'unstar' 
  | 'properties' 
  | 'versions';

// Upload progress
export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

// Activity/History
export interface DocumentActivity {
  id: string;
  type: 'created' | 'edited' | 'shared' | 'moved' | 'renamed' | 'deleted' | 'downloaded';
  documentId: string;
  documentName: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

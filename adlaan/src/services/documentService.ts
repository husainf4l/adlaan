// Document Management Service (Updated for Real API)

import type { 
  DocumentItem,
  DocumentFile,
  DocumentFolder,
  CreateFolderRequest,
  UploadFileRequest,
  CreateDocumentRequest,
  MoveItemRequest,
  RenameItemRequest,
  ShareDocumentRequest,
  DocumentSearchRequest,
  DocumentSearchResponse,
  BreadcrumbItem,
  UploadProgress,
  DocumentActivity
} from '@/types/documents';
import { 
  transformDocumentDTO, 
  transformDocumentListResponse,
  type ApiResponse,
  type DocumentItemDTO 
} from '@/types/document-dtos';

// API Error Response type
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

interface PaginatedApiResponse<T> {
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
  timestamp: string;
}

class DocumentService {
  private baseUrl: string;
  private accessToken: string;

  constructor() {
    this.baseUrl = 'http://localhost:4007/api';
    // Try to get token from localStorage first, fallback to the fresh token
    this.accessToken = this.getStoredToken() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWVhYnNxYjEwMDAwM3NhOGJxZW54MjB3IiwiaWF0IjoxNzU1MTE5ODEzLCJleHAiOjE3NTUyMDYyMTN9.y4W5B0ljaCn8pBFQV5XyO69j_9tBbYAXMPJp_dECUp8';
  }

  // Get token from localStorage (client-side only)
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adlaan_access_token');
    }
    return null;
  }

  // Store token in localStorage and update current token
  setAccessToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('adlaan_access_token', token);
    }
  }

  // Set both access and refresh tokens
  setTokens(accessToken: string, refreshToken: string) {
    this.setAccessToken(accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adlaan_refresh_token', refreshToken);
    }
  }

  // Clear stored tokens (for logout)
  clearTokens() {
    this.accessToken = '';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adlaan_access_token');
      localStorage.removeItem('adlaan_refresh_token');
    }
  }

  // Test API connection and token validity
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing API connection...');
      console.log('🌐 Base URL:', this.baseUrl);
      console.log('🔑 Token (first 20 chars):', this.accessToken.substring(0, 20) + '...');
      
      // Try a simple endpoint first
      await this.apiCall<any>('/documents/folders/root/contents');
      
      return {
        success: true,
        message: 'API connection successful'
      };
    } catch (error) {
      console.error('🚨 API connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Debug method to test document fetching and transformation
  async debugGetDocument(id: string): Promise<{ raw: any; transformed: DocumentFile | DocumentFolder }> {
    try {
      console.log(`🔍 Debugging document fetch for ID: ${id}`);
      
      // Get raw response
      const rawResponse = await this.apiCall<any>(`/documents/${id}`);
      console.log('📄 Raw API response:', JSON.stringify(rawResponse, null, 2));
      
      // Transform response
      const transformed = this.transformApiItem(rawResponse);
      console.log('🔄 Transformed document:', JSON.stringify(transformed, null, 2));
      
      return {
        raw: rawResponse,
        transformed
      };
    } catch (error) {
      console.error('🚨 Debug fetch failed:', error);
      throw error;
    }
  }

  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
    };

    // Don't set Content-Type for FormData uploads
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    console.log(`🌐 Making ${options.method || 'GET'} request to:`, url);
    console.log('🔑 Authorization header:', headers['Authorization'] ? 'Bearer [TOKEN_PROVIDED]' : 'NO_TOKEN');

    try {
      const response = await fetch(url, config);
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        const error = responseData as ApiErrorResponse;
        console.error(`❌ API Error (${response.status}):`, error);
        
        // Special handling for 401 Unauthorized
        if (response.status === 401) {
          console.error('🚨 Token may be expired or invalid. Please check your JWT token.');
          throw new Error('Authentication failed. Please login again.');
        }
        
        throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ API call successful');
      return (responseData as ApiResponse<T>).data;
    } catch (error) {
      console.error('🔥 Network or parsing error:', error);
      throw error;
    }
  }

  // Folder operations
  async getRootItems(): Promise<DocumentItem[]> {
    // Get root-level items using folder contents endpoint
    const response = await this.apiCall<DocumentItemDTO[]>('/documents/folders/root/contents');
    return response.map(item => transformDocumentDTO(item));
  }

  async getFolderContents(folderId: string): Promise<DocumentItem[]> {
    const response = await this.apiCall<DocumentItemDTO[]>(`/documents/folders/${folderId}/contents`);
    return response.map(item => transformDocumentDTO(item));
  }

  async createFolder(data: CreateFolderRequest): Promise<DocumentFolder> {
    const requestBody = {
      name: data.name,
      parentId: data.parentId || null,
      color: data.color,
    };

    const response = await this.apiCall<any>('/folders', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    return this.transformApiItem(response) as DocumentFolder;
  }

  async getFolderPath(folderId: string): Promise<BreadcrumbItem[]> {
    // This might need to be implemented via the search API or a custom endpoint
    // For now, return empty array - you'll need to check if this endpoint exists
    try {
      return this.apiCall<BreadcrumbItem[]>(`/documents/${folderId}/breadcrumbs`);
    } catch {
      // Fallback: return empty breadcrumbs if endpoint doesn't exist
      return [];
    }
  }

  // File operations
  async uploadFile(data: UploadFileRequest, onProgress?: (progress: UploadProgress) => void): Promise<DocumentFile> {
    const formData = new FormData();
    formData.append('file', data.file);
    
    if (data.parentId) {
      formData.append('parentId', data.parentId);
    }
    
    if (data.documentType) {
      formData.append('documentType', data.documentType);
    }
    
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }

    // Handle upload progress if callback provided
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress({
              fileId: 'temp-' + Date.now(),
              fileName: data.file.name,
              progress,
              status: 'uploading'
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                const transformedDocument = this.transformApiItem(response.data);
                onProgress({
                  fileId: transformedDocument.id,
                  fileName: data.file.name,
                  progress: 100,
                  status: 'completed'
                });
                resolve(transformedDocument as DocumentFile);
              } else {
                throw new Error(response.error?.message || 'Upload failed');
              }
            } catch (error) {
              onProgress({
                fileId: 'temp-' + Date.now(),
                fileName: data.file.name,
                progress: 0,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed'
              });
              reject(error);
            }
          } else {
            onProgress({
              fileId: 'temp-' + Date.now(),
              fileName: data.file.name,
              progress: 0,
              status: 'error',
              error: 'Upload failed'
            });
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          onProgress({
            fileId: 'temp-' + Date.now(),
            fileName: data.file.name,
            progress: 0,
            status: 'error',
            error: 'Network error'
          });
          reject(new Error('Network error'));
        });

        xhr.open('POST', `${this.baseUrl}/documents/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
        xhr.send(formData);
      });
    }

    const response = await this.apiCall<any>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
    return this.transformApiItem(response) as DocumentFile;
  }

  async createDocument(data: CreateDocumentRequest): Promise<DocumentFile> {
    const response = await this.apiCall<any>('/documents', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        type: data.documentType,
        parentId: data.parentId,
        content: data.content || '',
        tags: data.tags || []
      }),
    });
    return this.transformApiItem(response) as DocumentFile;
  }

  async getDocument(id: string): Promise<DocumentFile> {
    const response = await this.apiCall<any>(`/documents/${id}`);
    return this.transformApiItem(response) as DocumentFile;
  }

  async updateDocument(id: string, content: string): Promise<DocumentFile> {
    const response = await this.apiCall<any>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return this.transformApiItem(response) as DocumentFile;
  }

  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/documents/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    return response.blob();
  }

  // Item management
  async renameItem(id: string, data: RenameItemRequest): Promise<DocumentItem> {
    const response = await this.apiCall<any>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: data.newName }),
    });
    return this.transformApiItem(response);
  }

  async moveItems(data: MoveItemRequest): Promise<void> {
    return this.apiCall<void>('/documents/move', {
      method: 'POST',
      body: JSON.stringify({
        itemIds: data.itemIds,
        targetParentId: data.targetParentId
      }),
    });
  }

  async deleteItems(itemIds: string[]): Promise<void> {
    // Delete each item individually since the API uses DELETE /documents/{id}
    await Promise.all(
      itemIds.map(id => 
        this.apiCall<void>(`/documents/${id}`, {
          method: 'DELETE',
        })
      )
    );
  }

  async starItem(id: string): Promise<DocumentItem> {
    const response = await this.apiCall<any>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isStarred: true }),
    });
    return this.transformApiItem(response);
  }

  async unstarItem(id: string): Promise<DocumentItem> {
    const response = await this.apiCall<any>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isStarred: false }),
    });
    return this.transformApiItem(response);
  }

  // Search and filter
  async searchDocuments(params: DocumentSearchRequest): Promise<DocumentSearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('query', params.query);
    if (params.parentId) queryParams.append('parentId', params.parentId);
    if (params.type) queryParams.append('type', params.type.toUpperCase()); // API expects FILE/FOLDER
    if (params.documentType) queryParams.append('documentType', params.documentType);
    if (params.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));
    if (params.starred !== undefined) queryParams.append('starred', params.starred.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await this.apiCall<{
      items: DocumentItem[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/documents/search?${queryParams}`);

    return {
      items: response.items,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
    };
  }

  async getRecentDocuments(limit = 10): Promise<DocumentFile[]> {
    const response = await this.searchDocuments({
      type: 'file',
      limit,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
    return response.items.filter(item => item.type === 'file') as DocumentFile[];
  }

  async getStarredDocuments(): Promise<DocumentItem[]> {
    const response = await this.searchDocuments({
      starred: true,
      limit: 50,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
    return response.items;
  }

  async getSharedDocuments(): Promise<DocumentItem[]> {
    // Note: You may need to implement this via a specific endpoint if available
    // For now, return empty array or implement based on your API
    try {
      return this.apiCall<DocumentItem[]>('/documents/shared');
    } catch {
      // Fallback: return empty array if endpoint doesn't exist
      return [];
    }
  }

  // Sharing and permissions
  async shareDocument(id: string, data: ShareDocumentRequest): Promise<void> {
    return this.apiCall<void>(`/documents/${id}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDocumentPermissions(id: string): Promise<unknown[]> {
    return this.apiCall<unknown[]>(`/documents/${id}/permissions`);
  }

  async updateDocumentPermission(id: string, userId: string, role: string): Promise<void> {
    return this.apiCall<void>(`/documents/${id}/permissions/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async removeDocumentPermission(id: string, userId: string): Promise<void> {
    return this.apiCall<void>(`/documents/${id}/permissions/${userId}`, {
      method: 'DELETE',
    });
  }

  // Version history
  async getDocumentVersions(id: string): Promise<unknown[]> {
    return this.apiCall<unknown[]>(`/documents/${id}/versions`);
  }

  async revertToVersion(id: string, versionId: string): Promise<DocumentFile> {
    return this.apiCall<DocumentFile>(`/documents/${id}/versions/${versionId}/revert`, {
      method: 'POST',
    });
  }

  // Activity and history
  async getDocumentActivity(id: string): Promise<DocumentActivity[]> {
    return this.apiCall<DocumentActivity[]>(`/documents/${id}/activity`);
  }

  async getRecentActivity(limit = 20): Promise<DocumentActivity[]> {
    return this.apiCall<DocumentActivity[]>(`/activity/recent?limit=${limit}`);
  }

  // Transform API response to internal format
  private transformApiItem(apiItem: any): DocumentFile | DocumentFolder {
    const isFolder = apiItem.type === 'FOLDER' || apiItem.type === 'folder';
    
    // Handle user objects for createdBy and lastModifiedBy
    const getCreatedBy = (item: any): string => {
      if (typeof item.createdBy === 'object' && item.createdBy?.id) {
        return item.createdBy.id;
      }
      return item.createdBy || item.created_by || item.ownerId || '';
    };

    const getLastModifiedBy = (item: any): string => {
      if (typeof item.lastModifiedBy === 'object' && item.lastModifiedBy?.id) {
        return item.lastModifiedBy.id;
      }
      return item.lastModifiedBy || item.last_modified_by || item.ownerId || '';
    };
    
    const baseItem = {
      id: apiItem.id,
      name: apiItem.name,
      type: isFolder ? 'folder' as const : 'file' as const,
      parentId: apiItem.parentId || apiItem.parent_id || null,
      path: apiItem.path || `/${apiItem.name}`,
      createdAt: apiItem.createdAt || apiItem.created_at,
      updatedAt: apiItem.updatedAt || apiItem.updated_at,
      createdBy: getCreatedBy(apiItem),
      lastModifiedBy: getLastModifiedBy(apiItem),
      isShared: apiItem.isShared || apiItem.is_shared || false,
      permissions: apiItem.permissions || [],
      tags: apiItem.tags || [],
      isFavorite: apiItem.isFavorite || apiItem.is_favorite || false,
      isStarred: apiItem.isStarred || apiItem.is_starred || false,
      downloadUrl: apiItem.downloadUrl || apiItem.download_url,
      previewUrl: apiItem.previewUrl || apiItem.preview_url,
      thumbnailUrl: apiItem.thumbnailUrl || apiItem.thumbnail_url
    };

    if (isFolder) {
      return {
        ...baseItem,
        type: 'folder' as const,
        children: [],
        childrenCount: apiItem.itemCount || apiItem.item_count || 0,
        isRoot: apiItem.isRoot || apiItem.is_root || false,
        color: apiItem.color
      } as DocumentFolder;
    } else {
      return {
        ...baseItem,
        type: 'file' as const,
        size: apiItem.size || 0,
        mimeType: apiItem.mimeType || apiItem.mime_type || 'application/octet-stream',
        extension: apiItem.extension || this.getFileExtension(apiItem.name),
        content: apiItem.content,
        documentType: apiItem.documentType || apiItem.document_type || 'OTHER',
        version: apiItem.version || 1,
        versions: apiItem.versions || [],
        checksum: apiItem.checksum || '',
        isLocked: apiItem.isLocked || apiItem.is_locked || false,
        lockedBy: apiItem.lockedBy || apiItem.locked_by,
        lockedAt: apiItem.lockedAt || apiItem.locked_at
      } as DocumentFile;
    }
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'ك.بايت', 'م.بايت', 'ج.بايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  getFileTypeInfo(filename: string) {
    const extension = this.getFileExtension(filename);
    const fileTypes = {
      // Documents
      'pdf': { icon: '📄', color: 'text-red-600', canPreview: true },
      'docx': { icon: '📝', color: 'text-blue-600', canPreview: true },
      'doc': { icon: '📝', color: 'text-blue-600', canPreview: true },
      'txt': { icon: '📄', color: 'text-gray-600', canPreview: true },
      
      // Spreadsheets
      'xlsx': { icon: '📊', color: 'text-green-600', canPreview: true },
      'xls': { icon: '📊', color: 'text-green-600', canPreview: true },
      'csv': { icon: '📊', color: 'text-green-600', canPreview: true },
      
      // Images
      'jpg': { icon: '🖼️', color: 'text-pink-600', canPreview: true },
      'jpeg': { icon: '🖼️', color: 'text-pink-600', canPreview: true },
      'png': { icon: '🖼️', color: 'text-pink-600', canPreview: true },
      
      // Default
      'default': { icon: '📎', color: 'text-gray-600', canPreview: false }
    };
    
    return fileTypes[extension as keyof typeof fileTypes] || fileTypes.default;
  }
}

export const documentService = new DocumentService();

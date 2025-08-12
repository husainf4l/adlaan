// Document Management Service (Google Drive-like)

import { API_CONFIG } from '@/lib/constants';
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

class DocumentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    // Don't set Content-Type for FormData uploads
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      headers,
      credentials: 'include',
      ...options,
    };

    console.log(`🌐 Making ${options.method || 'GET'} request to:`, url);

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.error(`❌ API Error (${response.status}):`, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Folder operations
  async getRootItems(): Promise<DocumentItem[]> {
    // Use search endpoint with default parameters to get root documents
    const response = await this.apiCall<{ documents: DocumentItem[] }>('/documents/search?page=1&limit=50&sortBy=updatedAt&sortOrder=desc');
    return response.documents || [];
  }

  async getFolderContents(folderId: string): Promise<DocumentItem[]> {
    // Use search endpoint with parent filter
    const response = await this.apiCall<{ documents: DocumentItem[] }>(`/documents/search?parentId=${folderId}&page=1&limit=50&sortBy=updatedAt&sortOrder=desc`);
    return response.documents || [];
  }

  async createFolder(data: CreateFolderRequest): Promise<DocumentFolder> {
    return this.apiCall<DocumentFolder>('/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFolderPath(folderId: string): Promise<BreadcrumbItem[]> {
    return this.apiCall<BreadcrumbItem[]>(`/folders/${folderId}/path`);
  }

  // File operations
  async uploadFile(data: UploadFileRequest, onProgress?: (progress: UploadProgress) => void): Promise<DocumentFile> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('type', data.documentType);
    
    if (data.parentId) {
      formData.append('parentId', data.parentId);
    }
    
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => formData.append('tags[]', tag));
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
            const response = JSON.parse(xhr.responseText);
            onProgress({
              fileId: response.id,
              fileName: data.file.name,
              progress: 100,
              status: 'completed'
            });
            resolve(response);
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
        xhr.setRequestHeader('credentials', 'include');
        xhr.send(formData);
      });
    }

    return this.apiCall<DocumentFile>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async createDocument(data: CreateDocumentRequest): Promise<DocumentFile> {
    return this.apiCall<DocumentFile>('/documents', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        type: data.documentType,
        parentId: data.parentId,
        content: data.content || '',
        tags: data.tags || []
      }),
    });
  }

  async getDocument(id: string): Promise<DocumentFile> {
    return this.apiCall<DocumentFile>(`/documents/${id}`);
  }

  async updateDocument(id: string, content: string): Promise<DocumentFile> {
    return this.apiCall<DocumentFile>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async downloadDocument(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/documents/${id}/download`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    return response.blob();
  }

  // Item management
  async renameItem(id: string, data: RenameItemRequest): Promise<DocumentItem> {
    return this.apiCall<DocumentItem>(`/documents/${id}/rename`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async moveItems(data: MoveItemRequest): Promise<void> {
    return this.apiCall<void>('/documents/move', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItems(itemIds: string[]): Promise<void> {
    return this.apiCall<void>('/documents/delete', {
      method: 'DELETE',
      body: JSON.stringify({ itemIds }),
    });
  }

  async starItem(id: string): Promise<DocumentItem> {
    return this.apiCall<DocumentItem>(`/documents/${id}/star`, {
      method: 'POST',
    });
  }

  async unstarItem(id: string): Promise<DocumentItem> {
    return this.apiCall<DocumentItem>(`/documents/${id}/unstar`, {
      method: 'POST',
    });
  }

  // Search and filter
  async searchDocuments(params: DocumentSearchRequest): Promise<DocumentSearchResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(`${key}[]`, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return this.apiCall<DocumentSearchResponse>(`/documents/search?${queryParams}`);
  }

  async getRecentDocuments(limit = 10): Promise<DocumentFile[]> {
    return this.apiCall<DocumentFile[]>(`/documents/recent?limit=${limit}`);
  }

  async getStarredDocuments(): Promise<DocumentItem[]> {
    return this.apiCall<DocumentItem[]>('/documents/starred');
  }

  async getSharedDocuments(): Promise<DocumentItem[]> {
    return this.apiCall<DocumentItem[]>('/documents/shared');
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

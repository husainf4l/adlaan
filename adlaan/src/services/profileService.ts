import { API_CONFIG } from '@/lib/constants';

const API_BASE = API_CONFIG.BASE_URL;

export interface CompanyProfile {
  id: string;
  name: string;
  nameEn?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  addressEn?: string | null;
  website?: string | null;
  taxNumber?: string | null;
  commercialRegister?: string | null;
  logo?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  documentLayouts?: DocumentLayout[];
}

export interface DocumentLayout {
  id: string;
  name: string;
  headerTemplate: string;
  footerTemplate: string;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  fontSize: number;
  fontFamily: string;
  isDefault: boolean;
  isActive: boolean;
  companyProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyProfileDto {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  nameEn?: string | null;
  addressEn?: string | null;
  website?: string | null;
  taxNumber?: string | null;
  commercialRegister?: string | null;
  logo?: string | null;
  description?: string | null;
}

export interface CreateDocumentLayoutDto {
  name: string;
  headerTemplate: string;
  footerTemplate: string;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  fontSize: number;
  fontFamily: string;
  companyProfileId: string;
  isDefault?: boolean;
}

class ProfileApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول مرة أخرى.');
    }

    console.log('🔑 Making API request to:', `${API_BASE}${endpoint}`);
    console.log('🔑 Token present:', !!token);
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📦 API Response:', result);
    
    // Handle wrapped response format {success: true, data: ...}
    if (result.success && result.data !== undefined) {
      return result.data;
    }
    
    // Fallback to direct response
    return result;
  }

  // Company Profile API methods
  async getCompanyProfile(): Promise<CompanyProfile> {
    return this.request('/api/profile/company');
  }

  async createCompanyProfile(data: CreateCompanyProfileDto): Promise<CompanyProfile> {
    return this.request('/api/profile/company', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompanyProfile(id: string, data: Partial<CreateCompanyProfileDto>): Promise<CompanyProfile> {
    return this.request(`/api/profile/company/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompanyProfile(id: string): Promise<void> {
    return this.request(`/api/profile/company/${id}`, {
      method: 'DELETE',
    });
  }

  // Document Layout API methods
  async getDocumentLayouts(): Promise<DocumentLayout[]> {
    return this.request('/api/profile/layouts');
  }

  async createDocumentLayout(data: CreateDocumentLayoutDto): Promise<DocumentLayout> {
    return this.request('/api/profile/layouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDocumentLayout(id: string, data: Partial<CreateDocumentLayoutDto>): Promise<DocumentLayout> {
    return this.request(`/api/profile/layouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocumentLayout(id: string): Promise<void> {
    return this.request(`/api/profile/layouts/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultLayout(id: string): Promise<DocumentLayout> {
    return this.request(`/api/profile/layouts/${id}/set-default`, {
      method: 'POST',
    });
  }
}

export const profileApi = new ProfileApiService();

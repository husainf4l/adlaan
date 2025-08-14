const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CompanyProfile {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  phone: string;
  address: string;
  addressEn?: string;
  website?: string;
  taxNumber?: string;
  commercialRegister?: string;
  logo?: string;
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
  email: string;
  phone: string;
  address: string;
  nameEn?: string;
  addressEn?: string;
  website?: string;
  taxNumber?: string;
  commercialRegister?: string;
  logo?: string;
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
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
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

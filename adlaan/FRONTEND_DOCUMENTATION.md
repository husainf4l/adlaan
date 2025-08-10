# Adlaan Backend API - Frontend Integration Guide

## 🚀 Server Information
- **Base URL**: `http://localhost:4007`
- **Platform**: Fastify (High Performance)
- **API Documentation**: `http://localhost:4007/api-docs`
- **Authentication**: JWT tokens via HTTP-only cookies

## 📋 Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Company Management](#company-management)
3. [Subscription Management](#subscription-management)
4. [Error Handling](#error-handling)
5. [Request/Response Examples](#request-response-examples)
6. [Frontend Integration Patterns](#frontend-integration-patterns)

---

## 🔐 Authentication Endpoints

### 1. User Registration
**Endpoint**: `POST /auth/register`

**Request Body**:
```typescript
interface RegisterRequest {
  email: string;           // Required: Valid email address
  name: string;            // Required: Min 2 characters
  password: string;        // Required: Min 8 characters
  phoneNumber?: string;    // Optional: Valid phone number (international format)
  twoFactorEnabled?: boolean; // Optional: Enable 2FA (default: false)
}
```

**Response**:
```typescript
interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber: string | null;
    twoFactorEnabled: boolean;
    companyId: string | null;
    company: Company | null;
  };
  // If 2FA enabled and phone provided:
  requiresEmailVerification?: boolean;
  otpSent?: boolean;
  otpCode?: string; // Only in development mode
}
```

**Example Request**:
```javascript
// Registration without 2FA
const registerUser = async (userData) => {
  const response = await fetch('http://localhost:4007/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: Include cookies
    body: JSON.stringify({
      email: 'user@example.com',
      name: 'John Doe',
      password: 'securePassword123'
    })
  });
  
  return await response.json();
};

// Registration with 2FA enabled
const registerSecureUser = async (userData) => {
  const response = await fetch('http://localhost:4007/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email: 'secure@example.com',
      name: 'Jane Doe',
      password: 'securePassword123',
      phoneNumber: '+1234567890',
      twoFactorEnabled: true
    })
  });
  
  return await response.json();
};
```

### 2. User Login
**Endpoint**: `POST /auth/login`

**Request Body**:
```typescript
interface LoginRequest {
  email: string;    // Required: User's email
  password: string; // Required: User's password
}
```

**Response**:
```typescript
interface LoginResponse {
  // If 2FA disabled or no phone number:
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber: string | null;
    twoFactorEnabled: boolean;
    company: Company | null;
    requiresOtp: false;
  };
  
  // If 2FA enabled:
  id: string;
  email: string;
  name: string;
  requiresOtp: true;
  message: string;
  phoneNumber: string;
  otpSent: boolean;
  otpCode?: string; // Only in development mode
}
```

**Example Request**:
```javascript
const loginUser = async (credentials) => {
  const response = await fetch('http://localhost:4007/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: Include cookies for JWT
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'securePassword123'
    })
  });
  
  const data = await response.json();
  
  if (data.requiresOtp) {
    // Redirect to OTP verification page
    return { needsOtp: true, data };
  } else {
    // User is logged in, redirect to dashboard
    return { needsOtp: false, data };
  }
};
```

### 3. OTP Verification
**Endpoint**: `POST /auth/verify-otp`

**Request Body**:
```typescript
interface OtpVerificationRequest {
  phoneNumber: string;  // User's phone number
  code: string;         // 6-digit OTP code
  type: 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION' | 'PASSWORD_RESET';
}
```

**Response**:
```typescript
interface OtpVerificationResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    companyId: string | null;
    company: Company | null;
  };
}
```

**Example Request**:
```javascript
const verifyOtp = async (otpData) => {
  const response = await fetch('http://localhost:4007/auth/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      phoneNumber: '+1234567890',
      code: '123456',
      type: 'LOGIN_VERIFICATION'
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    // User is now fully authenticated
    // Redirect to dashboard
    return data;
  } else {
    // Handle OTP verification error
    const error = await response.json();
    throw new Error(error.message);
  }
};
```

### 4. User Profile
**Endpoint**: `GET /auth/profile`
**Authentication**: Required (JWT cookie)

**Response**:
```typescript
interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  phoneNumber: string | null;
  twoFactorEnabled: boolean;
  companyId: string | null;
  company: Company | null;
}
```

**Example Request**:
```javascript
const getUserProfile = async () => {
  const response = await fetch('http://localhost:4007/auth/profile', {
    method: 'GET',
    credentials: 'include', // Include JWT cookie
  });
  
  if (response.ok) {
    return await response.json();
  } else if (response.status === 401) {
    // User not authenticated, redirect to login
    window.location.href = '/login';
  }
};
```

### 5. Logout
**Endpoint**: `POST /auth/logout`
**Authentication**: Required (JWT cookie)

**Example Request**:
```javascript
const logoutUser = async () => {
  const response = await fetch('http://localhost:4007/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  
  if (response.ok) {
    // Clear any client-side state
    // Redirect to login page
    window.location.href = '/login';
  }
};
```

---

## 🏢 Company Management

### 1. Create Company
**Endpoint**: `POST /company`
**Authentication**: Required

**Request Body**:
```typescript
interface CreateCompanyRequest {
  name: string;        // Required: Company name
  description?: string; // Optional: Company description
  email?: string;      // Optional: Company email
  phone?: string;      // Optional: Company phone
  address?: string;    // Optional: Company address
  website?: string;    // Optional: Company website
}
```

### 2. Get Company Details
**Endpoint**: `GET /company/:id`
**Authentication**: Required

### 3. Update Company
**Endpoint**: `PUT /company/:id`
**Authentication**: Required (Owner only)

### 4. Delete Company
**Endpoint**: `DELETE /company/:id`
**Authentication**: Required (Owner only)

---

## 💳 Subscription Management

### 1. Get Subscription Plans
**Endpoint**: `GET /subscription/plans`
**Authentication**: Not required

**Response**:
```typescript
interface SubscriptionPlan {
  id: string;
  name: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
  maxUsers: number;
  maxProjects: number;
  maxStorage: number; // in MB
}
```

### 2. Subscribe to Plan
**Endpoint**: `POST /subscription/subscribe`
**Authentication**: Required

**Request Body**:
```typescript
interface SubscribeRequest {
  planId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  paymentMethodId?: string; // Stripe payment method ID
}
```

---

## ⚠️ Error Handling

### Common Error Response Format
```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (Validation errors)
- **401**: Unauthorized (Authentication required)
- **403**: Forbidden (Insufficient permissions)
- **404**: Not Found
- **409**: Conflict (Resource already exists)
- **500**: Internal Server Error

### Example Error Handling
```javascript
const handleApiError = (error) => {
  switch (error.statusCode) {
    case 400:
      // Validation errors
      if (Array.isArray(error.message)) {
        return error.message.join(', ');
      }
      return error.message;
    
    case 401:
      // Redirect to login
      window.location.href = '/login';
      break;
    
    case 403:
      return 'You do not have permission to perform this action';
    
    case 404:
      return 'Resource not found';
    
    default:
      return 'An unexpected error occurred';
  }
};
```

---

## 🎨 Frontend Integration Patterns

### 1. Authentication State Management (React)
```javascript
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:4007/auth/profile', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await fetch('http://localhost:4007/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (response.ok && !data.requiresOtp) {
      setUser(data.user);
      return { success: true, user: data.user };
    }
    
    return { success: response.ok, data };
  };

  const logout = async () => {
    await fetch('http://localhost:4007/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### 2. API Service Class
```javascript
class ApiService {
  constructor(baseURL = 'http://localhost:4007') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        statusCode: response.status,
        ...data,
      };
    }

    return data;
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async verifyOtp(otpData) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: otpData,
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Company methods
  async createCompany(companyData) {
    return this.request('/company', {
      method: 'POST',
      body: companyData,
    });
  }

  async getCompany(id) {
    return this.request(`/company/${id}`);
  }
}

export const apiService = new ApiService();
```

### 3. Two-Factor Authentication Flow (React)
```javascript
import { useState } from 'react';
import { useAuth } from './AuthContext';

const LoginForm = () => {
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [loginData, setLoginData] = useState(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const result = await login(credentials);
      
      if (result.success && !result.data.requiresOtp) {
        // Login successful, redirect to dashboard
        window.location.href = '/dashboard';
      } else if (result.data.requiresOtp) {
        // Show OTP verification form
        setLoginData(result.data);
        setStep('otp');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    
    try {
      await apiService.verifyOtp({
        phoneNumber: loginData.phoneNumber,
        code: otpCode,
        type: 'LOGIN_VERIFICATION'
      });
      
      // Verification successful, redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('OTP verification failed:', error);
    }
  };

  if (step === 'otp') {
    return (
      <form onSubmit={handleOtpVerification}>
        <h2>Enter Verification Code</h2>
        <p>We sent a code to {loginData.phoneNumber}</p>
        <input
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          placeholder="Enter 6-digit code"
          maxLength={6}
          required
        />
        <button type="submit">Verify</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

---

## 🔧 Development Notes

### Environment Variables
```bash
# Frontend environment variables
REACT_APP_API_URL=http://localhost:4007
REACT_APP_ENV=development
```

### CORS Configuration
The backend is configured to accept requests from `http://localhost:3000` by default. Update the `FRONTEND_URL` environment variable if your frontend runs on a different port.

### Cookie Handling
- JWT tokens are stored in HTTP-only cookies for security
- Always include `credentials: 'include'` in fetch requests
- Cookies are automatically handled by the browser

### Development vs Production
- In development mode, OTP codes might be included in API responses
- Remove sensitive data from responses in production
- Use HTTPS in production for secure cookie transmission

---

## 📞 Support

For questions or issues with the API integration:
- Check the interactive API documentation at `http://localhost:4007/api-docs`
- Review error responses for detailed validation messages
- Ensure proper CORS and cookie handling in your frontend application

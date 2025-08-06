# Adlaan API Quick Reference

## 🚀 Quick Start

### Base Configuration

```javascript
const API_BASE = 'http://localhost:4007';
const defaultOptions = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};
```

## 🔐 Authentication Quick Reference

### Simple Login (No 2FA)

```javascript
const simpleLogin = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    ...defaultOptions,
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  return data.requiresOtp ? 'NEEDS_OTP' : 'SUCCESS';
};
```

### Registration with 2FA

```javascript
const registerWithTwoFactor = async (userData) => {
  return fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    ...defaultOptions,
    body: JSON.stringify({
      ...userData,
      twoFactorEnabled: true, // Enable 2FA
    }),
  });
};
```

### OTP Verification

```javascript
const verifyLoginOTP = async (phoneNumber, code) => {
  return fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    ...defaultOptions,
    body: JSON.stringify({
      phoneNumber,
      code,
      type: 'LOGIN_VERIFICATION',
    }),
  });
};
```

## 📊 Response Patterns

### Success Response

```javascript
{
  "message": "Operation successful",
  "user": { /* user data */ }
}
```

### 2FA Required Response

```javascript
{
  "requiresOtp": true,
  "phoneNumber": "+1234567890",
  "message": "OTP sent to your phone"
}
```

### Error Response

```javascript
{
  "statusCode": 400,
  "message": ["Email is required", "Password must be 8+ characters"],
  "error": "Bad Request"
}
```

## 🎯 Common Use Cases

### 1. User Registration Flow

```javascript
// Step 1: Register user
const registerUser = async (formData) => {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      ...defaultOptions,
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.requiresEmailVerification) {
      // Show OTP input form
      return { step: 'verify-otp', data };
    } else {
      // Registration complete, user logged in
      return { step: 'complete', data };
    }
  } catch (error) {
    return { step: 'error', error };
  }
};
```

### 2. Login Flow with 2FA

```javascript
const loginFlow = async (email, password) => {
  // Step 1: Login attempt
  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    ...defaultOptions,
    body: JSON.stringify({ email, password }),
  });

  const loginData = await loginResponse.json();

  if (loginData.requiresOtp) {
    // Step 2: Show OTP form
    return {
      needsOtp: true,
      phoneNumber: loginData.phoneNumber,
    };
  } else {
    // Login complete
    return {
      needsOtp: false,
      user: loginData.user,
    };
  }
};
```

### 3. Protected Route Check

```javascript
const checkAuth = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Not authenticated');
    }
  } catch (error) {
    // Redirect to login
    window.location.href = '/login';
    return null;
  }
};
```

## 🔧 React Hooks

### useAuth Hook

```javascript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        credentials: 'include',
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
    // Implementation here
  };

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return { user, login, logout, loading, isAuthenticated: !!user };
};
```

### useApi Hook

```javascript
import { useState } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...defaultOptions,
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
};
```

## 🛡️ Security Best Practices

### 1. Always Use Credentials

```javascript
// ✅ Correct
fetch('/api/endpoint', { credentials: 'include' });

// ❌ Wrong
fetch('/api/endpoint'); // Cookies won't be sent
```

### 2. Handle Authentication Errors

```javascript
const apiCall = async () => {
  try {
    const response = await fetch('/api/protected-endpoint', {
      credentials: 'include',
    });

    if (response.status === 401) {
      // Clear local state and redirect
      localStorage.clear();
      window.location.href = '/login';
      return;
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
  }
};
```

### 3. Validate User Input

```javascript
const validateRegistration = (formData) => {
  const errors = [];

  if (!formData.email?.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!formData.password || formData.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (formData.twoFactorEnabled && !formData.phoneNumber) {
    errors.push('Phone number is required for 2FA');
  }

  return errors;
};
```

## 📱 Mobile/React Native Considerations

### Fetch Configuration

```javascript
// For React Native
const mobileApiCall = async (endpoint, options = {}) => {
  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Still needed
    headers: {
      'Content-Type': 'application/json',
      // Add any mobile-specific headers
      ...options.headers,
    },
  });
};
```

## 🔍 Debugging Tips

### 1. Check Network Tab

- Verify cookies are being sent
- Check response headers
- Inspect request/response bodies

### 2. Common Issues

```javascript
// Issue: Cookies not being sent
// Solution: Add credentials: 'include'

// Issue: CORS errors
// Solution: Check FRONTEND_URL environment variable

// Issue: 401 errors on protected routes
// Solution: Verify JWT cookie exists and is valid
```

### 3. Error Logging

```javascript
const logApiError = (error, context) => {
  console.error(`API Error in ${context}:`, {
    status: error.statusCode,
    message: error.message,
    timestamp: new Date().toISOString(),
  });
};
```

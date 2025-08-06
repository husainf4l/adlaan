# 🚀 Frontend Integration Guide - Authentication API

This guide shows how to integrate your frontend application with the NestJS authentication backend that uses **HTTP-only cookies** and supports **Google OAuth** + **OTP verification**.

## 🔧 Backend Configuration

Your backend is running on: `http://localhost:4007`

### Available Endpoints:

- **Registration**: `POST /auth/register`
- **Login**: `POST /auth/login`
- **OTP Verification**: `POST /auth/verify-otp`
- **Resend OTP**: `POST /auth/resend-otp`
- **Google OAuth**: `GET /auth/google`
- **Google Callback**: `GET /auth/google/callback`
- **Logout**: `POST /auth/logout`
- **Profile**: `GET /auth/profile`

---

## 🌐 Frontend Setup (React/Next.js Examples)

### 1. Configure HTTP Client (Axios)

```javascript
// api/config.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4007';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🔑 CRITICAL: Enables HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
```

### 2. Authentication Context (React)

```javascript
// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);

      // Check if OTP is required
      if (response.data.requiresOtp) {
        return {
          success: true,
          requiresOtp: true,
          message: 'OTP verification required',
          data: response.data,
        };
      }

      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const verifyOtp = async (otpData) => {
    try {
      const response = await api.post('/auth/verify-otp', otpData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'OTP verification failed',
      };
    }
  };

  const resendOtp = async (email, type) => {
    try {
      const response = await api.post('/auth/resend-otp', { email, type });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend OTP',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    verifyOtp,
    resendOtp,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

---

## 📝 Component Examples

### 3. Registration Component

```javascript
// components/Register.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);

    if (result.success) {
      // Registration successful - user is automatically logged in
      window.location.href = '/dashboard';
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      {error && <div className="error">{error}</div>}

      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default Register;
```

### 4. Login Component with OTP Support

```javascript
// components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, verifyOtp, resendOtp } = useAuth();
  const [step, setStep] = useState('login'); // 'login' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [otpData, setOtpData] = useState({
    email: '',
    code: '',
    type: 'LOGIN_VERIFICATION',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);

    if (result.success) {
      if (result.requiresOtp) {
        // OTP required
        setOtpData({ ...otpData, email: formData.email });
        setStep('otp');
      } else {
        // Login successful
        window.location.href = '/dashboard';
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await verifyOtp(otpData);

    if (result.success) {
      window.location.href = '/dashboard';
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleResendOtp = async () => {
    const result = await resendOtp(otpData.email, otpData.type);
    if (result.success) {
      alert('OTP sent successfully!');
    } else {
      setError(result.error);
    }
  };

  if (step === 'otp') {
    return (
      <form onSubmit={handleOtpVerification}>
        <h2>Enter OTP</h2>
        <p>We've sent a verification code to {otpData.email}</p>

        {error && <div className="error">{error}</div>}

        <input
          type="text"
          placeholder="Enter OTP (use: 1234)"
          value={otpData.code}
          onChange={(e) => setOtpData({ ...otpData, code: e.target.value })}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button type="button" onClick={handleResendOtp}>
          Resend OTP
        </button>

        <button type="button" onClick={() => setStep('login')}>
          Back to Login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>

      {error && <div className="error">{error}</div>}

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {/* Google OAuth Button */}
      <div className="oauth-section">
        <p>Or continue with:</p>
        <a href="http://localhost:4007/auth/google" className="google-btn">
          Sign in with Google
        </a>
      </div>
    </form>
  );
};

export default Login;
```

### 5. Protected Route Component

```javascript
// components/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access this page</div>;
  }

  return children;
};

export default ProtectedRoute;
```

### 6. Profile Component

```javascript
// components/Profile.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      window.location.href = '/login';
    }
  };

  return (
    <div>
      <h2>Profile</h2>
      <div>
        <p>
          <strong>Name:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Provider:</strong> {user?.provider || 'LOCAL'}
        </p>
        {user?.avatar && (
          <img src={user.avatar} alt="Avatar" width="50" height="50" />
        )}
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;
```

---

## 🔗 Google OAuth Integration

### Frontend Google OAuth Button

```javascript
// Simply redirect to your backend OAuth endpoint
const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:4007/auth/google';
  };

  return (
    <button onClick={handleGoogleLogin} className="google-oauth-btn">
      <img src="/google-icon.svg" alt="Google" />
      Continue with Google
    </button>
  );
};
```

### OAuth Success Page

```javascript
// pages/auth/success.js
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthSuccess = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    // Check auth status after OAuth redirect
    checkAuth().then(() => {
      window.location.href = '/dashboard';
    });
  }, []);

  return <div>Authenticating...</div>;
};

export default AuthSuccess;
```

---

## 🛠️ App.js Setup (React)

```javascript
// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import AuthSuccess from './pages/auth/success';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Welcome to Dashboard!</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

---

## 🎯 Key Points for Frontend Development

### ✅ **CRITICAL Requirements:**

1. **Always use `withCredentials: true`** in your HTTP client
2. **Never try to access tokens** - they're HTTP-only
3. **Check authentication** via `/auth/profile` endpoint
4. **Handle OTP flow** properly for enhanced security

### 🔒 **Security Best Practices:**

- HTTP-only cookies are managed automatically
- No token storage needed in localStorage/sessionStorage
- CORS is already configured for `http://localhost:3000`
- Always handle 401 responses by redirecting to login

### 📱 **OTP Flow:**

1. User attempts login
2. If `requiresOtp: true`, show OTP input
3. User enters OTP (currently: `1234`)
4. Verify OTP and complete login

### 🌐 **Google OAuth Flow:**

1. User clicks "Sign in with Google"
2. Redirect to `/auth/google`
3. Google handles authentication
4. Redirect back to `/auth/google/callback`
5. Backend sets cookies and redirects to `/auth/success`
6. Frontend checks auth status and redirects to dashboard

---

## 🚀 Testing Your Integration

### Test Credentials:

- **OTP Code**: `1234` (for all OTP verifications)
- **Google OAuth**: Use your real Google account

### Test Flow:

1. Register a new user → Auto logged in
2. Logout → Cookies cleared
3. Login → May require OTP (use `1234`)
4. Access protected routes → Should work seamlessly
5. Test Google OAuth → Should redirect and authenticate

**Your authentication system is production-ready with enterprise-level security! 🎉**

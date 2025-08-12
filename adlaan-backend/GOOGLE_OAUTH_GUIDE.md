# Google OAuth Integration Guide

## 🚀 Complete Google OAuth Setup for Adlaan Backend

### Backend Configuration ✅

Your backend is already configured with Google OAuth! Here's what's set up:

#### Environment Variables (Already in .env)

```bash
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4007/auth/google/callback"
```

#### Available Endpoints

| Method | Endpoint                | Description                             |
| ------ | ----------------------- | --------------------------------------- |
| `GET`  | `/auth/google`          | Initiate Google OAuth (redirect method) |
| `GET`  | `/auth/google/callback` | Handle OAuth callback                   |
| `POST` | `/auth/google/token`    | Verify Google ID token (modern method)  |

---

## 🎯 Frontend Integration Options

### Option 1: Direct Redirect (Simple)

Perfect for traditional web applications:

```javascript
const loginWithGoogle = () => {
  window.location.href = 'http://localhost:4007/auth/google';
};
```

### Option 2: Google Identity Services (Recommended)

Modern approach with better UX:

#### HTML Setup

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
  </head>
  <body>
    <div id="google-signin-button"></div>
  </body>
</html>
```

#### JavaScript Implementation

```javascript
// Initialize Google Sign-In
function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: 'your-google-client-id.apps.googleusercontent.com',
    callback: handleGoogleSignIn,
  });

  google.accounts.id.renderButton(
    document.getElementById('google-signin-button'),
    {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      width: 300,
    },
  );
}

// Handle Google Sign-In
async function handleGoogleSignIn(response) {
  try {
    const result = await fetch('http://localhost:4007/auth/google/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential }),
    });

    if (result.ok) {
      const userData = await result.json();
      console.log('Login successful:', userData);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Google Sign-In failed:', error);
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeGoogleSignIn);
```

---

## ⚛️ React Integration

```jsx
import { useEffect, useState } from 'react';

const GoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: 'your-google-client-id.apps.googleusercontent.com',
        callback: handleGoogleSignIn,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: 300,
        },
      );
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleSignIn = async (response) => {
    setIsLoading(true);
    try {
      const result = await fetch('http://localhost:4007/auth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: response.credential }),
      });

      if (result.ok) {
        const userData = await result.json();
        console.log('Login successful:', userData);
        // Update your auth context/state
        // Redirect to dashboard
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div id="google-signin-button" />
      {isLoading && <p>Signing in...</p>}
    </div>
  );
};
```

---

## 🅰️ Angular Integration

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-google-signin',
  template: `
    <div id="google-signin-button"></div>
    <div *ngIf="isLoading">Signing in...</div>
  `,
})
export class GoogleSigninComponent implements OnInit {
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadGoogleScript();
  }

  loadGoogleScript() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      (window as any).google.accounts.id.initialize({
        client_id: 'your-google-client-id.apps.googleusercontent.com',
        callback: this.handleGoogleSignIn.bind(this),
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: 300,
        },
      );
    };
  }

  async handleGoogleSignIn(response: any) {
    this.isLoading = true;
    try {
      const result = await this.http
        .post(
          'http://localhost:4007/auth/google/token',
          {
            credential: response.credential,
          },
          { withCredentials: true },
        )
        .toPromise();

      console.log('Login successful:', result);
      // Handle successful login
    } catch (error) {
      console.error('Google Sign-In failed:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
```

---

## 🧪 Testing

### Test File

Open `google-oauth-test.html` in your browser to test both methods:

1. Direct redirect method
2. Google Identity Services method

### Test Steps

1. Open the test file in your browser
2. Click "Sign in with Google" (either method)
3. Complete Google authentication
4. Check the response and user data
5. Test profile endpoint
6. Test logout

---

## 🔧 Features

### Automatic User Creation

- New Google users are automatically created in your database
- Welcome emails are sent to new users
- User data includes Google profile information

### Security

- JWT tokens stored in HTTP-only cookies
- Google ID token verification
- Proper CORS configuration

### User Data

When users sign in with Google, they get:

- Automatic account creation
- Profile information from Google
- Welcome email
- JWT authentication cookies
- Company association (if applicable)

---

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend URL is in the CORS configuration
2. **Invalid Client ID**: Check Google Console configuration
3. **Callback URL Mismatch**: Verify Google Console settings
4. **Missing Cookies**: Ensure `credentials: 'include'` in fetch requests

### Debug Steps

1. Check browser console for errors
2. Verify network requests in DevTools
3. Check backend logs for authentication errors
4. Test with the provided HTML test file

---

## 📝 Notes

- Google OAuth is fully configured and ready to use
- Both redirect and token-based authentication are supported
- Welcome emails are automatically sent to new users
- All authentication uses secure HTTP-only cookies
- The system supports both web and mobile app integration patterns

Your Google OAuth integration is complete and ready for production! 🎉

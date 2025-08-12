# Server-Side Google OAuth Setup Guide

## 🎯 New Server-Side Implementation

We've switched from client-side Google Sign-In to **server-side OAuth** which is more secure and eliminates FedCM issues.

## 📋 Google Cloud Console Setup

### 1. Go to Google Cloud Console

Visit: https://console.cloud.google.com/apis/credentials

### 2. Find Your OAuth Client

Look for: `535659420325-0modn8rtl2g7068qnpb8kt5ithk9i148.apps.googleusercontent.com`

### 3. Configure Authorized Redirect URIs

Click **EDIT** → Under **"Authorized redirect URIs"** add:

```
http://localhost:3000/api/auth/google/callback
```

### 4. Configure Authorized JavaScript Origins (Optional)

Under **"Authorized JavaScript origins"** add:

```
http://localhost:3000
```

### 5. Save Changes

Click **SAVE** - changes take effect immediately for server-side OAuth

## 🔄 How It Works Now

### Old (Client-Side):

- JavaScript SDK in browser
- FedCM issues
- Domain authorization problems

### New (Server-Side):

1. User clicks "Sign in with Google"
2. Redirects to `/api/auth/google`
3. Server redirects to Google OAuth
4. Google redirects back to `/api/auth/google/callback`
5. Server exchanges code for tokens
6. Server gets user info from Google
7. User authenticated and redirected to dashboard

## 🛠️ Files Created/Updated

### API Routes:

- `/src/app/api/auth/google/route.ts` - Initiates OAuth flow
- `/src/app/api/auth/google/callback/route.ts` - Handles OAuth callback

### Environment:

- Added `NEXTAUTH_URL=http://localhost:3000` to `.env.local`

### Frontend:

- Updated login page to use server-side redirect
- Removed client-side Google SDK dependency

## ✅ Benefits of Server-Side OAuth

1. **No FedCM Issues** - Runs on server, not browser
2. **Better Security** - Client secret stays on server
3. **Simpler Setup** - Just redirect URIs needed
4. **More Reliable** - No browser compatibility issues
5. **Production Ready** - Industry standard approach

## 🚀 Testing

1. Go to: http://localhost:3000/login
2. Click "Sign in with Google"
3. Should redirect to Google OAuth page
4. After authentication, redirects back to your app

## 🔧 Next Steps

After testing the OAuth flow, you'll want to:

1. Integrate with your user database
2. Implement proper session management
3. Add JWT tokens or secure cookies
4. Handle user registration/login logic

## 🎉 No More Client-Side Issues!

This approach eliminates all the FedCM, domain authorization, and browser compatibility issues you were experiencing.

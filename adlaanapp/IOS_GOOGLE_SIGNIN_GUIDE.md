# iOS Google Sign-In Integration with HTTP-Only Backend Authentication

## Overview

This document explains the iOS Google Sign-In implementation for the Adlaan app that sends Google ID tokens to the backend for HTTP-only cookie authentication.

## Flow Architecture

### 1. Client-Side Google Sign-In (iOS)

```
User taps "Continue with Google"
   ↓
Google Sign-In SDK handles authentication
   ↓
Returns Google ID Token and Access Token
   ↓
App extracts ID Token for backend verification
```

### 2. Backend Token Exchange

```
POST /auth/google/ios/token
Content-Type: application/json

{
  "token": "google_id_token_from_ios",
  "clientId": "535659420325-dhlhc6edvd5lohb7r4lqk65legi28uef.apps.googleusercontent.com"
}

Backend Response:
- Verifies Google ID token
- Creates user session
- Sets HTTP-only cookies
- Returns user profile

Response Cookies:
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
Set-Cookie: csrf-token=xyz789; HttpOnly; Secure; SameSite=Strict
```

### 3. Profile Access

```
GET /auth/profile
Cookie: session=abc123; csrf-token=xyz789

Response:
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "avatar_url"
  }
}
```

## Implementation Details

### Client Configuration

#### GoogleService-Info.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CLIENT_ID</key>
	<string>535659420325-dhlhc6edvd5lohb7r4lqk65legi28uef.apps.googleusercontent.com</string>
	<key>REVERSED_CLIENT_ID</key>
	<string>com.googleusercontent.apps.535659420325-dhlhc6edvd5lohb7r4lqk65legi28uef</string>
	<key>BUNDLE_ID</key>
	<string>com.adlaan.adlaanapp</string>
</dict>
</plist>
```

#### Flutter Dependencies

```yaml
dependencies:
  google_sign_in: ^6.2.1
  dio: ^5.4.0
  dio_cookie_manager: ^3.1.1
  cookie_jar: ^4.0.8
```

### Code Implementation

#### GoogleTokenRequest Model

```dart
@JsonSerializable()
class GoogleTokenRequest {
  final String token;        // Google ID Token
  final String? clientId;    // Optional client ID override

  const GoogleTokenRequest({
    required this.token,
    this.clientId,
  });
}
```

#### HTTP Service with Cookie Support

```dart
class HttpService {
  late CookieJar _cookieJar;

  void _initializeDio() {
    _cookieJar = CookieJar();
    _dio.interceptors.add(CookieManager(_cookieJar));
  }

  void clearCookies() {
    _cookieJar.deleteAll();
  }
}
```

#### Auth Repository

```dart
Future<GoogleAuthResponse> googleSignIn(GoogleTokenRequest request) async {
  String endpoint = AppConstants.googleAuthEndpoint;
  if (Platform.isIOS) {
    endpoint = AppConstants.googleAuthiOSEndpoint; // /auth/google/ios/token
  }

  final response = await _httpService.post(endpoint, data: request.toJson());

  // Backend sets HTTP-only cookies automatically
  // No token storage needed on client side

  return GoogleAuthResponse.fromJson(response.data);
}
```

## Security Benefits

### HTTP-Only Cookies

1. **XSS Protection**: Cookies are not accessible via JavaScript
2. **CSRF Protection**: SameSite=Strict prevents cross-site requests
3. **Secure Transport**: Cookies only sent over HTTPS
4. **Automatic Management**: Browser handles cookie storage and transmission

### Backend Verification

1. **Google Token Validation**: Server verifies ID token with Google
2. **Client ID Verification**: Ensures token was issued for our app
3. **Expiration Checking**: Validates token timestamp
4. **User Mapping**: Creates or updates user profile

## API Endpoints

### iOS Google Sign-In

- **URL**: `POST /auth/google/ios/token`
- **Content-Type**: `application/json`
- **Body**: `{ "token": "google_id_token", "clientId": "optional_client_id" }`
- **Response**: User profile + HTTP-only cookies

### Profile Access

- **URL**: `GET /auth/profile`
- **Authentication**: HTTP-only cookies
- **Response**: Current user profile

### Logout

- **URL**: `POST /auth/logout`
- **Effect**: Clears server session and cookies

## Testing

### Development Testing

```bash
# Test Google Sign-In flow
flutter run --debug

# Check logs for:
# 🔐 Starting Google Sign-In...
# 🆔 ID Token: eyJhbGciOiJSUzI1...
# 📤 REQUEST: POST /auth/google/ios/token
# 🍪 Cookies set: session=abc123; HttpOnly; Secure
```

### Production Checklist

- [ ] GoogleService-Info.plist configured
- [ ] Bundle ID matches Google Console
- [ ] Backend validates Google tokens
- [ ] HTTPS enabled for cookie security
- [ ] CSRF protection implemented
- [ ] Session timeout configured

## Error Handling

### Client-Side Errors

- User cancellation: Don't show error
- Network failure: Retry mechanism
- Invalid token: Re-authenticate

### Server-Side Errors

- Invalid token: 401 Unauthorized
- Expired token: 401 Unauthorized
- Server error: 500 Internal Server Error

## Future Enhancements

1. **Token Refresh**: Implement silent refresh
2. **Biometric Auth**: Add Face ID/Touch ID
3. **Multi-Account**: Support multiple Google accounts
4. **Offline Mode**: Cache user data locally

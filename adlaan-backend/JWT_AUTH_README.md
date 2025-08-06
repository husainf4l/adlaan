# JWT Authentication with HTTP-Only Cookies - Best Practices Implementation

This NestJS application implements secure JWT authentication using HTTP-only cookies with global protection.

## 🔐 Security Features

- **HTTP-Only Cookies**: JWT tokens are stored in HTTP-only cookies, preventing XSS attacks
- **Global Authentication**: All routes are protected by default unless marked as `@Public()`
- **CSRF Protection**: SameSite cookie policy
- **Secure Cookies**: HTTPS-only in production
- **Password Hashing**: bcryptjs with salt rounds of 12
- **Token Validation**: Automatic user validation on each request

## 🚀 API Endpoints

### Public Endpoints (No Authentication Required)

#### Register User

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

#### Login User

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Home Page

```bash
GET /
```

### Protected Endpoints (Authentication Required)

#### Get User Profile

```bash
GET /auth/profile
```

#### Logout User

```bash
POST /auth/logout
```

## 🛡️ How It Works

### 1. **Registration/Login Flow**

- User submits credentials
- Password is hashed using bcryptjs
- JWT tokens (access + refresh) are generated
- Tokens are set as HTTP-only cookies
- User data (without password) is returned

### 2. **Authentication Flow**

- JWT is automatically extracted from HTTP-only cookies
- Token is validated and user is fetched from database
- User object is attached to the request
- Route access is granted or denied

### 3. **Global Protection**

- `JwtAuthGuard` is applied globally via `APP_GUARD`
- All routes require authentication by default
- Use `@Public()` decorator to mark routes as public

## 📝 Usage Examples

### Frontend Integration (with credentials)

```javascript
// Register
const response = await fetch('http://localhost:4007/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
    name: 'John Doe',
  }),
});

// Login
const loginResponse = await fetch('http://localhost:4007/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
  }),
});

// Access protected route
const profileResponse = await fetch('http://localhost:4007/auth/profile', {
  method: 'GET',
  credentials: 'include', // Important: Include cookies
});

// Logout
const logoutResponse = await fetch('http://localhost:4007/auth/logout', {
  method: 'POST',
  credentials: 'include', // Important: Include cookies
});
```

### Creating Protected Routes

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('protected')
export class ProtectedController {
  // This route is automatically protected
  @Get('data')
  getProtectedData(@Request() req) {
    return {
      message: 'This is protected data',
      user: req.user,
    };
  }
}
```

### Creating Public Routes

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Controller('public')
export class PublicController {
  @Public() // Mark as public to bypass authentication
  @Get('info')
  getPublicInfo() {
    return {
      message: 'This is public information',
    };
  }
}
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-make-it-long-and-complex"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
NODE_ENV="development"
PORT=4007
FRONTEND_URL="http://localhost:3000"
```

### Cookie Configuration

Cookies are configured with:

- `httpOnly: true` - Prevents JavaScript access
- `secure: true` (production only) - HTTPS only
- `sameSite: 'strict'` - CSRF protection
- `maxAge` - Automatic expiration

## 🧪 Testing with curl

```bash
# Register
curl -X POST http://localhost:4007/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:4007/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Access protected route
curl -X GET http://localhost:4007/auth/profile \
  -b cookies.txt

# Logout
curl -X POST http://localhost:4007/auth/logout \
  -b cookies.txt
```

## 🏗️ Project Structure

```
src/
├── auth/
│   ├── auth.controller.ts      # Authentication endpoints
│   ├── auth.service.ts         # Authentication logic
│   ├── auth.module.ts          # Authentication module
│   ├── jwt.strategy.ts         # JWT extraction and validation
│   ├── jwt-auth.guard.ts       # Global authentication guard
│   ├── jwt.config.ts           # JWT configuration
│   └── public.decorator.ts     # Public route decorator
├── prisma.service.ts           # Database service
├── app.module.ts               # Main application module
└── main.ts                     # Application bootstrap
```

## 🔒 Security Best Practices Implemented

1. **HTTP-Only Cookies**: Prevents XSS token theft
2. **SameSite Policy**: Prevents CSRF attacks
3. **Secure Flag**: HTTPS-only in production
4. **Password Hashing**: Strong bcryptjs hashing
5. **Token Expiration**: Configurable token lifetimes
6. **Global Protection**: Secure by default approach
7. **CORS Configuration**: Proper cross-origin setup
8. **Database Validation**: User existence validation
9. **Error Handling**: Secure error responses
10. **Environment Configuration**: Secure configuration management

## 🚀 Quick Start

1. Install dependencies: `npm install`
2. Set up your database connection in `.env`
3. Run Prisma migrations: `npx prisma migrate dev`
4. Start the application: `npm run start:dev`
5. The API is now available at `http://localhost:4007`

The application now has enterprise-level JWT authentication with HTTP-only cookies and global protection! 🎉

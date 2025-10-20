# JWT Authentication & Role-Based Access Control (RBAC)

## Overview
This application implements JWT-based authentication with role-based access control using three user roles:
- **SUPERADMIN**: Full system access (for your team)
- **ADMIN**: Company management and user administration
- **USER**: Basic access (default role)

## User Roles

### SuperAdmin
- **Access Level**: Complete system access
- **Permissions**:
  - All admin permissions
  - Delete users
  - Delete companies
  - Access all data across all companies
  - Manage all users regardless of company

### Admin
- **Access Level**: Company and user management
- **Permissions**:
  - View all users
  - Create new users
  - Update user information
  - View all companies
  - Create new companies
  - Update company information
  - Cannot delete users or companies

### User
- **Access Level**: Basic authenticated access
- **Permissions**:
  - View their own profile (via `me` query)
  - View companies they have access to
  - Limited data access

## Authentication Flow

### 1. Register a New User
```graphql
mutation {
  register(input: {
    name: "John Doe"
    email: "john@example.com"
    password: "securePassword123"
    role: USER  # Options: USER, ADMIN, SUPERADMIN
    companyId: 1
  }) {
    access_token
    user {
      id
      name
      email
      role
      company {
        id
        name
      }
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "register": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER",
        "company": {
          "id": "1",
          "name": "Acme Corporation"
        }
      }
    }
  }
}
```

### 2. Login
```graphql
mutation {
  login(input: {
    email: "john@example.com"
    password: "securePassword123"
  }) {
    access_token
    user {
      id
      name
      email
      role
      company {
        id
        name
      }
    }
  }
}
```

### 3. Get Current User (Protected Route)
```graphql
query {
  me {
    id
    name
    email
    role
    company {
      id
      name
    }
  }
}
```

**Headers Required:**
```
Authorization: Bearer <your_jwt_token>
```

## Protected Routes

### Authentication Required (All Authenticated Users)

#### Get Current User
```graphql
query {
  me {
    id
    name
    email
    role
  }
}
```

#### View Companies
```graphql
query {
  companies {
    id
    name
    description
  }
}

query {
  company(id: 1) {
    id
    name
    users {
      id
      name
      email
    }
  }
}
```

### Admin & SuperAdmin Only

#### View All Users
```graphql
query {
  users {
    id
    name
    email
    role
    company {
      id
      name
    }
  }
}
```

#### Get User by ID
```graphql
query {
  user(id: 1) {
    id
    name
    email
    role
  }
}
```

#### Create User
```graphql
mutation {
  createUser(input: {
    name: "Jane Smith"
    email: "jane@example.com"
    password: "password123"
    role: USER
    companyId: 1
  }) {
    id
    name
    email
    role
  }
}
```

#### Update User
```graphql
mutation {
  updateUser(
    id: 1
    input: {
      name: "Jane Updated"
      role: ADMIN
    }
  ) {
    id
    name
    role
  }
}
```

#### Create Company
```graphql
mutation {
  createCompany(input: {
    name: "New Company"
    description: "A new company"
    email: "contact@newcompany.com"
  }) {
    id
    name
  }
}
```

#### Update Company
```graphql
mutation {
  updateCompany(
    id: 1
    input: {
      name: "Updated Company Name"
    }
  ) {
    id
    name
  }
}
```

### SuperAdmin Only

#### Delete User
```graphql
mutation {
  deleteUser(id: 1)
}
```

#### Delete Company
```graphql
mutation {
  deleteCompany(id: 1)
}
```

## How to Use JWT Tokens

### In GraphQL Playground

1. Login or register to get your JWT token
2. Click on "HTTP HEADERS" at the bottom of the playground
3. Add the authorization header:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### In Code (JavaScript/TypeScript)

```typescript
const token = 'your_jwt_token_here';

const response = await fetch('http://localhost:3000/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `
      query {
        me {
          id
          name
          email
          role
        }
      }
    `
  })
});

const data = await response.json();
console.log(data);
```

### In cURL

```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"query":"{ me { id name email role } }"}'
```

## JWT Token Details

### Token Payload
```json
{
  "sub": 1,           // User ID
  "email": "john@example.com",
  "name": "John Doe",
  "role": "USER",     // User role
  "iat": 1234567890,  // Issued at
  "exp": 1234654290   // Expires at (7 days from issue)
}
```

### Token Expiration
- Default: 7 days
- Configure in `.env`: `JWT_EXPIRES_IN=7d`

## Security Features

### Password Hashing
- Passwords are hashed using `bcrypt` with salt rounds of 10
- Never stored in plain text
- Compared securely during login

### JWT Secret
- Stored in environment variable `JWT_SECRET`
- **IMPORTANT**: Change the default secret in production!
- Generate a strong secret: `openssl rand -base64 64`

### Role-Based Guards
- `GqlAuthGuard`: Validates JWT token
- `RolesGuard`: Checks user role against required roles
- SuperAdmin bypasses all role checks (has access to everything)

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=adlaan

# Application
NODE_ENV=development
PORT=3000
```

## Creating Your First SuperAdmin

### Method 1: Via Database
```sql
UPDATE "user" 
SET role = 'superadmin' 
WHERE email = 'your-email@example.com';
```

### Method 2: Via GraphQL (if you have admin access)
```graphql
mutation {
  updateUser(
    id: 1
    input: {
      role: SUPERADMIN
    }
  ) {
    id
    name
    role
  }
}
```

### Method 3: Register with SuperAdmin Role
```graphql
mutation {
  register(input: {
    name: "Super Admin"
    email: "admin@yourcompany.com"
    password: "securePassword123"
    role: SUPERADMIN
  }) {
    access_token
    user {
      id
      name
      email
      role
    }
  }
}
```

## Error Handling

### Common Errors

#### 401 Unauthorized
```json
{
  "errors": [{
    "message": "Unauthorized",
    "extensions": {
      "code": "UNAUTHENTICATED"
    }
  }]
}
```
**Solution**: Provide a valid JWT token in the Authorization header

#### 403 Forbidden
```json
{
  "errors": [{
    "message": "Forbidden resource",
    "extensions": {
      "code": "FORBIDDEN"
    }
  }]
}
```
**Solution**: Your role doesn't have permission for this operation

#### Invalid Credentials
```json
{
  "errors": [{
    "message": "Invalid email or password"
  }]
}
```
**Solution**: Check your email and password

## Best Practices

1. **Never Commit Secrets**: Keep JWT_SECRET out of version control
2. **Use HTTPS**: Always use HTTPS in production
3. **Rotate Secrets**: Periodically change JWT secret and invalidate old tokens
4. **Short Expiration**: Consider shorter token expiration for sensitive operations
5. **Refresh Tokens**: Implement refresh token mechanism for better security (future enhancement)
6. **Password Policies**: Enforce strong password requirements
7. **Rate Limiting**: Add rate limiting to prevent brute force attacks (future enhancement)
8. **Audit Logs**: Log all admin and superadmin actions (future enhancement)

## Testing Roles

### Test as Regular User
```graphql
# Register as user
mutation {
  register(input: {
    name: "Test User"
    email: "user@test.com"
    password: "password123"
    role: USER
  }) {
    access_token
    user { role }
  }
}

# Try to access admin route (should fail)
query {
  users {
    id
    name
  }
}
```

### Test as Admin
```graphql
# Register as admin
mutation {
  register(input: {
    name: "Test Admin"
    email: "admin@test.com"
    password: "password123"
    role: ADMIN
  }) {
    access_token
    user { role }
  }
}

# Can view users
query {
  users {
    id
    name
  }
}

# Cannot delete users (should fail)
mutation {
  deleteUser(id: 1)
}
```

### Test as SuperAdmin
```graphql
# Register as superadmin
mutation {
  register(input: {
    name: "Test SuperAdmin"
    email: "superadmin@test.com"
    password: "password123"
    role: SUPERADMIN
  }) {
    access_token
    user { role }
  }
}

# Can do everything
mutation {
  deleteUser(id: 2)
}
```

## Architecture

### File Structure
```
src/
├── auth/
│   ├── decorators/
│   │   ├── current-user.decorator.ts  # Get current user from request
│   │   └── roles.decorator.ts          # Define required roles
│   ├── dto/
│   │   ├── auth-response.dto.ts        # Auth response type
│   │   ├── login.input.ts              # Login input
│   │   └── register.input.ts           # Register input
│   ├── guards/
│   │   ├── gql-auth.guard.ts           # JWT validation
│   │   └── roles.guard.ts              # Role checking
│   ├── strategies/
│   │   └── jwt.strategy.ts             # JWT strategy
│   ├── auth.module.ts
│   ├── auth.resolver.ts
│   └── auth.service.ts
├── user/
│   ├── enums/
│   │   └── user-role.enum.ts           # Role definitions
│   ├── user.entity.ts                  # User with role field
│   ├── user.module.ts
│   ├── user.resolver.ts                # Protected with roles
│   └── user.service.ts
```

## Future Enhancements

1. **Refresh Tokens**: Implement refresh token mechanism
2. **Email Verification**: Verify email addresses before activation
3. **Password Reset**: Implement password reset flow
4. **Two-Factor Authentication**: Add 2FA support
5. **Session Management**: Track active sessions
6. **Audit Logging**: Log all privileged operations
7. **IP Whitelisting**: Restrict superadmin access by IP
8. **Rate Limiting**: Prevent brute force attacks
9. **OAuth Integration**: Support Google/GitHub login
10. **Password Policies**: Enforce complexity requirements

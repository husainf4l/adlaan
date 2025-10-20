# Adlaan Backend API

NestJS GraphQL API with JWT Authentication, Role-Based Access Control (RBAC), and PostgreSQL.

## Features

✅ **GraphQL API** with Apollo Server  
✅ **JWT Authentication** with Passport  
✅ **Role-Based Access Control** (SuperAdmin, Admin, User)  
✅ **PostgreSQL Database** with TypeORM  
✅ **Database Migrations** (no auto-sync)  
✅ **Password Hashing** with bcrypt  
✅ **TypeScript** for type safety  
✅ **Environment Configuration**  

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=adlaan

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

NODE_ENV=development
PORT=3000
```

### 3. Database Setup

⚠️ **Important**: This app uses **migrations** instead of auto-sync.

The database schema is already set up. To apply future changes:

```bash
# Run any pending migrations
npm run migration:run

# Check migration status
npm run migration:show
```

### 4. Run the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3000/api/graphql`

## Documentation

📖 **[GraphQL API Documentation](./GRAPHQL_API.md)**  
📖 **[Authentication & RBAC Guide](./AUTH_RBAC.md)**  
📖 **[Database Migrations Guide](./MIGRATIONS.md)**  

## API Overview

### Public Endpoints
- `register` - Create new user account
- `login` - Authenticate and get JWT token

### Protected Endpoints (Requires Authentication)
- `me` - Get current user profile
- `companies` - View companies
- `company(id)` - Get company by ID

### Admin/SuperAdmin Only
- `users` - List all users
- `createUser` - Create new user
- `updateUser` - Update user info
- `createCompany` - Create company
- `updateCompany` - Update company

### SuperAdmin Only
- `deleteUser` - Delete user
- `deleteCompany` - Delete company

## Example Queries

### Register
```graphql
mutation {
  register(input: {
    name: "John Doe"
    email: "john@example.com"
    password: "securePassword123"
    role: USER
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

### Login
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
    }
  }
}
```

### Get Current User (with JWT token)
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

**Headers:**
```json
{
  "Authorization": "Bearer your_jwt_token_here"
}
```

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **SUPERADMIN** | System administrators | Full access to everything |
| **ADMIN** | Company administrators | Manage users and companies (cannot delete) |
| **USER** | Regular users | View own profile and companies |

## Database Migrations

⚠️ **Auto-sync is DISABLED** - Use migrations for all schema changes

### Making Schema Changes

```bash
# 1. Modify your entity file
# 2. Generate migration
npm run migration:generate -- -n DescriptionOfChange

# 3. Review generated migration in src/migrations/

# 4. Run migration
npm run migration:run

# 5. Commit to git
git add src/migrations/*
git commit -m "migration: description"
```

### Migration Commands

```bash
npm run migration:generate -- -n MigrationName  # Generate from entity changes
npm run migration:create -- -n MigrationName    # Create empty migration
npm run migration:run                            # Apply pending migrations
npm run migration:revert                         # Rollback last migration
npm run migration:show                           # Show migration status
```

See [MIGRATIONS.md](./MIGRATIONS.md) for detailed guide.

## Development

```bash
# Watch mode
npm run start:dev

# Debug mode
npm run start:debug

# Linting
npm run lint

# Format code
npm run format
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Production Deployment

```bash
# 1. Set environment to production
export NODE_ENV=production

# 2. Install dependencies
npm ci

# 3. Run migrations
npm run migration:run

# 4. Build application
npm run build

# 5. Start with PM2
pm2 start dist/main.js --name adlaan-backend

# Or use the start script
npm run start:prod
```

## Security Best Practices

✅ Passwords hashed with bcrypt (10 rounds)  
✅ JWT tokens with configurable expiration  
✅ Role-based access control on all routes  
✅ Unique email constraint  
✅ No auto-sync (migrations only)  
✅ Environment variables for secrets  

⚠️ **Remember to:**
- Change JWT_SECRET in production
- Use HTTPS in production
- Keep dependencies updated
- Backup database before migrations
- Review migrations before running

## Technologies

- **NestJS** - Progressive Node.js framework
- **GraphQL** - Query language for APIs
- **TypeORM** - ORM for TypeScript
- **PostgreSQL** - Relational database
- **Passport** - Authentication middleware
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing

## License

MIT licensed

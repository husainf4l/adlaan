# Database Migrations Guide

## ⚠️ Important: Synchronize is DISABLED

The application **NO LONGER auto-migrates** the database on startup. This is a best practice for production applications.

## Why Migrations Instead of Synchronize?

### Problems with `synchronize: true`:
- ❌ Can drop tables and columns without warning
- ❌ Data loss in production
- ❌ No version control for database changes
- ❌ No rollback capability
- ❌ Race conditions in clustered environments

### Benefits of Migrations:
- ✅ Version controlled database changes
- ✅ Rollback support
- ✅ Safe for production
- ✅ Team collaboration
- ✅ Audit trail of changes
- ✅ Controlled deployment

## Migration Commands

### 1. Generate a Migration (Automatic)
Compares your entities with the database and generates migration:
```bash
npm run migration:generate -- -n AddUserRoleColumn
```

### 2. Create a Migration (Manual)
Creates an empty migration file for custom changes:
```bash
npm run migration:create -- -n CustomMigration
```

### 3. Run Migrations
Apply pending migrations to the database:
```bash
npm run migration:run
```

### 4. Revert Last Migration
Rollback the most recent migration:
```bash
npm run migration:revert
```

### 5. Show Migration Status
See which migrations have been run:
```bash
npm run migration:show
```

## Workflow

### Initial Setup (Already Done ✅)
The database already has:
- User table with role enum
- Company table
- Foreign key relationships
- Unique constraints

### Making Schema Changes

**Step 1**: Modify your entity file
```typescript
// Example: Adding a new field to User entity
@Column({ nullable: true })
phoneNumber?: string;
```

**Step 2**: Generate migration
```bash
npm run migration:generate -- -n AddPhoneNumber
```

**Step 3**: Review the generated migration
Check `src/migrations/` folder for the new file

**Step 4**: Run the migration
```bash
npm run migration:run
```

**Step 5**: Commit migration file to git
```bash
git add src/migrations/*
git commit -m "Add phone number field to users"
```

## Example Migration

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneNumber1234567890123 implements MigrationInterface {
    name = 'AddPhoneNumber1234567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD "phoneNumber" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" 
            DROP COLUMN "phoneNumber"
        `);
    }
}
```

## Current Database Schema

### User Table
```sql
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'user',
  "companyId" INTEGER,
  CONSTRAINT "FK_user_company" FOREIGN KEY ("companyId") 
    REFERENCES "company"("id")
);
```

### Company Table
```sql
CREATE TABLE "company" (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description VARCHAR,
  address VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  website VARCHAR
);
```

### User Role Enum
```sql
CREATE TYPE user_role_enum AS ENUM (
  'superadmin',
  'admin', 
  'user'
);
```

## Production Deployment

### Before Deploying:
1. ✅ Test migrations locally
2. ✅ Backup production database
3. ✅ Review all pending migrations
4. ✅ Plan rollback strategy

### Deployment Steps:
```bash
# 1. Pull latest code
git pull origin master

# 2. Install dependencies
npm install

# 3. Build application
npm run build

# 4. Run migrations
npm run migration:run

# 5. Start application
pm2 restart all
```

### Rollback if Needed:
```bash
# Revert last migration
npm run migration:revert

# Restart application
pm2 restart all
```

## Best Practices

### ✅ DO:
- Always generate migrations for schema changes
- Test migrations locally before production
- Backup database before running migrations
- Review generated SQL before running
- Keep migrations small and focused
- Commit migrations to version control
- Document breaking changes

### ❌ DON'T:
- Never use `synchronize: true` in production
- Don't modify migrations after they've been run
- Don't delete migrations that have been deployed
- Don't run migrations manually with raw SQL (unless emergency)
- Don't skip migrations in the sequence

## Troubleshooting

### Migration Failed
```bash
# Check what went wrong
npm run migration:show

# Revert if needed
npm run migration:revert

# Fix the issue and try again
npm run migration:run
```

### Out of Sync Database
```bash
# Generate migration to sync
npm run migration:generate -- -n SyncDatabase

# Review the migration carefully
cat src/migrations/*SyncDatabase*.ts

# Run if safe
npm run migration:run
```

### Manual Database Fix Required
If you need to manually fix the database (emergency only):

```bash
# Connect to database
PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST} -U ${DB_USERNAME} -d ${DB_DATABASE}

# Make your changes
# Then create a migration to match
npm run migration:create -- -n ManualFix

# Edit the migration to reflect what you did
# Run it (it will likely do nothing, but documents the change)
npm run migration:run
```

## Migration History

All migrations are tracked in the `migrations` table:

```sql
SELECT * FROM migrations ORDER BY timestamp DESC;
```

## Additional Resources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [Database Migration Best Practices](https://www.brunton-spall.co.uk/post/2014/05/06/database-migrations-done-right/)
- [Zero-Downtime Deployments](https://spring.io/blog/2016/05/31/zero-downtime-deployment-with-a-database)

## Quick Reference

```bash
# Common workflow
npm run migration:generate -- -n MigrationName
npm run migration:run
git add src/migrations/*
git commit -m "migration: description"

# Undo last migration  
npm run migration:revert

# See status
npm run migration:show
```

## Notes

- Migrations run automatically in the specified order (by timestamp)
- Each migration runs in a transaction (rollback on error)
- Migration table tracks which migrations have been executed
- Application will NOT start if database is out of sync (good!)

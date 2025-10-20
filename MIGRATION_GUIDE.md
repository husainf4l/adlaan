# Migration Guide: Removing CV Field

## Summary
The `cv` field has been removed from the User entity and all related code.

## Changes Made

### 1. Code Changes
- ✅ Removed `cv` field from `src/user/user.entity.ts`
- ✅ Removed `cv` field from `src/user/create-user.input.ts`

### 2. Migration System Setup
- ✅ Created `src/data-source.ts` for TypeORM CLI
- ✅ Created migration: `1729260000000-RemoveCvColumn.ts`
- ✅ Added migration scripts to `package.json`
- ✅ Updated `app.module.ts` for production-safe configuration

## How to Apply the Changes

### Option 1: Development (Auto-Sync) - CURRENT SETUP
Since you're in development mode, just restart your app:

```bash
pm2 restart 14
# or
npm run start:dev
```

TypeORM will automatically drop the `cv` column because `synchronize: true` is enabled in development.

### Option 2: Production (Manual Migration) - RECOMMENDED
For production or safer database changes:

```bash
# 1. Build the project first
npm run build

# 2. Run the migration
npm run migration:run
```

This will safely drop the `cv` column using the migration file.

## New Migration Commands Available

```bash
# Show migration status
npm run migration:show

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate a new migration based on entity changes
npm run migration:generate -- src/migrations/MigrationName
```

## Database Configuration

### Development Mode (Current)
- `synchronize: true` - Auto-syncs schema changes
- Database changes happen automatically on app restart

### Production Mode
- `synchronize: false` - Manual migrations only
- `migrationsRun: true` - Auto-runs pending migrations on startup
- Safer and more controlled

## Environment Variables

Make sure your `.env` has:
```
NODE_ENV=development  # or 'production'
DB_HOST=149.200.251.12
DB_PORT=5432
DB_USERNAME=husain
DB_PASSWORD=tt55oo77
DB_DATABASE=adlaan
```

## Verification

After restarting or running migration, verify the column is gone:

```sql
-- Connect to your database and run:
\d user  -- PostgreSQL command to describe table
-- OR
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user' AND column_name = 'cv';
-- Should return no rows
```

## Rollback (If Needed)

If you need to restore the `cv` column:

```bash
npm run migration:revert
```

This will re-add the column with nullable string type.

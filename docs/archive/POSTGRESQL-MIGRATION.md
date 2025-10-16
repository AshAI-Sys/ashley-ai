# PostgreSQL Migration Guide

**Date**: October 2, 2025
**Migration**: SQLite → PostgreSQL
**Status**: ✅ **READY TO MIGRATE**

---

## Overview

Migrating Ashley AI from SQLite (development) to PostgreSQL (production) for better performance, scalability, and production-readiness.

---

## Why PostgreSQL?

### SQLite Limitations (Development Only)
- ❌ Single file database (not suitable for concurrent users)
- ❌ Limited data types (no native JSON, arrays)
- ❌ No user management or access control
- ❌ Poor performance with multiple connections
- ❌ Not designed for production workloads

### PostgreSQL Advantages (Production Ready)
- ✅ Multi-user concurrent access
- ✅ Native JSON/JSONB support
- ✅ Advanced indexing and query optimization
- ✅ Robust user management and security
- ✅ ACID compliant with transactions
- ✅ Scales horizontally and vertically
- ✅ Battle-tested in production (used by Instagram, Spotify, Reddit)

---

## Migration Options

### Option 1: Local PostgreSQL (Recommended for Development)
- Install PostgreSQL on your machine
- Full control and no internet required
- Free and unlimited

### Option 2: Neon PostgreSQL (Recommended for Production)
- Serverless PostgreSQL in the cloud
- Auto-scaling and backups
- Free tier: 512 MB storage, 100 hours compute
- Already configured in your .env

### Option 3: Other Cloud Providers
- **Supabase**: PostgreSQL + real-time subscriptions
- **Railway**: Simple deployment with PostgreSQL
- **AWS RDS**: Enterprise-grade PostgreSQL
- **Heroku Postgres**: Easy setup

---

## Step-by-Step Migration

### Step 1: Install PostgreSQL (Local)

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey
choco install postgresql

# Or use scoop
scoop install postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

**Local PostgreSQL:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ashley_ai;

# Create user (optional)
CREATE USER ashley_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ashley_ai TO ashley_admin;

# Exit
\q
```

**Neon PostgreSQL (Cloud):**
- Already set up! Use the connection string in .env
- No installation needed

### Step 3: Update Configuration

**Already done! Check your .env:**
```bash
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ashley_ai?schema=public"

# OR Neon PostgreSQL (Cloud)
DATABASE_URL="postgresql://neondb_owner:npg_Il0Wxopyjv5n@ep-snowy-firefly-a1wq4mcr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

### Step 4: Generate Prisma Client

```bash
cd packages/database
npx prisma generate
```

### Step 5: Run Database Migrations

```bash
# Create initial migration
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy
```

### Step 6: (Optional) Migrate Existing Data

If you have existing data in SQLite:

**Option A: Fresh Start (Recommended)**
```bash
# Just run migrations - starts with empty database
npx prisma migrate dev --name init

# Seed with test data
npx prisma db seed
```

**Option B: Export and Import Data**
```bash
# Export from SQLite (create export script)
node scripts/export-sqlite-data.js

# Import to PostgreSQL
node scripts/import-to-postgres.js
```

### Step 7: Verify Connection

```bash
# Test database connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio
```

---

## Schema Changes for PostgreSQL

### Improved Data Types

**Before (SQLite):**
```prisma
settings String? // JSON as string for SQLite
```

**After (PostgreSQL):**
```prisma
settings Json? // Native JSON type (faster queries)
```

### PostgreSQL-Specific Features

**Arrays:**
```prisma
tags String[] // Native array support
```

**JSONB (faster than JSON):**
```prisma
metadata Json @db.JsonB // Binary JSON for better performance
```

**Better Indexes:**
```prisma
@@index([client_id, status]) // Composite indexes
@@index([created_at(sort: Desc)]) // Sorted indexes
```

---

## Database Connection Strings

### Local PostgreSQL
```bash
# Format
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public

# Example
postgresql://postgres:postgres@localhost:5432/ashley_ai?schema=public
```

### Neon PostgreSQL (Cloud)
```bash
# Already configured (from your account)
postgresql://neondb_owner:npg_Il0Wxopyjv5n@ep-snowy-firefly-a1wq4mcr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### Supabase
```bash
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
```

### Railway
```bash
# Auto-generated when you add PostgreSQL plugin
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

---

## Migration Scripts

### Export SQLite Data (if needed)

Create `scripts/export-sqlite-data.js`:
```javascript
const { PrismaClient } = require('@ash-ai/database')
const fs = require('fs')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:../packages/database/prisma/dev.db'
    }
  }
})

async function exportData() {
  const data = {
    workspaces: await prisma.workspace.findMany(),
    users: await prisma.user.findMany(),
    clients: await prisma.client.findMany(),
    orders: await prisma.order.findMany(),
    // ... export all tables
  }

  fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2))
  console.log('✅ Data exported to data-export.json')
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### Import to PostgreSQL

Create `scripts/import-to-postgres.js`:
```javascript
const { PrismaClient } = require('@ash-ai/database')
const fs = require('fs')

const prisma = new PrismaClient()

async function importData() {
  const data = JSON.parse(fs.readFileSync('data-export.json', 'utf-8'))

  // Import in order (respecting foreign keys)
  for (const workspace of data.workspaces) {
    await prisma.workspace.create({ data: workspace })
  }

  for (const user of data.users) {
    await prisma.user.create({ data: user })
  }

  // ... import all tables

  console.log('✅ Data imported successfully')
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## Troubleshooting

### Error: "Can't reach database server"
```bash
# Check if PostgreSQL is running
# Windows
pg_ctl status

# Mac/Linux
brew services list
# or
sudo systemctl status postgresql

# Restart if needed
brew services restart postgresql
```

### Error: "Database does not exist"
```bash
# Create database
createdb ashley_ai

# Or via psql
psql -U postgres
CREATE DATABASE ashley_ai;
```

### Error: "Authentication failed"
```bash
# Update password in .env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ashley_ai"

# Or reset PostgreSQL password
psql -U postgres
ALTER USER postgres WITH PASSWORD 'newpassword';
```

### Error: "SSL connection required"
```bash
# For Neon/cloud databases, ensure SSL is in URL
DATABASE_URL="postgresql://...?sslmode=require"
```

### Error: "Migration failed"
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create fresh migration
npx prisma migrate dev --name init
```

---

## Performance Optimization

### Connection Pooling

Update Prisma Client initialization:
```typescript
import { PrismaClient } from '@ash-ai/database'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error', 'warn'],
})

// Connection pool settings (for production)
// Add to DATABASE_URL: ?connection_limit=10&pool_timeout=20
```

### Indexes for Better Performance

Add indexes to frequently queried fields:
```prisma
model Order {
  // ... fields

  @@index([client_id])
  @@index([status])
  @@index([created_at(sort: Desc)])
  @@index([order_number])
}
```

### Database Vacuum (Maintenance)

```bash
# Run periodically to optimize PostgreSQL
psql -U postgres ashley_ai
VACUUM ANALYZE;
```

---

## Environment-Specific Configuration

### Development (.env.development)
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ashley_ai_dev"
```

### Testing (.env.test)
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ashley_ai_test"
```

### Production (.env.production)
```bash
DATABASE_URL="postgresql://neondb_owner:npg_Il0Wxopyjv5n@ep-snowy-firefly-a1wq4mcr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

---

## Cloud PostgreSQL Setup

### Neon (Already Configured)
1. Database already exists at Neon
2. Connection string is in your .env
3. Just run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Supabase (Alternative)
1. Sign up at https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Update DATABASE_URL in .env
5. Run migrations

### Railway (Alternative)
1. Sign up at https://railway.app
2. Create new project
3. Add PostgreSQL plugin
4. Copy DATABASE_URL from Variables tab
5. Update .env and run migrations

---

## Testing the Migration

### 1. Verify Schema
```bash
npx prisma db pull
npx prisma studio
```

### 2. Test Queries
```typescript
// Test basic operations
const workspace = await prisma.workspace.create({
  data: {
    name: 'Test Workspace',
    slug: 'test-workspace',
  },
})

const workspaces = await prisma.workspace.findMany()
console.log(workspaces)
```

### 3. Run Application
```bash
cd services/ash-admin
pnpm dev

# Check http://localhost:3001
```

---

## Rollback Plan

If migration fails, rollback to SQLite:

1. Update .env:
   ```bash
   DATABASE_URL="file:C:/Users/Khell/Desktop/Ashley AI/packages/database/prisma/dev.db"
   ```

2. Update schema.prisma:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. Regenerate client:
   ```bash
   npx prisma generate
   ```

---

## Quick Start Commands

**Choose your database:**

### Option 1: Use Neon PostgreSQL (Cloud - Already Set Up)
```bash
# 1. Update .env (already done)
DATABASE_URL="postgresql://neondb_owner:npg_Il0Wxopyjv5n@ep-snowy-firefly-a1wq4mcr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# 2. Run migrations
cd packages/database
npx prisma migrate dev --name init

# 3. Generate client
npx prisma generate

# 4. Start app
cd ../../services/ash-admin
pnpm dev
```

### Option 2: Use Local PostgreSQL
```bash
# 1. Install PostgreSQL
choco install postgresql

# 2. Create database
createdb ashley_ai

# 3. Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ashley_ai?schema=public"

# 4. Run migrations
cd packages/database
npx prisma migrate dev --name init

# 5. Generate client
npx prisma generate

# 6. Start app
cd ../../services/ash-admin
pnpm dev
```

---

## ✅ Migration Checklist

- [x] Updated schema.prisma to use PostgreSQL
- [x] Updated .env with PostgreSQL connection strings
- [x] Documented migration steps
- [ ] Install PostgreSQL (local) or use Neon (cloud)
- [ ] Create database
- [ ] Run Prisma migrations
- [ ] Generate Prisma client
- [ ] Test database connection
- [ ] (Optional) Migrate existing data
- [ ] Verify application works
- [ ] Update deployment configuration

---

## Next Steps After Migration

1. **Run Migrations**:
   ```bash
   cd packages/database
   npx prisma migrate dev --name init
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Test Application**:
   ```bash
   cd ../../services/ash-admin
   pnpm dev
   ```

4. **Set Up Backups** (see AUTOMATED-BACKUPS.md)

5. **Deploy to Production** (see VERCEL-DEPLOYMENT.md)

---

## 🎯 Result

**PostgreSQL migration is READY!**

Choose your preferred database:
- **Neon PostgreSQL** (Cloud, already configured)
- **Local PostgreSQL** (Full control, offline)

Run the Quick Start commands above to complete the migration.

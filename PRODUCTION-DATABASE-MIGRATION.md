# Production Database Migration Guide

Complete guide for migrating Ashley AI from SQLite (development) to PostgreSQL (production).

## Table of Contents
- [Why Migrate](#why-migrate)
- [Option 1: Vercel Postgres](#option-1-vercel-postgres)
- [Option 2: Neon Serverless](#option-2-neon-serverless)
- [Option 3: Railway PostgreSQL](#option-3-railway-postgresql)
- [Migration Steps](#migration-steps)
- [Data Export/Import](#data-exportimport)
- [Troubleshooting](#troubleshooting)

---

## Why Migrate

**SQLite Limitations:**
- ❌ Single file database (not scalable)
- ❌ No concurrent writes (serverless issues)
- ❌ File system dependency (Vercel ephemeral)
- ❌ No connection pooling
- ❌ Limited backup options

**PostgreSQL Benefits:**
- ✅ Scalable and robust
- ✅ Concurrent connections
- ✅ Production-grade reliability
- ✅ Connection pooling
- ✅ Automatic backups
- ✅ Serverless compatible

---

## Option 1: Vercel Postgres

**Best for**: Apps deployed on Vercel

### Step 1: Create Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Choose database name: `ashley-ai-production`
6. Select region (closest to users)
7. Click **Create**

### Step 2: Get Connection String

1. In Storage tab, click on your database
2. Go to **.env.local** tab
3. Copy the `DATABASE_URL` value

Example:
```env
DATABASE_URL="postgres://default:xxx@ep-xxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"
```

### Step 3: Configure Environment

Add to Vercel environment variables:

```env
# Database
DATABASE_URL="your-postgres-connection-string"

# Enable connection pooling (recommended)
POSTGRES_URL_NON_POOLING="your-non-pooled-connection-string"
```

### Step 4: Run Migrations

```bash
# Update DATABASE_URL in .env
export DATABASE_URL="your-postgres-url"

# Generate Prisma client
cd packages/database
npx prisma generate

# Run migrations
npx prisma db push

# OR use migrate deploy for production
npx prisma migrate deploy
```

### Pricing

- **Hobby Plan**: Free (256MB storage, 60 hours compute)
- **Pro Plan**: $20/month (512MB+ storage, unlimited compute)

---

## Option 2: Neon Serverless

**Best for**: Serverless applications, pay-as-you-go

### Step 1: Create Database

1. Go to [Neon Console](https://console.neon.tech)
2. Click **New Project**
3. Name: `ashley-ai-production`
4. Select region (closest to users)
5. Click **Create**

### Step 2: Get Connection String

1. In project dashboard, go to **Dashboard**
2. Copy **Connection string** from the top
3. Choose **Pooled connection** for serverless

Example:
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Step 3: Configure Environment

Add to `.env` or Vercel environment variables:

```env
# Neon Postgres (Pooled for serverless)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Direct connection (for migrations)
DATABASE_URL_UNPOOLED="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Step 4: Run Migrations

```bash
# Use unpooled connection for migrations
export DATABASE_URL="your-unpooled-connection-string"

cd packages/database
npx prisma db push
```

### Pricing

- **Free Tier**: $0/month (512MB storage, 192 compute hours)
- **Pro Tier**: $19/month (unlimited storage, always-on)

---

## Option 3: Railway PostgreSQL

**Best for**: Full-stack deployments, simple pricing

### Step 1: Create Database

1. Go to [Railway](https://railway.app)
2. Click **New Project**
3. Select **Provision PostgreSQL**
4. Name: `ashley-ai-db`

### Step 2: Get Connection String

1. Click on PostgreSQL service
2. Go to **Connect** tab
3. Copy **PostgreSQL Connection URL**

Example:
```env
DATABASE_URL="postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway"
```

### Step 3: Configure Environment

Add to Railway environment variables (or local `.env`):

```env
DATABASE_URL="your-railway-postgres-url"
```

### Step 4: Run Migrations

```bash
export DATABASE_URL="your-railway-url"

cd packages/database
npx prisma db push
```

### Pricing

- **Starter Plan**: $5/month usage-based
- **Pro Plan**: $20/month + usage

---

## Migration Steps

### 1. Backup Existing SQLite Data

```bash
# Export all data from SQLite
cd packages/database

# Using Prisma Studio
npx prisma studio
# Manually export data from each table

# OR use SQL dump
sqlite3 prisma/dev.db .dump > backup.sql
```

### 2. Update Prisma Schema

Already configured! `schema.prisma` supports PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"  // ✅ Already set
  url      = env("DATABASE_URL")
}
```

### 3. Run Migrations on PostgreSQL

```bash
# Set PostgreSQL connection
export DATABASE_URL="your-postgres-url"

cd packages/database

# Generate Prisma client
npx prisma generate

# Push schema to PostgreSQL
npx prisma db push

# Verify schema
npx prisma db pull
```

### 4. Seed Initial Data (Optional)

```bash
# Run database seeder
cd packages/database
npx prisma db seed
```

### 5. Test Connection

```bash
# Test database connection
npx prisma studio

# Should open Prisma Studio connected to PostgreSQL
```

### 6. Deploy to Production

```bash
# Set environment variables in Vercel/Railway
vercel env add DATABASE_URL production

# Deploy
vercel --prod

# Run migrations on production
vercel exec -- npx prisma db push
```

---

## Data Export/Import

### Export Data from SQLite

**Option A: Using Prisma Studio**

1. Open Prisma Studio: `npx prisma studio`
2. Manually export each table to CSV/JSON
3. Re-import into PostgreSQL

**Option B: Custom Export Script**

```typescript
// export-data.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  const users = await prisma.user.findMany();
  const orders = await prisma.order.findMany();
  const clients = await prisma.client.findMany();

  const data = { users, orders, clients };

  fs.writeFileSync('backup.json', JSON.stringify(data, null, 2));
  console.log('Data exported to backup.json');
}

exportData();
```

Run:
```bash
npx ts-node export-data.ts
```

### Import Data into PostgreSQL

```typescript
// import-data.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  const data = JSON.parse(fs.readFileSync('backup.json', 'utf-8'));

  // Import users
  for (const user of data.users) {
    await prisma.user.create({ data: user });
  }

  // Import clients
  for (const client of data.clients) {
    await prisma.client.create({ data: client });
  }

  // Import orders
  for (const order of data.orders) {
    await prisma.order.create({ data: order });
  }

  console.log('Data imported successfully!');
}

importData();
```

Run:
```bash
# Set PostgreSQL connection
export DATABASE_URL="your-postgres-url"
npx ts-node import-data.ts
```

---

## Troubleshooting

### Issue: "Connection timeout"

**Solution:**
- Check if DATABASE_URL is correct
- Verify network/firewall allows connections
- Try using connection pooler URL (for serverless)
- Check database is running and not paused

### Issue: "SSL certificate error"

**Solution:**
```env
# Add sslmode=require to connection string
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# OR disable SSL (development only)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=disable"
```

### Issue: "Migration failed"

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Push schema without migrations
npx prisma db push

# OR run migrations one by one
npx prisma migrate deploy
```

### Issue: "Too many connections"

**Solution:**
- Use connection pooler (Neon pooled URL, PgBouncer)
- Reduce `connection_limit` in DATABASE_URL:
```env
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=10"
```

### Issue: "Table already exists"

**Solution:**
```bash
# Drop all tables and re-create
npx prisma migrate reset

# OR manually drop tables in SQL
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then push schema
npx prisma db push
```

---

## Provider Comparison

| Feature | Vercel Postgres | Neon | Railway |
|---------|----------------|------|---------|
| **Free Tier** | 256MB | 512MB | $5 credit |
| **Pricing** | $20/month | $19/month | $5/month+ |
| **Serverless** | ✅ Yes | ✅ Yes | ❌ No |
| **Auto-sleep** | ❌ No | ✅ Yes | ❌ No |
| **Branching** | ❌ No | ✅ Yes | ❌ No |
| **Setup** | ⭐ Easy | ⭐⭐ Medium | ⭐ Easy |
| **Best For** | Vercel apps | Serverless | Full-stack |

---

## Post-Migration Checklist

- [ ] Verify all tables created successfully
- [ ] Check all data imported correctly
- [ ] Test all API endpoints with PostgreSQL
- [ ] Update environment variables in production
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Monitor database performance
- [ ] Update CLAUDE.md with new DATABASE_URL

---

## Quick Commands

```bash
# Generate Prisma client
cd packages/database && npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# View current schema
npx prisma db pull

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy
```

---

**Last Updated**: November 4, 2025
**Version**: 1.0.0
**Current Database**: PostgreSQL (Neon - Already configured!)

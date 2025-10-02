# Performance Optimization Guide

## 🎯 Common Bottlenecks & Solutions

### 1. Database Query Performance

#### **N+1 Query Problem**
**Problem**: Loading related data in loops causes excessive database queries.

**Bad Example**:
```typescript
// This causes N+1 queries!
const orders = await prisma.order.findMany();
for (const order of orders) {
  const client = await prisma.client.findUnique({ where: { id: order.client_id } });
}
```

**Good Example**:
```typescript
// Use include to load relations in one query
const orders = await prisma.order.findMany({
  include: { client: true }
});
```

**Solution**:
- Always use `include` or `select` with relations
- Use Prisma's eager loading
- Check query logs for repeated patterns

---

#### **Missing Indexes**
**Problem**: Queries on unindexed columns are slow on large datasets.

**Identify Slow Queries**:
```sql
-- PostgreSQL: Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Add Indexes**:
```prisma
model Order {
  id           String   @id @default(cuid())
  order_number String   @unique  // Already indexed
  status       String   @default("PENDING")
  client_id    String

  @@index([status])        // Index for filtering by status
  @@index([client_id])     // Index for joins
  @@index([created_at])    // Index for date sorting
  @@index([status, created_at]) // Composite index for common query
}
```

**Recommended Indexes for Ashley AI**:
```prisma
// In packages/database/prisma/schema.prisma

model Order {
  @@index([status])
  @@index([client_id])
  @@index([created_at])
  @@index([order_number])
}

model Bundle {
  @@index([lay_id])
  @@index([status])
  @@index([created_at])
}

model SewingRun {
  @@index([operator_id])
  @@index([status])
  @@index([created_at])
}

model Invoice {
  @@index([client_id])
  @@index([status])
  @@index([due_date])
}

model Employee {
  @@index([status])
  @@index([position])
  @@index([department])
}
```

---

#### **Large Result Sets**
**Problem**: Loading thousands of records without pagination.

**Bad Example**:
```typescript
// Loads ALL orders into memory!
const orders = await prisma.order.findMany();
```

**Good Example**:
```typescript
// Paginated query
const page = 1;
const limit = 20;

const [orders, total] = await Promise.all([
  prisma.order.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { created_at: 'desc' },
  }),
  prisma.order.count(),
]);
```

---

### 2. API Performance

#### **Implement Caching**
Use Redis caching for frequently accessed data:

```typescript
import { cacheService } from '@/lib/redis/cache';

// Cache client data for 30 minutes
export async function GET(request: NextRequest) {
  const clients = await cacheService.getOrSet(
    'clients:all',
    async () => {
      return await prisma.client.findMany();
    },
    1800 // 30 minutes TTL
  );

  return NextResponse.json({ clients });
}
```

#### **Invalidate Cache on Updates**
```typescript
export async function POST(request: NextRequest) {
  const client = await prisma.client.create({ data });

  // Invalidate cache
  await cacheService.delete('clients:all');

  return NextResponse.json({ client });
}
```

---

#### **Use Parallel Requests**
**Bad Example**:
```typescript
// Sequential - slow!
const clients = await fetch('/api/clients');
const orders = await fetch('/api/orders');
const invoices = await fetch('/api/finance/invoices');
```

**Good Example**:
```typescript
// Parallel - fast!
const [clients, orders, invoices] = await Promise.all([
  fetch('/api/clients'),
  fetch('/api/orders'),
  fetch('/api/finance/invoices'),
]);
```

---

### 3. Database Connection Pooling

**Configure Prisma Connection Pool**:
```env
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/ashleyai?connection_limit=10&pool_timeout=20"
```

**Recommended Settings**:
- Development: `connection_limit=5`
- Production: `connection_limit=20-50` (based on load)
- Always set `pool_timeout` to prevent hanging connections

---

### 4. Optimize Aggregations

**Bad Example**:
```typescript
// Loads ALL data into memory, then counts
const orders = await prisma.order.findMany();
const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
```

**Good Example**:
```typescript
// Database aggregation - much faster
const result = await prisma.order.aggregate({
  _sum: { total_amount: true },
  _count: true,
  where: { status: 'COMPLETED' },
});
```

---

### 5. Batch Operations

**Bad Example**:
```typescript
// Individual inserts - slow!
for (const item of items) {
  await prisma.item.create({ data: item });
}
```

**Good Example**:
```typescript
// Batch insert - fast!
await prisma.item.createMany({
  data: items,
  skipDuplicates: true,
});
```

---

### 6. Query Optimization

#### **Select Only Needed Fields**
```typescript
// Bad: Loads all fields
const orders = await prisma.order.findMany();

// Good: Only load what you need
const orders = await prisma.order.findMany({
  select: {
    id: true,
    order_number: true,
    status: true,
    client: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});
```

#### **Use Transactions for Multiple Operations**
```typescript
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.invoice.create({ data: { order_id: order.id, ...invoiceData } });
  await tx.payment.create({ data: paymentData });
});
```

---

## 🔍 Performance Monitoring

### 1. Enable Prisma Query Logging
```typescript
// packages/database/src/index.ts
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 100) {
    console.warn(`Slow query detected: ${e.duration}ms`, e.query);
  }
});
```

### 2. Monitor API Response Times
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  const duration = Date.now() - start;
  if (duration > 500) {
    console.warn(`Slow request: ${request.url} - ${duration}ms`);
  }

  response.headers.set('X-Response-Time', `${duration}ms`);
  return response;
}
```

### 3. Database Performance Metrics
```sql
-- PostgreSQL: Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

## 📊 Performance Benchmarks

### Expected Response Times

| Endpoint | Target | Acceptable | Slow |
|----------|--------|------------|------|
| GET /api/clients | <100ms | <300ms | >500ms |
| GET /api/orders | <150ms | <400ms | >600ms |
| POST /api/orders | <200ms | <500ms | >800ms |
| GET /api/finance/dashboard | <300ms | <600ms | >1000ms |
| Login | <200ms | <400ms | >600ms |

### Database Query Benchmarks

| Query Type | Target | Acceptable | Slow |
|------------|--------|------------|------|
| Simple SELECT | <50ms | <100ms | >200ms |
| JOIN (2-3 tables) | <100ms | <200ms | >400ms |
| Aggregation | <200ms | <400ms | >800ms |
| Full-text search | <300ms | <500ms | >1000ms |

---

## 🚀 Quick Wins

1. **Add Missing Indexes** (30 minutes)
   - Run load tests to identify slow queries
   - Add indexes to frequently queried columns
   - Redeploy and test

2. **Enable Redis Caching** (1 hour)
   - Already implemented in Stage 13
   - Update API endpoints to use caching
   - Cache frequently accessed data

3. **Optimize Dashboard Queries** (1 hour)
   - Use aggregations instead of loading all data
   - Implement parallel data fetching
   - Cache dashboard metrics

4. **Implement Pagination** (2 hours)
   - Add pagination to all list endpoints
   - Limit default page size to 20-50 items
   - Add sorting and filtering

5. **Database Connection Pooling** (15 minutes)
   - Update DATABASE_URL with connection_limit
   - Configure pool_timeout
   - Test under load

---

## 🛠️ Tools

### Database Query Analysis
```bash
# Enable PostgreSQL slow query logging
# postgresql.conf
log_min_duration_statement = 100  # Log queries > 100ms
log_statement = 'all'
```

### Load Testing
```bash
# Run load tests
cd services/ash-admin
pnpm load-test

# Individual tests
pnpm load-test:api      # API endpoints
pnpm load-test:db       # Database queries
pnpm load-test:auth     # Authentication
```

### Redis Monitoring
```bash
# Connect to Redis
redis-cli

# Monitor commands
MONITOR

# Get cache statistics
INFO stats
```

---

## 📈 Optimization Checklist

- [ ] Database indexes added for frequently queried columns
- [ ] N+1 queries eliminated using eager loading
- [ ] Pagination implemented on all list endpoints
- [ ] Redis caching enabled for static/slow data
- [ ] Database connection pooling configured
- [ ] Query logging enabled for slow queries
- [ ] API response time monitoring in place
- [ ] Load tests passing with acceptable metrics
- [ ] Aggregations used for dashboard metrics
- [ ] Batch operations for bulk inserts/updates

---

## 🎯 Next Steps

After running load tests, prioritize optimizations based on:
1. **High Impact, Low Effort**: Missing indexes, caching
2. **High Impact, Medium Effort**: N+1 queries, pagination
3. **Medium Impact, Low Effort**: Query optimization, parallel requests
4. **Long Term**: Database sharding, CDN, microservices

# Week 1 - Test Foundation Setup Guide

**Created**: 2025-10-19
**Status**: Complete ✅
**Goal**: Set up comprehensive test infrastructure with Docker, database seeding, and 30+ integration tests

---

## Overview

This guide covers the Week 1 test infrastructure improvements for Ashley AI, including:

1. ✅ Docker Compose test environment
2. ✅ Test database with PostgreSQL and Redis
3. ✅ Database seeding script with realistic test data
4. ✅ 30+ comprehensive integration tests for critical APIs
5. ✅ GitHub Actions CI/CD workflow
6. ✅ Test helper scripts and utilities

---

## What's New

### 🐳 Docker Test Environment

**File**: `docker-compose.test.yml`

Provides isolated test environment with:
- PostgreSQL 16 (port 5433)
- Redis 7 (port 6380)
- Separate from development databases
- Health checks for reliability

### 🌱 Test Database Seeding

**File**: `tests/setup/seed-test-db.ts`

Seeds test database with:
- 3 test users (admin, manager, operator)
- 3 employees with different salary types
- 2 clients and 2 brands
- 4 orders with various statuses
- 5 color variants
- 3 attendance logs

### 🧪 Integration Test Suites

#### **Orders API Tests**
**File**: `tests/integration/orders-api.test.ts`

17 comprehensive tests covering:
- GET /api/orders - List, pagination, filtering
- POST /api/orders - Create with validation
- GET /api/orders/:id - Details retrieval
- PATCH /api/orders/:id - Updates
- DELETE /api/orders/:id - Deletion
- Performance tests

#### **Finance API Tests**
**File**: `tests/integration/finance-api.test.ts`

14 comprehensive tests covering:
- GET /api/finance/stats - Financial statistics
- GET /api/finance/invoices - List and filters
- POST /api/finance/invoices - Creation and validation
- GET /api/finance/payments - Payment records
- POST /api/finance/payments - Payment processing
- Performance tests

#### **HR API Tests**
**File**: `tests/integration/hr-api.test.ts`

15 comprehensive tests covering:
- GET /api/hr/employees - List and filters
- POST /api/hr/employees - Creation and validation
- GET /api/hr/attendance - Attendance logs
- POST /api/hr/attendance - Record attendance
- GET /api/hr/stats - HR statistics
- GET /api/hr/payroll - Payroll records
- Performance tests

**Total New Integration Tests**: 46 tests

### ⚙️ GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

5 jobs running in parallel:
1. **Unit & Integration Tests** - With PostgreSQL and Redis services
2. **E2E Tests** - With real server
3. **Security Tests** - Authentication and security validation
4. **Lint & Type Check** - Code quality
5. **Test Summary** - Overall results

### 📜 Helper Scripts

**Windows**: `scripts/test-with-db.bat`
**Linux/Mac**: `scripts/test-with-db.sh`

Automated test runner that:
1. Starts Docker containers
2. Waits for databases
3. Runs migrations
4. Seeds test data
5. Runs tests
6. Cleans up

---

## Quick Start

### Prerequisites

1. **Docker Desktop** installed and running
2. **Node.js 20+** installed
3. **pnpm 9.0+** installed

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Start Test Database

```bash
pnpm test:db:up
```

This starts PostgreSQL and Redis in Docker containers.

### Step 3: Run Migrations

```bash
cd packages/database
npx prisma migrate deploy
cd ../..
```

### Step 4: Seed Test Database

```bash
pnpm test:db:seed
```

This creates all test data (users, employees, clients, orders, etc.)

### Step 5: Run Tests

```bash
# Run all integration tests
pnpm test:integration

# Run specific API tests
pnpm test:api

# Run with coverage
pnpm test:coverage

# Run security tests (requires dev server on port 3001)
pnpm test:security
```

### Step 6: Cleanup

```bash
pnpm test:db:down
```

---

## All-in-One Command

**Linux/Mac**:
```bash
pnpm test:with-db
```

**Windows** (PowerShell):
```powershell
.\scripts\test-with-db.bat
```

This command:
1. Starts databases
2. Runs migrations
3. Seeds data
4. Runs all tests
5. Cleans up automatically

---

## Available Test Commands

```bash
# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# E2E tests only
pnpm test:e2e

# Security tests (requires server on port 3001)
pnpm test:security

# All API integration tests
pnpm test:api

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# CI mode
pnpm test:ci

# Database management
pnpm test:db:up      # Start test databases
pnpm test:db:down    # Stop test databases
pnpm test:db:seed    # Seed test data
```

---

## Test Environment Variables

Create `.env.test.local` (not in git):

```bash
# Database
DATABASE_URL="postgresql://test_user:test_password@localhost:5433/ashley_ai_test"

# Redis
REDIS_URL="redis://localhost:6380"

# JWT
JWT_SECRET="test_jwt_secret_for_testing_only"

# API
API_BASE_URL="http://localhost:3001"
PORT=3001

# Node Environment
NODE_ENV="test"
```

---

## Running Tests with Real Server

Some tests require a running development server:

### Terminal 1: Start Dev Server
```bash
pnpm --filter @ash/admin dev
```

### Terminal 2: Run Tests
```bash
# Security tests
pnpm test:security

# Real API tests
pnpm test tests/integration/api-real.test.ts

# All tests that need server
pnpm test tests/integration/api-real.test.ts tests/security/
```

---

## Test Data Reference

### Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@ashleyai.com | password123 | ADMIN |
| manager@ashleyai.com | password123 | MANAGER |
| operator@ashleyai.com | password123 | OPERATOR |

### Test Employees

| Number | Name | Position | Salary Type |
|--------|------|----------|-------------|
| EMP-001 | John Doe | Sewing Operator | PIECE |
| EMP-002 | Jane Smith | Quality Inspector | HOURLY |
| EMP-003 | Mike Johnson | Cutting Operator | DAILY |

### Test Clients

| Name | Contact |
|------|---------|
| Test Client Inc. | john@testclient.com |
| Sample Company Ltd. | jane@sampleco.com |

### Test Orders

| Order Number | Status | Quantity | Priority |
|--------------|--------|----------|----------|
| ORD-TEST-001 | PENDING | 1000 | NORMAL |
| ORD-TEST-002 | IN_PROGRESS | 500 | HIGH |
| ORD-TEST-003 | COMPLETED | 750 | NORMAL |
| ORD-TEST-004 | PENDING | 200 | URGENT |

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to master/main/develop
- Pull requests to master/main/develop

**Workflow includes**:
1. Unit tests with coverage
2. Integration tests with real database
3. E2E tests with server
4. Security tests
5. Lint and type checking

### View Results

Check GitHub Actions tab in repository for:
- Test results
- Coverage reports
- Performance metrics
- Failure logs

---

## Troubleshooting

### Docker Issues

**Problem**: Docker not running
```bash
# Check if Docker is running
docker info

# Start Docker Desktop (Windows/Mac)
# Or start Docker service (Linux)
sudo systemctl start docker
```

**Problem**: Port conflicts
```bash
# Check if ports are in use
netstat -an | findstr :5433  # Windows
lsof -i :5433                 # Mac/Linux

# Stop conflicting services or change ports in docker-compose.test.yml
```

### Database Issues

**Problem**: Migration failed
```bash
# Reset database
pnpm test:db:down
pnpm test:db:up

# Wait 10 seconds, then try again
cd packages/database
npx prisma migrate reset --force
npx prisma migrate deploy
```

**Problem**: Seed data failed
```bash
# Clear and reseed
cd packages/database
npx prisma migrate reset --force
cd ../..
pnpm test:db:seed
```

### Test Issues

**Problem**: Tests timing out
```bash
# Increase timeout in test file
it('test name', async () => {
  // test code
}, 30000) // 30 second timeout
```

**Problem**: Server not ready for security tests
```bash
# Wait longer after starting server
pnpm --filter @ash/admin dev

# Wait 30 seconds, then:
pnpm test:security
```

**Problem**: Fetch not defined
- This should be fixed by jest.setup.js
- If still occurring, check that node-fetch is installed:
```bash
pnpm add -D -w node-fetch@2
```

---

## Test Coverage Goals

### Current Status
- Unit tests: 41 tests ✅
- Integration tests (mock): 21 tests ✅
- Integration tests (real API): 46 tests ✅ (NEW)
- E2E tests: 13 tests ✅
- Security tests: 40 tests ✅

**Total: 161 tests**

### Coverage Targets

| Category | Current | Target |
|----------|---------|--------|
| Unit Tests | 0% (mock-based) | 70% |
| Integration Tests | 15% API coverage | 60% |
| Security Tests | 100% (when server running) | 100% |
| E2E Tests | Core workflows | All critical paths |

---

## Next Steps (Week 2)

### Planned Improvements

1. **Increase Unit Test Coverage**
   - Test utility functions in `services/ash-admin/src/lib/`
   - Add 50+ unit tests for business logic
   - Target: 70%+ code coverage

2. **More API Integration Tests**
   - Cutting operations (12 endpoints)
   - Printing operations (8 endpoints)
   - QC operations (8 endpoints)
   - Delivery operations (10 endpoints)
   - Target: 60%+ API coverage

3. **Component Tests**
   - React component testing with RTL
   - Focus on critical UI components
   - Target: 50%+ component coverage

4. **Load Testing**
   - Set up k6 in CI
   - Establish performance baselines
   - Add performance regression tests

---

## Resources

- [Testing Guide](TESTING-GUIDE.md) - Complete testing documentation
- [Quality Report](QUALITY-REPORT.md) - Current quality assessment
- [Jest Documentation](https://jestjs.io/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

---

## Support

### Common Questions

**Q: Do I need to run Docker for all tests?**
A: No, only for integration tests that need a real database. Unit tests and mock-based integration tests run without Docker.

**Q: Can I use SQLite instead of PostgreSQL for tests?**
A: Yes, but some tests may behave differently. PostgreSQL is recommended for production-like testing.

**Q: How long do tests take to run?**
A:
- Unit tests: ~2 seconds
- Integration tests (mock): ~2 seconds
- Integration tests (real DB): ~10-15 seconds
- E2E tests: ~5-10 seconds
- Security tests: ~15-20 seconds

**Q: Can I run tests in parallel?**
A: Yes, Jest runs tests in parallel by default. Use `--maxWorkers=50%` to control parallelism.

**Q: How do I skip tests that need a server?**
A: Tests automatically skip if server is not running. They check for server availability first.

---

**Week 1 Complete!** ✅

All test infrastructure is now in place. The system has:
- 161 total tests
- Docker-based test environment
- Automated CI/CD pipeline
- Comprehensive test data
- Helper scripts for easy testing

Ready to proceed to Week 2 for increased coverage! 🚀

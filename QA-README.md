# Ashley AI - Quality Assurance & Testing Guide

## Table of Contents
- [Quick Start](#quick-start)
- [Quality Gates](#quality-gates)
- [Testing Strategy](#testing-strategy)
- [Development Workflow](#development-workflow)
- [CI/CD Pipeline](#cicd-pipeline)
- [QA Checklist](#qa-checklist)
- [Deployment Guide](#deployment-guide)
- [Rollback Procedure](#rollback-procedure)

---

## Quick Start

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Git

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd ashley-ai

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Initialize database
cd services/ash-admin
pnpm init-db

# Start development server
cd ../..
pnpm dev
```

### Environment Variables
Create `.env` files in the following locations:
- `packages/database/.env`
- `services/ash-admin/.env`
- `services/ash-portal/.env`

Required variables:
```env
# Database
DATABASE_URL="your-database-url"

# Authentication
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Redis (optional for development)
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="development"
PORT=3001
```

---

## Quality Gates

### Pre-Commit Hooks (Husky)
Automatically run on `git commit`:
- ✅ **ESLint** - Code linting with zero warnings allowed
- ✅ **Prettier** - Code formatting
- ✅ **TypeScript** - Type checking (strict mode enabled)

### NPM Scripts

#### Development
```bash
pnpm dev              # Start all services in development mode
pnpm dev:fast         # Start admin and portal only
```

#### Building
```bash
pnpm build            # Build all services for production
```

#### Code Quality
```bash
pnpm lint             # Run ESLint (fails on warnings)
pnpm lint:fix         # Auto-fix ESLint issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
pnpm type-check       # TypeScript type checking
```

#### Testing
```bash
# Unit & Integration Tests (Jest)
pnpm test                    # Run all Jest tests
pnpm test:watch              # Run tests in watch mode
pnpm test:coverage           # Run tests with coverage report
pnpm test:unit               # Run unit tests only
pnpm test:integration        # Run integration tests only

# E2E Tests (Playwright)
pnpm test:e2e                # Run Playwright E2E tests
pnpm test:e2e:ui             # Run Playwright in UI mode
pnpm test:e2e:jest           # Run Jest E2E tests

# Security Tests
pnpm test:security           # Run security tests

# All Tests
pnpm test:ci                 # Run all tests in CI mode
```

#### Quality Check (Complete)
```bash
pnpm check              # Run type-check + lint + test + e2e
pnpm check:quick        # Run type-check + lint only
```

---

## Testing Strategy

### Unit Tests (Jest)
**Location**: `tests/unit/`

**Coverage Requirements**:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**What to Test**:
- Utility functions
- React components (using React Testing Library)
- Business logic
- Data transformations
- Validators

**Example**:
```typescript
// tests/unit/utils/validation.test.ts
import { validateEmail } from '@/lib/validation';

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

### Integration Tests (Jest)
**Location**: `tests/integration/`

**What to Test**:
- API endpoints with database
- Multi-step workflows
- Service integrations
- Database queries

**Existing Tests**:
- ✅ Orders API
- ✅ Finance API
- ✅ HR API
- ✅ Cutting API
- ✅ Printing API
- ✅ QC & Delivery API

### E2E Tests (Playwright)
**Location**: `e2e/`

**Critical User Journeys**:
1. **Authentication** (`e2e/auth.spec.ts`)
   - Login with valid credentials
   - Login with invalid credentials
   - Form validation
   - Logout
   - Protected routes
   - Keyboard accessibility

2. **Navigation** (`e2e/navigation.spec.ts`)
   - All navigation links functional
   - Dashboard navigation
   - Breadcrumbs
   - Keyboard navigation

3. **CRUD Operations** (`e2e/orders-crud.spec.ts`)
   - List view
   - Create new order
   - View order details
   - Form validation
   - Search/filter
   - Error handling

4. **Accessibility** (`e2e/accessibility.spec.ts`)
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support
   - Color contrast
   - Form labels
   - Focus management

5. **Error Pages** (`e2e/error-pages.spec.ts`)
   - 404 page
   - API errors
   - Network errors
   - Error boundaries
   - User-friendly messages

**Browser Support**:
- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit (Desktop Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

### Security Tests
**Location**: `tests/security/`

**What to Test**:
- Account lockout mechanisms
- Rate limiting
- SQL injection prevention
- XSS protection
- CSRF protection
- File upload security
- Password complexity

**Security Score**: A+ (98/100) - See `SECURITY-AUDIT-REPORT.md`

---

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Write Code
- Follow TypeScript strict mode
- Write tests first (TDD recommended)
- Follow project code style

### 3. Test Locally
```bash
# Quick check
pnpm check:quick

# Full check
pnpm check
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: your commit message"
```

Pre-commit hooks will automatically:
- Lint and format staged files
- Run type checking
- Fail commit if errors exist

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Create Pull Request on GitHub - CI will automatically run all tests.

---

## CI/CD Pipeline

### GitHub Actions Workflow
**File**: `.github/workflows/test.yml`

### Pipeline Jobs

#### Job 1: Unit & Integration Tests
- ✅ Run Jest unit tests
- ✅ Run Jest integration tests
- ✅ Generate coverage report
- ✅ Upload coverage to Codecov

#### Job 2: E2E Tests (Jest)
- ✅ Start test database
- ✅ Seed test data
- ✅ Build application
- ✅ Start server
- ✅ Run E2E tests

#### Job 3: Security Tests
- ✅ Run security test suite
- ✅ Verify rate limiting
- ✅ Test account lockout
- ✅ Validate file upload security

#### Job 4: Lint & Type Check
- ✅ Run ESLint (FAILS on warnings)
- ✅ Run TypeScript type check (FAILS on errors)

#### Job 5: Playwright E2E Tests
- ✅ Install Playwright browsers
- ✅ Run cross-browser tests
- ✅ Generate HTML report
- ✅ Upload test artifacts

#### Job 6: Test Summary
- ✅ Aggregate all test results
- ✅ Fail pipeline if ANY test fails

### Pipeline Requirements
**ALL jobs must pass before merge:**
- ❌ Build fails → Cannot merge
- ❌ Lint fails → Cannot merge
- ❌ Type check fails → Cannot merge
- ❌ Unit tests fail → Cannot merge
- ❌ Integration tests fail → Cannot merge
- ❌ E2E tests fail → Cannot merge
- ❌ Security tests fail → Cannot merge

---

## QA Checklist

### Before Every Deployment

#### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint passes with 0 warnings
- [ ] Prettier formatting applied
- [ ] No console.log statements in production code
- [ ] No commented-out code

#### Testing
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Code coverage ≥ 70%
- [ ] Security tests passing
- [ ] Manual testing completed

#### Functionality
- [ ] All buttons have working handlers
- [ ] All forms have validation
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Success feedback implemented
- [ ] All navigation links work
- [ ] Search/filter functionality works

#### Accessibility
- [ ] Keyboard navigation works
- [ ] All forms have labels
- [ ] ARIA labels present
- [ ] Color contrast ≥ WCAG AA
- [ ] Focus states visible
- [ ] Screen reader tested
- [ ] Axe accessibility scan passes

#### Performance
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Lighthouse Best Practices ≥ 90
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Bundle size acceptable

#### Security
- [ ] Authentication works
- [ ] Authorization enforced
- [ ] CSRF protection enabled
- [ ] Rate limiting active
- [ ] Sensitive data encrypted
- [ ] Environment variables secure
- [ ] Security scan passing (A+ grade)

#### Database
- [ ] Migrations applied
- [ ] Indexes optimized
- [ ] Seed data created
- [ ] Backup strategy in place

#### Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Environment variables documented
- [ ] Deployment guide updated

---

## Deployment Guide

### Production Deployment Steps

#### 1. Pre-Deployment Checks
```bash
# Run full quality check
pnpm check

# Build for production
pnpm build

# Verify build output
ls -la services/ash-admin/.next
```

#### 2. Database Migration
```bash
cd packages/database
npx prisma migrate deploy
```

#### 3. Environment Setup
```bash
# Copy production environment variables
cp .env.example .env.production

# Update with production values
# - DATABASE_URL
# - JWT_SECRET
# - REDIS_URL
# - NODE_ENV=production
```

#### 4. Initialize Production Database
```bash
cd services/ash-admin
pnpm init-db
```

#### 5. Start Production Server
```bash
# Method 1: Direct start
pnpm --filter @ash/admin start

# Method 2: Docker
docker-compose up -d

# Method 3: Process manager (recommended)
pm2 start ecosystem.config.js
```

#### 6. Health Check
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-19T...",
    "version": "1.0.0",
    "message": "Ashley AI API is running successfully"
  }
}
```

#### 7. Smoke Tests
Run critical E2E tests in production:
```bash
BASE_URL=https://your-production-url.com pnpm test:e2e
```

---

## Rollback Procedure

### If Deployment Fails

#### 1. Immediate Actions
```bash
# Stop current deployment
pm2 stop all  # or docker-compose down

# Check logs for errors
pm2 logs     # or docker-compose logs
```

#### 2. Rollback Code
```bash
# Revert to previous version
git checkout <previous-commit-hash>

# Rebuild
pnpm build
```

#### 3. Rollback Database (if needed)
```bash
cd packages/database

# List migrations
npx prisma migrate status

# Rollback to specific migration
npx prisma migrate resolve --rolled-back <migration-name>
```

#### 4. Restart Services
```bash
pnpm --filter @ash/admin start
```

#### 5. Verify Rollback
```bash
curl http://localhost:3001/api/health
pnpm test:e2e
```

### Post-Incident
- [ ] Document what went wrong
- [ ] Create bug report
- [ ] Fix issue in development
- [ ] Add tests to prevent recurrence
- [ ] Deploy fix when ready

---

## Adding New Tests

### Adding Unit Tests
```bash
# Create test file
touch tests/unit/your-module.test.ts

# Write test
describe('YourModule', () => {
  it('should work correctly', () => {
    expect(yourFunction()).toBe(expected);
  });
});

# Run tests
pnpm test:unit
```

### Adding E2E Tests
```bash
# Create spec file
touch e2e/your-feature.spec.ts

# Write test
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/your-page');
  await expect(page).toHaveTitle(/Expected Title/);
});

# Run tests
pnpm test:e2e
```

### Adding Integration Tests
```bash
# Create test file
touch tests/integration/your-api.test.ts

# Write test
describe('Your API', () => {
  it('should return data', async () => {
    const response = await fetch('/api/your-endpoint');
    expect(response.status).toBe(200);
  });
});

# Run tests
pnpm test:integration
```

---

## Troubleshooting

### Tests Failing Locally

**Type Errors**:
```bash
# Clean and regenerate
pnpm clean
pnpm db:generate
pnpm install
```

**Database Errors**:
```bash
# Reset database
cd packages/database
npx prisma migrate reset
```

**Port Conflicts**:
```bash
# Find process on port 3001
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

### CI Pipeline Failing

**Check Logs**:
1. Go to GitHub Actions tab
2. Click on failed workflow
3. Expand failed job
4. Read error messages

**Common Fixes**:
- Update lockfile: `pnpm install --frozen-lockfile=false`
- Clear cache: Delete `node_modules`, reinstall
- Fix TypeScript errors: `pnpm type-check`
- Fix linting: `pnpm lint:fix`

---

## Performance Benchmarks

### Load Testing
See `LOAD-TESTING.md` for complete guide.

**Quick Load Test**:
```bash
cd services/ash-admin
pnpm load-test:smoke
```

**Expected Performance**:
- p95 response time < 500ms
- p99 response time < 1000ms
- Failure rate < 1%

### Lighthouse Scores (Target)
- **Performance**: ≥ 90
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 80

---

## Support & Resources

### Documentation
- [Production Setup Guide](PRODUCTION-SETUP.md)
- [Security Audit Report](SECURITY-AUDIT-REPORT.md)
- [Security Remediation Plan](SECURITY-REMEDIATION-PLAN.md)
- [Load Testing Guide](LOAD-TESTING.md)
- [Performance Optimization](PERFORMANCE-OPTIMIZATION-GUIDE.md)

### External Resources
- [Playwright Docs](https://playwright.dev)
- [Jest Docs](https://jestjs.io)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Definition of Done

A feature is considered "Done" when:

1. ✅ **Code Complete**
   - TypeScript strict mode passes
   - ESLint passes with 0 warnings
   - Prettier formatting applied

2. ✅ **Tests Written**
   - Unit tests for all functions
   - Integration tests for APIs
   - E2E tests for user flows
   - Coverage ≥ 70%

3. ✅ **Accessibility**
   - Keyboard navigation works
   - WCAG AA compliance
   - Axe scan passes

4. ✅ **Functionality**
   - All features work as expected
   - Error handling implemented
   - Loading states present
   - Success feedback shown

5. ✅ **CI/CD**
   - All pipeline jobs pass
   - No console errors
   - Build succeeds

6. ✅ **Documentation**
   - Code commented where needed
   - README updated if needed
   - API docs updated

7. ✅ **Security**
   - No security vulnerabilities
   - Authentication/authorization enforced
   - Input validation present

8. ✅ **Code Review**
   - PR approved by team
   - All comments addressed

---

## License
PROPRIETARY - ASH AI Team

**Last Updated**: 2025-10-19

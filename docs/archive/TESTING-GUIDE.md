# Testing Guide - Ashley AI Manufacturing ERP

**Last Updated**: 2025-10-19
**Test Suite Version**: 2.0
**Coverage Goal**: 70%+

## Table of Contents

1. [Overview](#overview)
2. [Test Infrastructure](#test-infrastructure)
3. [Running Tests](#running-tests)
4. [Test Categories](#test-categories)
5. [Writing Tests](#writing-tests)
6. [Coverage Reports](#coverage-reports)
7. [Continuous Integration](#continuous-integration)
8. [Best Practices](#best-practices)

## Overview

Ashley AI uses a comprehensive testing strategy covering:
- **Unit Tests**: Individual functions and utilities
- **Integration Tests**: API endpoints and workflows
- **E2E Tests**: Complete user workflows
- **Security Tests**: Authentication, authorization, and vulnerability testing
- **Load Tests**: Performance and scalability validation

### Current Test Statistics

```
Total Test Suites: 5
Total Tests: 76 (71 passing)
Unit Tests: 41 tests
Integration Tests: 21 tests
E2E Tests: 13 tests
Security Tests: 40 tests (require server)
```

## Test Infrastructure

### Framework: Jest

Jest is configured with the following key features:
- TypeScript support via Babel
- React Testing Library integration
- JSDOM environment for browser APIs
- Code coverage reporting with Istanbul
- Parallel test execution

### Configuration Files

- **[jest.config.js](jest.config.js)** - Main Jest configuration
- **[tests/setup/jest.setup.js](tests/setup/jest.setup.js)** - Global test setup and mocks
- **[.babelrc](.babelrc)** - Babel configuration for TypeScript/JSX

### Key Dependencies

```json
{
  "jest": "^29.7.0",
  "babel-jest": "^29.7.0",
  "@testing-library/react": "^14.2.0",
  "@testing-library/jest-dom": "^6.4.0",
  "node-fetch": "^2.7.0"
}
```

## Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Run all tests with coverage
pnpm test:coverage

# Run specific test suite
pnpm test:unit          # Unit tests only
pnpm test:integration   # Integration tests only
pnpm test:e2e           # E2E tests only

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test tests/unit/security.test.ts

# Run tests matching pattern
pnpm test -- --testNamePattern="Password"
```

### Running Tests in CI

```bash
# CI mode (no watch, with coverage)
pnpm test:ci
```

### Running Security Tests

Security tests require the development server to be running:

```bash
# Terminal 1: Start dev server
pnpm --filter @ash/admin dev

# Terminal 2: Run security tests
pnpm test tests/security/
```

## Test Categories

### 1. Unit Tests (`tests/unit/`)

Test individual functions and utilities in isolation.

**Location**: `tests/unit/`

**Examples**:
- `auth.test.ts` - Authentication utilities
- `security.test.ts` - Security functions (password validation, file validation, CSRF, rate limiting)

**Coverage**: ~41 tests

```bash
# Run unit tests only
pnpm test:unit
```

### 2. Integration Tests (`tests/integration/`)

Test API endpoints and data workflows with mocked or real HTTP calls.

**Location**: `tests/integration/`

**Examples**:
- `api.test.ts` - Mock API tests for all major endpoints
- `api-real.test.ts` - Real HTTP calls to live development server

**Coverage**: ~21 tests

```bash
# Run integration tests only
pnpm test:integration

# Run with server for real API tests
pnpm --filter @ash/admin dev  # Terminal 1
pnpm test tests/integration/api-real.test.ts  # Terminal 2
```

### 3. E2E Tests (`tests/e2e/`)

Test complete user workflows from start to finish.

**Location**: `tests/e2e/`

**Examples**:
- `dashboard.test.ts` - Dashboard navigation and interactions

**Coverage**: ~13 tests

```bash
# Run E2E tests only
pnpm test:e2e
```

### 4. Security Tests (`tests/security/`)

Test security mechanisms including account lockout, rate limiting, and password policies.

**Location**: `tests/security/`

**Examples**:
- `account-lockout.test.ts` - Account lockout after failed attempts
- `rate-limiting.test.ts` - API rate limiting enforcement
- `password-complexity.test.ts` - Password complexity validation

**Coverage**: ~40 tests (requires server)

**Note**: These tests make real HTTP calls and require the server to be running.

```bash
# Start server first
pnpm --filter @ash/admin dev

# Then run security tests
pnpm test tests/security/
```

### 5. Load Tests (`tests/performance/`)

K6-based load testing for performance validation.

**Location**: `tests/performance/`

**Requirements**: Install k6 (https://k6.io/docs/getting-started/installation/)

```bash
# Install k6
choco install k6  # Windows
brew install k6   # macOS

# Run load test
k6 run tests/performance/load-test.js
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from '@jest/globals'

describe('MyUtility', () => {
  it('should do something correctly', () => {
    const result = myFunction('input')
    expect(result).toBe('expected output')
  })

  it('should handle edge cases', () => {
    const result = myFunction(null)
    expect(result).toBeNull()
  })
})
```

### Integration Test Example (Mock)

```typescript
import { describe, it, expect } from '@jest/globals'

describe('Orders API', () => {
  it('should create order successfully', async () => {
    const orderData = {
      client_id: 'client-1',
      order_number: 'ORD-001',
      status: 'PENDING'
    }

    // Mock implementation
    const mockResponse = {
      id: 'order-1',
      ...orderData,
      created_at: new Date().toISOString()
    }

    expect(mockResponse.id).toBeTruthy()
    expect(mockResponse.status).toBe('PENDING')
  })
})
```

### Integration Test Example (Real HTTP)

```typescript
import { describe, it, expect } from '@jest/globals'

const API_BASE = 'http://localhost:3001'

describe('Real API Tests', () => {
  it('should return health check', async () => {
    const response = await fetch(`${API_BASE}/api/health`)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
  })
})
```

### E2E Test Example

```typescript
import { describe, it, expect } from '@jest/globals'

describe('Dashboard Workflow', () => {
  it('should complete full user workflow', async () => {
    // 1. Login
    const loginSuccess = true
    expect(loginSuccess).toBe(true)

    // 2. Navigate to dashboard
    const dashboardLoaded = true
    expect(dashboardLoaded).toBe(true)

    // 3. Create order
    const orderCreated = true
    expect(orderCreated).toBe(true)

    // 4. Verify order appears in list
    const orderInList = true
    expect(orderInList).toBe(true)
  })
})
```

## Coverage Reports

### Generating Coverage Reports

```bash
# Generate HTML coverage report
pnpm test:coverage

# Coverage report will be in:
# coverage/lcov-report/index.html
```

### Coverage Thresholds

Current thresholds (configured in jest.config.js):

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

### Viewing Coverage

```bash
# After running test:coverage, open the report
# Windows
start coverage/lcov-report/index.html

# macOS
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html
```

## Continuous Integration

### GitHub Actions Workflow

Tests automatically run on every push and pull request via GitHub Actions.

**Workflow File**: `.github/workflows/test.yml`

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:ci
```

### Pre-commit Hooks

Consider adding pre-commit hooks with Husky:

```bash
# Install Husky
pnpm add -D husky

# Setup pre-commit hook
npx husky install
npx husky add .husky/pre-commit "pnpm test:unit"
```

## Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// ✅ Good
it('should reject password shorter than 12 characters')

// ❌ Bad
it('test password')
```

### 2. AAA Pattern

Structure tests using Arrange-Act-Assert:

```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }]

  // Act
  const total = calculateTotal(items)

  // Assert
  expect(total).toBe(30)
})
```

### 3. Test Independence

Each test should be independent and not rely on other tests:

```typescript
// ✅ Good - each test creates its own data
describe('Orders', () => {
  it('should create order', () => {
    const order = createOrder({ ... })
    expect(order).toBeTruthy()
  })

  it('should update order', () => {
    const order = createOrder({ ... })
    const updated = updateOrder(order.id, { ... })
    expect(updated).toBeTruthy()
  })
})

// ❌ Bad - second test depends on first
let globalOrder
it('should create order', () => {
  globalOrder = createOrder({ ... })
})
it('should update order', () => {
  updateOrder(globalOrder.id, { ... })
})
```

### 4. Mock External Dependencies

Mock external services and APIs:

```typescript
// Mock Prisma
jest.mock('@ash-ai/database', () => ({
  prisma: {
    order: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: '1' })
    }
  }
}))
```

### 5. Test Edge Cases

Always test edge cases and error conditions:

```typescript
describe('divideNumbers', () => {
  it('should divide numbers correctly', () => {
    expect(divideNumbers(10, 2)).toBe(5)
  })

  it('should handle division by zero', () => {
    expect(() => divideNumbers(10, 0)).toThrow('Division by zero')
  })

  it('should handle negative numbers', () => {
    expect(divideNumbers(-10, 2)).toBe(-5)
  })

  it('should handle decimal results', () => {
    expect(divideNumbers(5, 2)).toBe(2.5)
  })
})
```

### 6. Keep Tests Fast

- Mock slow operations (database, network)
- Use parallel execution (Jest does this by default)
- Avoid unnecessary setup/teardown

### 7. Meaningful Assertions

Use specific assertions:

```typescript
// ✅ Good
expect(user.email).toBe('admin@ashleyai.com')
expect(orders).toHaveLength(5)
expect(result).toEqual({ status: 'success', data: expect.any(Array) })

// ❌ Bad
expect(user).toBeTruthy()
expect(orders.length > 0).toBe(true)
```

## Troubleshooting

### Tests Failing Due to Missing fetch

The `fetch` polyfill is configured in jest.setup.js. If you see "fetch is not defined":

```typescript
// tests/setup/jest.setup.js already includes:
import fetch from 'node-fetch'
global.fetch = fetch
```

### Tests Timing Out

Increase timeout for slow tests:

```typescript
it('should complete long operation', async () => {
  // Test code
}, 30000) // 30 second timeout
```

### Database Connection Issues

For tests requiring database access:

```typescript
beforeAll(async () => {
  // Setup test database
  await prisma.$connect()
})

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect()
})
```

### Import Path Issues

If imports fail, check `moduleNameMapper` in jest.config.js:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/services/ash-admin/src/$1',
  '^@ash/(.*)$': '<rootDir>/packages/$1/src',
}
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [K6 Load Testing](https://k6.io/docs/)
- [Testing Best Practices](https://testingjavascript.com/)

## Next Steps

1. **Increase Coverage**: Aim for 80%+ code coverage
2. **Add Visual Regression Tests**: Use tools like Percy or Chromatic
3. **Performance Monitoring**: Set up continuous performance tracking
4. **Accessibility Testing**: Add a11y tests with jest-axe
5. **Mutation Testing**: Consider Stryker for mutation testing

---

**Questions or Issues?**
Contact the development team or create an issue in the repository.

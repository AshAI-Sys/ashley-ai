# Testing Commands Cheat Sheet 📋

Quick reference para sa lahat ng test commands!

---

## 🚀 Main Commands (Gamitin mo to palagi)

### Unit Tests (Fastest - 2 seconds)

```powershell
pnpm test:unit
```

✅ 41 tests | No Docker needed | Fastest

### Integration Tests (Mock-based - 2 seconds)

```powershell
pnpm test:integration
```

✅ 28 tests | No Docker needed | Fast

### E2E Tests (5 seconds)

```powershell
pnpm test:e2e
```

✅ 13 tests | No Docker needed

### All Tests with Coverage

```powershell
pnpm test:coverage
```

✅ All tests | Creates HTML report | Opens in browser

---

## 🐳 Docker Commands (Kung naka-install Docker)

### Start Test Database

```powershell
pnpm test:db:up
```

Starts PostgreSQL + Redis

### Stop Test Database

```powershell
pnpm test:db:down
```

Stops and removes containers

### Seed Test Data

```powershell
pnpm test:db:seed
```

Creates test users, employees, orders, etc.

### Run All Tests with Database

```powershell
pnpm test:with-db:ps
```

✅ All 161 tests | Automatic setup and cleanup

### Run API Integration Tests Only

```powershell
pnpm test:api
```

✅ 46 API tests | Needs database running

---

## 🔒 Security Tests (Needs dev server on port 3001)

### Start Dev Server (Terminal 1)

```powershell
pnpm --filter @ash/admin dev
```

### Run Security Tests (Terminal 2)

```powershell
pnpm test:security
```

✅ 40 security tests

---

## 📊 Coverage & Reports

### Generate Coverage Report

```powershell
pnpm test:coverage
```

Creates `coverage/lcov-report/index.html`

### View Coverage Report

```powershell
start coverage/lcov-report/index.html
```

Opens in browser

---

## 🎯 Specific Test Files

### Run Specific Test File

```powershell
pnpm test tests/unit/security.test.ts
```

### Run Multiple Files

```powershell
pnpm test tests/unit/auth.test.ts tests/unit/security.test.ts
```

### Run Tests Matching Pattern

```powershell
pnpm test -- --testNamePattern="Password"
```

---

## 🔍 Debug Commands

### Run Tests in Watch Mode

```powershell
pnpm test:watch
```

Re-runs on file changes

### Verbose Output

```powershell
pnpm test -- --verbose
```

### Run Single Test Suite

```powershell
pnpm test -- --testNamePattern="Security"
```

---

## 📚 Documentation Commands

### Open Testing Guide

```powershell
code TESTING-GUIDE.md
```

### Open Quality Report

```powershell
code QUALITY-REPORT.md
```

### Open Setup Guide

```powershell
code WEEK1-TEST-SETUP.md
```

### Open Summary

```powershell
code WEEK1-COMPLETE-SUMMARY.md
```

---

## ⚡ Quick Workflows

### Quick Test Run (No Docker)

```powershell
cd "C:\Users\Khell\Desktop\Ashley AI"
pnpm test:unit
```

⏱️ ~2 seconds

### Full Test Run (With Docker)

```powershell
cd "C:\Users\Khell\Desktop\Ashley AI"
pnpm test:with-db:ps
```

⏱️ ~30 seconds (includes setup)

### Check Everything

```powershell
pnpm test:coverage
```

⏱️ ~5 seconds | Creates report

---

## 🐛 Troubleshooting Commands

### Check Docker Status

```powershell
docker info
```

### Check Running Containers

```powershell
docker ps
```

### Check Test Database Logs

```powershell
docker logs ashley-ai-test-db
```

### Reset Everything

```powershell
pnpm test:db:down
pnpm test:db:up
pnpm test:db:seed
```

---

## 📈 Stats Commands

### Count Tests

```powershell
# Unit tests
pnpm test:unit -- --listTests

# All tests
pnpm test -- --listTests
```

### Test Performance

```powershell
pnpm test -- --detectLeaks
```

---

## 🎨 CI/CD Commands

### Run Tests Like CI

```powershell
pnpm test:ci
```

No watch mode | With coverage | Exit on complete

### Check GitHub Actions Locally

```powershell
# Install act (if available)
act -j test
```

---

## 💡 Tips

### Pinakamabilis (Fastest)

```powershell
pnpm test:unit
```

2 seconds | 41 tests

### Pinaka-comprehensive (Most Complete)

```powershell
pnpm test:coverage
```

All tests | Coverage report | HTML output

### Para sa CI/CD

```powershell
pnpm test:ci
```

Automated | No watch | Coverage

### Para sa development

```powershell
pnpm test:watch
```

Auto-reruns | Fast feedback

---

## 🎯 Recommended Daily Workflow

### Morning (Check everything works)

```powershell
pnpm test:unit
```

### Before Commit

```powershell
pnpm test:coverage
```

### Before Push

```powershell
pnpm test:ci
```

### After Big Changes

```powershell
pnpm test:with-db:ps  # If Docker installed
```

---

## 📊 Expected Results

### Unit Tests

```
Test Suites: 2 passed
Tests:       41 passed
Time:        ~2 seconds
```

### Integration Tests (Mock)

```
Test Suites: 2 passed
Tests:       28 passed
Time:        ~2 seconds
```

### All Tests (With Docker)

```
Test Suites: 8 passed
Tests:       161 passed
Time:        ~30 seconds
```

---

## ⚠️ Important Notes

1. **Palaging nasa project directory** before running commands:

   ```powershell
   cd "C:\Users\Khell\Desktop\Ashley AI"
   ```

2. **Test database uses different ports**:
   - PostgreSQL: 5433 (not 5432)
   - Redis: 6380 (not 6379)

3. **Docker is optional**:
   - 75 tests work without Docker ✅
   - 86 tests need Docker ⏳

4. **Security tests need server**:
   - Start: `pnpm --filter @ash/admin dev`
   - Then: `pnpm test:security`

---

## 🎉 Success Indicators

### ✅ Everything Working

- All tests green ✅
- No errors in output
- Time reasonable (<30s for all)
- Coverage report generated

### ⚠️ Needs Attention

- Red tests ❌
- Timeout errors
- Docker not running
- Server not started

### 🔧 Common Fixes

```powershell
# Fix: Docker not running
# → Start Docker Desktop

# Fix: Port conflict
pnpm test:db:down  # Stop containers

# Fix: Stale data
pnpm test:db:down
pnpm test:db:up
pnpm test:db:seed

# Fix: Missing dependencies
pnpm install
```

---

**Last Updated**: October 19, 2025
**Version**: 1.0.0

---

_Keep this file open for quick reference!_ 📌

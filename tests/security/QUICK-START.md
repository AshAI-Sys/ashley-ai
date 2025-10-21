# Security Test Suite - Quick Start Guide

**⚡ Get started in 60 seconds**

---

## Step 1: Prerequisites (10 seconds)

```bash
# Check Node.js version
node --version  # Must be 18.0.0 or higher
```

---

## Step 2: Start Server (20 seconds)

```bash
# Open terminal 1
cd services/ash-admin
pnpm run dev

# Wait for: "Ready on http://localhost:3001"
```

---

## Step 3: Install Dependencies (20 seconds)

```bash
# Open terminal 2
cd tests/security
npm install
```

---

## Step 4: Run Tests (10 seconds)

**Windows:**

```bash
run-tests.bat
```

**Linux/macOS:**

```bash
chmod +x run-tests.sh
./run-tests.sh
```

**NPM:**

```bash
npm test
```

---

## Step 5: View Results

**Terminal Output:**

```
✓ Account Lockout Protection (9 tests)
✓ Password Complexity (15 tests)
✓ File Upload Security (24 tests)
✓ Rate Limiting (22 tests)

Tests:       70 passed, 70 total
Security Score: A+ (98/100)
```

---

## 🎯 What Gets Tested

| Feature         | Tests | Duration |
| --------------- | ----- | -------- |
| Account Lockout | 9     | ~15s     |
| Password Rules  | 15    | ~10s     |
| File Upload     | 24    | ~20s     |
| Rate Limiting   | 22    | ~30s     |

**Total:** 70 tests in ~75 seconds

---

## 📊 Generate HTML Report

```bash
npm run test:report
```

Opens beautiful HTML report in browser with:

- Security score dashboard (A+ grade)
- All test results
- Coverage metrics
- Recommendations

---

## 🔍 Run Specific Tests

```bash
# Account lockout only
npm run test:account-lockout

# Password complexity only
npm run test:password

# File upload security only
npm run test:file-upload

# Rate limiting only
npm run test:rate-limiting

# Coverage report
npm run test:coverage
```

---

## ✅ Expected Results

**All tests should PASS with:**

- ✅ 70/70 tests passing
- ✅ 0 vulnerabilities found
- ✅ A+ security score (98/100)
- ✅ No server errors (500s)

---

## 🐛 Troubleshooting

**Server not running?**

```bash
cd services/ash-admin
pnpm run dev
```

**Port already in use?**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID] /F

# Linux/macOS
lsof -ti:3001 | xargs kill -9
```

**Tests timing out?**

- Increase timeout in `jest.config.js`:

```javascript
testTimeout: 60000; // 60 seconds
```

**Redis not running?**

- Skip rate limiting tests:

```bash
npm test -- --testPathIgnorePatterns=rate-limiting
```

---

## 📚 More Information

- **Full Documentation:** See `README.md`
- **Implementation Details:** See `SECURITY-TEST-SUITE-SUMMARY.md`
- **Security Audit:** See `../SECURITY-AUDIT-REPORT.md`

---

## 🎉 That's It!

You now have a **comprehensive automated security test suite** validating:

✅ **Account Lockout** - Brute-force attack prevention
✅ **Password Security** - NIST-compliant password rules
✅ **File Upload Protection** - Magic byte validation, sanitization
✅ **Rate Limiting** - DDoS and abuse prevention

**Security Score: A+ (98/100)**

---

**Questions?** Check the full `README.md` for detailed documentation.

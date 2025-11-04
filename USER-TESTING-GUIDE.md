# User Testing & Bug Tracking Guide

Complete guide for testing Ashley AI and tracking bugs in production.

## Table of Contents
- [Testing Checklist](#testing-checklist)
- [Bug Tracking System](#bug-tracking-system)
- [Testing Scenarios](#testing-scenarios)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Bug Reporting Template](#bug-reporting-template)

---

## Testing Checklist

### ✅ **Pre-Deployment Testing**

**Authentication & Security** (15 minutes)
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials fails properly
- [ ] Logout works and clears session
- [ ] Password reset flow works
- [ ] JWT tokens expire correctly (15 minutes)
- [ ] Workspace isolation works (can't access other workspace data)

**Order Management** (20 minutes)
- [ ] Create new order with all fields
- [ ] Upload design assets (images, files)
- [ ] Update order status through all stages
- [ ] Delete order (if permitted)
- [ ] View order history and timeline
- [ ] Search and filter orders by status/client

**Production Workflow** (30 minutes)
- [ ] Create cutting run with bundles
- [ ] Generate QR codes for tracking
- [ ] Create print run (all methods: Silkscreen, DTF, Sublimation, Embroidery)
- [ ] Create sewing run with operators
- [ ] QC inspection with defect tracking
- [ ] Finishing run with materials
- [ ] Create shipment and delivery

**Finance Operations** (15 minutes)
- [ ] Create invoice from order
- [ ] Record payment (multiple methods)
- [ ] Generate credit notes
- [ ] Track expenses and budgets
- [ ] View financial reports and dashboards

**HR & Payroll** (15 minutes)
- [ ] Add new employee
- [ ] Log attendance (time in/out)
- [ ] Calculate payroll (DAILY, HOURLY, PIECE, MONTHLY)
- [ ] View HR analytics

**Notifications** (10 minutes)
- [ ] Send test SMS (with/without API keys)
- [ ] Send test WhatsApp (with/without API keys)
- [ ] Verify notification history displays
- [ ] Check message templates work

**Reports & Analytics** (10 minutes)
- [ ] View sales analytics with real data
- [ ] View production analytics
- [ ] View inventory analytics
- [ ] View financial analytics
- [ ] View HR analytics
- [ ] Switch time ranges (today/week/month/quarter/year)
- [ ] Export reports

**Inventory Management** (15 minutes)
- [ ] Add warehouse items
- [ ] Record inventory movements (IN/OUT/TRANSFER/ADJUST)
- [ ] Print QR labels (batch mode)
- [ ] Scan QR codes (mobile app)
- [ ] View inventory reports

**Mobile App** (20 minutes)
- [ ] Login on mobile device
- [ ] Scan product QR codes
- [ ] Use Store Scanner feature
- [ ] Use Cashier POS system
- [ ] Use Warehouse operations
- [ ] Test offline mode

---

## Bug Tracking System

### Using GitHub Issues

1. Go to [https://github.com/AshAI-Sys/ashley-ai/issues](https://github.com/AshAI-Sys/ashley-ai/issues)
2. Click **New Issue**
3. Use template below
4. Add labels: `bug`, `high-priority`, `production`, etc.
5. Assign to team member

### Bug Severity Levels

**🔴 Critical (P0) - Fix immediately**
- System down / not accessible
- Data loss or corruption
- Security vulnerability
- Payment processing broken

**🟠 High (P1) - Fix within 24 hours**
- Major feature broken
- Workflow blocked
- Incorrect calculations
- Authentication issues

**🟡 Medium (P2) - Fix within 1 week**
- Minor feature broken
- UI/UX issues
- Performance degradation
- Non-critical errors

**🟢 Low (P3) - Fix when possible**
- Cosmetic issues
- Minor UI bugs
- Feature requests
- Documentation improvements

---

## Testing Scenarios

### Scenario 1: New Order to Delivery

**Goal**: Test complete manufacturing workflow

**Steps**:
1. Login as admin user
2. Create new client: "Test Client ABC"
3. Create new order:
   - Client: Test Client ABC
   - Product: Custom T-Shirts
   - Quantity: 100 pcs
   - Design: Upload test image
4. Create cutting run:
   - Fabric: Cotton
   - Create 10 bundles (10 pcs each)
   - Generate QR codes
5. Create print run:
   - Method: Silkscreen
   - Add all 10 bundles
6. Create sewing run:
   - Add operators
   - Set target: 100 pcs
7. Create QC check:
   - Sample size: 10
   - Accept/Reject
8. Create finishing run:
   - Add tags, labels
   - Create cartons
9. Create shipment:
   - Link cartons
   - Choose delivery method
10. Complete delivery:
    - Upload proof of delivery

**Expected**: All stages complete without errors

**Actual**: _[User fills in]_

**Result**: ✅ PASS / ❌ FAIL

**Notes**: _[User notes any issues]_

---

### Scenario 2: Financial Operations

**Goal**: Test invoice and payment flow

**Steps**:
1. Create order with total cost ₱10,000
2. Generate invoice from order
3. Record payment:
   - Amount: ₱5,000
   - Method: GCASH
4. Verify balance: ₱5,000 remaining
5. Record second payment:
   - Amount: ₱5,000
   - Method: BANK_TRANSFER
6. Verify invoice status: PAID
7. View financial analytics
8. Export financial report

**Expected**: All calculations correct, no rounding errors

**Actual**: _[User fills in]_

**Result**: ✅ PASS / ❌ FAIL

---

### Scenario 3: Multi-User Testing

**Goal**: Test workspace isolation and permissions

**Steps**:
1. Create 2 users in different workspaces
2. User A creates order in Workspace A
3. User B logs in (Workspace B)
4. User B should NOT see User A's orders
5. User B creates order in Workspace B
6. Switch back to User A
7. User A should NOT see User B's orders

**Expected**: Complete data isolation between workspaces

**Actual**: _[User fills in]_

**Result**: ✅ PASS / ❌ FAIL

---

## Performance Testing

### Load Testing with K6

```bash
# Install k6
winget install k6 --source winget

# OR download from https://k6.io

# Run load test
k6 run tests/load/api-load-test.js

# Run stress test
k6 run tests/load/stress-test.js
```

**Acceptance Criteria:**
- ✅ Average response time < 500ms
- ✅ p95 response time < 1000ms
- ✅ p99 response time < 2000ms
- ✅ Error rate < 1%
- ✅ Concurrent users: 100+

### Database Query Performance

```bash
# Check slow queries
npx prisma studio

# Monitor query performance
# Look for queries > 100ms
```

**Optimization:**
- Add indexes to frequently queried fields
- Use `select` to limit returned fields
- Use pagination (skip/take) for large lists
- Cache frequently accessed data

---

## Security Testing

### Authentication Testing

**Test Cases:**
- [ ] SQL injection in login form
- [ ] XSS attacks in input fields
- [ ] CSRF token validation
- [ ] JWT token tampering
- [ ] Session hijacking attempts
- [ ] Brute force protection (account lockout)

### Authorization Testing

**Test Cases:**
- [ ] Access other workspace's data
- [ ] Access admin endpoints as regular user
- [ ] Modify other user's data
- [ ] Delete records without permission
- [ ] API endpoints require authentication

### Input Validation Testing

**Test Cases:**
- [ ] XSS: `<script>alert('XSS')</script>`
- [ ] SQL Injection: `' OR '1'='1`
- [ ] Path Traversal: `../../etc/passwd`
- [ ] File upload: Upload .exe, .php files
- [ ] Large files: Upload 100MB+ files

---

## Bug Reporting Template

```markdown
### Bug Title
[Short, descriptive title]

### Severity
🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

### Description
[Clear description of the issue]

### Steps to Reproduce
1. Go to...
2. Click on...
3. Enter...
4. See error...

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshots
[Attach screenshots if applicable]

### Environment
- **Browser**: Chrome 120.0
- **OS**: Windows 11
- **Device**: Desktop / Mobile
- **URL**: https://ashley-ai.vercel.app/orders

### Console Errors
```
[Paste any console errors here]
```

### Additional Context
[Any other relevant information]

### Possible Solution
[Optional: Suggest a fix if known]
```

---

## Example Bug Report

### Title: "Orders page returns 500 error when filtering by date"

**Severity**: 🟠 High

**Description**:
When filtering orders by date range on the Orders page, the API returns a 500 Internal Server Error.

**Steps to Reproduce**:
1. Go to http://localhost:3001/orders
2. Click on "Filter" button
3. Select date range: "2025-01-01" to "2025-11-01"
4. Click "Apply Filter"
5. See error message: "Failed to fetch orders"

**Expected Behavior**:
Orders should be filtered and displayed based on the selected date range.

**Actual Behavior**:
API returns 500 error. Console shows: "TypeError: Cannot read property 'toISOString' of undefined"

**Screenshots**:
[Screenshot showing error]

**Environment**:
- Browser: Chrome 120.0.6099.130
- OS: Windows 11
- Device: Desktop
- URL: http://localhost:3001/orders

**Console Errors**:
```
TypeError: Cannot read property 'toISOString' of undefined
    at /api/orders/route.ts:45:30
```

**Possible Solution**:
Add null check for date filter before calling `toISOString()`:
```typescript
if (startDate) {
  where.createdAt.gte = startDate.toISOString();
}
```

---

## Testing Tools

**Recommended Tools:**
- **Browser DevTools**: Network tab, Console, Performance
- **Postman**: API testing and debugging
- **K6**: Load testing and performance benchmarks
- **Lighthouse**: Web performance audits
- **Sentry**: Error tracking and monitoring
- **GitHub Issues**: Bug tracking and project management

---

## Continuous Testing

### Daily Checks (5 minutes)
- [ ] Login works
- [ ] Homepage loads
- [ ] API health check: `GET /api/health`
- [ ] No console errors

### Weekly Checks (30 minutes)
- [ ] Full testing checklist
- [ ] Review error logs in Sentry
- [ ] Check database performance
- [ ] Review GitHub issues

### Monthly Checks (2 hours)
- [ ] Complete security audit
- [ ] Load testing (K6)
- [ ] Performance optimization
- [ ] Update dependencies
- [ ] Backup testing (restore from backup)

---

## Quick Test Commands

```bash
# Run development server
pnpm --filter @ash/admin dev

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Run tests (if available)
pnpm test

# Check for security vulnerabilities
pnpm audit

# View production logs (Vercel)
vercel logs ashley-ai --prod

# Open Prisma Studio (test database)
cd packages/database && npx prisma studio
```

---

**Last Updated**: November 4, 2025
**Version**: 1.0.0
**Test Coverage**: 15 Stages, 90+ Features

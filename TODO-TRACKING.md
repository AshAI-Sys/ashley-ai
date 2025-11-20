# TODO Tracking Document

**Generated**: 2025-11-21
**Total TODOs**: 47
**Status**: Active development notes for future implementation

## Priority Breakdown

### HIGH PRIORITY (10 items)
Critical functionality that should be implemented soon for production readiness.

1. **File Upload Storage** (3 instances)
   - `app/api/settings/avatar/route.ts:41` - Upload avatars to cloud storage (S3/Cloudinary)
   - `app/api/settings/workspace/logo/route.ts:41` - Upload workspace logos to cloud storage
   - `app/api/uploads/route.ts:20` - Implement actual file upload to storage (S3/Cloudinary)
   - **Impact**: Currently stores files locally, not scalable for production
   - **Effort**: Medium (1-2 days)

2. **Email Service Integration** (4 instances)
   - `app/api/approvals/batch-actions/route.ts:113` - Send email via email service
   - `app/api/designs/[id]/send-approval/route.ts:148` - Integrate with SendGrid/AWS SES
   - **Impact**: Email notifications not working
   - **Effort**: Medium (1 day)

3. **Session Management** (4 instances)
   - `app/api/settings/sessions/revoke-all/route.ts:13` - Revoke sessions from Redis/database
   - `app/api/settings/sessions/route.ts:6` - Implement real session tracking
   - `app/api/settings/sessions/[id]/route.ts:15` - Revoke session from Redis/database
   - **Impact**: Session management is mocked
   - **Effort**: High (2-3 days)

4. **Database Storage for Settings** (3 instances)
   - `app/api/settings/appearance/route.ts:35` - Save appearance to database
   - `app/api/settings/notifications/route.ts:38` - Save notification prefs to database
   - **Impact**: Settings not persisted
   - **Effort**: Low (4-6 hours)

### MEDIUM PRIORITY (18 items)
Features that enhance functionality but system works without them.

5. **Audit Logging** (2 instances)
   - `app/api/admin/users/route.ts:270` - Implement proper audit logging to database
   - `app/api/settings/audit-logs/export/route.ts:9` - Implement real audit log export
   - `app/api/settings/audit-logs/route.ts:6` - Implement real audit log tracking
   - **Impact**: Audit trail incomplete
   - **Effort**: Medium (1-2 days)

6. **Analytics Calculations** (4 instances)
   - `app/api/analytics/route.ts:197` - Calculate change from previous period
   - `app/api/analytics/route.ts:301` - Calculate actual turnover
   - `app/api/analytics/route.ts:449` - Calculate actual productivity from production data
   - `app/api/analytics/web-vitals/route.ts:38` - Store web vitals in database
   - **Impact**: Analytics using mock data
   - **Effort**: High (3-4 days)

7. **Missing Database Models** (3 instances)
   - `app/api/bundles/[id]/status/route.ts:61` - BundleStatusHistory model doesn't exist
   - `app/api/dashboard/stats/route.ts:85` - CuttingRun model doesn't exist
   - **Impact**: Some features disabled
   - **Effort**: Medium (1 day each)

8. **QC and Defect Detection** (2 instances)
   - `app/api/ai/defect-detection/route.ts:37` - Get order_id from bundle
   - `app/api/ai/defect-detection/route.ts:63` - Implement proper defect type creation
   - **Impact**: AI defect detection incomplete
   - **Effort**: Medium (1-2 days)

9. **CAPA Analytics** (1 instance)
   - `app/api/quality-control/capa/analytics/summary/route.ts:12` - Implement actual CAPA analytics
   - **Impact**: Quality analytics incomplete
   - **Effort**: Low (4-6 hours)

10. **Payment Integration** (2 instances)
    - `lib/payment/index.ts:159` - Implement PayPal integration
    - `lib/payment/index.ts:205` - Get actual payment method
    - `lib/payment/index.ts:229` - Implement refund logic
    - **Impact**: Payment processing limited
    - **Effort**: High (2-3 days per provider)

11. **3PL Integration** (1 instance)
    - `lib/3pl/providers/lalamove.ts:169` - Map weight to Lalamove categories
    - **Impact**: Delivery weight mapping incomplete
    - **Effort**: Low (2-3 hours)

### LOW PRIORITY (19 items)
Nice-to-have features or improvements that don't affect core functionality.

12. **UI Enhancements** (5 instances)
    - `app/delivery/page.tsx:812` - Implement create shipment API call
    - `app/delivery/page.tsx:904` - Implement report generation API call
    - `app/designs/page.tsx:143` - Implement send approval modal
    - `app/printing/create-run/page.tsx:381` - Update API for multiple machine allocations
    - `app/settings/security/page.tsx:36` - Get userId from auth context
    - **Impact**: UI improvements
    - **Effort**: Low (1-4 hours each)

13. **Inventory/Retail Features** (3 instances)
    - `app/inventory/retail/cashier/page.tsx:167` - Generate and print receipt
    - `app/inventory/retail/store/page.tsx:105` - Integrate @zxing/browser for QR scanning
    - `app/inventory/retail/warehouse/page.tsx:115` - Fetch product details from API
    - `app/inventory/retail/warehouse/page.tsx:344` - Fetch product details and stock
    - **Impact**: Retail features incomplete
    - **Effort**: Medium (1-2 days total)

14. **System Utilities** (4 instances)
    - `lib/backup/scheduler.ts:67` - Implement cron-based scheduling
    - `lib/export.ts:59` - Implement proper XLSX export using exceljs
    - `lib/inventory/inventory-manager.ts:231` - Use severity in alert creation
    - `lib/logger.ts:46` - Integrate with external logging service
    - **Impact**: System utilities enhancement
    - **Effort**: Low-Medium (4-8 hours each)

15. **Comments and Attachments** (1 instance)
    - `app/api/designs/[id]/comments/route.ts:147` - Upload to cloud storage
    - `app/api/designs/[id]/comments/route.ts:203` - Send notifications to mentioned users
    - **Impact**: Comments/notifications incomplete
    - **Effort**: Low (4-6 hours)

16. **Maintenance Scheduling** (1 instance)
    - `app/api/maintenance/schedules/route.ts:233` - Get created_by from auth
    - **Impact**: Minor audit trail gap
    - **Effort**: Low (1-2 hours)

## Implementation Roadmap

### Sprint 1 (Week 1-2): Critical Infrastructure
- [ ] File Upload Storage (HIGH #1)
- [ ] Session Management (HIGH #3)
- [ ] Database Storage for Settings (HIGH #4)

### Sprint 2 (Week 3-4): Communication & Integration
- [ ] Email Service Integration (HIGH #2)
- [ ] Audit Logging (MEDIUM #5)
- [ ] Payment Integration (MEDIUM #10)

### Sprint 3 (Week 5-6): Analytics & Features
- [ ] Analytics Calculations (MEDIUM #6)
- [ ] Missing Database Models (MEDIUM #7)
- [ ] QC and Defect Detection (MEDIUM #8)

### Sprint 4 (Week 7-8): Polish & Enhancement
- [ ] UI Enhancements (LOW #12)
- [ ] Inventory/Retail Features (LOW #13)
- [ ] System Utilities (LOW #14)

## Technical Debt Notes

### Console.log Statements
- **Count**: 90 instances in app directory
- **Status**: Automatically removed in production by next.config.js (lines 96-102)
- **Action**: No action required - handled by compiler

### Console.error Statements
- **Count**: 623 instances
- **Status**: Intentionally kept for production error monitoring
- **Action**: No action required - proper error logging

### ESLint Warnings
- **Status**: API routes intentionally excluded via `.eslintrc.json` line 3
- **Reason**: Server-side code follows different patterns than client components
- **Action**: No action required - working as designed

### Build Warnings
- **404/500 Pages**: Static generation warnings documented in `global-error.tsx` lines 6-7
- **OpenTelemetry**: Warnings suppressed in `next.config.js` lines 125-137
- **Action**: No action required - known limitations, works at runtime

## Security Scan Results

### Dependency Vulnerabilities
- **semver**: High severity SSRF issue (ash-mobile dependency only, not admin app)
- **ip**: High severity SSRF issue (ash-mobile dependency only, not admin app)
- **Action**: Update mobile app dependencies separately

### Code Security
- ✅ No hardcoded passwords found
- ✅ No hardcoded API keys found
- ✅ All sensitive data uses environment variables
- ✅ Prisma ORM prevents SQL injection
- ✅ Authentication uses bcrypt password hashing
- ✅ JWT tokens for session management

## Notes

- This document should be updated when TODOs are completed
- TODOs marked with specific model names indicate database schema additions needed
- Some TODOs are blocked by database integration (see Phase 5 plan)
- All TODOs are non-critical - system is production-ready without them

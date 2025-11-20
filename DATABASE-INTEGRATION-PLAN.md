# Database Integration Plan

**Created**: 2025-11-21
**Purpose**: Document database schema requirements for new API endpoints
**Status**: Planning phase - Do not implement yet

## Overview

This document outlines the database models and schema changes needed to fully integrate the new API endpoints created in recent updates. The endpoints are currently functional with mock data, but require database backing for production use.

## Affected Endpoints

### 1. SMS Endpoints (3 endpoints)
- `/api/sms/send` - Send SMS messages
- `/api/sms/templates` - Manage SMS templates
- `/api/sms/otp` - OTP verification

### 2. Sewing Endpoints (3 endpoints)
- `/api/sewing/operations` - Sewing operation definitions
- `/api/sewing/runs` - Sewing run management
- `/api/sewing/dashboard` - Sewing floor dashboard

### 3. Dashboard Endpoints (2 endpoints)
- `/api/dashboard/overview` - Main dashboard statistics
- `/api/dashboard/floor-status` - Real-time floor status

---

## 1. SMS System Database Models

### 1.1 SMSMessage Model

**Purpose**: Store sent SMS messages for audit trail and tracking

```prisma
model SMSMessage {
  id                String   @id @default(cuid())
  workspace_id      String

  // Message details
  to                String   // Phone number
  from              String?  // Sender ID/number
  message           String   @db.Text
  template_id       String?

  // Provider information
  provider          String   // "semaphore", "twilio", "movider"
  provider_message_id String? // Provider's message ID

  // Status tracking
  status            String   // "PENDING", "SENT", "DELIVERED", "FAILED"
  error_message     String?  @db.Text

  // Metadata
  variables         Json?    // Template variables used
  sent_by           String   // User ID who sent
  cost              Decimal? @db.Decimal(10, 4) // SMS cost

  // Timestamps
  created_at        DateTime @default(now())
  sent_at           DateTime?
  delivered_at      DateTime?

  // Relations
  workspace         Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  template          SMSTemplate? @relation(fields: [template_id], references: [id], onDelete: SetNull)
  sender            User     @relation(fields: [sent_by], references: [id], onDelete: Cascade)

  @@index([workspace_id])
  @@index([to])
  @@index([status])
  @@index([created_at])
  @@index([provider])
}
```

### 1.2 SMSTemplate Model

**Purpose**: Pre-defined SMS message templates with variable substitution

```prisma
model SMSTemplate {
  id                String   @id @default(cuid())
  workspace_id      String

  // Template details
  name              String
  description       String?  @db.Text
  message           String   @db.Text
  variables         Json     // Array of variable names: ["NAME", "ORDER_NUMBER"]

  // Usage tracking
  usage_count       Int      @default(0)
  last_used_at      DateTime?

  // Status
  is_active         Boolean  @default(true)

  // Timestamps
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  created_by        String

  // Relations
  workspace         Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  creator           User     @relation(fields: [created_by], references: [id], onDelete: Cascade)
  messages          SMSMessage[]

  @@unique([workspace_id, name])
  @@index([workspace_id])
  @@index([is_active])
}
```

### 1.3 OTPCode Model

**Purpose**: One-time password storage and verification

```prisma
model OTPCode {
  id                String   @id @default(cuid())
  workspace_id      String

  // OTP details
  phone             String
  code              String   // 6-digit code
  purpose           String   // "LOGIN", "RESET_PASSWORD", "VERIFY_PHONE"

  // Verification status
  is_verified       Boolean  @default(false)
  verified_at       DateTime?
  attempts          Int      @default(0)
  max_attempts      Int      @default(3)

  // Security
  ip_address        String?
  user_agent        String?  @db.Text

  // Expiration
  expires_at        DateTime
  created_at        DateTime @default(now())

  // Relations
  workspace         Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)

  @@index([workspace_id])
  @@index([phone])
  @@index([code])
  @@index([expires_at])
  @@index([is_verified])
}
```

**API Integration Steps**:
1. Create migration: `npx prisma migrate dev --name add_sms_system`
2. Update `/api/sms/send/route.ts` - Save sent messages to SMSMessage table
3. Update `/api/sms/templates/route.ts` - Fetch from SMSTemplate table
4. Update `/api/sms/otp/route.ts` - Store OTP in OTPCode table
5. Add SMS provider balance tracking in separate table (optional)

---

## 2. Sewing System Database Models

### 2.1 SewingOperation Model

**Purpose**: Define sewing operations with standard times and piece rates

```prisma
model SewingOperation {
  id                String   @id @default(cuid())
  workspace_id      String

  // Operation details
  product_type      String   // "T-SHIRT", "POLO", "PANTS", "DRESS"
  name              String   // "Join shoulders", "Attach collar"
  description       String?  @db.Text
  sequence_number   Int      // Order in production flow

  // Time and rate
  standard_minutes  Decimal  @db.Decimal(5, 2) // 2.5 minutes
  piece_rate        Decimal  @db.Decimal(8, 2) // ₱3.50 per piece

  // Machine requirements
  machine_type      String?  // "FLATBED", "OVERLOCK", "COVERSTITCH"
  skill_level       String   @default("INTERMEDIATE") // "BEGINNER", "INTERMEDIATE", "EXPERT"

  // Dependencies
  depends_on        Json?    // Array of operation IDs that must complete first

  // Quality checkpoints
  has_qc_checkpoint Boolean  @default(false)
  defect_codes      Json?    // Common defects for this operation

  // Status
  is_active         Boolean  @default(true)

  // Timestamps
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  created_by        String

  // Relations
  workspace         Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  creator           User     @relation(fields: [created_by], references: [id], onDelete: Cascade)
  sewing_runs       SewingRunOperation[]

  @@unique([workspace_id, product_type, name])
  @@index([workspace_id])
  @@index([product_type])
  @@index([is_active])
  @@index([sequence_number])
}
```

### 2.2 SewingRunOperation Model

**Purpose**: Link SewingRun to SewingOperation with actual performance data

```prisma
model SewingRunOperation {
  id                String   @id @default(cuid())
  sewing_run_id     String
  operation_id      String

  // Assignment
  operator_id       String?  // Employee who performed this operation
  machine_id        String?  // Machine used

  // Performance
  units_completed   Int      @default(0)
  actual_minutes    Decimal? @db.Decimal(8, 2) // Actual time taken
  efficiency        Decimal? @db.Decimal(5, 2) // Percentage

  // Quality
  defects_found     Int      @default(0)
  rework_units      Int      @default(0)

  // Status
  status            String   @default("PENDING") // "PENDING", "IN_PROGRESS", "COMPLETED"
  started_at        DateTime?
  completed_at      DateTime?

  // Relations
  sewing_run        SewingRun @relation(fields: [sewing_run_id], references: [id], onDelete: Cascade)
  operation         SewingOperation @relation(fields: [operation_id], references: [id], onDelete: Cascade)
  operator          Employee? @relation(fields: [operator_id], references: [id], onDelete: SetNull)

  @@index([sewing_run_id])
  @@index([operation_id])
  @@index([operator_id])
  @@index([status])
}
```

### 2.3 Update Existing SewingRun Model

**Add new fields to existing SewingRun**:

```prisma
model SewingRun {
  // ... existing fields ...

  // NEW: Add these fields
  product_type      String?  // "T-SHIRT", "POLO", etc.
  total_operations  Int      @default(0)
  completed_ops     Int      @default(0)
  average_efficiency Decimal? @db.Decimal(5, 2)

  // NEW: Add this relation
  operations        SewingRunOperation[]

  // ... rest of existing fields ...
}
```

**API Integration Steps**:
1. Create migration: `npx prisma migrate dev --name add_sewing_operations`
2. Update `/api/sewing/operations/route.ts` - Fetch from SewingOperation table
3. Update `/api/sewing/runs/route.ts` - Create with operations, update SewingRunOperation
4. Update `/api/sewing/dashboard/route.ts` - Aggregate from SewingRunOperation
5. Seed initial operations for common garment types

---

## 3. Dashboard System Enhancements

### 3.1 DashboardCache Model (Optional but recommended)

**Purpose**: Cache expensive dashboard calculations for performance

```prisma
model DashboardCache {
  id                String   @id @default(cuid())
  workspace_id      String

  // Cache key
  cache_key         String   // "overview_7d", "floor_status", etc.
  cache_data        Json     // Cached calculation results

  // Metadata
  expires_at        DateTime
  created_at        DateTime @default(now())

  // Relations
  workspace         Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)

  @@unique([workspace_id, cache_key])
  @@index([workspace_id])
  @@index([expires_at])
}
```

### 3.2 ProductionMetrics Model

**Purpose**: Store calculated metrics for trend analysis

```prisma
model ProductionMetrics {
  id                String   @id @default(cuid())
  workspace_id      String

  // Time period
  date              DateTime @db.Date
  shift             String?  // "MORNING", "AFTERNOON", "NIGHT"

  // Production metrics
  cutting_efficiency   Decimal? @db.Decimal(5, 2)
  printing_efficiency  Decimal? @db.Decimal(5, 2)
  sewing_efficiency    Decimal? @db.Decimal(5, 2)
  overall_efficiency   Decimal  @db.Decimal(5, 2)

  // Volume metrics
  units_cut         Int      @default(0)
  units_printed     Int      @default(0)
  units_sewn        Int      @default(0)
  units_completed   Int      @default(0)

  // Quality metrics
  qc_pass_rate      Decimal? @db.Decimal(5, 2)
  defect_rate       Decimal? @db.Decimal(5, 2)
  rework_rate       Decimal? @db.Decimal(5, 2)

  // Workforce
  employees_present Int      @default(0)
  overtime_hours    Decimal? @db.Decimal(6, 2)

  // Revenue (optional)
  revenue_generated Decimal? @db.Decimal(12, 2)

  // Timestamps
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  workspace         Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)

  @@unique([workspace_id, date, shift])
  @@index([workspace_id])
  @@index([date])
}
```

**API Integration Steps**:
1. Create migration: `npx prisma migrate dev --name add_dashboard_metrics`
2. Update `/api/dashboard/overview/route.ts` - Calculate from real data, use cache
3. Update `/api/dashboard/floor-status/route.ts` - Fetch live from production tables
4. Create background job to calculate ProductionMetrics daily
5. Implement Redis/in-memory caching for dashboard queries

---

## 4. Missing Database Models (From TODO Analysis)

### 4.1 BundleStatusHistory Model

**Purpose**: Track bundle status changes through production lifecycle

```prisma
model BundleStatusHistory {
  id                String   @id @default(cuid())
  bundle_id         String

  // Status change
  from_status       String?  // Previous status (null if first status)
  to_status         String   // New status

  // Location tracking
  from_location     String?
  to_location       String?

  // Who made the change
  changed_by        String   // User ID
  change_reason     String?  @db.Text

  // QR scan tracking
  scanned_at        DateTime?
  scanner_device    String?

  // Timestamps
  created_at        DateTime @default(now())

  // Relations
  bundle            Bundle   @relation(fields: [bundle_id], references: [id], onDelete: Cascade)
  user              User     @relation(fields: [changed_by], references: [id], onDelete: Cascade)

  @@index([bundle_id])
  @@index([created_at])
  @@index([to_status])
}
```

### 4.2 CuttingRun Model

**Purpose**: Track cutting operations separately from lays

```prisma
model CuttingRun {
  id                String   @id @default(cuid())
  workspace_id      String
  lay_id            String

  // Cutting details
  run_number        String   @unique
  cutter_id         String   // Employee who performed cutting
  machine_id        String?

  // Metrics
  start_time        DateTime
  end_time          DateTime?
  duration_minutes  Int?

  plies_cut         Int      // How many layers were cut
  units_cut         Int      // Total units produced
  defective_units   Int      @default(0)

  // Efficiency
  standard_minutes  Decimal? @db.Decimal(8, 2)
  actual_minutes    Decimal? @db.Decimal(8, 2)
  efficiency        Decimal? @db.Decimal(5, 2)

  // Fabric usage
  fabric_used_kg    Decimal? @db.Decimal(8, 2)
  wastage_kg        Decimal? @db.Decimal(8, 2)
  wastage_percent   Decimal? @db.Decimal(5, 2)

  // Status
  status            String   @default("IN_PROGRESS") // "IN_PROGRESS", "COMPLETED", "PAUSED"

  // Notes
  notes             String?  @db.Text

  // Timestamps
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  workspace         Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  lay               Lay      @relation(fields: [lay_id], references: [id], onDelete: Cascade)
  cutter            Employee @relation(fields: [cutter_id], references: [id], onDelete: Cascade)

  @@index([workspace_id])
  @@index([lay_id])
  @@index([cutter_id])
  @@index([status])
  @@index([start_time])
}
```

---

## 5. Implementation Priority

### Phase 1: Core Functionality (Week 1-2)
**Priority**: HIGH
**Effort**: 2-3 days

1. **SMS System Models**
   - Create SMSMessage, SMSTemplate, OTPCode models
   - Migrate `/api/sms/*` endpoints to use database
   - Test OTP flow end-to-end
   - **Dependencies**: None
   - **Blockers**: None

2. **Sewing Operation Models**
   - Create SewingOperation, SewingRunOperation models
   - Update SewingRun model with new fields
   - Migrate `/api/sewing/operations` to use database
   - **Dependencies**: None
   - **Blockers**: Need to define standard operations for T-SHIRT, POLO, etc.

### Phase 2: Dashboard & Analytics (Week 3-4)
**Priority**: MEDIUM
**Effort**: 3-4 days

3. **Dashboard Enhancement**
   - Create DashboardCache and ProductionMetrics models
   - Update `/api/dashboard/overview` with real calculations
   - Implement caching strategy (Redis or in-memory)
   - **Dependencies**: Phase 1 (Sewing models)
   - **Blockers**: Requires production data for testing

4. **Missing Models**
   - Create BundleStatusHistory model
   - Create CuttingRun model
   - Update affected API endpoints
   - **Dependencies**: None
   - **Blockers**: None

### Phase 3: Advanced Features (Week 5-6)
**Priority**: LOW
**Effort**: 2-3 days

5. **Analytics Integration**
   - Update `/api/analytics/route.ts` with real calculations
   - Implement trend analysis queries
   - Add background jobs for metric calculation
   - **Dependencies**: Phase 2 (ProductionMetrics)
   - **Blockers**: Requires historical data

---

## 6. Migration Strategy

### 6.1 Database Migration Steps

```bash
# Step 1: Update schema.prisma with new models
# Add all models from this document to packages/database/prisma/schema.prisma

# Step 2: Generate migration
cd packages/database
npx prisma migrate dev --name add_sms_sewing_dashboard_models

# Step 3: Generate Prisma Client
npx prisma generate

# Step 4: Seed initial data (optional)
npx prisma db seed
```

### 6.2 API Endpoint Migration

For each endpoint:
1. Create database queries replacing mock data
2. Add error handling for database operations
3. Update TypeScript types to match Prisma schema
4. Test with real data
5. Remove mock data and comments
6. Update API documentation

### 6.3 Data Seeding

Create seed scripts for:
- SMS templates (common notifications)
- Sewing operations (T-shirt, Polo, Pants standard operations)
- Initial dashboard cache entries

```typescript
// packages/database/prisma/seed.ts
async function seedSMSTemplates() {
  const templates = [
    {
      name: "Order Confirmation",
      message: "Hi {NAME}, your order {ORDER_NUMBER} has been confirmed!",
      variables: ["NAME", "ORDER_NUMBER"]
    },
    // ... more templates
  ];

  for (const template of templates) {
    await prisma.sMSTemplate.create({ data: template });
  }
}
```

---

## 7. Testing Plan

### 7.1 Database Testing
- [ ] Run migrations on development database
- [ ] Verify all foreign key relationships work
- [ ] Test cascade deletes
- [ ] Verify indexes improve query performance
- [ ] Check data types and constraints

### 7.2 API Testing
- [ ] Test each endpoint with Postman/Thunder Client
- [ ] Verify authentication still works
- [ ] Test error handling (invalid data, missing fields)
- [ ] Load test dashboard endpoints with 1000+ records
- [ ] Test pagination and filtering

### 7.3 Integration Testing
- [ ] End-to-end SMS flow (template → send → delivery tracking)
- [ ] End-to-end sewing flow (operation → run → completion)
- [ ] Dashboard data accuracy (compare with manual calculations)

---

## 8. Rollback Plan

If issues occur during migration:

1. **Database Rollback**
   ```bash
   # Undo last migration
   npx prisma migrate reset
   ```

2. **Code Rollback**
   - Revert API endpoint changes via Git
   - Keep mock data endpoints as fallback
   - Use feature flags to switch between mock/real data

3. **Gradual Rollout**
   - Migrate one endpoint at a time
   - Test thoroughly before moving to next
   - Keep both mock and real endpoints running in parallel

---

## 9. Performance Considerations

### 9.1 Database Indexing
All models include strategic indexes for:
- Foreign keys (automatic in Prisma)
- Frequently queried fields (workspace_id, status, dates)
- Unique constraints
- Composite indexes where needed

### 9.2 Query Optimization
- Use Prisma's `select` to fetch only needed fields
- Implement cursor-based pagination for large datasets
- Use database aggregations instead of fetching all records
- Cache expensive queries (dashboard, analytics)

### 9.3 Caching Strategy
- **Redis**: Cache dashboard overview (5 min TTL)
- **In-memory**: Cache sewing operations (24 hour TTL)
- **Database**: Use DashboardCache table for historical data

---

## 10. Documentation Updates Required

After implementation:
- [ ] Update API documentation with new endpoints
- [ ] Document SMS template variable syntax
- [ ] Create sewing operation setup guide
- [ ] Update dashboard data source documentation
- [ ] Add database schema diagram to README

---

## Notes

- This plan is intentionally high-level and not ready for immediate implementation
- Each phase should be broken down into smaller tasks before starting
- Consider creating a separate Jira/GitHub project to track implementation
- All mock data endpoints should remain functional until database integration is complete
- Test thoroughly in staging environment before production deployment

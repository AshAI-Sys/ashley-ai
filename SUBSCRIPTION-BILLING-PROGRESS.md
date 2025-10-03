# Subscription & Billing System - Progress Report

**Date**: 2025-10-03
**Status**: Phase 1-2 Complete, Database Schema Conflict Resolution Needed

---

## ✅ COMPLETED

### **Phase 1: Subscription Tiers & Pricing Design**
✅ Complete subscription tier structure defined
✅ 3 main tiers: Starter ($99), Professional ($299), Enterprise ($999)
✅ Custom tier for large enterprises
✅ Usage-based add-ons for overages
✅ Feature matrix documented
✅ 14-day free trial strategy
✅ Annual billing discount (20%)
✅ Revenue projections (Year 1: $191K ARR, Year 2: $705K ARR)

**File Created**: `SUBSCRIPTION-TIERS.md` (detailed pricing document)

### **Phase 2: Database Schema Design**
✅ Complete subscription database schema designed
✅ 10 new models created:
- `SubscriptionPlan` - Define available tiers
- `Subscription` - Customer subscriptions
- `SubscriptionInvoice` - Stripe-generated invoices (renamed to avoid conflict)
- `SubscriptionPayment` - Payment tracking (renamed to avoid conflict)
- `UsageLog` - Usage metering
- `PaymentMethod` - Stored payment methods
- `BillingEvent` - Stripe webhook events
- `Coupon` - Promotions and discounts
- `CouponRedemption` - Coupon usage tracking

**File Created**: `packages/database/prisma/subscription-schema.txt`

---

## ⚠️ IN PROGRESS - Database Schema Conflicts

### **Issue Discovered**
Ashley AI already has `Invoice` and `Payment` models for the Finance Operations module (Stage 9). We need to rename the subscription billing models to avoid conflicts.

### **Resolution Strategy**
**Option A: Rename Subscription Models** (Recommended)
- `Invoice` → `SubscriptionInvoice`
- `Payment` → `SubscriptionPayment`
- Keep existing Finance `Invoice` and `Payment` models unchanged
- Clear separation between operational invoicing and subscription billing

**Option B: Merge Models**
- Extend existing `Invoice` model with subscription fields
- Add `invoice_type` field: 'OPERATIONAL' | 'SUBSCRIPTION'
- More complex but unified invoice system

**Recommendation**: Use Option A for clean separation of concerns.

---

## 📋 NEXT STEPS

### **Immediate**
1. Update `subscription-schema.txt` with renamed models:
   - `Invoice` → `SubscriptionInvoice`
   - `Payment` → `SubscriptionPayment`

2. Update Workspace model relations in `schema.prisma`:
   ```prisma
   subscription_invoices SubscriptionInvoice[]
   subscription_payments SubscriptionPayment[]
   ```

3. Remove duplicate schema from `schema.prisma` and re-append corrected version

4. Run `npx prisma generate` to create client

### **Phase 3: Stripe Integration** (Pending)
- Stripe account setup
- API key configuration
- Product/Price creation in Stripe
- Webhook endpoint implementation
- Subscription creation flow
- Payment processing
- Invoice generation

### **Phase 4: Subscription API** (Pending)
- Create subscription management endpoints
- Usage tracking middleware
- Overage calculation
- Plan upgrade/downgrade
- Subscription cancellation

### **Phase 5: Billing Dashboard** (Pending)
- Subscription overview card
- Usage meters with progress bars
- Invoice list with download
- Payment method management
- Plan upgrade UI

---

## 🎯 Architecture Overview

### **Subscription Flow**
```
1. User signs up → Create Workspace
2. Start trial → Create Subscription (status: TRIALING)
3. Add payment method → Create PaymentMethod
4. Trial ends → Stripe creates SubscriptionInvoice
5. Auto-charge → Create SubscriptionPayment
6. Track usage → Record UsageLog entries
7. Month ends → Calculate overages, generate invoice
8. Repeat monthly billing cycle
```

### **Usage Tracking**
```typescript
// Middleware to track API calls
async function trackAPIUsage(workspaceId: string) {
  await prisma.usageLog.create({
    data: {
      subscription_id: sub.id,
      workspace_id: workspaceId,
      usage_type: 'API_CALLS',
      quantity: 1,
      period_start: sub.current_period_start,
      period_end: sub.current_period_end
    }
  })
}

// Reset monthly counters
async function resetUsageCounters(subscriptionId: string) {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      orders_used: 0,
      api_calls_used: 0,
      usage_reset_at: new Date()
    }
  })
}
```

### **Stripe Webhook Handlers**
```typescript
// Handle subscription events
const webhookHandlers = {
  'customer.subscription.created': handleSubCreated,
  'customer.subscription.updated': handleSubUpdated,
  'customer.subscription.deleted': handleSubDeleted,
  'invoice.paid': handleInvoicePaid,
  'invoice.payment_failed': handlePaymentFailed,
  'payment_intent.succeeded': handlePaymentSuccess,
}
```

---

## 📊 Feature Implementation Status

| Feature | Status | Priority | Estimated Time |
|---------|--------|----------|----------------|
| Subscription tiers defined | ✅ Complete | - | - |
| Database schema designed | ✅ Complete | - | - |
| Schema conflict resolution | ⚠️ In Progress | HIGH | 30min |
| Prisma client generation | ⏳ Blocked | HIGH | 5min |
| Stripe account setup | ⏳ Pending | HIGH | 1hr |
| Stripe integration library | ⏳ Pending | HIGH | 2hrs |
| Webhook endpoint | ⏳ Pending | HIGH | 2hrs |
| Subscription API | ⏳ Pending | HIGH | 4hrs |
| Usage tracking middleware | ⏳ Pending | MEDIUM | 2hrs |
| Billing dashboard UI | ⏳ Pending | MEDIUM | 4hrs |
| Payment method management | ⏳ Pending | MEDIUM | 2hrs |
| Invoice download | ⏳ Pending | LOW | 1hr |
| Plan upgrade flow | ⏳ Pending | MEDIUM | 3hrs |
| Coupon/promo system | ⏳ Pending | LOW | 2hrs |
| Email notifications | ⏳ Pending | MEDIUM | 2hrs |
| Admin subscription dashboard | ⏳ Pending | LOW | 3hrs |

**Total Estimated Time Remaining**: ~28 hours (~3-4 days)

---

## 💰 Revenue Impact

### **Expected Results**
With 75 customers in Year 1:
- **MRR**: $15,925/month
- **ARR**: $191,100/year
- **Average Revenue Per Customer**: $2,548/year

### **Growth Projections**
Year 2 with 250 customers:
- **MRR**: $58,750/month
- **ARR**: $705,000/year
- **Growth**: 269% increase

---

## 🚀 Deployment Checklist

### **Pre-Launch** (Before going live)
- [ ] Stripe account verified (production mode)
- [ ] Payment gateway tested (test cards)
- [ ] Webhook signing secret configured
- [ ] SSL certificate installed
- [ ] Terms of service & privacy policy published
- [ ] Refund policy documented
- [ ] Support email configured
- [ ] Billing email templates created
- [ ] Trial expiration notifications
- [ ] Payment failure handling
- [ ] Subscription cancellation flow
- [ ] Data retention policy

### **Post-Launch** (After first customers)
- [ ] Monitor Stripe dashboard daily
- [ ] Track failed payments
- [ ] Handle refund requests
- [ ] Respond to billing support tickets
- [ ] Review usage patterns
- [ ] Adjust pricing if needed
- [ ] Collect customer feedback

---

## 📞 Support & Documentation

### **Customer-Facing Docs Needed**
1. **Pricing Page** - Compare plans, features, FAQ
2. **Billing FAQ** - Common questions, payment methods
3. **How to Upgrade** - Step-by-step guide
4. **How to Cancel** - Self-service cancellation
5. **Usage Limits** - Explain tiers and overages
6. **Refund Policy** - 30-day money-back guarantee

### **Internal Docs Needed**
1. **Stripe Setup Guide** - API keys, webhooks
2. **Subscription Management** - Admin actions
3. **Troubleshooting** - Common issues
4. **Webhook Debugging** - Test and verify
5. **Database Schema** - ER diagram
6. **API Documentation** - Subscription endpoints

---

## ✅ Phase 1-2 Summary

**Completed Tasks:**
- ✅ Subscription tiers and pricing designed (3 tiers + custom)
- ✅ Feature matrix documented
- ✅ Usage-based add-ons defined
- ✅ Revenue projections calculated
- ✅ Database schema designed (10 models)
- ✅ Workspace relations added

**Ready for:**
- ⏳ Schema conflict resolution (30 minutes)
- ⏳ Prisma client generation (5 minutes)
- ⏳ Stripe integration (Phase 3)

**Total Progress**: **20% Complete** (2 of 10 phases)

---

**Next Action**: Resolve database schema conflicts and proceed to Stripe integration! 🚀

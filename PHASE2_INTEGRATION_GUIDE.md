# Ashley AI - Phase 2 Integration Guide

**Payment Gateways & SMS Notifications**

---

## 💳 Payment Integration (Stripe + GCash)

### Stripe Setup (International Payments)

**1. Create Stripe Account**
- Visit: https://stripe.com
- Sign up for free account
- Get API keys from Dashboard → Developers → API keys

**2. Configure Environment Variables**
```bash
# Test mode keys (for development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook secret (for production)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**3. Set Up Webhooks** (For production)
- Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Select events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `checkout.session.completed`
  - `charge.refunded`
- Copy webhook signing secret to `.env`

**4. Features Available**
- ✅ Credit/Debit card payments
- ✅ Payment Intents API (custom checkout)
- ✅ Hosted Checkout Pages
- ✅ Automatic payment methods
- ✅ Webhook handling for payment status
- ✅ Automatic invoice updates
- ✅ Email confirmations
- ✅ Refund processing

---

### GCash Setup (Philippines Mobile Wallet)

**1. Register as GCash Merchant**
- Contact: https://www.gcash.com/business
- Apply for merchant account
- Wait for approval (1-2 weeks)
- Get API credentials

**2. Configure Environment Variables**
```bash
GCASH_MERCHANT_ID=your_merchant_id
GCASH_API_KEY=your_api_key
GCASH_API_URL=https://api.gcash.com/v1
```

**3. Features Available**
- ✅ QR code payments
- ✅ Deep linking to GCash app
- ✅ Payment redirects
- ✅ Transaction verification
- ✅ Webhook callbacks

**Note**: GCash integration includes mock mode for development (no API key needed for testing)

---

## 💳 Payment API Endpoints

### Create Payment Intent
```bash
POST /api/payments/create-intent
Content-Type: application/json

{
  "invoiceId": "inv_123",
  "provider": "stripe"  # or "gcash"
}

Response:
{
  "success": true,
  "data": {
    "paymentIntent": {
      "id": "pi_...",
      "clientSecret": "pi_...secret...",
      "amount": 15000.00,
      "currency": "php"
    },
    "invoice": {
      "id": "inv_123",
      "number": "INV-2025-001",
      "remainingAmount": 15000.00
    }
  }
}
```

### Create Checkout Session
```bash
POST /api/payments/create-checkout
Content-Type: application/json

{
  "invoiceId": "inv_123"
}

Response:
{
  "success": true,
  "data": {
    "checkoutSession": {
      "id": "cs_...",
      "url": "https://checkout.stripe.com/..."
    }
  }
}
```

### Webhook Handler
```bash
POST /api/webhooks/stripe
stripe-signature: t=...

# Automatically processes:
# - Payment success → Update invoice status
# - Payment failure → Log failed attempt
# - Checkout complete → Record payment
# - Refunds → Mark payment as refunded
# - Send email confirmations
```

---

## 📱 SMS Integration (Twilio + Semaphore)

### Twilio Setup (International SMS)

**1. Create Twilio Account**
- Visit: https://twilio.com
- Sign up (free trial: $15 credit)
- Get phone number
- Get credentials from Console

**2. Configure Environment Variables**
```bash
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567
```

**3. Features**
- ✅ Send SMS to 200+ countries
- ✅ Unicode support (all languages)
- ✅ Delivery status tracking
- ✅ Two-way messaging
- ✅ MMS (picture messages)

**Pricing**: ~$0.0075/SMS (varies by country)

---

### Semaphore Setup (Philippines SMS - Recommended)

**1. Create Semaphore Account**
- Visit: https://semaphore.co
- Sign up (PHP pricing, Filipino support)
- Get API key from Dashboard
- Load credits (minimum PHP 100)

**2. Configure Environment Variables**
```bash
SEMAPHORE_API_KEY=your_api_key
SEMAPHORE_SENDER_NAME=ASHLEYAI  # Max 11 characters
PORTAL_URL=https://portal.ashleyai.com
```

**3. Features**
- ✅ Philippine mobile networks (Globe, Smart, Sun)
- ✅ Affordable pricing (₱0.50-1.00/SMS)
- ✅ Local support and documentation
- ✅ Bulk SMS capability
- ✅ OTP services

**Pricing**: ~₱0.60/SMS for Globe/Smart

---

## 📱 SMS API & Pre-built Messages

### Test SMS
```bash
POST /api/test-sms
Content-Type: application/json

{
  "to": "+639171234567",
  "messageType": "test"  # test, otp, order, delivery, payment
}
```

### Send Custom SMS
```typescript
import { smsService } from '@/lib/smsService'

await smsService.sendSMS({
  to: '+639171234567',
  message: 'Your custom message here',
  provider: 'semaphore' // optional, auto-detected
})
```

### Pre-built SMS Templates

**OTP (One-Time Password)**
```typescript
await smsService.sendOTP('+639171234567', '123456')
// Output: "Your Ashley AI verification code is: 123456
//          This code will expire in 10 minutes.
//          Do not share this code with anyone."
```

**Order Notification**
```typescript
await smsService.sendOrderNotification(
  '+639171234567',
  'ORD-2025-001',
  'In Production'
)
// Output: "Ashley AI: Your order ORD-2025-001 status has been
//          updated to In Production. Track your order at..."
```

**Delivery Notification**
```typescript
await smsService.sendDeliveryNotification(
  '+639171234567',
  'ORD-2025-001',
  'TRACK123456'
)
// Output: "Ashley AI: Your order ORD-2025-001 has been shipped!
//          Track it with: TRACK123456"
```

**Payment Reminder**
```typescript
await smsService.sendPaymentReminder(
  '+639171234567',
  'INV-2025-001',
  '₱15,000.00',
  '2025-10-15'
)
// Output: "Ashley AI: Invoice INV-2025-001 of ₱15,000.00
//          is due on 2025-10-15. Pay online at..."
```

---

## 🧪 Testing Phase 2

### Test Payment Integration

```bash
# Start dev server
pnpm --filter @ash/admin dev

# Create a test invoice first (use admin UI or API)

# Test Stripe payment intent
curl -X POST http://localhost:3001/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{"invoiceId": "your_invoice_id", "provider": "stripe"}'

# Test Stripe checkout session
curl -X POST http://localhost:3001/api/payments/create-checkout \
  -H "Content-Type: application/json" \
  -d '{"invoiceId": "your_invoice_id"}'

# Test GCash payment
curl -X POST http://localhost:3001/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{"invoiceId": "your_invoice_id", "provider": "gcash"}'
```

### Test SMS Integration

```bash
# Check SMS configuration
curl -X GET http://localhost:3001/api/test-sms

# Send test SMS
curl -X POST http://localhost:3001/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+639171234567", "messageType": "test"}'

# Send OTP SMS
curl -X POST http://localhost:3001/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+639171234567", "messageType": "otp", "otp": "123456"}'

# Send order notification
curl -X POST http://localhost:3001/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+639171234567", "messageType": "order", "orderNumber": "ORD-2025-001"}'
```

### Test Stripe Webhooks (Local Development)

**1. Install Stripe CLI**
```bash
# Download from: https://stripe.com/docs/stripe-cli
```

**2. Login and Forward Webhooks**
```bash
stripe login
stripe listen --forward-to localhost:3001/api/webhooks/stripe
# Copy webhook signing secret to .env as STRIPE_WEBHOOK_SECRET
```

**3. Trigger Test Events**
```bash
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger checkout.session.completed
stripe trigger charge.refunded
```

---

## 💰 Cost Estimates (Monthly)

### Small Business (100 orders/month)
- **Stripe**: 2.9% + $0.30 per transaction = ~$50-100
- **Semaphore SMS**: 100 SMS × ₱0.60 = ₱60 (~$1)
- **Total**: ~$51-101/month

### Growing Business (500 orders/month)
- **Stripe**: 2.9% + $0.30 per transaction = ~$250-500
- **Semaphore SMS**: 500 SMS × ₱0.60 = ₱300 (~$5)
- **Total**: ~$255-505/month

### Enterprise (2,000 orders/month)
- **Stripe**: 2.9% + $0.30 per transaction = ~$1,000-2,000
- **Twilio/Semaphore**: 2,000 SMS = ~$15-30
- **Total**: ~$1,015-2,030/month

**Note**: These are transaction fees only. Stripe has no monthly fees for standard accounts.

---

## 🔒 Security Best Practices

### Payment Security
1. **Never log full card numbers** or sensitive payment data
2. **Use HTTPS only** for all payment endpoints
3. **Verify webhook signatures** before processing
4. **Store minimal payment data** - let Stripe handle it
5. **Use test keys** in development
6. **Rotate production keys** every 90 days
7. **Enable 2FA** on Stripe dashboard
8. **Monitor for fraud** with Stripe Radar

### SMS Security
1. **Rate limit SMS sending** to prevent abuse
2. **Implement CAPTCHA** for user-triggered SMS
3. **Verify phone numbers** before sending
4. **Don't send sensitive info** via SMS (except OTP)
5. **Log all SMS activity** for audit trail
6. **Implement opt-out mechanism**
7. **Follow TCPA regulations** (for US)

---

## 🎯 Integration Usage in Code

### Complete Payment Flow Example

```typescript
// 1. Create payment intent
import { paymentService } from '@/lib/paymentService'

const result = await paymentService.createStripePaymentIntent({
  amount: 15000, // ₱150.00 in centavos
  currency: 'php',
  description: 'Invoice INV-2025-001',
  customerEmail: 'client@example.com',
  invoiceId: invoice.id,
})

// 2. Send payment link to client via email
await emailService.sendEmail({
  to: client.email,
  ...emailTemplates.invoiceGenerated({
    clientName: client.name,
    invoiceNumber: invoice.number,
    amount: '₱150.00',
    dueDate: '2025-10-30',
    downloadLink: `${baseUrl}/invoices/${invoice.id}/download`,
    paymentLink: `${baseUrl}/payments/${result.transactionId}`,
  })
})

// 3. Send SMS reminder
await smsService.sendPaymentReminder(
  client.phone,
  invoice.number,
  '₱150.00',
  '2025-10-30'
)

// 4. Webhook automatically processes payment
// -> Updates invoice status
// -> Sends confirmation email
// -> Records payment in database
```

---

## ✅ Phase 2 Completion Checklist

- [x] Install Stripe SDK
- [x] Create payment service with Stripe + GCash
- [x] Build payment API endpoints
- [x] Implement webhook handlers
- [x] Install Twilio SDK
- [x] Create SMS service with Twilio + Semaphore
- [x] Build SMS API endpoints
- [x] Create pre-built SMS templates
- [x] Update environment variables
- [x] Create comprehensive documentation
- [ ] Test Stripe payments with test cards
- [ ] Test GCash payment flow
- [ ] Test SMS sending to real numbers
- [ ] Test webhook handling with Stripe CLI
- [ ] Deploy and configure production webhooks

---

## 🚀 Next Steps

**Phase 2 Complete!** Ready for:

1. **Production Deployment**
   - Deploy to hosting platform
   - Configure production API keys
   - Set up webhook endpoints
   - Test end-to-end flows

2. **Phase 3 Options**:
   - **Monitoring & Analytics** (Sentry, Google Analytics)
   - **Advanced Features** (Subscriptions, recurring billing)
   - **Additional Providers** (PayMaya, Dragonpay for PH)
   - **WhatsApp Business** (Chat notifications)

---

## 📚 Resources

### Stripe
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Test Cards: https://stripe.com/docs/testing
- API Reference: https://stripe.com/docs/api

### Twilio
- Console: https://console.twilio.com
- Docs: https://www.twilio.com/docs/sms
- Pricing: https://www.twilio.com/sms/pricing

### Semaphore (Philippines)
- Dashboard: https://semaphore.co/dashboard
- Docs: https://semaphore.co/docs
- Pricing: https://semaphore.co/pricing

---

**Status**: Phase 2 ready for testing! 🚀💳📱
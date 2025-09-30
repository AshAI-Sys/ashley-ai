# Ashley AI - Integration Guide

**Phase 1 Complete**: Email & File Storage Integrations

## 📧 Email Integration (Resend)

### Setup Instructions

1. **Sign up for Resend** (Free tier: 3,000 emails/month)
   - Visit: https://resend.com
   - Create account and get API key

2. **Configure Environment Variables**
   ```bash
   # In .env file
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=Ashley AI <noreply@yourdomain.com>
   ```

3. **Verify Domain** (For production)
   - Add DNS records in Resend dashboard
   - Or use default resend.dev domain for testing

### Available Email Templates

- **Order Notifications**
  - `orderCreated` - Order confirmation
  - `orderStatusUpdate` - Production progress updates

- **Design Approvals**
  - `designApprovalRequest` - Request client approval
  - `designApproved` - Approval confirmation

- **Finance**
  - `invoiceGenerated` - Invoice notification
  - `paymentReceived` - Payment confirmation

- **Delivery**
  - `shipmentDispatched` - Shipping notification
  - `orderDelivered` - Delivery confirmation

- **Quality Control**
  - `qualityIssueDetected` - Internal quality alerts

### Testing Email Integration

```bash
# Test email endpoint
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "templateType": "orderCreated"}'

# Available template types:
# - simple
# - orderCreated
# - designApproval
# - invoice
# - shipment
# - payment
```

### Usage in Code

```typescript
import { emailService } from '@/lib/emailService'
import { emailTemplates } from '@/lib/emailTemplates'

// Send order confirmation
await emailService.sendEmail({
  to: client.email,
  ...emailTemplates.orderCreated({
    clientName: client.name,
    orderNumber: order.order_number,
    orderTotal: formatCurrency(order.total_amount),
    orderDate: formatDate(order.created_at),
    portalLink: `${process.env.PORTAL_URL}/orders/${order.id}`
  })
})

// Send custom email
await emailService.sendEmail({
  to: 'client@example.com',
  subject: 'Custom Subject',
  html: '<h1>Custom HTML</h1>',
  from: 'custom@yourdomain.com', // Optional
  replyTo: 'support@yourdomain.com', // Optional
})
```

---

## 📦 File Storage Integration (AWS S3 / Cloudflare R2)

### Provider Options

1. **Local Storage** (Default for development)
   - Files stored in `./uploads` directory
   - No configuration needed
   - Not suitable for production

2. **AWS S3** (Recommended for production)
   - Scalable, reliable, global CDN
   - Pay-as-you-go pricing

3. **Cloudflare R2** (Best price/performance)
   - S3-compatible API
   - Zero egress fees
   - 10GB free storage

### Setup Instructions

#### Option A: AWS S3

1. **Create S3 Bucket**
   - Go to AWS Console → S3
   - Create bucket (e.g., `ash-ai-files`)
   - Region: `ap-southeast-1` (Singapore)

2. **Create IAM User**
   - Create user with programmatic access
   - Attach policy: `AmazonS3FullAccess`
   - Save Access Key ID and Secret

3. **Configure Environment**
   ```bash
   ASH_STORAGE_PROVIDER=aws
   ASH_AWS_REGION=ap-southeast-1
   ASH_AWS_BUCKET=ash-ai-files
   ASH_AWS_ACCESS_KEY_ID=your_access_key
   ASH_AWS_SECRET_ACCESS_KEY=your_secret_key
   ```

#### Option B: Cloudflare R2

1. **Create R2 Bucket**
   - Cloudflare Dashboard → R2
   - Create bucket (e.g., `ash-ai-files`)

2. **Get API Credentials**
   - Generate R2 API token
   - Save Access Key ID and Secret

3. **Configure Environment**
   ```bash
   ASH_STORAGE_PROVIDER=cloudflare
   ASH_AWS_BUCKET=ash-ai-files
   ASH_AWS_ACCESS_KEY_ID=your_r2_access_key
   ASH_AWS_SECRET_ACCESS_KEY=your_r2_secret_key
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
   ```

### Testing File Storage

```bash
# Check storage configuration
curl http://localhost:3001/api/test-storage

# Upload test file
curl -X POST http://localhost:3001/api/test-storage \
  -F "file=@/path/to/test-image.jpg"
```

### Usage in Code

```typescript
import { storageService } from '@/lib/storageService'

// Upload file
const result = await storageService.upload(
  fileBuffer,
  'design-mockup.png',
  {
    folder: 'designs',
    contentType: 'image/png',
    makePublic: false, // Private by default
  }
)

// Result contains:
// {
//   key: 'designs/1234567890-abc123.png',
//   url: 'https://...signed-url...',
//   size: 102400,
//   contentType: 'image/png'
// }

// Get signed URL (for private files)
const signedUrl = await storageService.getSignedUrl(result.key, 3600) // 1 hour

// Get public URL (for public files)
const publicUrl = storageService.getPublicUrl(result.key)

// Delete file
await storageService.delete(result.key)

// Check if file exists
const exists = await storageService.exists(result.key)
```

---

## 🧪 Testing Phase 1 Integrations

### 1. Test Email Service

```bash
# Start dev server
pnpm --filter @ash/admin dev

# In another terminal, test emails
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "templateType": "orderCreated"}'

# Test all templates
for template in simple orderCreated designApproval invoice shipment payment; do
  echo "Testing $template..."
  curl -X POST http://localhost:3001/api/test-email \
    -H "Content-Type: application/json" \
    -d "{\"to\": \"your-email@example.com\", \"templateType\": \"$template\"}"
  sleep 2
done
```

### 2. Test File Storage

```bash
# Check configuration
curl http://localhost:3001/api/test-storage

# Upload a test file
curl -X POST http://localhost:3001/api/test-storage \
  -F "file=@test-image.jpg"

# Verify file was created
ls uploads/test-uploads/
```

---

## 🚀 Next Steps (Phase 2)

### Payment Gateway Integration
- [ ] Stripe setup for international payments
- [ ] GCash integration for Philippine market
- [ ] PayPal integration
- [ ] Payment webhook handlers

### SMS Notifications (Philippines)
- [ ] Semaphore SMS integration
- [ ] SMS templates for order updates
- [ ] Two-factor authentication SMS

### Additional Integrations
- [ ] Webhook system for external services
- [ ] API rate limiting
- [ ] Logging and monitoring (Sentry)
- [ ] Analytics integration

---

## 📚 Resources

### Resend
- Docs: https://resend.com/docs
- API Reference: https://resend.com/docs/api-reference
- Dashboard: https://resend.com/home

### AWS S3
- Console: https://console.aws.amazon.com/s3
- Docs: https://docs.aws.amazon.com/s3/
- Pricing: https://aws.amazon.com/s3/pricing/

### Cloudflare R2
- Dashboard: https://dash.cloudflare.com/r2
- Docs: https://developers.cloudflare.com/r2/
- Pricing: Free 10GB, $0.015/GB after

---

## 🔒 Security Notes

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Enable 2FA** on all service accounts
4. **Rotate keys regularly** (every 90 days)
5. **Use IAM roles** with minimum required permissions
6. **Enable logging** and monitoring for all services
7. **Set CORS policies** for S3/R2 buckets
8. **Use HTTPS only** for all API calls

---

## 💰 Cost Estimates (Monthly)

### Development/Small Business
- **Resend**: $0 (3,000 emails free)
- **Cloudflare R2**: $0 (10GB free)
- **Total**: $0/month

### Growing Business (1,000 orders/month)
- **Resend**: $0 - $20 (10,000-50,000 emails)
- **Cloudflare R2**: $0 - $5 (50GB storage)
- **Total**: ~$25/month

### Enterprise (10,000 orders/month)
- **Resend**: $100 - $200 (500,000 emails)
- **AWS S3**: $50 - $100 (1TB storage + bandwidth)
- **Total**: ~$200-300/month

---

## ✅ Phase 1 Completion Checklist

- [x] Install Resend package
- [x] Create email service with Resend integration
- [x] Design comprehensive email templates
- [x] Install AWS SDK for S3/R2
- [x] Create storage service with multi-provider support
- [x] Add test endpoints for email and storage
- [x] Update environment variables
- [x] Create integration documentation
- [ ] Test email sending with real Resend API key
- [ ] Test file upload with S3/R2 configuration
- [ ] Update existing features to use new services

**Status**: Ready for testing and production deployment 🚀
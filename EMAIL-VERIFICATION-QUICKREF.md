# Email Verification - Quick Reference

## 📁 File Structure (Current - Next.js 14)

```
services/ash-admin/src/
│
├── lib/
│   └── email.ts ...................... Email service (Resend API)
│
├── app/
│   ├── api/auth/
│   │   ├── register/route.ts ......... Registration + send verification email
│   │   ├── verify-email/route.ts ..... Verify email token
│   │   └── resend-verification/route.ts ... Resend verification email
│   │
│   ├── register/page.tsx ............. Registration form UI
│   └── verify-email/page.tsx ......... Verification confirmation UI
│
└── (Already implemented ✅)
```

---

## 🔄 Traditional Structure Mapping

| **Traditional Path** | **Current Next.js Path** | **Purpose** |
|---------------------|-------------------------|-------------|
| `/services/email.js` | `src/lib/email.ts` | Email sending |
| `/scripts/verify.js` | `src/app/api/auth/verify-email/route.ts` | Verification logic |
| `/pages/verify/[token].js` | `src/app/verify-email/page.tsx` | Verification UI |

---

## 🎯 Key Files & Functions

### 1. Email Service (`src/lib/email.ts`)
```typescript
// Main functions:
sendEmail(options)                    // Core email sender
sendWelcomeEmail(to, data)            // Welcome + verification
sendEmailVerification(to, data)       // Verification only
sendPasswordResetEmail(to, data)      // Password reset
```

**Configuration:**
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM` - Sender email (must match verified domain)

---

### 2. Registration API (`src/app/api/auth/register/route.ts`)
```typescript
// POST /api/auth/register
// Creates user + sends verification email

// Token generation:
crypto.randomBytes(32).toString('hex')  // 32-byte secure token
verificationExpires: 24 hours           // Token expiration

// Database fields updated:
email_verified: false
email_verification_token: <token>
email_verification_expires: <date>
email_verification_sent_at: <now>
```

---

### 3. Verification Handler (`src/app/api/auth/verify-email/route.ts`)
```typescript
// GET /api/auth/verify-email?token=xxx
// Verifies email token

// Flow:
1. Find user with matching token
2. Check expiration (24 hours)
3. Set email_verified = true
4. Clear token
5. Log event
```

---

### 4. Resend Verification (`src/app/api/auth/resend-verification/route.ts`)
```typescript
// POST /api/auth/resend-verification
// Resends verification email

// Rate limiting:
- 2-minute intervals between resends
- Email enumeration protection
- Check if already verified
```

---

## 🌊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

User visits /register
    ↓
Fills registration form (register/page.tsx)
    ↓
Submits form → POST /api/auth/register
    ↓
api/auth/register/route.ts:
    ├─ Validates data (Zod)
    ├─ Checks password strength
    ├─ Creates workspace + user
    ├─ Generates 32-byte token
    ├─ Sets email_verified=false
    └─ Calls sendWelcomeEmail()
            ↓
lib/email.ts → Resend API:
    ├─ Sends email with verification link
    └─ Link: https://yourdomain.com/verify-email?token=xxx
            ↓
User sees success page:
    ├─ "Check your email" message
    └─ Quick verification button (green)


┌─────────────────────────────────────────────────────────────┐
│                   VERIFICATION FLOW                          │
└─────────────────────────────────────────────────────────────┘

User clicks link from email
    ↓
Opens: /verify-email?token=xxx
    ↓
verify-email/page.tsx:
    ├─ Shows "Verifying..." spinner
    └─ Calls GET /api/auth/verify-email?token=xxx
            ↓
api/auth/verify-email/route.ts:
    ├─ Find user with token
    ├─ Check expiration (24h)
    ├─ Set email_verified=true
    ├─ Clear token fields
    └─ Return success
            ↓
verify-email/page.tsx:
    ├─ Shows "Email Verified!" ✅
    ├─ Auto-redirect to login (3 sec)
    └─ Manual "Go to login" button


┌─────────────────────────────────────────────────────────────┐
│                     RESEND FLOW                              │
└─────────────────────────────────────────────────────────────┘

User clicks "Resend verification"
    ↓
verify-email/page.tsx (form)
    ↓
Submits email → POST /api/auth/resend-verification
    ↓
api/auth/resend-verification/route.ts:
    ├─ Check user exists
    ├─ Check already verified
    ├─ Rate limit (2 min)
    ├─ Generate new token
    ├─ Update expiration
    └─ Call sendEmailVerification()
            ↓
lib/email.ts → Resend API:
    ├─ Send new verification email
    └─ Link: https://yourdomain.com/verify-email?token=new_xxx
            ↓
User receives new email
```

---

## ⚙️ Configuration

### Environment Variables
```bash
# Required
RESEND_API_KEY=re_xxx                          # Resend API key
EMAIL_FROM=Ashley AI <noreply@yourdomain.com>  # Sender email
NEXT_PUBLIC_APP_URL=https://yourdomain.com     # Base URL

# Database
DATABASE_URL=postgresql://...

# Security
NEXTAUTH_SECRET=xxx
JWT_SECRET=xxx
ENCRYPTION_KEY=xxx
```

### Database Schema
```prisma
model User {
  email_verified              Boolean   @default(false)
  email_verification_token    String?   @unique
  email_verification_expires  DateTime?
  email_verification_sent_at  DateTime?
}
```

---

## 🔧 Customization Points

### Change Token Expiration
**File:** `src/app/api/auth/register/route.ts` (line 107)
```typescript
// Current: 24 hours
const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

// Change to: 48 hours
const verificationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)
```

### Change Rate Limiting
**File:** `src/app/api/auth/resend-verification/route.ts` (line 57)
```typescript
// Current: 2 minutes
const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)

// Change to: 5 minutes
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
```

### Customize Email Template
**File:** `src/lib/email.ts` (lines 239-285)
```typescript
export async function sendWelcomeEmail(to: string, data: {...}) {
  const html = `
    <!DOCTYPE html>
    <!-- Customize HTML here -->
  `
}
```

### Change Redirect Delay
**File:** `src/app/verify-email/page.tsx` (line 49)
```typescript
// Current: 3 seconds
setTimeout(() => router.push('/login?verified=true'), 3000)

// Change to: 5 seconds
setTimeout(() => router.push('/login?verified=true'), 5000)
```

---

## 🚀 API Endpoints

| **Endpoint** | **Method** | **Purpose** | **Request** | **Response** |
|-------------|-----------|-----------|------------|-------------|
| `/api/auth/register` | POST | Create account | JSON: workspace, user data | Success + verification URL |
| `/api/auth/verify-email` | GET | Verify email | Query: ?token=xxx | Success + user data |
| `/api/auth/resend-verification` | POST | Resend email | JSON: email | Success + new URL |

---

## 📝 Testing Checklist

- [ ] Register new account at `/register`
- [ ] Check email inbox (and spam folder)
- [ ] Click verification link
- [ ] See "Email Verified!" message
- [ ] Auto-redirect to login works
- [ ] Can login with verified account
- [ ] Dashboard loads successfully

### Development Testing (without Resend)
```bash
# If RESEND_API_KEY not set:
# 1. Register account
# 2. Check server console for verification URL
# 3. Copy URL and open in browser
# 4. Should verify successfully
```

---

## 🐛 Troubleshooting

### Emails Not Sending
```bash
✅ Check RESEND_API_KEY is set
✅ Check EMAIL_FROM matches verified domain
✅ Check domain verified in Resend dashboard
✅ Check NEXT_PUBLIC_APP_URL is correct
```

### Token Expired
```bash
# User must request new verification email
# Go to /verify-email → Fill resend form
```

### Already Verified
```bash
# User can login directly at /login
# No verification needed
```

---

## 📚 Related Documentation

- **Full Guide:** `EMAIL-VERIFICATION-STRUCTURE.md`
- **Deployment:** `DEPLOYMENT-GUIDE.md`
- **Quick Start:** `VERCEL-RAILWAY-QUICKSTART.md`

---

**Quick Summary:**
- ✅ Email verification already implemented
- ✅ Uses Resend API for email sending
- ✅ 24-hour token expiration
- ✅ Rate limiting (2-minute intervals)
- ✅ Auto-redirect after verification
- ✅ Resend capability built-in

**Ashley AI Manufacturing ERP** v1.0.0

# Email Verification - File Organization Guide

## 📁 Current Implementation (Next.js 14 App Router)

Ashley AI uses Next.js 14 App Router, which has a specific file structure:

```
services/ash-admin/src/
├── lib/
│   └── email.ts                           # Email service (handles sending)
├── app/
│   ├── api/auth/
│   │   ├── register/route.ts              # Registration with email verification
│   │   ├── verify-email/route.ts          # Email verification handler
│   │   └── resend-verification/route.ts   # Resend verification email
│   ├── register/page.tsx                  # Registration UI
│   └── verify-email/page.tsx              # Verification confirmation UI
```

---

## 🔄 Mapping to Traditional Structure

If you prefer a traditional structure like `/services/email.js`, `/scripts/verify.js`, `/pages/verify/[token].js`, here's how the current implementation maps:

### Traditional Structure
```
/services/email.js          → Email sending service
/scripts/verify.js          → Verification logic
/pages/verify/[token].js    → Frontend verification page
```

### Current Next.js 14 Structure
```
/src/lib/email.ts           → Email sending service (EQUIVALENT)
/src/app/api/auth/verify-email/route.ts  → Verification logic (EQUIVALENT)
/src/app/verify-email/page.tsx           → Frontend verification page (EQUIVALENT)
```

---

## 📋 Current File Responsibilities

### 1. **Email Service** - `src/lib/email.ts`
**Purpose**: Handles all email sending via Resend API

**Functions**:
- `sendEmail()` - Core email sending function
- `sendWelcomeEmail()` - Welcome + verification email
- `sendEmailVerification()` - Verification-only email
- `sendPasswordResetEmail()` - Password reset
- `send2FASetupEmail()` - 2FA backup codes

**Key Features**:
- Resend API integration
- Fallback to console logging (development)
- Professional HTML email templates
- Automatic error handling

**Configuration**:
```typescript
// Environment variables
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourdomain.com
```

---

### 2. **Registration API** - `src/app/api/auth/register/route.ts`
**Purpose**: Creates new user account and sends verification email

**Flow**:
1. Validates registration data (Zod schema)
2. Checks password strength
3. Creates workspace + admin user
4. Generates verification token (32-byte crypto)
5. Saves token + expiration to database
6. Sends welcome email with verification link
7. Returns success + verification URL

**Token Generation**:
```typescript
const verificationToken = crypto.randomBytes(32).toString('hex')
const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
```

**Database Fields Updated**:
```typescript
email_verified: false
email_verification_token: verificationToken
email_verification_expires: verificationExpires
email_verification_sent_at: new Date()
```

---

### 3. **Verification Handler** - `src/app/api/auth/verify-email/route.ts`
**Purpose**: Handles email verification when user clicks link

**Flow**:
1. Receives token from query params (`?token=xxx`)
2. Finds user with matching token
3. Checks token expiration (24 hours)
4. Sets `email_verified = true`
5. Clears verification token
6. Logs verification event (audit trail)
7. Returns success response

**API Endpoint**:
```
GET /api/auth/verify-email?token=abc123xyz
```

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### 4. **Resend Verification** - `src/app/api/auth/resend-verification/route.ts`
**Purpose**: Allows users to request a new verification email

**Flow**:
1. Receives email address
2. Validates user exists
3. Checks if already verified
4. Rate limiting (2-minute intervals)
5. Generates new token + expiration
6. Sends new verification email
7. Returns success

**Rate Limiting**:
```typescript
// Don't allow resending within 2 minutes
if (user.email_verification_sent_at > twoMinutesAgo) {
  return NextResponse.json({
    error: 'Please wait ${waitSeconds} seconds'
  }, { status: 429 })
}
```

---

### 5. **Verification Page** - `src/app/verify-email/page.tsx`
**Purpose**: Frontend UI for email verification

**States**:
- **Verifying**: Shows loading spinner
- **Success**: Shows "Email Verified!" + auto-redirect
- **Error**: Shows error message + resend form
- **Expired**: Shows expiration message + resend form

**Features**:
- Auto-redirects to login after 3 seconds
- Manual "Go to login now" button
- Resend verification form
- Light mode enforced

---

### 6. **Registration Page** - `src/app/register/page.tsx`
**Purpose**: User registration form

**Features**:
- Workspace creation (name + slug)
- Admin user details (name, email, password)
- Password validation (8+ chars, uppercase, lowercase, number)
- Success screen with verification link button
- "Check your email" message

---

## 🔧 How Files Work Together

### Registration Flow
```
1. User fills form on /register
   ↓
2. POST /api/auth/register
   ↓
3. src/app/api/auth/register/route.ts
   - Creates user with email_verified=false
   - Generates token
   ↓
4. src/lib/email.ts → sendWelcomeEmail()
   - Sends email with verification link
   ↓
5. User shown success page with:
   - "Check your email" message
   - Quick verification button
```

### Verification Flow
```
1. User clicks link from email
   ↓
2. GET /verify-email?token=xxx
   ↓
3. src/app/verify-email/page.tsx
   - Shows "Verifying..." state
   ↓
4. Frontend calls GET /api/auth/verify-email?token=xxx
   ↓
5. src/app/api/auth/verify-email/route.ts
   - Validates token
   - Sets email_verified=true
   ↓
6. Frontend shows "Email Verified!"
   - Auto-redirects to login (3 seconds)
```

### Resend Flow
```
1. User clicks "Resend verification"
   ↓
2. POST /api/auth/resend-verification
   ↓
3. src/app/api/auth/resend-verification/route.ts
   - Generates new token
   ↓
4. src/lib/email.ts → sendEmailVerification()
   - Sends new verification email
   ↓
5. User receives new email with fresh link
```

---

## 🔄 Alternative: Reorganize to Traditional Structure

If you want to reorganize to a more traditional structure, here's how:

### Option 1: Keep Next.js App Router (Current - Recommended)
✅ **Advantages:**
- Modern Next.js 14 best practices
- Serverless-friendly
- Type-safe with TypeScript
- Built-in API routes
- Better performance (Server Components)

**No changes needed - already well-structured!**

### Option 2: Reorganize to Traditional Structure

Create these files:

#### `/services/email.js`
```javascript
// Move from: src/lib/email.ts
// Contains: sendWelcomeEmail, sendEmailVerification, etc.
```

#### `/scripts/verify.js`
```javascript
// Move verification logic from: src/app/api/auth/verify-email/route.ts
// Export functions: verifyEmail(token), resendVerification(email)
```

#### `/pages/verify/[token].js`
```javascript
// Move from: src/app/verify-email/page.tsx
// Convert to Next.js Pages Router format
```

**Trade-offs:**
- ❌ More manual work (Next.js App Router is automatic)
- ❌ Less type safety
- ❌ Harder to deploy to serverless platforms
- ✅ More familiar to developers who prefer Pages Router

---

## 📝 Configuration Files

### Environment Variables (`.env`)
```bash
# Required for email verification
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://...

# Security
NEXTAUTH_SECRET=xxx
JWT_SECRET=xxx
ENCRYPTION_KEY=xxx
```

### Database Schema (`prisma/schema.prisma`)
```prisma
model User {
  // Email verification fields
  email_verified              Boolean   @default(false)
  email_verification_token    String?   @unique
  email_verification_expires  DateTime?
  email_verification_sent_at  DateTime?
}
```

---

## 🎯 Recommended Structure (Current)

**Your current implementation is already well-organized!** It follows Next.js 14 best practices:

✅ **Separation of Concerns:**
- `/lib/email.ts` - Email service (business logic)
- `/app/api/auth/*` - API routes (backend logic)
- `/app/*/page.tsx` - UI pages (frontend)

✅ **Benefits:**
- Type-safe with TypeScript
- Serverless-ready (Vercel, Railway)
- Modern React Server Components
- Built-in API routes
- Automatic code splitting

✅ **Maintainability:**
- Clear file structure
- Easy to find related code
- Standard Next.js conventions
- Well-documented

---

## 🔍 Finding Files Quickly

### Email-related files:
```bash
# Email service
src/lib/email.ts

# Email templates
src/lib/email.ts (lines 239-428)

# API endpoints
src/app/api/auth/register/route.ts
src/app/api/auth/verify-email/route.ts
src/app/api/auth/resend-verification/route.ts

# UI pages
src/app/register/page.tsx
src/app/verify-email/page.tsx
```

### Database schema:
```bash
packages/database/prisma/schema.prisma
# Lines 172-175: Email verification fields
```

### Environment configuration:
```bash
services/ash-admin/.env.example
services/ash-admin/.env.production
```

---

## 🛠️ Customization Guide

### Change Email Templates
**File**: `src/lib/email.ts`

Find the function you want to customize:
```typescript
export async function sendWelcomeEmail(
  to: string,
  data: {
    user_name: string
    verification_link: string
  }
): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <!-- Customize HTML here -->
    </html>
  `

  return sendEmail({
    to,
    subject: 'Welcome to Ashley AI - Verify Your Email',
    html,
  })
}
```

### Change Token Expiration
**File**: `src/app/api/auth/register/route.ts`

Change from 24 hours to your preferred duration:
```typescript
// Current: 24 hours
const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

// Example: 48 hours
const verificationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)

// Example: 1 hour
const verificationExpires = new Date(Date.now() + 1 * 60 * 60 * 1000)
```

### Change Rate Limiting
**File**: `src/app/api/auth/resend-verification/route.ts`

Change from 2 minutes to your preferred interval:
```typescript
// Current: 2 minutes
const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)

// Example: 5 minutes
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

// Example: 30 seconds
const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)
```

---

## 📊 File Dependencies

```
Registration Flow:
register/page.tsx (UI)
    ↓
api/auth/register/route.ts (API)
    ↓
lib/email.ts (Service)
    ↓ Resend API


Verification Flow:
verify-email/page.tsx (UI)
    ↓
api/auth/verify-email/route.ts (API)
    ↓
lib/db.ts (Database)
    ↓ Prisma


Resend Flow:
verify-email/page.tsx (UI - form)
    ↓
api/auth/resend-verification/route.ts (API)
    ↓
lib/email.ts (Service)
    ↓ Resend API
```

---

## ✅ Summary

**Your current file structure is optimal for:**
- ✅ Next.js 14 App Router
- ✅ TypeScript projects
- ✅ Serverless deployments (Vercel, Railway)
- ✅ Modern React patterns (Server Components)

**If you prefer traditional structure:**
- You can reorganize to `/services`, `/scripts`, `/pages`
- But it will require more manual configuration
- And lose some Next.js 14 benefits

**Recommendation**: Keep the current structure - it's well-organized and follows Next.js best practices! 🎉

---

**Last Updated:** 2025-10-21
**Ashley AI Manufacturing ERP** v1.0.0

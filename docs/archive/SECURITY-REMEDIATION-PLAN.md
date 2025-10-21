# Security Remediation Plan

**Date**: 2025-10-02
**Priority**: HIGH
**Target Completion**: Before Production Deployment

---

## 🔴 HIGH PRIORITY - Fix Immediately

### 1. Strengthen Content Security Policy

**Risk**: XSS attacks via inline scripts
**Effort**: 2 hours
**Impact**: HIGH

**Current State**:

```typescript
'Content-Security-Policy':
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +  // ⚠️ Risky
  "style-src 'self' 'unsafe-inline';"
```

**Remediation**:

Update `services/ash-admin/src/middleware.ts`:

```typescript
// Generate nonce for this request
const nonce = generateNonce();

const securityHeaders = {
  // ... other headers
  "Content-Security-Policy":
    `default-src 'self'; ` +
    `script-src 'self' 'nonce-${nonce}'; ` + // Remove unsafe-eval and unsafe-inline
    `style-src 'self' 'nonce-${nonce}'; ` +
    `img-src 'self' data: https://res.cloudinary.com; ` +
    `font-src 'self' data:; ` +
    `connect-src 'self' https://api.anthropic.com https://api.openai.com; ` +
    `frame-ancestors 'self'; ` +
    `base-uri 'self'; ` +
    `form-action 'self';`,
};

// Add nonce to response for use in components
response.headers.set("X-Nonce", nonce);
```

**Testing**:

```bash
# Test CSP compliance
curl -I http://localhost:3001
# Verify Content-Security-Policy header
```

---

### 2. File Upload Validation

**Risk**: Malicious file upload, XXE, RCE
**Effort**: 3 hours
**Impact**: CRITICAL

**Current State**: Basic file upload without strict validation

**Remediation**:

Create `services/ash-admin/src/lib/file-validator.ts`:

```typescript
import { NextRequest } from "next/server";

const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  spreadsheets: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
}

export async function validateFile(
  file: File,
  allowedTypes: string[] = ALLOWED_FILE_TYPES.images
): Promise<FileValidationResult> {
  // 1. Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // 2. Validate MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // 3. Validate file extension matches MIME type
  const ext = file.name.split(".").pop()?.toLowerCase();
  const mimeToExt: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/svg+xml": ["svg"],
    "application/pdf": ["pdf"],
  };

  const allowedExtensions = allowedTypes.flatMap(type => mimeToExt[type] || []);
  if (ext && !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: "File extension does not match file type",
    };
  }

  // 4. Sanitize filename (prevent path traversal)
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Remove special characters
    .replace(/\.{2,}/g, ".") // Remove multiple dots
    .substring(0, 255); // Limit length

  // 5. Check for magic bytes (basic file signature validation)
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (file.type.startsWith("image/")) {
    const isValidImage = validateImageSignature(bytes, file.type);
    if (!isValidImage) {
      return {
        valid: false,
        error: "File signature does not match declared type",
      };
    }
  }

  return {
    valid: true,
    sanitizedName: `${Date.now()}-${sanitizedName}`, // Add timestamp prefix
  };
}

function validateImageSignature(bytes: Uint8Array, mimeType: string): boolean {
  // JPEG: FF D8 FF
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  // PNG: 89 50 4E 47
  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (mimeType === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  return true; // Unknown type, allow
}

export function generateSafeFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split(".").pop()?.toLowerCase() || "bin";
  const safeName = originalName
    .split(".")[0]
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 50);

  return `${timestamp}_${randomString}_${safeName}.${ext}`;
}
```

Update `services/ash-admin/src/app/api/upload/route.ts`:

```typescript
import { validateFile, ALLOWED_FILE_TYPES } from "@/lib/file-validator";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    const validation = await validateFile(file, [
      ...ALLOWED_FILE_TYPES.images,
      ...ALLOWED_FILE_TYPES.documents,
    ]);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
        },
        { status: 400 }
      );
    }

    // Upload to Cloudinary with sanitized name
    const result = await cloudinary.uploader.upload(file, {
      folder: "ashley-ai",
      public_id: validation.sanitizedName,
      resource_type: "auto",
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
      },
      { status: 500 }
    );
  }
}
```

**Testing**:

```bash
# Test with valid image
curl -F "file=@test.jpg" http://localhost:3001/api/upload

# Test with invalid file type (should fail)
curl -F "file=@malicious.exe" http://localhost:3001/api/upload

# Test with oversized file (should fail)
curl -F "file=@large.jpg" http://localhost:3001/api/upload
```

---

### 3. Migrate to Redis for Production Stores

**Risk**: Memory leaks, inconsistent rate limiting across instances
**Effort**: 4 hours
**Impact**: HIGH

**Current State**: In-memory rate limiting and CSRF tokens

**Remediation**:

Update `services/ash-admin/src/middleware.ts`:

```typescript
import { getRedisClient } from "./lib/redis/client";

const redis = getRedisClient();

// Replace in-memory store with Redis
async function checkRateLimit(request: NextRequest): Promise<boolean> {
  const key = getRateLimitKey(request);
  const now = Date.now();
  const maxRequests = getRateLimitForPath(request.nextUrl.pathname);

  try {
    // Use Redis for distributed rate limiting
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 60); // 1 minute window
    }

    return count <= maxRequests;
  } catch (error) {
    console.error("Redis rate limit error:", error);
    return true; // Fail open in case of Redis error
  }
}

// CSRF tokens in Redis
async function verifyCSRFToken(request: NextRequest): Promise<boolean> {
  const sessionId = getSessionId(request);
  const csrfToken = request.headers.get("x-csrf-token");

  try {
    const storedToken = await redis.get(`csrf:${sessionId}`);
    return csrfToken === storedToken;
  } catch (error) {
    console.error("Redis CSRF error:", error);
    return false; // Fail closed for security
  }
}

async function generateAndStoreCSRFToken(sessionId: string): Promise<string> {
  const token = generateCSRFToken();

  try {
    await redis.setex(`csrf:${sessionId}`, 3600, token); // 1 hour expiry
  } catch (error) {
    console.error("Redis CSRF store error:", error);
  }

  return token;
}
```

**Testing**:

```bash
# Verify Redis connection
redis-cli ping

# Monitor rate limiting in Redis
redis-cli monitor | grep "INCR"

# Check CSRF tokens
redis-cli keys "csrf:*"
```

---

### 4. Verify Environment Variable Security

**Risk**: Secrets leaked in git repository
**Effort**: 30 minutes
**Impact**: CRITICAL

**Remediation**:

```bash
# 1. Check .gitignore
cat .gitignore | grep ".env"

# 2. Create .env.example without secrets
cp .env .env.example

# 3. Remove all real values from .env.example
# Replace with placeholders
```

**`.env.example`**:

```bash
# ===== DATABASE =====
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# ===== AUTHENTICATION =====
JWT_SECRET="your-jwt-secret-here-min-32-characters"
JWT_EXPIRES_IN="7d"

# ===== REDIS =====
REDIS_URL="redis://localhost:6379"

# ===== CLOUDINARY =====
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ===== AI SERVICES =====
ANTHROPIC_API_KEY="sk-ant-api03-..."
OPENAI_API_KEY="sk-..."

# ===== EXTERNAL SERVICES =====
STRIPE_SECRET_KEY="sk_test_..."
RESEND_API_KEY="re_..."
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
```

**Check Git History**:

```bash
# Scan for accidentally committed secrets
git log --all --full-history --source -- .env

# If .env was committed, remove from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 🟡 MEDIUM PRIORITY - Fix in Next Sprint

### 5. Password Complexity Requirements

**Remediation**:

Create `services/ash-admin/src/lib/password-validator.ts`:

```typescript
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Minimum length
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Number
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Common passwords check
  const commonPasswords = ["password", "password123", "qwerty", "123456"];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common");
  }

  // Calculate strength
  let strength: "weak" | "medium" | "strong" = "weak";
  if (errors.length === 0 && password.length >= 16) {
    strength = "strong";
  } else if (errors.length <= 1) {
    strength = "medium";
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}
```

---

### 6. Account Lockout Mechanism

**Remediation**:

Create `services/ash-admin/src/lib/account-lockout.ts`:

```typescript
import { getRedisClient } from "./redis/client";

const redis = getRedisClient();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60; // 30 minutes in seconds

export async function recordFailedLogin(email: string): Promise<void> {
  const key = `failed_login:${email}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, LOCKOUT_DURATION);
  }

  if (attempts >= MAX_FAILED_ATTEMPTS) {
    await redis.set(`locked:${email}`, "1", "EX", LOCKOUT_DURATION);
  }
}

export async function isAccountLocked(email: string): Promise<boolean> {
  const locked = await redis.get(`locked:${email}`);
  return locked === "1";
}

export async function clearFailedAttempts(email: string): Promise<void> {
  await redis.del(`failed_login:${email}`);
  await redis.del(`locked:${email}`);
}

export async function getFailedAttempts(email: string): Promise<number> {
  const attempts = await redis.get(`failed_login:${email}`);
  return parseInt(attempts || "0", 10);
}
```

Update login route:

```typescript
// Check if account is locked
if (await isAccountLocked(email)) {
  return NextResponse.json(
    {
      error: "Account temporarily locked due to too many failed login attempts",
    },
    { status: 423 }
  );
}

// On failed password
await recordFailedLogin(email);

// On successful login
await clearFailedAttempts(email);
```

---

### 7. Input Validation with Zod

**Remediation**:

```typescript
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const CreateClientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  address: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate with Zod
  const result = LoginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.format(),
      },
      { status: 400 }
    );
  }

  const { email, password } = result.data;
  // ... continue with validated data
}
```

---

## 🟢 LOW PRIORITY - Nice to Have

### 8. JWT Token Rotation

### 9. Session Timeout

### 10. Subresource Integrity (SRI)

### 11. Security.txt

### 12. Dependabot Setup

---

## 📊 Implementation Timeline

| Task                   | Priority | Effort | Week 1 | Week 2 |
| ---------------------- | -------- | ------ | ------ | ------ |
| CSP Strengthening      | HIGH     | 2h     | ✅     |        |
| File Upload Validation | HIGH     | 3h     | ✅     |        |
| Redis Migration        | HIGH     | 4h     | ✅     |        |
| Env Security Check     | HIGH     | 30m    | ✅     |        |
| Password Complexity    | MEDIUM   | 2h     |        | ✅     |
| Account Lockout        | MEDIUM   | 2h     |        | ✅     |
| Zod Validation         | MEDIUM   | 4h     |        | ✅     |
| JWT Rotation           | LOW      | 3h     |        |        |

**Total Effort**: ~20 hours
**Target**: Complete before production deployment

---

## ✅ Verification Checklist

After implementing all HIGH priority fixes:

- [ ] CSP header no longer contains 'unsafe-eval' or 'unsafe-inline'
- [ ] File uploads reject invalid file types
- [ ] File uploads enforce size limits
- [ ] Rate limiting uses Redis
- [ ] CSRF tokens stored in Redis
- [ ] .env file is in .gitignore
- [ ] .env.example has no real secrets
- [ ] Git history clean of secrets
- [ ] Password complexity enforced
- [ ] Account lockout after 5 failed attempts
- [ ] All API inputs validated with Zod

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-02
**Status**: READY FOR IMPLEMENTATION

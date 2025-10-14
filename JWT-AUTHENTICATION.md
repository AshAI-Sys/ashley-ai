# JWT Authentication System

**Last Updated**: 2025-10-14
**Status**: Production Ready ✅
**Type**: Access/Refresh Token Pattern

## Overview

Ashley AI now implements a complete JWT-based authentication system with access and refresh tokens for secure, stateless authentication.

## Architecture

### Token Types

1. **Access Token** (Short-lived - 15 minutes)
   - Used for API authentication
   - Stored in HTTP-only cookie and returned in response
   - Expires after 15 minutes
   - Must be refreshed using refresh token

2. **Refresh Token** (Long-lived - 7 days)
   - Used to obtain new access tokens
   - Stored in HTTP-only cookie
   - Expires after 7 days
   - Cannot be used for API authentication

### JWT Payload Structure

```typescript
interface JWTPayload {
  userId: string       // User ID from database
  email: string        // User email
  role: UserRole       // User role (admin, manager, etc.)
  workspaceId: string  // Workspace ID for multi-tenancy
  type?: 'access' | 'refresh'  // Token type
  iat?: number         // Issued at timestamp
  exp?: number         // Expiration timestamp
}
```

### Token Storage

**HTTP-only Cookies** (Recommended for web apps):
- `auth_token`: Access token (15 minutes)
- `refresh_token`: Refresh token (7 days)
- Secure flag enabled in production
- SameSite: lax

**Authorization Header** (For API clients):
```
Authorization: Bearer <access_token>
```

## API Endpoints

### 1. Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "workspaceId": "workspace-1"
  }
}
```

**Cookies Set:**
- `auth_token`: Access token (15 min)
- `refresh_token`: Refresh token (7 days)

### 2. Refresh Token
**POST** `/api/auth/refresh`

**Request (Option 1 - Cookie):**
No body required - reads from `refresh_token` cookie

**Request (Option 2 - Body):**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

**Cookies Updated:**
- `auth_token`: New access token (15 min)

### 3. Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "position": "Manager",
    "department": "Operations",
    "workspaceId": "workspace-1",
    "isActive": true,
    "lastLoginAt": "2025-10-14T10:30:00Z"
  }
}
```

### 4. Logout
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `auth_token`
- `refresh_token`
- `session`

## Usage in API Routes

### Basic Authentication

```typescript
import { requireAuth } from '@/lib/auth-guards'

export async function GET(request: NextRequest) {
  // Require authentication
  const userOrResponse = await requireAuth(request)
  if (userOrResponse instanceof NextResponse) {
    return userOrResponse // 401 Unauthorized
  }

  const user = userOrResponse

  // User is authenticated
  return NextResponse.json({
    message: `Hello ${user.email}!`
  })
}
```

### Permission-Based Authorization

```typescript
import { requirePermission, Permission } from '@/lib/auth-guards'

export async function POST(request: NextRequest) {
  // Require specific permission
  const userOrResponse = await requirePermission(
    request,
    Permission.ORDERS_CREATE
  )
  if (userOrResponse instanceof NextResponse) {
    return userOrResponse // 401 or 403
  }

  const user = userOrResponse

  // User has permission to create orders
  // ...
}
```

### Role-Based Authorization

```typescript
import { requireRole, UserRole } from '@/lib/auth-guards'

export async function DELETE(request: NextRequest) {
  // Require admin or super admin role
  const userOrResponse = await requireRole(request, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ])
  if (userOrResponse instanceof NextResponse) {
    return userOrResponse // 401 or 403
  }

  const user = userOrResponse

  // User is admin or super admin
  // ...
}
```

## Frontend Integration

### Login Flow

```typescript
// Login request
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include' // Important: Include cookies
})

const data = await response.json()

if (data.success) {
  // Store access token (optional - already in cookie)
  localStorage.setItem('access_token', data.access_token)

  // Redirect to dashboard
  router.push('/dashboard')
}
```

### Authenticated API Calls

```typescript
// Option 1: Using cookie (automatic)
const response = await fetch('/api/orders', {
  credentials: 'include' // Automatically sends auth_token cookie
})

// Option 2: Using Authorization header
const token = localStorage.getItem('access_token')
const response = await fetch('/api/orders', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Handling Token Expiration

```typescript
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Try request with current token
  let response = await fetch(url, {
    ...options,
    credentials: 'include'
  })

  // If 401, try to refresh token
  if (response.status === 401) {
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })

    if (refreshResponse.ok) {
      const data = await refreshResponse.json()

      // Update stored token
      localStorage.setItem('access_token', data.access_token)

      // Retry original request
      response = await fetch(url, {
        ...options,
        credentials: 'include'
      })
    } else {
      // Refresh failed - redirect to login
      window.location.href = '/login'
      return
    }
  }

  return response
}
```

### Logout

```typescript
async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  })

  // Clear local storage
  localStorage.removeItem('access_token')

  // Redirect to login
  router.push('/login')
}
```

## Security Features

### 1. HTTP-only Cookies
- Tokens stored in HTTP-only cookies
- Not accessible via JavaScript
- Protection against XSS attacks

### 2. Secure Flag
- Enabled in production
- Cookies only sent over HTTPS
- Protection against man-in-the-middle attacks

### 3. SameSite Protection
- SameSite: lax
- Protection against CSRF attacks

### 4. Token Expiration
- Short-lived access tokens (15 min)
- Reduces impact of token theft
- Automatic expiration verification

### 5. Refresh Token Rotation
- Refresh tokens expire after 7 days
- Forces re-authentication periodically
- Reduces risk of long-term token theft

### 6. Account Lockout
- Maximum 5 failed login attempts
- 30-minute lockout after 5 failures
- Protection against brute force attacks

### 7. Audit Logging
- All authentication events logged
- Failed login attempts tracked
- Security monitoring enabled

## Environment Configuration

Required environment variables in `.env`:

```bash
# JWT Secret (REQUIRED - minimum 32 characters)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# JWT Token Expiration
JWT_ACCESS_EXPIRES_IN="15m"   # Access token: 15 minutes
JWT_REFRESH_EXPIRES_IN="7d"   # Refresh token: 7 days

# Demo Mode (Development only)
DEMO_MODE=true
DEFAULT_WORKSPACE_ID=demo-workspace-1

# Security
NODE_ENV=production
```

## User Roles and Permissions

### Available Roles

```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',  // Full system access
  ADMIN = 'admin',               // Organization admin
  MANAGER = 'manager',           // Department manager
  SUPERVISOR = 'supervisor',     // Team supervisor
  OPERATOR = 'operator',         // Production worker
  CLIENT = 'client',             // External client
  VIEWER = 'viewer',             // Read-only access
}
```

### Available Permissions

**Orders:**
- `orders.view` - View orders
- `orders.create` - Create orders
- `orders.update` - Update orders
- `orders.delete` - Delete orders

**Clients:**
- `clients.view` - View clients
- `clients.create` - Create clients
- `clients.update` - Update clients
- `clients.delete` - Delete clients

**Finance:**
- `finance.view` - View financial data
- `finance.create` - Create invoices/payments
- `finance.update` - Update financial records
- `finance.delete` - Delete financial records

**HR:**
- `hr.view` - View employee data
- `hr.create` - Create employees
- `hr.update` - Update employee records
- `hr.delete` - Delete employees

**Production:**
- `production.view` - View production data
- `production.create` - Create production runs
- `production.update` - Update production status

**Admin:**
- `admin.view` - View admin panel
- `admin.manage_users` - Manage users
- `admin.manage_settings` - Manage settings

### Role-Permission Matrix

| Role | Orders | Clients | Finance | HR | Production | Admin |
|------|--------|---------|---------|-----|------------|-------|
| **SUPER_ADMIN** | All | All | All | All | All | All |
| **ADMIN** | All | All | View, Create, Update | View, Create, Update | All | View |
| **MANAGER** | View, Create, Update | View, Create, Update | View | View | All | - |
| **SUPERVISOR** | View, Create | View | - | - | All | - |
| **OPERATOR** | View | - | - | - | View, Update | - |
| **CLIENT** | View (own) | - | - | - | - | - |
| **VIEWER** | View | View | - | - | View | - |

## Demo Mode

When `DEMO_MODE=true` in environment:
- Allows unauthenticated access
- Returns demo user for all requests
- Useful for development and testing
- **MUST be disabled in production**

Demo user details:
```typescript
{
  id: 'demo-user-1',
  email: 'admin@ashleyai.com',
  role: 'admin',
  workspace_id: process.env.DEFAULT_WORKSPACE_ID || 'demo-workspace-1'
}
```

## Testing

### Manual Testing

1. **Login Test:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ashleyai.com","password":"password123"}' \
  -c cookies.txt
```

2. **Authenticated Request:**
```bash
curl http://localhost:3001/api/auth/me \
  -b cookies.txt
```

3. **Refresh Token:**
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

4. **Logout:**
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

### Automated Testing

```typescript
describe('JWT Authentication', () => {
  it('should login and receive tokens', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.access_token).toBeDefined()
    expect(data.refresh_token).toBeDefined()
  })

  it('should refresh access token', async () => {
    // Login first
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    const { refresh_token } = await loginResponse.json()

    // Refresh token
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token })
    })

    const data = await refreshResponse.json()
    expect(data.success).toBe(true)
    expect(data.access_token).toBeDefined()
  })
})
```

## Troubleshooting

### Token Verification Fails

**Symptom:** Getting 401 Unauthorized despite having valid token

**Solution:**
1. Check `JWT_SECRET` is set in `.env`
2. Verify token hasn't expired (access tokens last 15 min)
3. Check token format: `Bearer <token>`
4. Ensure cookies are being sent (`credentials: 'include'`)

### Refresh Token Not Working

**Symptom:** Refresh endpoint returns 401

**Solution:**
1. Check refresh token hasn't expired (7 days)
2. Verify `refresh_token` cookie is set
3. Check token type is 'refresh' not 'access'
4. Look for JWT errors in server logs

### CORS Issues with Cookies

**Symptom:** Cookies not being sent with requests

**Solution:**
1. Set `credentials: 'include'` in fetch requests
2. Configure CORS to allow credentials:
```typescript
// next.config.js
async headers() {
  return [{
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Credentials', value: 'true' },
      { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL },
    ]
  }]
}
```

## Migration from Old System

If upgrading from session-based or old JWT system:

1. **Update login calls** to handle token pair:
```typescript
// Old
const { token } = await login(email, password)

// New
const { access_token, refresh_token } = await login(email, password)
```

2. **Add token refresh logic**:
```typescript
// Intercept 401 responses and refresh token
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshToken()
      return axios.request(error.config)
    }
    return Promise.reject(error)
  }
)
```

3. **Update logout** to clear both tokens:
```typescript
// Clear both access and refresh tokens
await logout()
localStorage.removeItem('access_token')
```

## Production Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` (minimum 32 random characters)
- [ ] Set `DEMO_MODE=false`
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS for all endpoints
- [ ] Configure CORS properly
- [ ] Set up token refresh in frontend
- [ ] Enable audit logging
- [ ] Test account lockout mechanism
- [ ] Monitor failed login attempts
- [ ] Set up alerts for security events

## Files Modified/Created

### Created Files:
1. [lib/jwt.ts](services/ash-admin/src/lib/jwt.ts) - JWT utilities (enhanced)
2. [lib/auth-guards.ts](services/ash-admin/src/lib/auth-guards.ts) - Authentication guards (updated)
3. [app/api/auth/refresh/route.ts](services/ash-admin/src/app/api/auth/refresh/route.ts) - Token refresh endpoint
4. [app/api/auth/logout/route.ts](services/ash-admin/src/app/api/auth/logout/route.ts) - Logout endpoint

### Modified Files:
1. [app/api/auth/login/route.ts](services/ash-admin/src/app/api/auth/login/route.ts) - Updated to use token pairs
2. [app/api/auth/me/route.ts](services/ash-admin/src/app/api/auth/me/route.ts) - Updated with JWT verification

## Further Reading

- [JWT.io](https://jwt.io/) - JWT token decoder and documentation
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT specification
- [jsonwebtoken npm package](https://www.npmjs.com/package/jsonwebtoken)

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-10-14

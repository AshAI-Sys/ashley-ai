# Ashley AI - Production Setup Guide

**Last Updated**: 2025-10-19
**Status**: Production-Ready with Real Authentication

## 🔒 Security Changes

Ashley AI has been upgraded from demo mode to **production-ready** with real authentication and security:

### What Changed:
- ❌ **Removed** demo mode authentication bypass
- ❌ **Removed** hardcoded `demo-workspace-1` fallback
- ❌ **Removed** automatic demo user login
- ✅ **Added** real JWT-based authentication
- ✅ **Added** bcrypt password hashing (12 rounds)
- ✅ **Added** workspace multi-tenancy enforcement
- ✅ **Added** production database initialization script

---

## 🚀 Quick Start (Production Deployment)

### Step 1: Database Setup

#### Option A: Using Environment Variables (Recommended for CI/CD)
```bash
# Set environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/ashleyai"
export ADMIN_EMAIL="admin@yourcompany.com"
export ADMIN_PASSWORD="YourSecurePassword123!"
export WORKSPACE_NAME="Your Company Name"
export WORKSPACE_SLUG="your-company"

# Run database migrations
cd packages/database
npx prisma migrate deploy

# Initialize production database
cd ../../services/ash-admin
pnpm init-db
```

#### Option B: Interactive Setup (Recommended for First-Time Setup)
```bash
# Run database migrations
cd packages/database
npx prisma migrate deploy

# Run interactive setup
cd ../../services/ash-admin
pnpm init-db

# Follow the prompts to enter:
# - Workspace name (e.g., "Acme Manufacturing")
# - Workspace slug (e.g., "acme-mfg")
# - Admin email (e.g., "admin@acme.com")
# - Admin password (min 8 chars, uppercase, lowercase, number, special char)
```

### Step 2: Configure Environment Variables

Create `.env` file in `services/ash-admin/`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ashleyai"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Application
NODE_ENV="production"
PORT=3001

# Optional: Redis for caching (recommended for production)
REDIS_URL="redis://localhost:6379"

# Optional: Anthropic AI (for AI features)
ANTHROPIC_API_KEY="your-anthropic-key"

# Optional: OpenAI (alternative to Anthropic)
OPENAI_API_KEY="your-openai-key"
```

### Step 3: Build and Start

```bash
# Build the application
cd services/ash-admin
pnpm build

# Start production server
pnpm start
```

Access the application at: `http://localhost:3001`

---

## 🔐 Password Requirements

For security, passwords must meet these requirements:
- Minimum 8 characters long
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Example valid passwords:**
- `SecurePass123!`
- `MyP@ssw0rd`
- `Admin2024#Strong`

---

## 👥 User Management

### Creating Additional Users

After initial setup, create additional users through:

1. **Admin Dashboard**: Navigate to Settings → Users → Add User
2. **API Endpoint**: POST `/api/users/create`
3. **Direct Database**: (Not recommended for production)

### User Roles

- **admin** - Full system access
- **manager** - Department management access
- **operator** - Production floor access
- **viewer** - Read-only access

---

## 🏢 Multi-Tenancy (Workspaces)

Ashley AI supports multiple workspaces (tenants):

- Each workspace is completely isolated
- Users belong to one workspace
- All data is scoped to workspace_id
- Workspace ID comes from authenticated user's JWT token

### Adding New Workspaces

Run the init script again with different credentials:

```bash
WORKSPACE_NAME="Second Company" \
WORKSPACE_SLUG="second-company" \
ADMIN_EMAIL="admin@secondcompany.com" \
ADMIN_PASSWORD="SecurePass123!" \
pnpm init-db
```

---

## 🔒 Authentication Flow

### Login Process

1. User submits email and password to `/api/auth/login`
2. System validates credentials against database (bcrypt verification)
3. JWT access token (15 min) and refresh token (7 days) generated
4. Tokens returned + set as HTTP-only cookies
5. User's workspace_id embedded in JWT payload

### Protected API Routes

All API routes now require authentication:

```typescript
// Example: Protected API route
import { requireAuth } from '@/lib/auth-middleware'

export const GET = requireAuth(async (request, user) => {
  // user.workspaceId is automatically available
  const data = await prisma.order.findMany({
    where: { workspace_id: user.workspaceId }
  })
  return NextResponse.json({ data })
})
```

### Frontend Authentication

```typescript
// Login
const { user, login } = useAuth()
await login('admin@company.com', 'SecurePass123!')

// Logout
logout()

// Check auth status
if (!user) {
  // Redirect to login
}
```

---

## 🛡️ Security Features

### Implemented Security

- ✅ **Password Hashing**: bcrypt with 12 salt rounds
- ✅ **JWT Tokens**: HS256 algorithm, 15-minute expiry
- ✅ **HTTP-Only Cookies**: Prevents XSS attacks
- ✅ **CSRF Protection**: Built-in with SameSite cookies
- ✅ **Account Lockout**: 5 failed attempts → 30-minute lockout
- ✅ **Rate Limiting**: API endpoint protection
- ✅ **SQL Injection Prevention**: Prisma ORM parameterized queries
- ✅ **Session Management**: Redis-based session tracking
- ✅ **Audit Logging**: All auth events logged

### Security Best Practices

1. **Change Default Credentials**: Immediately after first login
2. **Use Strong JWT Secret**: Generate with `openssl rand -hex 32`
3. **Enable HTTPS**: Always use HTTPS in production
4. **Regular Backups**: Schedule automated database backups
5. **Monitor Logs**: Review audit logs regularly
6. **Update Dependencies**: Keep packages up to date

---

## 📊 Production Checklist

Before deploying to production:

- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Production database initialized (`pnpm init-db`)
- [ ] Environment variables configured (`.env` file)
- [ ] Strong JWT_SECRET generated and set
- [ ] Default admin password changed
- [ ] HTTPS/SSL certificates configured
- [ ] Redis caching configured (optional but recommended)
- [ ] Backup strategy implemented
- [ ] Monitoring and logging configured
- [ ] Load testing completed
- [ ] Security audit passed

---

## 🔧 Troubleshooting

### Cannot Login - "Unauthorized"

**Cause**: Missing or invalid JWT token
**Solution**: Clear browser cookies and localStorage, try logging in again

### Database Connection Error

**Cause**: Incorrect DATABASE_URL
**Solution**: Verify connection string in `.env` file

```bash
# Test database connection
cd packages/database
npx prisma db pull
```

### "Workspace not found"

**Cause**: User's workspace_id doesn't match any workspace
**Solution**: Run `pnpm init-db` to create initial workspace

### Port 3001 Already in Use

**Cause**: Another process using port 3001
**Solution**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID] /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

---

## 📝 Migration from Demo Mode

If you're upgrading from the demo version:

1. **Backup your data** - Export all important data first
2. **Clear localStorage** - Remove demo user data from browser
3. **Run init-db** - Create production workspace and admin user
4. **Migrate data** - Import backed up data into new workspace
5. **Test authentication** - Verify login works with new credentials

---

## 🎯 Next Steps

After successful production setup:

1. **Create Users**: Add team members to the system
2. **Configure Settings**: Set up company-specific configurations
3. **Import Data**: Import existing clients, products, etc.
4. **Train Staff**: Onboard your team to the new system
5. **Monitor Performance**: Use built-in analytics dashboard
6. **Regular Maintenance**: Schedule updates and backups

---

## 📞 Support

For issues or questions:

- Check `CLAUDE.md` for development guidelines
- Review `SECURITY-AUDIT-REPORT.md` for security details
- Check `PERFORMANCE-OPTIMIZATION-GUIDE.md` for optimization tips

---

## 🔐 Security Notice

**IMPORTANT**:
- Never commit `.env` file to version control
- Change all default credentials immediately
- Use strong, unique passwords for each user
- Enable 2FA for admin accounts (coming soon)
- Regularly review audit logs for suspicious activity
- Keep the system and dependencies updated

---

**Ashley AI** - Secure, Production-Ready Manufacturing ERP System

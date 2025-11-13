# Ashley AI - Quick Start Guide

**Production-Ready Manufacturing ERP System**

---

## 🚀 Getting Started (5 Minutes)

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Git installed
- PostgreSQL or SQLite database

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

### 2. Setup Database

```bash
# Generate Prisma client
cd packages/database
npx prisma generate

# Run migrations (development)
npx prisma migrate dev

# OR initialize production database
cd ../..
pnpm init-db
```

### 3. Configure Environment

```bash
# Copy example environment file
cd services/ash-admin
cp .env.example .env

# Edit .env with your settings
# Required: DATABASE_URL, JWT_SECRET, NEXTAUTH_SECRET
```

### 4. Start Development Server

```bash
# From project root
pnpm --filter @ash/admin dev

# OR from ash-admin directory
cd services/ash-admin
pnpm dev
```

### 5. Access Application

Open browser: **http://localhost:3001**

**First Time Login:**

- Use credentials created during `pnpm init-db`
- OR create new account via registration

---

## 📱 Mobile App Setup

### Start Mobile Development

```bash
cd services/ash-mobile
pnpm install
pnpm start
```

### Run on Device

1. Install **Expo Go** app on your phone
2. Scan QR code from terminal
3. App will load on your device

---

## 🔧 Common Commands

### Development

```bash
# Start admin interface
pnpm --filter @ash/admin dev

# Start with Turbopack (faster)
pnpm --filter @ash/admin dev --turbo

# Start mobile app
cd services/ash-mobile && pnpm start
```

### Database Operations

```bash
# Generate Prisma client
cd packages/database
npx prisma generate

# Create new migration
npx prisma migrate dev --name description

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Validate schema
npx prisma validate
```

### Building for Production

```bash
# Build admin interface
pnpm --filter @ash/admin build

# Start production server
pnpm --filter @ash/admin start

# Build mobile app
cd services/ash-mobile
eas build --platform ios
eas build --platform android
```

### Testing & Validation

```bash
# Run validation script
powershell -ExecutionPolicy Bypass -File validate-system.ps1

# Check TypeScript errors
cd services/ash-admin
npx tsc --noEmit

# Run tests (if configured)
pnpm test
```

---

## 📁 Project Structure

```
Ashley AI/
├── services/
│   ├── ash-admin/          # Main admin interface (Next.js)
│   │   ├── src/
│   │   │   ├── app/        # Next.js App Router pages
│   │   │   ├── components/ # React components
│   │   │   └── lib/        # Utilities and helpers
│   │   ├── public/         # Static assets
│   │   └── .env            # Environment variables
│   │
│   └── ash-mobile/         # Mobile app (React Native)
│       ├── src/
│       ├── screens/        # Mobile screens
│       └── app.json        # Expo configuration
│
├── packages/
│   └── database/           # Prisma database layer
│       ├── prisma/
│       │   └── schema.prisma  # Database schema
│       └── migrations/     # Database migrations
│
└── docs/                   # Documentation
    ├── CLAUDE.md           # System overview
    ├── SYSTEM-DEEP-SCAN-REPORT.md
    └── PRODUCTION-SETUP.md
```

---

## 🎯 Key Features & Access

### Manufacturing Operations

- **Orders**: http://localhost:3001/orders
- **Cutting**: http://localhost:3001/cutting
- **Printing**: http://localhost:3001/printing
- **Sewing**: http://localhost:3001/sewing
- **Quality Control**: http://localhost:3001/quality-control
- **Finishing**: http://localhost:3001/finishing
- **Delivery**: http://localhost:3001/delivery

### Business Operations

- **Finance**: http://localhost:3001/finance
- **HR & Payroll**: http://localhost:3001/hr-payroll
- **Maintenance**: http://localhost:3001/maintenance
- **Inventory**: http://localhost:3001/inventory

### AI Features

- **AI Chat Assistant**: Available on all pages (floating button)
- **Merchandising AI**: http://localhost:3001/ai-features
- **Automation**: http://localhost:3001/automation

### Administration

- **User Management**: http://localhost:3001/admin/users
- **Analytics**: http://localhost:3001/admin/analytics
- **Audit Logs**: http://localhost:3001/admin/audit
- **Settings**: http://localhost:3001/settings

---

## 🔐 Authentication & Security

### Login System

- **URL**: http://localhost:3001/login
- **Method**: JWT tokens (15-minute access, 7-day refresh)
- **Password**: bcrypt hashed (12 rounds)

### User Roles

1. **SUPER_ADMIN** - Full system access
2. **ADMIN** - Administrative functions
3. **MANAGER** - Department management
4. **EMPLOYEE** - Standard access
5. **CLIENT** - Client portal access

### Creating First User

```bash
pnpm init-db
# Follow prompts to create admin user
```

### Resetting Password

```bash
# Via API endpoint
POST /api/auth/reset-password
{
  "email": "user@example.com"
}
```

---

## 🗄️ Database Management

### Using SQLite (Development)

```env
# .env file
DATABASE_URL="file:./dev.db"
```

### Using PostgreSQL (Production)

```env
# .env file
DATABASE_URL="postgresql://user:password@localhost:5432/ashleyai"
```

### Common Database Tasks

**View Database**:

```bash
cd packages/database
npx prisma studio
# Opens at http://localhost:5555
```

**Export Data**:

```bash
# SQLite
sqlite3 dev.db .dump > backup.sql

# PostgreSQL
pg_dump ashleyai > backup.sql
```

**Import Data**:

```bash
# SQLite
sqlite3 dev.db < backup.sql

# PostgreSQL
psql ashleyai < backup.sql
```

---

## 🧪 Testing the System

### Manual Testing Checklist

1. **Authentication**
   - [ ] Login with valid credentials
   - [ ] Logout successfully
   - [ ] Password reset works

2. **Order Management**
   - [ ] Create new order
   - [ ] View order list
   - [ ] Update order status
   - [ ] Delete order

3. **Production Workflow**
   - [ ] Create cutting run
   - [ ] Generate QR codes
   - [ ] Track bundles
   - [ ] Complete production stages

4. **Finance Operations**
   - [ ] Create invoice
   - [ ] Process payment
   - [ ] View financial reports

5. **Mobile App**
   - [ ] Login on mobile
   - [ ] Scan QR code
   - [ ] Record production
   - [ ] Use POS system

### API Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get orders (with auth token)
curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

**Prisma Client Not Generated**

```bash
cd packages/database
npx prisma generate
```

**Build Errors**

```bash
# Clear cache and rebuild
cd services/ash-admin
rm -rf .next
pnpm build
```

**Module Not Found**

```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

**Database Connection Error**

```bash
# Check DATABASE_URL in .env
# Ensure database is running
# Run migrations
cd packages/database
npx prisma migrate deploy
```

### Getting Help

1. Check CLAUDE.md for system documentation
2. Review SYSTEM-DEEP-SCAN-REPORT.md for technical details
3. Check GitHub issues (if applicable)
4. Review error logs in console

---

## 📊 Monitoring & Logs

### Development Logs

- Console output shows request logs
- Prisma query logs (if enabled)
- React error boundaries catch UI errors

### Production Monitoring

```env
# Configure in .env
SENTRY_DSN=your_sentry_dsn
REDIS_URL=your_redis_url
```

### Log Locations

- **Next.js**: Console output
- **Prisma**: Database query logs
- **Errors**: Captured by Sentry (if configured)

---

## 🚢 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd services/ash-admin
vercel --prod
```

### Docker Deployment

```bash
# Build image
docker build -t ashley-ai .

# Run container
docker run -p 3001:3001 ashley-ai
```

### Environment Variables for Production

```env
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://yourdomain.com

# Recommended
REDIS_URL=redis://...
SENTRY_DSN=https://...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 🎓 Learning Resources

### Documentation Files

- **CLAUDE.md** - Complete system overview
- **SYSTEM-DEEP-SCAN-REPORT.md** - Technical audit
- **PRODUCTION-SETUP.md** - Deployment guide
- **SECURITY-AUDIT-REPORT.md** - Security details

### Technologies Used

- **Next.js 14** - https://nextjs.org/docs
- **React 18** - https://react.dev
- **Prisma ORM** - https://www.prisma.io/docs
- **TypeScript** - https://www.typescriptlang.org/docs
- **Tailwind CSS** - https://tailwindcss.com/docs
- **React Native** - https://reactnative.dev/docs

---

## 📈 Performance Tips

### Development

- Use `--turbo` flag for faster dev server
- Enable Prisma query logging only when debugging
- Use React DevTools for component optimization

### Production

- Enable Redis caching
- Configure CDN for static assets
- Use PostgreSQL connection pooling
- Enable Sentry performance monitoring
- Optimize images with Next.js Image

---

## 🔄 Updating the System

### Pull Latest Changes

```bash
git pull origin main
pnpm install
cd packages/database
npx prisma generate
npx prisma migrate deploy
```

### Update Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update next

# Check outdated packages
pnpm outdated
```

---

## 💡 Pro Tips

1. **Use Prisma Studio** for quick database inspection
2. **Enable source maps** in development for easier debugging
3. **Use React DevTools** to inspect component tree
4. **Enable VS Code extensions**: Prisma, ESLint, Tailwind CSS IntelliSense
5. **Use Git hooks** to run validation before commits
6. **Set up CI/CD** for automated testing and deployment
7. **Monitor performance** with Next.js built-in analytics
8. **Use environment-specific configs** for dev/staging/prod

---

## ✅ Daily Workflow

### Starting Your Day

```bash
# 1. Pull latest changes
git pull

# 2. Start database (if not running)
# For PostgreSQL: pg_ctl start

# 3. Start development server
pnpm --filter @ash/admin dev

# 4. Open Prisma Studio (optional)
cd packages/database && npx prisma studio
```

### Ending Your Day

```bash
# 1. Commit changes
git add .
git commit -m "Your commit message"
git push

# 2. Stop services
# Ctrl+C to stop dev server
# pg_ctl stop (if using PostgreSQL)
```

---

## 🎉 You're Ready!

The Ashley AI system is now ready to use. Start building, customizing, and deploying your manufacturing ERP solution!

**Need Help?** Check the troubleshooting section or review the comprehensive documentation in CLAUDE.md.

**Happy Manufacturing! 🏭**

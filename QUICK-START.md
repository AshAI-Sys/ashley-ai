# Ashley AI - Quick Start Guide

Welcome to Ashley AI Manufacturing ERP! This guide will get you up and running in minutes.

---

## 🚀 Quick Setup (5 Minutes)

### 1. **Clone & Install**

```bash
# Clone the repository
git clone <your-repo-url>
cd ashley-ai

# Install dependencies
pnpm install

# Or if you don't have pnpm:
npm install -g pnpm
pnpm install
```

### 2. **Configure Environment**

```bash
# Copy environment template
cp .env.example .env

# Edit with your values (optional for demo)
# The defaults work out of the box!
```

### 3. **Set Up Database**

```bash
# Generate Prisma client
cd packages/database
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed demo data (optional)
npm run seed
```

### 4. **Start Development Server**

```bash
# From root directory
cd services/ash-admin
pnpm dev

# Server will start at http://localhost:3001
```

### 5. **Access the Application**

```
🌐 Open: http://localhost:3001
📧 Email: admin@ashleyai.com
🔑 Password: password123
```

**That's it! You're ready to go!** 🎉

---

## 📚 What You Get

### ✅ **15 Manufacturing Stages**

1. Client & Order Intake
2. Design & Approval
3. Cutting Operations
4. Printing Operations
5. Sewing Operations
6. Quality Control
7. Finishing & Packing
8. Delivery Operations
9. Finance Operations
10. HR & Payroll
11. Maintenance Management
12. Client Portal
13. Merchandising AI
14. Automation & Reminders
15. AI Chat Assistant

### ✅ **New Features (Oct 2025)**

- ✨ **Multi-Tenancy** - Support multiple workspaces
- ✨ **Type Safety** - 50+ TypeScript types
- ✨ **Structured Logging** - Production-ready logs
- ✨ **Authentication Guards** - Role-based access control
- ✨ **Consistent APIs** - Standardized responses

---

## 🎯 Common Tasks

### Create an Order

```
1. Go to "Orders" → "New Order"
2. Select client and brand
3. Add line items
4. Set delivery date
5. Click "Submit Order"
```

### Add a Client

```
1. Go to "Clients" → "New Client"
2. Fill in company details
3. Add contact information
4. Click "Create Client"
```

### View Production Status

```
1. Go to "Dashboard"
2. See real-time production metrics
3. Click on any stage for details
```

### Process Delivery

```
1. Go to "Delivery" → "Create Shipment"
2. Select order and method
3. Enter delivery details
4. Track shipment status
```

---

## 🔧 Development Workflow

### Project Structure

```
ashley-ai/
├── services/
│   ├── ash-admin/      # Main admin interface (YOU ARE HERE)
│   └── ash-portal/     # Client portal
├── packages/
│   └── database/       # Shared Prisma database
├── .env.example        # Environment template
├── CLAUDE.md          # Development guide
└── QUICK-START.md     # This file
```

### Key Files

```
services/ash-admin/src/
├── app/                # Next.js App Router pages
│   ├── api/           # API routes
│   ├── orders/        # Order management
│   ├── clients/       # Client management
│   └── ...           # Other modules
├── lib/               # Shared utilities
│   ├── workspace.ts   # Multi-tenancy
│   ├── logger.ts      # Logging utility
│   ├── auth-guards.ts # Authentication
│   └── types/         # TypeScript types
└── components/        # React components
```

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
npx prisma studio     # Database GUI
npx prisma generate   # Generate Prisma client
npx prisma migrate dev # Run migrations

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # Check TypeScript
```

---

## 💡 Using New Features

### 1. **Multi-Workspace Support**

```typescript
// API routes automatically get workspace from:
// - Header: X-Workspace-ID
// - Cookie: workspace_id
// - Query: ?workspaceId=xxx

import { getWorkspaceIdFromRequest } from "@/lib/workspace";

export async function GET(request: NextRequest) {
  const workspaceId = getWorkspaceIdFromRequest(request);
  // Use in queries...
}
```

### 2. **Type-Safe Development**

```typescript
// Import types for autocomplete
import { Order, Client, ApiResponse } from "@/lib/types";

// Use in components
const [orders, setOrders] = useState<Order[]>([]);

// Use with API calls
const response: ApiResponse<Order[]> = await fetch("/api/orders").then(r =>
  r.json()
);
```

### 3. **Production Logging**

```typescript
// Import logger
import { logger, logError } from "@/lib/logger";

// Log messages
logger.info("Order created", { orderId: "123" });
logger.error("Failed to save", error);

// Domain-specific loggers
import { apiLogger, dbLogger } from "@/lib/logger";
apiLogger.info("POST /api/orders");
```

### 4. **Route Protection**

```typescript
// Protect API routes
import { requireAuth, requirePermission, Permission } from "@/lib/auth-guards";

export async function POST(request: NextRequest) {
  // Require authentication
  const user = await requireAuth(request);
  if (user instanceof NextResponse) return user;

  // User is authenticated!
}
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3001 | xargs kill -9
```

### Database Connection Error

```bash
# Regenerate Prisma client
cd packages/database
npx prisma generate

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

### TypeScript Errors

```bash
# Rebuild project
pnpm build

# Clear Next.js cache
rm -rf .next
pnpm dev
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
pnpm install
```

---

## 📖 Learn More

### Documentation

- [CLAUDE.md](./CLAUDE.md) - Complete development guide
- [IMPROVEMENTS-2025-10-14.md](./IMPROVEMENTS-2025-10-14.md) - Recent improvements
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Production deployment

### Key Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

---

## 🎓 Next Steps

### For Developers

1. ✅ Read [CLAUDE.md](./CLAUDE.md) for full system overview
2. ✅ Explore the codebase starting with `/app`
3. ✅ Check out API routes in `/app/api`
4. ✅ Review shared utilities in `/lib`
5. ✅ Try creating a new feature

### For Deployment

1. ✅ Read [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
2. ✅ Configure production environment variables
3. ✅ Set up production database (PostgreSQL)
4. ✅ Deploy to Vercel or your preferred platform
5. ✅ Set up monitoring and alerts

### For Testing

1. ✅ Create test accounts
2. ✅ Test complete order workflow
3. ✅ Test multi-workspace functionality
4. ✅ Test authentication and permissions
5. ✅ Load test critical endpoints

---

## 💬 Get Help

### Common Questions

**Q: How do I add a new user?**
A: Go to Admin → Users → Add User

**Q: How do I create a new workspace?**
A: Workspaces are automatically created via the API or can be added directly to the database

**Q: How do I change my workspace?**
A: Use the header `X-Workspace-ID` or set the `workspace_id` cookie

**Q: Where are logs stored?**
A: Logs are output to console/stdout. Configure log aggregation service for production

**Q: How do I add a new permission?**
A: Add to the `Permission` enum in `lib/auth-guards.ts`

---

## 🚀 Quick Commands Reference

```bash
# Start development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Database GUI
npx prisma studio

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database
npm run seed

# Lint code
pnpm lint

# Type check
pnpm type-check

# View logs (if using PM2)
pm2 logs ashley-ai
```

---

## 🎉 You're All Set!

Ashley AI is now running on your machine. Start exploring the features and building amazing manufacturing workflows!

**Need help?** Check [CLAUDE.md](./CLAUDE.md) for detailed documentation.

**Ready to deploy?** Check [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md).

---

**Last Updated**: October 14, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅

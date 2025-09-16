# ASH AI - Quick Start Guide

> Get your ASH AI development environment running in minutes!

## 🚀 Prerequisites

### Required
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** ([Download](https://postgresql.org/download/))

### Optional
- **Redis 6+** (for caching and sessions)
- **OpenAI API Key** (for Ashley AI features)

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database URL and API keys
# Required: ASH_DB_URL, ASH_JWT_SECRET
# Optional: ASH_OPENAI_API_KEY, ASH_REDIS_URL
```

### 3. Database Setup
```bash
# Generate Prisma client, run migrations, and seed data
npm run db:migrate
npm run db:seed
```

### 4. Start Development
```bash
# Start all services
npm run dev
```

## 🌟 Service URLs

Once running, access these services:

| Service | URL | Description |
|---------|-----|-------------|
| **API Gateway** | http://localhost:3000 | Main API endpoint |
| **Admin UI** | http://localhost:3001 | Backoffice management |
| **Staff PWA** | http://localhost:3002 | Worker interface |
| **Client Portal** | http://localhost:3003 | Customer self-service |

### Backend Services
| Service | URL | Description |
|---------|-----|-------------|
| **Core Service** | http://localhost:4000 | Business logic API |
| **Ashley AI** | http://localhost:4001 | AI analysis service |

## 🔐 Demo Login Credentials

### Admin Portal (localhost:3001)
- **Email:** admin@demo.com
- **Password:** admin123
- **Workspace:** demo-apparel

### Manager Account
- **Email:** manager@demo.com  
- **Password:** admin123
- **Workspace:** demo-apparel

## 📊 Demo Data

The system comes with pre-loaded demo data:

- **2 Demo Clients** (Trendy Threads Co., Urban Style PH)
- **3 Brands** across the clients
- **2 Sample Orders** with line items
- **4 Employees** in different departments
- **Assets** (machines, vehicles)
- **Routing Templates** for different printing methods

## 🛠️ Development Commands

```bash
# Install all dependencies
npm install

# Start all services in development
npm run dev

# Build all services
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Database operations
npm run db:migrate     # Run migrations
npm run db:seed        # Seed demo data
npm run db:studio      # Open Prisma Studio
```

## 📂 Project Structure

```
ash-ai/
├── services/           # Microservices
│   ├── ash-core/      # Business logic
│   ├── ash-ai/        # Ashley AI service
│   ├── ash-admin/     # Admin interface
│   ├── ash-staff/     # Staff PWA
│   ├── ash-portal/    # Client portal
│   └── ash-api/       # API gateway
├── packages/          # Shared packages
│   ├── database/      # Prisma schema
│   ├── types/         # TypeScript types
│   ├── shared/        # Common utilities
│   ├── ui/            # UI components
│   └── events/        # Event bus
└── scripts/           # Development scripts
```

## 🎯 What's Included

### ✅ Stage 1: Client & Order Intake
- Client and brand management
- Order creation with line items
- Routing template generation
- Basic Ashley AI validation

### ✅ Core Features
- Multi-tenant architecture
- Role-based access control (RBAC)
- Audit logging
- API gateway with BFF pattern
- Event-driven architecture ready

### ✅ Philippine Market Features
- Timezone (Asia/Manila)
- Currency (PHP)
- Philippine regions support
- BIR compliance ready

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Create databases manually if needed
createdb ash_ai_dev
createdb ash_ai_test
```

### Port Conflicts
If ports are in use, update these in your `.env`:
```env
ASH_API_PORT=3000
ASH_ADMIN_PORT=3001
ASH_STAFF_PORT=3002
ASH_PORTAL_PORT=3003
ASH_CORE_PORT=4000
ASH_AI_PORT=4001
```

### Missing Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# For Windows
rmdir /s node_modules
del package-lock.json
npm install
```

## 📞 Next Steps

1. **Explore the Admin UI** - Login and browse clients, orders, and production data
2. **Test API Endpoints** - Use the API Gateway to interact with services  
3. **Check Ashley AI** - Test capacity analysis and quality predictions
4. **Review Client Portal** - See the customer experience
5. **Read Documentation** - Check `DEVELOPMENT.md` for detailed development guide

## 🎉 You're Ready!

Your ASH AI development environment is now running! Start exploring the system and building amazing features for apparel manufacturing.

For detailed development information, see [DEVELOPMENT.md](./DEVELOPMENT.md)
# 🏭 ASH AI - Apparel Smart Hub with Artificial Intelligence

[![CI/CD Pipeline](https://github.com/ash-ai/ash-ai/workflows/CI/badge.svg)](https://github.com/ash-ai/ash-ai/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.12-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

> **World-class ERP system for apparel manufacturing with integrated AI intelligence**

ASH AI is a comprehensive, AI-powered enterprise resource planning (ERP) system specifically designed for apparel manufacturing companies. Built with modern technologies and best practices, it provides end-to-end coverage from order intake to delivery.

## ✨ Features

### 🎯 **Core Manufacturing Modules**
- **Order Management** - Client intake, routing templates, Ashley AI validation
- **Design & Approval** - Version control, client portal, printability checks
- **Production Control** - Cutting, printing (Silkscreen/Sublimation/DTF/Embroidery), sewing
- **Quality Management** - AQL sampling, defect tracking, CAPA automation
- **Inventory Control** - Real-time stock, QR tracking, wastage monitoring
- **Payroll & HR** - Piece-rate calculations, attendance, Philippine compliance

### 🤖 **Ashley AI Intelligence**
- **Capacity Planning** - Smart scheduling and bottleneck detection
- **Quality Prediction** - Defect pattern analysis and prevention
- **Cost Optimization** - Material usage and efficiency recommendations
- **Merchandising** - Reprint suggestions and trend analysis

### 🌐 **Client Experience**
- **Self-Service Portal** - Order tracking, approvals, reorders
- **Real-time Updates** - Progress notifications and delivery tracking
- **Payment Integration** - PayMongo, GCash, bank transfers
- **Mobile Responsive** - Works on all devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and **pnpm** 9+
- **PostgreSQL** 16+ database
- **Redis** 7+ for caching and job queues
- **Docker** and **Docker Compose** (recommended)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ash-ai/ash-ai.git
   cd ash-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start with Docker (Recommended)**
   ```bash
   pnpm docker:up
   ```
   
   Or manually:
   ```bash
   # Start database and Redis
   docker-compose up postgres redis -d
   
   # Run migrations and seed
   pnpm setup
   
   # Start development server
   pnpm dev
   ```

5. **Access the applications**
   - **Admin Dashboard**: http://localhost:3000
   - **Client Portal**: http://localhost:3001
   - **Staff Mobile**: http://localhost:3002
   - **Database Admin**: http://localhost:8080
   - **Email Testing**: http://localhost:8025

## 🏗️ Architecture

### **Monorepo Structure**
```
ash-ai/
├── apps/
│   ├── admin/          # Main admin dashboard (Next.js)
│   ├── portal/         # Client portal (Next.js)
│   └── mobile/         # Staff PWA (React Native)
├── packages/
│   ├── database/       # Prisma schema & utilities
│   ├── ui/            # Shared React components
│   ├── lib/           # Shared utilities
│   └── types/         # TypeScript definitions
├── services/
│   ├── api/           # Main API gateway (Fastify)
│   ├── worker/        # Background job processor
│   └── ai/            # Ashley AI service (Python/FastAPI)
└── docs/              # Documentation
```

### **Technology Stack**

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | Modern web applications |
| **UI/UX** | Tailwind CSS, Shadcn/UI, Framer Motion | Beautiful, accessible interfaces |
| **Backend** | Node.js, Fastify, tRPC | High-performance APIs |
| **Database** | PostgreSQL 16, Prisma ORM | Reliable data persistence |
| **Caching** | Redis 7, Bull queues | Fast data access & job processing |
| **Storage** | AWS S3 / MinIO | File and asset management |
| **AI/ML** | OpenAI GPT-4, Claude 3.5 | Intelligent recommendations |
| **Monitoring** | Sentry, Mixpanel | Error tracking & analytics |

## 🎯 Production Stages

The system covers 14 production stages:

1. **Client & Order Intake** - PO creation, routing templates
2. **Design & Approval** - Asset management, client approvals  
3. **Cutting** - Fabric cutting, bundle creation
4. **Printing** - Multi-method printing (Silkscreen, Sublimation, DTF, Embroidery)
5. **Sewing** - Sewing operations, piece-rate tracking
6. **Quality Control** - AQL-based inspection, CAPA
7. **Finishing & Packing** - Final processing, cartonization
8. **Delivery** - Multi-modal delivery, POD capture
9. **Finance** - AR/AP, invoicing, Philippine compliance
10. **HR** - Attendance, payroll, compliance
11. **Maintenance** - Asset management, PM scheduling
12. **Client Portal** - Self-service tracking, payments
13. **Merchandising AI** - Reprint recommendations, themes
14. **Automation & Reminders** - Notification engine

## 🤖 Ashley AI Features

Ashley is the AI assistant that monitors, forecasts, and advises across all stages:

- **Capacity Planning** - Validate deadlines against capacity
- **Stock Optimization** - Monitor inventory levels
- **Quality Prediction** - Identify potential quality issues
- **Route Safety** - Validate production routing
- **Fatigue Monitoring** - Track worker performance
- **Predictive Maintenance** - Asset health monitoring
- **Merchandising Intelligence** - Sales pattern analysis

## 🌏 Philippine Market Features

- **BIR Compliance** - Tax reporting and compliance
- **GCash Integration** - Local payment method
- **Labor Law Compliance** - PH employment regulations  
- **Multi-language** - English/Filipino support
- **Timezone** - Asia/Manila default

## 🔒 Security Features

- **Multi-tenant** - Workspace isolation
- **RBAC** - Role-based access control
- **2FA** - Two-factor authentication for sensitive roles
- **RLS** - Row-level security in database
- **Encryption** - Field-level encryption for PII/payroll
- **Audit Trail** - Comprehensive audit logging

## 📊 Key Metrics

- **Performance** - p95 < 300ms for reads
- **Reliability** - 99.9% uptime target
- **Scalability** - Multi-tenant architecture
- **Security** - SOC 2 Type II compliance ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

---

**ASH AI Team** - Building the future of apparel manufacturing with AI# Deployment trigger
# Trigger deployment

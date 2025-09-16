# Ashley AI - Development Guide

**Last Updated**: 2025-09-16
**Current Status**: 8 of 14 Manufacturing Stages Implemented
**Latest Update**: Stage 8 - Delivery Operations completed

## Quick Start Commands

### Start Development Servers
```bash
# Start Admin Interface (localhost:3001)
pnpm --filter admin dev

# Start Client Portal (localhost:3003)
pnpm --filter portal dev

# Generate Database
cd packages/database && npx prisma generate
```

### Access URLs
- **Admin Interface**: http://localhost:3001
- **Client Portal**: http://localhost:3003
- **Login**: Use any email/password (e.g., admin@ashleyai.com / password123)

## Current System Status

### ✅ **COMPLETED STAGES (8/14)**
**Stages 1-8** are fully implemented and functional

### 🔄 **NEXT TO IMPLEMENT**
**Stage 9 - Finance Operations** (Invoicing, Payments, Billing)

## Project Structure
```
Ashley AI/
├── services/
│   ├── ash-admin/     # Main admin interface
│   └── ash-portal/    # Client portal
├── packages/
│   └── database/      # Prisma database schema
└── apps/              # Additional apps (if any)
```

## Implemented Manufacturing Stages

### ✅ Stage 1 - Client & Order Intake
- Client management system
- Order creation and tracking
- Order status workflow

### ✅ Stage 2 - Design & Approval Workflow  
- Design asset upload and management
- Client approval system with tokens
- Version control for designs

### ✅ Stage 3 - Cutting Operations
- Lay creation and fabric issuing
- Bundle generation with QR codes
- Cutting efficiency calculations
- Ashley AI optimization

### ✅ Stage 4 - Printing Operations
- Multi-method printing (Silkscreen, Sublimation, DTF, Embroidery)
- Print run management
- Quality control integration
- Ashley AI print optimization

### ✅ Stage 5 - Sewing Operations
- Sewing run creation and management
- Operator tracking with piece rates
- Real-time production monitoring
- Ashley AI sewing optimization

### ✅ Stage 6 - Quality Control (QC)
- QC inspection creation with AQL sampling plans
- Defect code management and severity tracking
- Photo uploads for defects
- Automated pass/fail calculations based on ANSI/ASQ Z1.4
- CAPA (Corrective and Preventive Action) task management
- Integration with existing order workflow

### ✅ Stage 7 - Finishing & Packing
- Finishing run management with task tracking
- Material usage tracking (JSON-based)
- Finished unit creation with SKU generation
- Carton management with weight and dimension calculations
- Volume utilization and dimensional weight calculations
- Shipment preparation workflow

### ✅ Stage 8 - Delivery Operations *(Latest - Sept 16, 2025)*
- Shipment creation and management with carton linking
- Multi-method delivery support (Driver, 3PL providers)
- Real-time delivery tracking with status updates
- Warehouse scan-out operations with QR codes
- Proof of delivery capture with photos and signatures
- 3PL integration with automated quotes and booking
- Dispatch board for logistics coordination
- Live tracking interface for monitoring deliveries

### 🚧 **REMAINING STAGES TO IMPLEMENT**

#### Stage 9 - Finance Operations
- Invoice generation and management
- Payment processing and tracking
- Financial reporting and analytics
- Cost accounting and profitability analysis

#### Stage 10 - HR & Payroll
- Employee management and attendance
- Payroll calculation and processing
- Performance tracking and piece-rate calculations
- Compliance and reporting

#### Stage 11 - Maintenance Management
- Equipment maintenance scheduling
- Asset tracking and lifecycle management
- Work order management
- Preventive maintenance programs

#### Stage 12 - Client Portal
- Order tracking for clients
- Design approvals and feedback
- Payment and invoice management
- Communication and collaboration tools

#### Stage 13 - Merchandising AI
- Demand forecasting and analytics
- Product recommendation engine
- Trend analysis and insights
- Inventory optimization

#### Stage 14 - Automation & Reminders
- Workflow automation rules
- Notification systems
- Alert management
- Integration orchestration

## Key Features
- **QR Code System**: Track bundles throughout production
- **Ashley AI Integration**: Efficiency calculations and recommendations
- **Real-time Monitoring**: Live production dashboards
- **Mobile Responsive**: Works on production floor devices
- **Authentication**: Local auth system (bypasses external service)

## Database Schema
Located in `packages/database/prisma/schema.prisma` with models for:
- **Core**: Clients, Orders, DesignAssets
- **Production**: Lays, Bundles, CuttingRuns, PrintRuns, SewingRuns
- **Quality**: QualityControlChecks, Inspections, DefectCodes, CAPA
- **Finishing**: FinishingRuns, FinishedUnits, Cartons
- **Delivery**: Shipments, Deliveries, TrackingEvents, ShipmentCartons

## Recent Updates Log

### 2025-09-16 - Stage 8 Delivery Operations
- ✅ Added 7 new API endpoints for delivery management
- ✅ Implemented dispatch board with real-time shipment tracking
- ✅ Built 3PL integration with quote comparison
- ✅ Added warehouse scan-out operations
- ✅ Created proof of delivery system with photo capture
- ✅ Updated delivery page with tabs interface
- ✅ Committed 1,779 lines of new code

### Auto-Update System
This CLAUDE.md file will be automatically updated whenever:
- New stages are implemented
- Major features are added
- Database schema changes
- System architecture updates

## Troubleshooting

### Authentication Issues
- Auth is handled locally in `/api/auth/` endpoints
- No external auth service required
- Use any credentials to login

### Port Conflicts
```bash
# Check what's running on ports
netstat -ano | findstr :3001
netstat -ano | findstr :3003

# Kill process if needed
taskkill /PID [PID_NUMBER] /F
```

## Development Notes
- Uses Next.js 14 with App Router
- TypeScript throughout
- Prisma ORM with SQLite
- Tailwind CSS for styling
- Lucide React for icons

## Commander Role Context
This system was built with Claude Code acting as a supervisor, implementing a complete 14-stage manufacturing ERP system called "ASH AI" (Apparel Smart Hub - Artificial Intelligence). All stages follow the specifications in CLIENT_UPDATED_PLAN.md.

The implementation focuses on real-world manufacturing workflows with AI-powered optimization and efficiency tracking throughout the production pipeline.
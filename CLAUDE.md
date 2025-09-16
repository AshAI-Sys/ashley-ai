# Ashley AI - Development Guide

**Last Updated**: 2025-09-16
**Current Status**: 11 of 14 Manufacturing Stages Implemented
**Latest Update**: Stage 11 - Maintenance Management completed

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
- **Finance Operations**: http://localhost:3001/finance
- **HR & Payroll**: http://localhost:3001/hr-payroll
- **Login**: Use any email/password (e.g., admin@ashleyai.com / password123)

## Current System Status

### ✅ **COMPLETED STAGES (11/14)**
**Stages 1-11** are fully implemented and functional

### 🔄 **NEXT TO IMPLEMENT**
**Stage 12 - Client Portal** (Order Tracking, Design Approvals, Payment Management)

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

### ✅ Stage 8 - Delivery Operations
- Shipment creation and management with carton linking
- Multi-method delivery support (Driver, 3PL providers)
- Real-time delivery tracking with status updates
- Warehouse scan-out operations with QR codes
- Proof of delivery capture with photos and signatures
- 3PL integration with automated quotes and booking
- Dispatch board for logistics coordination
- Live tracking interface for monitoring deliveries

### ✅ Stage 9 - Finance Operations
- Invoice generation and management with line items
- Payment processing and tracking with multiple methods
- Credit notes for returns and adjustments
- Bank account management and transaction tracking
- Expense management with approval workflows
- Cost centers and budget management
- Financial reporting and analytics dashboard
- Cash flow tracking and accounts receivable management
- Tax settings and compliance features
- Real-time financial KPIs and metrics

### ✅ Stage 10 - HR & Payroll
- Employee management with comprehensive profiles and contact information
- Attendance tracking with time_in/time_out, breaks, and overtime
- Payroll calculation and processing for multiple salary types (DAILY, HOURLY, PIECE, MONTHLY)
- Performance tracking with piece-rate calculations for production workers
- HR analytics with productivity metrics and attendance rates
- Employee filtering by status, position, and department
- Integration with production runs for efficiency tracking
- Compliance and reporting capabilities

### ✅ Stage 11 - Maintenance Management *(Latest - Sept 16, 2025)*
- Asset management with comprehensive tracking and lifecycle management
- Work order creation and management with priority-based assignment
- Preventive maintenance scheduling with frequency-based automation
- Equipment status monitoring and performance tracking
- Maintenance cost tracking and budget management
- Overdue maintenance alerts and notification system
- Asset utilization analytics and optimization recommendations
- Integration with existing production workflow and quality control systems

### 🚧 **REMAINING STAGES TO IMPLEMENT**

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
- **Finance**: Invoices, InvoiceItems, Payments, CreditNotes, BankAccounts, Expenses, CostCenters, Budgets, FinancialReports
- **HR**: Employees, AttendanceLogs, PayrollPeriods, PayrollEarnings
- **Maintenance**: Assets, WorkOrders, MaintenanceSchedules

## Recent Updates Log

### 2025-09-16 - Stage 11 Maintenance Management
- ✅ Added comprehensive maintenance database models (3 new tables: Assets, WorkOrders, MaintenanceSchedules)
- ✅ Implemented asset management with lifecycle tracking and status monitoring
- ✅ Built work order management with priority-based assignment and status workflow
- ✅ Created preventive maintenance scheduling with frequency-based automation
- ✅ Added 4 new API endpoints for maintenance management (assets, work-orders, schedules, stats)
- ✅ Implemented maintenance dashboard with real-time analytics and alerts
- ✅ Added overdue maintenance tracking and notification system
- ✅ Integrated with existing employee and user management systems
- ✅ Created comprehensive maintenance statistics and reporting capabilities

### 2025-09-16 - Stage 10 HR & Payroll
- ✅ Added comprehensive employee management with salary types (DAILY, HOURLY, PIECE, MONTHLY)
- ✅ Implemented attendance tracking with time_in/time_out, breaks, and overtime
- ✅ Created payroll period and earnings management system
- ✅ Updated all HR API endpoints to match Prisma schema fields
- ✅ Connected HR page to real API data instead of mock data
- ✅ Added employee filtering by status, position, department
- ✅ Implemented HR analytics with productivity metrics and attendance rates
- ✅ Added workspace auto-creation in employee API
- ✅ Created database seeding scripts for HR data
- ✅ Fixed database connection paths and environment configuration

### 2025-09-16 - Stage 9 Finance Operations
- ✅ Added comprehensive finance database models (14 new tables)
- ✅ Implemented invoice management with line items and status tracking
- ✅ Built payment processing with multiple payment methods
- ✅ Created expense management with approval workflows
- ✅ Added bank account and transaction management
- ✅ Implemented cost centers and budget tracking
- ✅ Built financial reporting and analytics dashboard
- ✅ Created credit notes for returns and adjustments
- ✅ Updated Finance page with real-time API integration
- ✅ Added tax settings and compliance features

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
# Ashley AI - Updated Backup Script
# Creates comprehensive backup with Stage 9 Finance Operations
# Date: September 16, 2025

Write-Host "🚀 Ashley AI - Creating Updated Backup..." -ForegroundColor Green
Write-Host "📅 Including Stage 9 Finance Operations completion" -ForegroundColor Yellow

# Get current date and time for backup filename
$timestamp = Get-Date -Format "MM-dd-yyyy-HHmm"
$backupName = "Ashley-AI-Stage9-Complete-$timestamp"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$backupPath = Join-Path $desktopPath $backupName

Write-Host "📁 Creating backup directory: $backupName" -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Define what to copy (exclude node_modules and other large/unnecessary folders)
$excludePatterns = @(
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    "coverage",
    "*.log",
    ".env.local",
    ".DS_Store",
    "Thumbs.db"
)

# Function to copy files with exclusions
function Copy-WithExclusions {
    param($Source, $Destination, $ExcludePatterns)

    Get-ChildItem -Path $Source -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Substring($Source.Length + 1)
        $shouldExclude = $false

        foreach ($pattern in $ExcludePatterns) {
            if ($relativePath -like "*$pattern*") {
                $shouldExclude = $true
                break
            }
        }

        if (-not $shouldExclude) {
            $destinationPath = Join-Path $Destination $relativePath
            $destinationDir = Split-Path $destinationPath -Parent

            if (-not (Test-Path $destinationDir)) {
                New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
            }

            if ($_.PSIsContainer -eq $false) {
                Copy-Item $_.FullName $destinationPath -Force
            }
        }
    }
}

Write-Host "📋 Copying core system files..." -ForegroundColor Cyan

# Copy main system files
$sourceDir = "C:\Users\Khell\Desktop\Ashley AI"
Copy-WithExclusions -Source $sourceDir -Destination $backupPath -ExcludePatterns $excludePatterns

Write-Host "📄 Creating backup documentation..." -ForegroundColor Cyan

# Create backup info file
$backupInfo = @"
# Ashley AI - System Backup Information
**Backup Created**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**System Status**: Stage 9 Complete - Finance Operations
**Progress**: 9/14 Manufacturing Stages (64% Complete)

## 🎯 Latest Updates Included:
✅ Stage 9 - Finance Operations (Complete)
- 14 new database models for comprehensive financial management
- Invoice generation and management with line items
- Payment processing with multiple payment methods
- Expense management with approval workflows
- Bank account and transaction management
- Cost centers and budget tracking
- Financial reporting and analytics dashboard
- Real-time KPIs and metrics

✅ System Demos:
- ashley-ai-complete-demo.html - Full system showcase
- Interactive demos for all completed stages
- Live system access documentation

✅ Documentation:
- Updated CLAUDE.md with Stage 9 completion
- MEMORIZE.md - Quick reference guide
- Complete API documentation

## 🗄️ Database Models (Total: 50+):
### Core Models:
- Clients, Orders, OrderLineItems

### Production Models:
- Lays, Bundles, CuttingRuns, PrintRuns, SewingRuns

### Quality Models:
- QualityControlChecks, Inspections, DefectCodes, CAPA

### Logistics Models:
- FinishingRuns, FinishedUnits, Cartons, Shipments, Deliveries

### Finance Models (NEW - Stage 9):
- Invoices, InvoiceItems, Payments, CreditNotes
- BankAccounts, BankTransactions, Expenses
- CostCenters, CostAllocations, Budgets
- FinancialReports, ReportRuns, FinancialMetrics, TaxSettings

## 🚀 To Restore System:
1. Extract backup to desired location
2. Run: npm install or pnpm install
3. Generate database: cd packages/database && npx prisma generate
4. Start system: pnpm --filter admin dev
5. Access: http://localhost:3001

## 🔧 Technology Stack:
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Backend: Next.js API Routes
- Database: Prisma ORM + SQLite
- Icons: Lucide React
- Auth: Local authentication system

## 📊 Current System Metrics:
- Total Stages: 14 (9 Complete, 5 Remaining)
- Database Models: 50+ comprehensive models
- API Endpoints: 40+ RESTful endpoints
- UI Components: 100+ React components
- Code Files: 500+ TypeScript/JavaScript files

🤖 Generated with Claude Code | Ashley AI ERP System
"@

$backupInfo | Out-File -FilePath (Join-Path $backupPath "BACKUP_INFO.md") -Encoding UTF8

Write-Host "🎯 Creating quick start guide..." -ForegroundColor Cyan

# Create quick start guide for the backup
$quickStart = @"
# Ashley AI - Quick Start from Backup

## 🚀 Restoration Steps:

### 1. Prerequisites
- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)

### 2. Setup Commands:
\`\`\`bash
# Navigate to extracted backup folder
cd Ashley-AI-Stage9-Complete-[timestamp]

# Install dependencies (choose one)
npm install          # Using npm
# OR
pnpm install        # Using pnpm (recommended)

# Generate database
cd packages/database
npx prisma generate
cd ../..
\`\`\`

### 3. Start System:
\`\`\`bash
# Start admin interface
pnpm --filter admin dev
# OR
npm run dev --workspace=services/ash-admin
\`\`\`

### 4. Access System:
- **Main System**: http://localhost:3001
- **Finance Module**: http://localhost:3001/finance
- **Demo File**: Open ashley-ai-complete-demo.html in browser

### 5. Login:
- Use any email/password (e.g., admin@ashleyai.com / password123)
- Local auth system - no external service needed

## 📋 Available Features:
✅ Stage 1: Client & Order Intake
✅ Stage 2: Design & Approval Workflow
✅ Stage 3: Cutting Operations
✅ Stage 4: Printing Operations
✅ Stage 5: Sewing Operations
✅ Stage 6: Quality Control
✅ Stage 7: Finishing & Packing
✅ Stage 8: Delivery Operations
✅ Stage 9: Finance Operations ⭐ LATEST

## 🎮 Interactive Demos:
- **Complete System Demo**: ashley-ai-complete-demo.html
- **Live System Access**: http://localhost:3001
- **Documentation**: All .md files in root directory

🎯 System ready for Stage 10: HR & Payroll implementation!
"@

$quickStart | Out-File -FilePath (Join-Path $backupPath "QUICK_START.md") -Encoding UTF8

Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
Write-Host "📍 Location: $backupPath" -ForegroundColor Yellow
Write-Host "📊 Status: Stage 9 Finance Operations included" -ForegroundColor Green

# Open backup folder
Start-Process $backupPath
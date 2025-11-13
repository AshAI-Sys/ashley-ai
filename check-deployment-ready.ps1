# Ashley AI - Deployment Readiness Checker
# Verifies system is ready for production deployment

Write-Host "🔍 Ashley AI - Deployment Readiness Checker" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$checksTotal = 0
$checksPassed = 0
$checksFailed = 0
$warnings = @()

function Test-Check {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$SuccessMessage,
        [string]$FailureMessage,
        [bool]$Critical = $true
    )

    $script:checksTotal++
    Write-Host "Checking: $Name..." -NoNewline

    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            if ($SuccessMessage) {
                Write-Host "   $SuccessMessage" -ForegroundColor Gray
            }
            $script:checksPassed++
            return $true
        } else {
            if ($Critical) {
                Write-Host " ❌ FAIL" -ForegroundColor Red
                Write-Host "   $FailureMessage" -ForegroundColor Red
                $script:checksFailed++
            } else {
                Write-Host " ⚠️  WARN" -ForegroundColor Yellow
                Write-Host "   $FailureMessage" -ForegroundColor Yellow
                $script:warnings += $Name
            }
            return $false
        }
    }
    catch {
        if ($Critical) {
            Write-Host " ❌ FAIL" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            $script:checksFailed++
        } else {
            Write-Host " ⚠️  WARN" -ForegroundColor Yellow
            $script:warnings += $Name
        }
        return $false
    }
}

# Check 1: Node.js installed
Test-Check -Name "Node.js installation" -Test {
    $node = Get-Command node -ErrorAction SilentlyContinue
    return $null -ne $node
} -SuccessMessage "Node.js is installed" -FailureMessage "Node.js not found. Install from nodejs.org"

# Check 2: Git installed
Test-Check -Name "Git installation" -Test {
    $git = Get-Command git -ErrorAction SilentlyContinue
    return $null -ne $git
} -SuccessMessage "Git is installed" -FailureMessage "Git not found. Install from git-scm.com"

# Check 3: pnpm installed
Test-Check -Name "pnpm installation" -Test {
    $pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
    return $null -ne $pnpm
} -SuccessMessage "pnpm is installed" -FailureMessage "pnpm not found. Run: npm install -g pnpm"

# Check 4: Vercel CLI installed
Test-Check -Name "Vercel CLI installation" -Test {
    $vercel = Get-Command vercel -ErrorAction SilentlyContinue
    return $null -ne $vercel
} -SuccessMessage "Vercel CLI is installed" -FailureMessage "Vercel CLI not found. Run: npm install -g vercel"

# Check 5: EAS CLI installed
Test-Check -Name "EAS CLI installation" -Test {
    $eas = Get-Command eas -ErrorAction SilentlyContinue
    return $null -ne $eas
} -SuccessMessage "EAS CLI is installed" -FailureMessage "EAS CLI not found. Run: npm install -g eas-cli"

# Check 6: package.json exists
Test-Check -Name "package.json exists" -Test {
    return Test-Path "package.json"
} -SuccessMessage "Root package.json found" -FailureMessage "package.json not found in current directory"

# Check 7: Admin service exists
Test-Check -Name "Admin service directory" -Test {
    return Test-Path "services/ash-admin"
} -SuccessMessage "Admin service found" -FailureMessage "services/ash-admin directory not found"

# Check 8: Mobile app exists
Test-Check -Name "Mobile app directory" -Test {
    return Test-Path "services/ash-mobile"
} -SuccessMessage "Mobile app found" -FailureMessage "services/ash-mobile directory not found"

# Check 9: Database package exists
Test-Check -Name "Database package" -Test {
    return Test-Path "packages/database"
} -SuccessMessage "Database package found" -FailureMessage "packages/database directory not found"

# Check 10: Prisma schema exists
Test-Check -Name "Prisma schema file" -Test {
    return Test-Path "packages/database/prisma/schema.prisma"
} -SuccessMessage "Prisma schema found" -FailureMessage "schema.prisma not found"

# Check 11: Git repository initialized
Test-Check -Name "Git repository" -Test {
    return Test-Path ".git"
} -SuccessMessage "Git repository initialized" -FailureMessage "Not a git repository. Run: git init"

# Check 12: Git has commits
Test-Check -Name "Git commits" -Test {
    $commits = git rev-list --count HEAD 2>&1
    return $LASTEXITCODE -eq 0 -and $commits -gt 0
} -SuccessMessage "Git has commits" -FailureMessage "No git commits found. Commit your code first"

# Check 13: Git remote configured
Test-Check -Name "Git remote repository" -Test {
    $remote = git remote -v 2>&1
    return $LASTEXITCODE -eq 0 -and $remote
} -SuccessMessage "Git remote configured" -FailureMessage "No git remote. Run: git remote add origin URL"

# Check 14: No uncommitted changes (warning only)
Test-Check -Name "Uncommitted changes" -Test {
    $status = git status --short
    return -not $status
} -SuccessMessage "Working directory clean" -FailureMessage "Uncommitted changes detected" -Critical $false

# Check 15: Dependencies installed
Test-Check -Name "node_modules exists" -Test {
    return Test-Path "node_modules"
} -SuccessMessage "Dependencies installed" -FailureMessage "Dependencies not installed. Run: pnpm install"

# Check 16: Build output exists
Test-Check -Name "Previous build" -Test {
    return Test-Path "services/ash-admin/.next"
} -SuccessMessage "Build artifacts found" -FailureMessage "No build found. Run: pnpm build" -Critical $false

# Check 17: .env file exists (warning only)
Test-Check -Name ".env file" -Test {
    return Test-Path "packages/database/.env"
} -SuccessMessage ".env file found" -FailureMessage "No .env file. Copy from .env.example" -Critical $false

# Check 18: Deployment guides exist
Test-Check -Name "Deployment guides" -Test {
    return (Test-Path "PRODUCTION-DEPLOYMENT-GUIDE.md") -and (Test-Path "QUICK-DEPLOYMENT-STEPS.md")
} -SuccessMessage "Deployment guides found" -FailureMessage "Deployment guides missing"

# Check 19: eas.json configured
Test-Check -Name "EAS configuration" -Test {
    return Test-Path "services/ash-mobile/eas.json"
} -SuccessMessage "EAS build configured" -FailureMessage "eas.json not found in mobile app"

# Check 20: TypeScript compilation
Write-Host "Checking: TypeScript compilation..." -NoNewline
$checksTotal++
Set-Location "services/ash-admin"
$tscOutput = npx tsc --noEmit 2>&1
$tscErrors = $tscOutput | Select-String "error TS"
Set-Location "../.."

if ($tscErrors.Count -eq 0) {
    Write-Host " ✅ PASS" -ForegroundColor Green
    Write-Host "   0 TypeScript errors" -ForegroundColor Gray
    $checksPassed++
} else {
    Write-Host " ❌ FAIL" -ForegroundColor Red
    Write-Host "   $($tscErrors.Count) TypeScript errors found" -ForegroundColor Red
    $checksFailed++
}

# Summary
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Deployment Readiness Summary" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Checks: $checksTotal" -ForegroundColor White
Write-Host "Passed: $checksPassed" -ForegroundColor Green
Write-Host "Failed: $checksFailed" -ForegroundColor Red
Write-Host "Warnings: $($warnings.Count)" -ForegroundColor Yellow
Write-Host ""

if ($warnings.Count -gt 0) {
    Write-Host "Warnings:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
}

# Overall status
$readinessScore = [math]::Round(($checksPassed / $checksTotal) * 100, 1)
Write-Host "Readiness Score: $readinessScore%" -ForegroundColor $(if ($readinessScore -ge 90) { "Green" } elseif ($readinessScore -ge 75) { "Yellow" } else { "Red" })
Write-Host ""

if ($checksFailed -eq 0) {
    Write-Host "✅ System is ready for production deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Sign up for Semaphore SMS: https://semaphore.co" -ForegroundColor White
    Write-Host "2. Setup PostgreSQL database (Railway/Supabase/Neon)" -ForegroundColor White
    Write-Host "3. Run deployment: .\deploy-to-production.ps1" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "❌ System is NOT ready for deployment" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the failed checks above before deploying." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

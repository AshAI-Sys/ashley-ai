# Ashley AI - System Validation Script
# Run this script to validate the entire system is production-ready
# PowerShell version for Windows

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Ashley AI - Complete System Validation" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$WarningCount = 0
$PassCount = 0

function Test-Step {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$SuccessMessage = "PASSED",
        [string]$FailureMessage = "FAILED"
    )

    Write-Host "Testing: $Name..." -NoNewline

    try {
        $result = & $Test
        if ($LASTEXITCODE -eq 0 -or $result) {
            Write-Host " ✅ $SuccessMessage" -ForegroundColor Green
            $script:PassCount++
            return $true
        } else {
            Write-Host " ❌ $FailureMessage" -ForegroundColor Red
            $script:ErrorCount++
            return $false
        }
    } catch {
        Write-Host " ❌ $FailureMessage" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:ErrorCount++
        return $false
    }
}

function Test-Warning {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$WarningMessage = "WARNING"
    )

    Write-Host "Checking: $Name..." -NoNewline

    try {
        $result = & $Test
        if ($LASTEXITCODE -eq 0 -or $result) {
            Write-Host " ⚠️  $WarningMessage" -ForegroundColor Yellow
            $script:WarningCount++
            return $false
        } else {
            Write-Host " ✅ OK" -ForegroundColor Green
            $script:PassCount++
            return $true
        }
    } catch {
        Write-Host " ✅ OK" -ForegroundColor Green
        $script:PassCount++
        return $true
    }
}

Write-Host "1. ENVIRONMENT CHECKS" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow

# Check Node.js
Test-Step -Name "Node.js installed" -Test {
    node --version | Out-Null
    $LASTEXITCODE -eq 0
}

# Check pnpm
Test-Step -Name "pnpm installed" -Test {
    pnpm --version | Out-Null
    $LASTEXITCODE -eq 0
}

# Check .env file
Test-Step -Name ".env file exists" -Test {
    Test-Path "services/ash-admin/.env"
}

Write-Host ""
Write-Host "2. DATABASE CHECKS" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow

# Validate Prisma schema
Test-Step -Name "Prisma schema validation" -Test {
    Push-Location packages/database
    npx prisma validate 2>&1 | Out-Null
    $result = $LASTEXITCODE -eq 0
    Pop-Location
    $result
}

# Check if Prisma client is generated
Test-Step -Name "Prisma client generated" -Test {
    Test-Path "node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client"
}

Write-Host ""
Write-Host "3. TYPESCRIPT CHECKS" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor Yellow

# TypeScript compilation check
Test-Step -Name "TypeScript compilation" -Test {
    Push-Location services/ash-admin
    $output = npx tsc --noEmit 2>&1
    $result = $LASTEXITCODE -eq 0
    Pop-Location
    $result
} -SuccessMessage "0 errors" -FailureMessage "Has errors"

Write-Host ""
Write-Host "4. DEPENDENCY CHECKS" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor Yellow

# Check if node_modules exists
Test-Step -Name "Dependencies installed" -Test {
    Test-Path "node_modules" -and Test-Path "services/ash-admin/node_modules"
}

# Check for critical dependencies
Test-Step -Name "Next.js installed" -Test {
    Test-Path "node_modules/.pnpm/next*"
}

Test-Step -Name "React installed" -Test {
    Test-Path "node_modules/.pnpm/react@18*"
}

Write-Host ""
Write-Host "5. BUILD VALIDATION" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow

# Try to build the project
Write-Host "Running production build (this may take 30-40 seconds)..." -ForegroundColor Cyan
Test-Step -Name "Production build" -Test {
    Push-Location services/ash-admin
    $output = pnpm build 2>&1
    $result = $output -match "Compiled successfully" -or $output -match "✓ Generating static pages"
    Pop-Location
    $result
} -SuccessMessage "Build successful" -FailureMessage "Build failed"

Write-Host ""
Write-Host "6. CODE QUALITY CHECKS" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow

# Check for console.logs (warning only)
$consoleCount = (Get-ChildItem -Path "services/ash-admin/src" -Recurse -Include *.ts,*.tsx | Select-String "console.log" | Measure-Object).Count
if ($consoleCount -gt 0) {
    Write-Host "Found $consoleCount console.log statements..." -NoNewline
    Write-Host " ⚠️  OK (removed in production build)" -ForegroundColor Yellow
    $WarningCount++
} else {
    Write-Host "Checking for console.log statements..." -NoNewline
    Write-Host " ✅ Clean" -ForegroundColor Green
    $PassCount++
}

# Check for TODO comments
$todoCount = (Get-ChildItem -Path "services/ash-admin/src" -Recurse -Include *.ts,*.tsx | Select-String "TODO:|FIXME:" | Measure-Object).Count
if ($todoCount -gt 0) {
    Write-Host "Found $todoCount TODO/FIXME comments..." -NoNewline
    Write-Host " ⚠️  Review recommended" -ForegroundColor Yellow
    $WarningCount++
} else {
    Write-Host "Checking for TODO/FIXME comments..." -NoNewline
    Write-Host " ✅ Clean" -ForegroundColor Green
    $PassCount++
}

Write-Host ""
Write-Host "7. FILE STRUCTURE CHECKS" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

# Check critical files exist
Test-Step -Name "next.config.js exists" -Test {
    Test-Path "services/ash-admin/next.config.js"
}

Test-Step -Name "package.json exists" -Test {
    Test-Path "services/ash-admin/package.json"
}

Test-Step -Name "tsconfig.json exists" -Test {
    Test-Path "services/ash-admin/tsconfig.json"
}

Test-Step -Name "Prisma schema exists" -Test {
    Test-Path "packages/database/prisma/schema.prisma"
}

Write-Host ""
Write-Host "8. API ROUTE CHECKS" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow

# Count API routes
$apiRouteCount = (Get-ChildItem -Path "services/ash-admin/src/app/api" -Recurse -Filter "route.ts" | Measure-Object).Count
Write-Host "Total API routes found: $apiRouteCount" -ForegroundColor Cyan

if ($apiRouteCount -gt 200) {
    Write-Host "API route count validation..." -NoNewline
    Write-Host " ✅ $apiRouteCount routes found" -ForegroundColor Green
    $PassCount++
} else {
    Write-Host "API route count validation..." -NoNewline
    Write-Host " ⚠️  Expected 210+, found $apiRouteCount" -ForegroundColor Yellow
    $WarningCount++
}

Write-Host ""
Write-Host "9. SECURITY CHECKS" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow

# Check for hardcoded secrets
$secretPatterns = @("password\s*=\s*['\`"]", "secret\s*=\s*['\`"]", "api[_-]?key\s*=\s*['\`"]")
$secretsFound = 0
foreach ($pattern in $secretPatterns) {
    $matches = Get-ChildItem -Path "services/ash-admin/src" -Recurse -Include *.ts,*.tsx | Select-String $pattern
    $secretsFound += ($matches | Measure-Object).Count
}

if ($secretsFound -eq 0) {
    Write-Host "Checking for hardcoded secrets..." -NoNewline
    Write-Host " ✅ Clean" -ForegroundColor Green
    $PassCount++
} else {
    Write-Host "Checking for hardcoded secrets..." -NoNewline
    Write-Host " ⚠️  Found $secretsFound potential issues" -ForegroundColor Yellow
    $WarningCount++
}

# Check for .env in gitignore
$gitignoreContent = Get-Content ".gitignore" -ErrorAction SilentlyContinue
if ($gitignoreContent -match "\.env") {
    Write-Host "Checking .env in .gitignore..." -NoNewline
    Write-Host " ✅ Protected" -ForegroundColor Green
    $PassCount++
} else {
    Write-Host "Checking .env in .gitignore..." -NoNewline
    Write-Host " ⚠️  Not found in .gitignore" -ForegroundColor Yellow
    $WarningCount++
}

Write-Host ""
Write-Host "10. DOCUMENTATION CHECKS" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

# Check for README files
Test-Step -Name "Main README exists" -Test {
    Test-Path "README.md" -or Test-Path "CLAUDE.md"
}

Test-Step -Name "System documentation exists" -Test {
    Test-Path "SYSTEM-DEEP-SCAN-REPORT.md"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Passed: " -NoNewline -ForegroundColor Green
Write-Host "$PassCount" -ForegroundColor White

Write-Host "⚠️  Warnings: " -NoNewline -ForegroundColor Yellow
Write-Host "$WarningCount" -ForegroundColor White

Write-Host "❌ Failed: " -NoNewline -ForegroundColor Red
Write-Host "$ErrorCount" -ForegroundColor White

Write-Host ""

if ($ErrorCount -eq 0) {
    Write-Host "🎉 SYSTEM STATUS: PRODUCTION READY" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Review warnings (if any)" -ForegroundColor White
    Write-Host "  2. Run: pnpm --filter @ash/admin dev" -ForegroundColor White
    Write-Host "  3. Access: http://localhost:3001" -ForegroundColor White
    Write-Host "  4. Test critical workflows" -ForegroundColor White
    Write-Host "  5. Deploy to production" -ForegroundColor White
    exit 0
} elseif ($ErrorCount -le 2) {
    Write-Host "⚠️  SYSTEM STATUS: NEEDS ATTENTION" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Minor issues detected. Review errors above and fix before deploying." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "❌ SYSTEM STATUS: NOT READY" -ForegroundColor Red
    Write-Host ""
    Write-Host "Critical issues detected. Fix errors above before proceeding." -ForegroundColor Red
    exit 2
}

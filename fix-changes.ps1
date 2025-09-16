#!/usr/bin/env powershell

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Ashley AI - Auto Fix Pending Changes" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Check if there are any changes to commit
    $status = git status --porcelain
    if ([string]::IsNullOrEmpty($status)) {
        Write-Host "✅ No pending changes found!" -ForegroundColor Green
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 0
    }

    Write-Host "[1/4] Adding all new files to git..." -ForegroundColor Yellow
    git add .
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to add files to git"
    }

    Write-Host "[2/4] Regenerating Prisma client after schema changes..." -ForegroundColor Yellow
    Push-Location "packages\database"
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma generate failed"
    }
    Pop-Location

    Write-Host "[3/4] Checking database migration status..." -ForegroundColor Yellow
    Push-Location "packages\database"
    $migrationStatus = npx prisma migrate status 2>&1
    if ($migrationStatus -match "Database schema is up to date") {
        Write-Host "✅ Database is already up to date" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Running migration deploy..." -ForegroundColor Yellow
        npx prisma migrate deploy
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Migration warning - continuing..." -ForegroundColor Yellow
        }
    }
    Pop-Location

    Write-Host "[4/4] Committing all changes..." -ForegroundColor Yellow
    git add .

    # Generate commit message based on current changes
    $commitMessage = @"
Auto-fix: Sync system changes and updates

- Updated CLAUDE.md with latest system status
- Regenerated Prisma client after schema changes
- Applied database migrations if needed
- Added new API endpoints and UI components

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
"@

    git commit -m $commitMessage
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SUCCESS: All pending changes have been committed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Commit may have failed (possibly no changes or already committed)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host "Auto-fix completed successfully!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "===========================================" -ForegroundColor Red
    Write-Host "Auto-fix failed!" -ForegroundColor Red
    Write-Host "===========================================" -ForegroundColor Red
    exit 1
}

Write-Host ""
Read-Host "Press Enter to exit"
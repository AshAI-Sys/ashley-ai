# ========================================
# Ashley AI - System Cleanup Script
# ========================================
# Removes unnecessary files, caches, and duplicates
# Safe to run - won't delete source code

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ashley AI - System Cleanup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$startSize = (Get-ChildItem -Path . -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB

# Initialize counters
$totalDeleted = 0
$filesDeleted = 0

# ========================================
# 1. Clean Build Artifacts
# ========================================
Write-Host "Step 1: Cleaning build artifacts..." -ForegroundColor Blue

$buildDirs = @(".next", "dist", "build", "out", ".turbo")
foreach ($dir in $buildDirs) {
    $found = Get-ChildItem -Path . -Directory -Recurse -Force -Filter $dir -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules" }
    foreach ($item in $found) {
        Write-Host "  Removing: $($item.FullName)" -ForegroundColor Yellow
        Remove-Item -Path $item.FullName -Recurse -Force -ErrorAction SilentlyContinue
        $filesDeleted++
    }
}
Write-Host "✓ Build artifacts cleaned" -ForegroundColor Green
Write-Host ""

# ========================================
# 2. Clean Cache Directories
# ========================================
Write-Host "Step 2: Cleaning cache directories..." -ForegroundColor Blue

$cacheDirs = @(".cache", ".temp", ".tmp", "tmp", "temp")
foreach ($dir in $cacheDirs) {
    $found = Get-ChildItem -Path . -Directory -Recurse -Force -Filter $dir -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules" }
    foreach ($item in $found) {
        Write-Host "  Removing: $($item.FullName)" -ForegroundColor Yellow
        Remove-Item -Path $item.FullName -Recurse -Force -ErrorAction SilentlyContinue
        $filesDeleted++
    }
}
Write-Host "✓ Cache directories cleaned" -ForegroundColor Green
Write-Host ""

# ========================================
# 3. Clean Temporary Files
# ========================================
Write-Host "Step 3: Cleaning temporary files..." -ForegroundColor Blue

$tempFiles = @("*.log", "*.tmp", ".DS_Store", "Thumbs.db", "*.cache", "*.swp", "*.swo", "*~")
foreach ($pattern in $tempFiles) {
    $found = Get-ChildItem -Path . -File -Recurse -Force -Filter $pattern -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules" }
    foreach ($item in $found) {
        Write-Host "  Removing: $($item.Name)" -ForegroundColor Yellow
        Remove-Item -Path $item.FullName -Force -ErrorAction SilentlyContinue
        $filesDeleted++
    }
}
Write-Host "✓ Temporary files cleaned" -ForegroundColor Green
Write-Host ""

# ========================================
# 4. Clean TypeScript Build Artifacts
# ========================================
Write-Host "Step 4: Cleaning TypeScript artifacts..." -ForegroundColor Blue

# Remove .d.ts files (except in node_modules)
$dtsFiles = Get-ChildItem -Path . -File -Recurse -Force -Filter "*.d.ts" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules" -and
    $_.FullName -notmatch "packages\\database" -and
    $_.DirectoryName -notmatch "types"
}
foreach ($item in $dtsFiles) {
    Write-Host "  Removing: $($item.Name)" -ForegroundColor Yellow
    Remove-Item -Path $item.FullName -Force -ErrorAction SilentlyContinue
    $filesDeleted++
}

# Remove .tsbuildinfo files
$tsbuildinfoFiles = Get-ChildItem -Path . -File -Recurse -Force -Filter "*.tsbuildinfo" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules" }
foreach ($item in $tsbuildinfoFiles) {
    Write-Host "  Removing: $($item.Name)" -ForegroundColor Yellow
    Remove-Item -Path $item.FullName -Force -ErrorAction SilentlyContinue
    $filesDeleted++
}

Write-Host "✓ TypeScript artifacts cleaned" -ForegroundColor Green
Write-Host ""

# ========================================
# 5. Clean Duplicate Documentation
# ========================================
Write-Host "Step 5: Cleaning duplicate documentation..." -ForegroundColor Blue

$duplicateDocs = @(
    "QUICK_START_OLD.md",
    "README_OLD.md",
    "CHANGELOG_OLD.md",
    "TODO.md",
    "NOTES.md"
)

foreach ($doc in $duplicateDocs) {
    $found = Get-ChildItem -Path . -File -Recurse -Force -Filter $doc -ErrorAction SilentlyContinue
    foreach ($item in $found) {
        Write-Host "  Removing: $($item.FullName)" -ForegroundColor Yellow
        Remove-Item -Path $item.FullName -Force -ErrorAction SilentlyContinue
        $filesDeleted++
    }
}
Write-Host "✓ Duplicate documentation cleaned" -ForegroundColor Green
Write-Host ""

# ========================================
# 6. Clean Test Coverage Reports
# ========================================
Write-Host "Step 6: Cleaning test coverage..." -ForegroundColor Blue

$coverageDirs = @("coverage", ".nyc_output", "test-results")
foreach ($dir in $coverageDirs) {
    $found = Get-ChildItem -Path . -Directory -Recurse -Force -Filter $dir -ErrorAction SilentlyContinue
    foreach ($item in $found) {
        Write-Host "  Removing: $($item.FullName)" -ForegroundColor Yellow
        Remove-Item -Path $item.FullName -Recurse -Force -ErrorAction SilentlyContinue
        $filesDeleted++
    }
}
Write-Host "✓ Test coverage cleaned" -ForegroundColor Green
Write-Host ""

# ========================================
# 7. Clean Empty Directories
# ========================================
Write-Host "Step 7: Cleaning empty directories..." -ForegroundColor Blue

$emptyDirs = Get-ChildItem -Path . -Directory -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object {
        $_.FullName -notmatch "node_modules" -and
        $_.FullName -notmatch "\.git" -and
        (Get-ChildItem -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0
    }

foreach ($dir in $emptyDirs) {
    Write-Host "  Removing: $($dir.FullName)" -ForegroundColor Yellow
    Remove-Item -Path $dir.FullName -Force -ErrorAction SilentlyContinue
    $filesDeleted++
}
Write-Host "✓ Empty directories cleaned" -ForegroundColor Green
Write-Host ""

# ========================================
# 8. Clean Package Manager Caches (Optional)
# ========================================
Write-Host "Step 8: Do you want to clean package manager caches? (pnpm, npm)" -ForegroundColor Yellow
Write-Host "  This will remove downloaded packages but they'll be re-downloaded on next install" -ForegroundColor Yellow
$cleanPkgCache = Read-Host "Clean package caches? (y/n)"

if ($cleanPkgCache -eq "y" -or $cleanPkgCache -eq "Y") {
    Write-Host "  Cleaning pnpm cache..." -ForegroundColor Blue
    try {
        pnpm store prune 2>&1 | Out-Null
        Write-Host "  ✓ pnpm cache cleaned" -ForegroundColor Green
    } catch {
        Write-Host "  ! pnpm not found or error" -ForegroundColor Yellow
    }

    Write-Host "  Cleaning npm cache..." -ForegroundColor Blue
    try {
        npm cache clean --force 2>&1 | Out-Null
        Write-Host "  ✓ npm cache cleaned" -ForegroundColor Green
    } catch {
        Write-Host "  ! npm error" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Skipped package cache cleaning" -ForegroundColor Yellow
}
Write-Host ""

# ========================================
# 9. Clean Old Database Backups (Optional)
# ========================================
Write-Host "Step 9: Checking for old database backups..." -ForegroundColor Blue

$dbBackups = Get-ChildItem -Path . -File -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match "\.db\.backup|\.sql\.backup|backup.*\.db|backup.*\.sql" -and $_.FullName -notmatch "node_modules" }

if ($dbBackups.Count -gt 0) {
    Write-Host "  Found $($dbBackups.Count) old database backups" -ForegroundColor Yellow
    Write-Host "  Do you want to remove them? (y/n)" -ForegroundColor Yellow
    $cleanBackups = Read-Host

    if ($cleanBackups -eq "y" -or $cleanBackups -eq "Y") {
        foreach ($backup in $dbBackups) {
            Write-Host "  Removing: $($backup.Name)" -ForegroundColor Yellow
            Remove-Item -Path $backup.FullName -Force -ErrorAction SilentlyContinue
            $filesDeleted++
        }
        Write-Host "  ✓ Old backups cleaned" -ForegroundColor Green
    } else {
        Write-Host "  Skipped backup cleaning" -ForegroundColor Yellow
    }
} else {
    Write-Host "  No old backups found" -ForegroundColor Green
}
Write-Host ""

# ========================================
# 10. Clean Git Ignored Files (Optional)
# ========================================
Write-Host "Step 10: Do you want to clean all Git-ignored files?" -ForegroundColor Yellow
Write-Host "  This will remove everything in .gitignore (safe but thorough)" -ForegroundColor Yellow
$cleanGitIgnored = Read-Host "Clean Git-ignored files? (y/n)"

if ($cleanGitIgnored -eq "y" -or $cleanGitIgnored -eq "Y") {
    Write-Host "  Running git clean..." -ForegroundColor Blue
    try {
        git clean -fdX 2>&1 | Out-Null
        Write-Host "  ✓ Git-ignored files cleaned" -ForegroundColor Green
    } catch {
        Write-Host "  ! Git not found or not a git repository" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Skipped Git clean" -ForegroundColor Yellow
}
Write-Host ""

# ========================================
# Summary
# ========================================
$endSize = (Get-ChildItem -Path . -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
$saved = $startSize - $endSize

Write-Host "========================================" -ForegroundColor Green
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Statistics:" -ForegroundColor Blue
Write-Host "  Files/Directories Removed: $filesDeleted" -ForegroundColor White
Write-Host "  Space Before: $([math]::Round($startSize, 2)) GB" -ForegroundColor White
Write-Host "  Space After: $([math]::Round($endSize, 2)) GB" -ForegroundColor White
Write-Host "  Space Saved: $([math]::Round($saved, 2)) GB" -ForegroundColor Green
Write-Host ""
Write-Host "Your Ashley AI system is now clean! ✨" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "  1. Run 'pnpm install' to ensure dependencies are installed" -ForegroundColor White
Write-Host "  2. Run 'pnpm build' to rebuild if needed" -ForegroundColor White
Write-Host "  3. Test your application" -ForegroundColor White
Write-Host ""
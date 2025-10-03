# Ashley AI - Deep System Cleanup Script
# Safe cleanup script that preserves database and essential files

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Ashley AI - Deep System Cleanup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date
$totalSize = 0

# Function to calculate folder size
function Get-FolderSize {
    param([string]$Path)
    try {
        $size = (Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        return $size
    } catch {
        return 0
    }
}

# Function to format bytes
function Format-Bytes {
    param([long]$Bytes)
    if ($Bytes -gt 1GB) { return "{0:N2} GB" -f ($Bytes / 1GB) }
    elseif ($Bytes -gt 1MB) { return "{0:N2} MB" -f ($Bytes / 1MB) }
    elseif ($Bytes -gt 1KB) { return "{0:N2} KB" -f ($Bytes / 1KB) }
    else { return "$Bytes Bytes" }
}

# Function to safely remove directory
function Remove-SafeDirectory {
    param(
        [string]$Path,
        [string]$Name
    )
    if (Test-Path $Path) {
        $size = Get-FolderSize -Path $Path
        Write-Host "  Removing $Name..." -ForegroundColor Yellow -NoNewline
        try {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
            Write-Host " OK (freed $(Format-Bytes $size))" -ForegroundColor Green
            return $size
        } catch {
            Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
            return 0
        }
    } else {
        Write-Host "  $Name not found (skipped)" -ForegroundColor Gray
        return 0
    }
}

Write-Host "[1/7] Cleaning node_modules..." -ForegroundColor Cyan
$totalSize += Remove-SafeDirectory -Path ".\node_modules" -Name "Root node_modules"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-admin\node_modules" -Name "Admin node_modules"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-portal\node_modules" -Name "Portal node_modules"
$totalSize += Remove-SafeDirectory -Path ".\packages\database\node_modules" -Name "Database node_modules"

Write-Host ""
Write-Host "[2/7] Cleaning build artifacts..." -ForegroundColor Cyan
$totalSize += Remove-SafeDirectory -Path ".\services\ash-admin\.next" -Name "Admin .next"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-portal\.next" -Name "Portal .next"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-admin\out" -Name "Admin out"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-portal\out" -Name "Portal out"
$totalSize += Remove-SafeDirectory -Path ".\packages\database\dist" -Name "Database dist"

Write-Host ""
Write-Host "[3/7] Cleaning cache files..." -ForegroundColor Cyan
$totalSize += Remove-SafeDirectory -Path ".\.turbo" -Name ".turbo cache"
$totalSize += Remove-SafeDirectory -Path ".\.next" -Name "Root .next"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-admin\.turbo" -Name "Admin .turbo"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-portal\.turbo" -Name "Portal .turbo"

Write-Host ""
Write-Host "[4/7] Cleaning log files..." -ForegroundColor Cyan
$totalSize += Remove-SafeDirectory -Path ".\logs" -Name "Root logs"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-admin\logs" -Name "Admin logs"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-portal\logs" -Name "Portal logs"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-ai\logs" -Name "AI logs"
$totalSize += Remove-SafeDirectory -Path ".\services\ash-api\logs" -Name "API logs"

Write-Host ""
Write-Host "[5/7] Cleaning temporary files..." -ForegroundColor Cyan
Get-ChildItem -Path . -Recurse -File -Include "*.log", "*.tmp", "*.temp" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $size = $_.Length
        Remove-Item $_.FullName -Force -ErrorAction Stop
        $totalSize += $size
        Write-Host "  Removed: $($_.Name)" -ForegroundColor Gray
    } catch {
        Write-Host "  Failed to remove: $($_.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "[6/7] Cleaning TypeScript build files..." -ForegroundColor Cyan
Get-ChildItem -Path . -Recurse -File -Include "*.tsbuildinfo" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $size = $_.Length
        Remove-Item $_.FullName -Force -ErrorAction Stop
        $totalSize += $size
        Write-Host "  Removed: $($_.Name)" -ForegroundColor Gray
    } catch {
        Write-Host "  Failed to remove: $($_.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "[7/7] Verifying protected files..." -ForegroundColor Cyan
$protectedFiles = @(
    ".\packages\database\dev.db",
    ".\packages\database\prisma\schema.prisma",
    ".\.env",
    ".\services\ash-admin\.env",
    ".\services\ash-portal\.env"
)

foreach ($file in $protectedFiles) {
    if (Test-Path $file) {
        Write-Host "  Protected: $file" -ForegroundColor Green
    } else {
        Write-Host "  Warning: $file not found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Cleanup Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Total space freed: $(Format-Bytes $totalSize)" -ForegroundColor Green
Write-Host "Time taken: $((Get-Date) - $startTime)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: pnpm install" -ForegroundColor White
Write-Host "  2. Run: cd packages/database && npx prisma generate" -ForegroundColor White
Write-Host "  3. Run: pnpm --filter @ash/admin dev" -ForegroundColor White
Write-Host ""
Write-Host "Database preserved: .\packages\database\dev.db" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

# PowerShell script to fix all remaining TypeScript errors

$ServicesRoot = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

Write-Host "Starting Final Error Fix (100% Goal)..." -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$fixedCount = 0

# Fix 1: role-activities.tsx - Replace _user with user
$roleActivitiesFile = "src/components/dashboard/role-activities.tsx"
$fullPath = Join-Path $ServicesRoot $roleActivitiesFile
if (Test-Path -LiteralPath $fullPath) {
    $content = Get-Content -LiteralPath $fullPath -Raw
    if ($content -match '\b_user\b') {
        Write-Host "[FIX] $roleActivitiesFile - Replace _user with user" -ForegroundColor Green
        $content = $content -replace '\b_user\b', 'user'
        Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
        $fixedCount++
    }
}

# Fix 2: audit/logger.ts - Replace workspaceId with workspace_id
$auditLoggerFile = "src/lib/audit/logger.ts"
$fullPath = Join-Path $ServicesRoot $auditLoggerFile
if (Test-Path -LiteralPath $fullPath) {
    $lines = Get-Content -LiteralPath $fullPath
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "log\.workspaceId") {
            Write-Host "[FIX] $auditLoggerFile - Replace log.workspaceId with log.workspace_id" -ForegroundColor Green
            $lines[$i] = $lines[$i] -replace 'log\.workspaceId', 'log.workspace_id'
            Set-Content -LiteralPath $fullPath -Value $lines -Encoding UTF8
            $fixedCount++
            break
        }
    }
}

# Fix 3: error-logger.ts - Comment out Sentry.startTransaction (not available in this Sentry version)
$errorLoggerFile = "src/lib/error-logger.ts"
$fullPath = Join-Path $ServicesRoot $errorLoggerFile
if (Test-Path -LiteralPath $fullPath) {
    $lines = Get-Content -LiteralPath $fullPath
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "Sentry\.startTransaction") {
            Write-Host "[FIX] $errorLoggerFile - Comment out Sentry.startTransaction" -ForegroundColor Green
            $lines[$i] = "    // " + $lines[$i].Trim() + " // Not available in this Sentry version"
            Set-Content -LiteralPath $fullPath -Value $lines -Encoding UTF8
            $fixedCount++
            break
        }
    }
}

# Fix 4: check-db.ts - Add types to implicit any parameters (utility file)
$checkDbFile = "check-db.ts"
$fullPath = Join-Path $ServicesRoot $checkDbFile
if (Test-Path -LiteralPath $fullPath) {
    Write-Host "[FIX] $checkDbFile - Add types to callback parameters" -ForegroundColor Green
    $content = Get-Content -LiteralPath $fullPath -Raw
    $content = $content -replace '\(\s*u\s*\)\s*=>', '(u: any) =>'
    $content = $content -replace '\(\s*ws\s*,\s*idx\s*\)\s*=>', '(ws: any, idx: number) =>'
    $content = $content -replace '\(\s*u\s*,\s*idx\s*\)\s*=>', '(u: any, idx: number) =>'
    Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
    $fixedCount++
}

# Fix 5: token-rotation.ts - Fix role type
$tokenRotationFile = "src/lib/token-rotation.ts"
$fullPath = Join-Path $ServicesRoot $tokenRotationFile
if (Test-Path -LiteralPath $fullPath) {
    $lines = Get-Content -LiteralPath $fullPath
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "userId.*email.*role.*workspaceId" -and $lines[$i] -match "role:\s*string") {
            Write-Host "[FIX] $tokenRotationFile - Cast role to UserRole" -ForegroundColor Green
            $lines[$i] = $lines[$i] -replace 'role:\s*string', 'role: payload.role as UserRole'
            $lines[$i] = $lines[$i] -replace 'role:\s*payload\.role', 'role: payload.role as UserRole'
            Set-Content -LiteralPath $fullPath -Value $lines -Encoding UTF8
            $fixedCount++
            break
        }
    }
}

# Fix 6: redis.ts - Export cache properly
$redisFile = "src/lib/redis.ts"
$fullPath = Join-Path $ServicesRoot $redisFile
if (Test-Path -LiteralPath $fullPath) {
    $content = Get-Content -LiteralPath $fullPath -Raw
    if ($content -notmatch 'export.*cache') {
        Write-Host "[FIX] $redisFile - Add cache export" -ForegroundColor Green
        # Add export at the end
        $content = $content + "`n`n// Re-export cache for middleware`nexport { cache } from '@/lib/cache/manager';`n"
        Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
        $fixedCount++
    }
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Phase 1 Complete!" -ForegroundColor Green
Write-Host "  Fixed: $fixedCount errors" -ForegroundColor Green
Write-Host "`nContinuing with manual fixes..." -ForegroundColor Cyan

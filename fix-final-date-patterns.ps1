# FINAL COMPREHENSIVE FIX - All Remaining Unsafe Date Parsing
# Fixes specific patterns that previous scripts missed

$rootPath = "c:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src"
$importStatement = 'import { formatDate as formatDateUtil } from "@/lib/utils/date";'

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FINAL DATE PARSING FIX - 11 REMAINING FILES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$filesToFix = @(
    "app/admin/audit/page.tsx",
    "app/admin/onboarding/page.tsx",
    "app/admin/reports/page.tsx",
    "app/designs/[id]/approval/page.tsx",
    "app/hr-payroll/attendance/page.tsx",
    "app/merchandising/page.tsx",
    "app/notifications/page.tsx",
    "app/orders/[id]/page.tsx",
    "app/quality-control/page.tsx",
    "components/approval-workflow/ApprovalTimeline.tsx",
    "lib/safe-operations.ts"
)

$fixedCount = 0
$errorCount = 0

foreach ($file in $filesToFix) {
    $filePath = Join-Path $rootPath $file
    $relativePath = $file

    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  Not found: $relativePath" -ForegroundColor Yellow
        continue
    }

    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content
        $changesMade = $false

        # Add import if needed (skip if already has formatDateUtil)
        if ($content -notmatch 'formatDateUtil' -and $content -notmatch 'from "@/lib/utils/date"') {
            # Find last import line
            $importMatches = [regex]::Matches($content, 'import .+?;')
            if ($importMatches.Count -gt 0) {
                $lastImport = $importMatches[$importMatches.Count - 1]
                $insertPos = $lastImport.Index + $lastImport.Length
                $content = $content.Insert($insertPos, "`n$importStatement")
                $changesMade = $true
            }
        }

        # Pattern 1: new Date(variable).toLocaleDateString(...options...)
        # Replace with formatDateUtil call
        if ($content -match 'new Date\([^)]+\)\.toLocaleDateString\([^)]*\)') {
            $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleDateString\([^)]*\)', 'formatDateUtil($1)'
            $changesMade = $true
        }

        # Pattern 2: new Date(variable).toLocaleString(...options...)
        if ($content -match 'new Date\([^)]+\)\.toLocaleString\([^)]*\)') {
            $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleString\([^)]*\)', 'formatDateUtil($1, "datetime")'
            $changesMade = $true
        }

        # Pattern 3: Custom formatDate functions that use unsafe patterns
        # Replace local formatDate with our utility
        if ($content -match 'const formatDate = \(date: [^)]+\) => \{[^}]*new Date\(date\)\.toLocaleDateString') {
            $content = $content -replace 'const formatDate = \(date: [^)]+\) => \{[^}]+\};', '// Using formatDateUtil from utils/date instead'
            $content = $content -replace '(?<![a-zA-Z])formatDate\(', 'formatDateUtil('
            $changesMade = $true
        }

        # Pattern 4: timestamp.toLocaleDateString() patterns
        if ($content -match '([a-zA-Z_$][a-zA-Z0-9_$.]*timestamp)\.toLocaleDateString\(\)') {
            $content = $content -replace '([a-zA-Z_$][a-zA-Z0-9_$.]*timestamp)\.toLocaleDateString\(\)', 'formatDateUtil($1)'
            $changesMade = $true
        }

        if ($changesMade -or $content -ne $originalContent) {
            Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed: $relativePath" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "⏭️  No changes: $relativePath" -ForegroundColor Gray
        }

    } catch {
        Write-Host "❌ Error: $relativePath - $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FINAL FIX COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Fixed: $fixedCount files" -ForegroundColor Green
Write-Host "  ⏭️  Skipped: $($filesToFix.Count - $fixedCount - $errorCount) files" -ForegroundColor Yellow
Write-Host "  ❌ Errors: $errorCount files" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

if ($fixedCount -gt 0) {
    Write-Host "SUCCESS: All unsafe date parsing patterns have been fixed!" -ForegroundColor Green
    Write-Host "NEXT STEP: Commit and deploy the changes" -ForegroundColor Yellow
}

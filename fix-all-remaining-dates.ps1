# COMPREHENSIVE FIX - All Remaining Unsafe Date Parsing
# Fixes ALL remaining .toLocaleDateString() and .toLocaleString() patterns

$rootPath = "c:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src"
$importStatement = 'import { formatDate as formatDateUtil } from "@/lib/utils/date";'

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "COMPREHENSIVE DATE PARSING FIX - FINAL BATCH" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$fixedCount = 0
$errorCount = 0

# Find ALL files with unsafe patterns
Write-Host "🔍 Scanning for remaining unsafe date patterns..." -ForegroundColor Yellow

$filesToFix = @()

# Find files with new Date().toLocaleDateString()
$toLocaleDateFiles = Get-ChildItem -Path $rootPath -Recurse -Include *.tsx,*.ts -Exclude *.d.ts |
    Where-Object { $_.FullName -notmatch 'node_modules|\.next' } |
    Select-String -Pattern "new Date.*\.toLocaleDateString\(\)" -List |
    Select-Object -ExpandProperty Path -Unique

# Find files with .toLocaleDateString() (not in formatDate already)
$directToLocaleDateFiles = Get-ChildItem -Path $rootPath -Recurse -Include *.tsx,*.ts -Exclude *.d.ts |
    Where-Object { $_.FullName -notmatch 'node_modules|\.next' } |
    Select-String -Pattern "\.toLocaleDateString\(\)" -List |
    Where-Object { (Get-Content $_.Path -Raw) -notmatch 'formatDateUtil' -or (Get-Content $_.Path -Raw) -match '\.toLocaleDateString\(\)' } |
    Select-Object -ExpandProperty Path -Unique

# Find files with .toLocaleString() for dates
$toLocaleStringFiles = Get-ChildItem -Path $rootPath -Recurse -Include *.tsx,*.ts -Exclude *.d.ts |
    Where-Object { $_.FullName -notmatch 'node_modules|\.next' } |
    Select-String -Pattern "new Date.*\.toLocaleString\(\)|timestamp.*\.toLocaleString\(\)" -List |
    Select-Object -ExpandProperty Path -Unique

# Combine and deduplicate
$allFiles = ($toLocaleDateFiles + $directToLocaleDateFiles + $toLocaleStringFiles) | Sort-Object -Unique

Write-Host "Found $($allFiles.Count) files with unsafe patterns`n" -ForegroundColor Yellow

foreach ($filePath in $allFiles) {
    $relativePath = $filePath.Replace("$rootPath\", "")

    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content
        $changesMade = $false

        # Add import if needed
        if ($content -notmatch 'from "@/lib/utils/date"' -and $content -notmatch "formatDate as formatDateUtil") {
            # Find last import
            $importMatches = [regex]::Matches($content, 'import .+?;')
            if ($importMatches.Count -gt 0) {
                $lastImport = $importMatches[$importMatches.Count - 1]
                $insertPos = $lastImport.Index + $lastImport.Length
                $content = $content.Insert($insertPos, "`n$importStatement")
                $changesMade = $true
            }
        }

        # Fix Pattern 1: new Date(var).toLocaleDateString()
        if ($content -match 'new Date\([^)]+\)\.toLocaleDateString\(\)') {
            $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleDateString\(\)', '($1 ? formatDateUtil($1) : "-")'
            $changesMade = $true
        }

        # Fix Pattern 2: variable.toLocaleDateString()
        if ($content -match '[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*\.toLocaleDateString\(\)' -and
            $content -notmatch 'formatDateUtil') {
            $content = $content -replace '([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\.toLocaleDateString\(\)', '($1 ? formatDateUtil($1) : "-")'
            $changesMade = $true
        }

        # Fix Pattern 3: date.toLocaleString() for dates (not currency)
        if ($content -match 'new Date\([^)]+\)\.toLocaleString\(\)') {
            $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleString\(\)', '($1 ? formatDateUtil($1, "datetime") : "-")'
            $changesMade = $true
        }

        # Fix Pattern 4: timestamp.toLocaleString()
        if ($content -match '(timestamp|time_in|time_out|created_at|updated_at).*\.toLocaleString\(\)') {
            $content = $content -replace '([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\.toLocaleString\(\)(?=\s*[;})])', '($1 ? formatDateUtil($1, "datetime") : "-")'
            $changesMade = $true
        }

        # Special fix for date: date.toLocaleDateString() in formatTimestamp functions
        $content = $content -replace 'date:\s*date\.toLocaleDateString\(\)', 'date: date ? formatDateUtil(date) : "-"'
        $content = $content -replace 'time:\s*date\.toLocaleTimeString\(\)', 'time: date ? formatDateUtil(date, "time") : "-"'
        $content = $content -replace 'return date\.toLocaleDateString\(\)', 'return date ? formatDateUtil(date) : "-"'

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
Write-Host "COMPREHENSIVE FIX COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Fixed: $fixedCount files" -ForegroundColor Green
Write-Host "  ⏭️  Skipped: $($allFiles.Count - $fixedCount - $errorCount) files" -ForegroundColor Yellow
Write-Host "  ❌ Errors: $errorCount files" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

if ($fixedCount -gt 0) {
    Write-Host "🎉 All unsafe date parsing patterns have been fixed!" -ForegroundColor Green
    Write-Host "📝 Next: Commit and deploy the changes" -ForegroundColor Yellow
}

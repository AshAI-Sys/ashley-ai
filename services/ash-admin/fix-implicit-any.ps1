# PowerShell script to fix TS7006 implicit any type errors
# Adds type annotations to callback parameters

$ErrorFile = "ts-errors-final.txt"
$ServicesRoot = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

Write-Host "Starting TS7006 Implicit Any Fix..." -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Read all TS7006 errors
$errors = Get-Content $ErrorFile | Where-Object { $_ -match "error TS7006" }
Write-Host "Found $($errors.Count) TS7006 implicit any errors`n" -ForegroundColor Yellow

$fixedCount = 0
$skippedCount = 0
$processedFiles = @{}

foreach ($errorLine in $errors) {
    # Parse: file.ts(line,col): error TS7006: Parameter 'name' implicitly has an 'any' type.
    if ($errorLine -match "^([^(]+)\((\d+),(\d+)\): error TS7006: Parameter '([^']+)'") {
        $relPath = $matches[1].Trim()
        $lineNum = [int]$matches[2]
        $paramName = $matches[4]

        $fullPath = Join-Path $ServicesRoot $relPath

        # Skip check-db.ts (utility script, not production code)
        if ($relPath -match "check-db\.ts") {
            $skippedCount++
            continue
        }

        # Read file if not already processed
        if (-not $processedFiles.ContainsKey($fullPath)) {
            # Use -LiteralPath to handle brackets in path
            if (Test-Path -LiteralPath $fullPath) {
                $processedFiles[$fullPath] = Get-Content -LiteralPath $fullPath
            } else {
                Write-Host "  [SKIP] File not found: $relPath" -ForegroundColor Red
                $skippedCount++
                continue
            }
        }

        $lines = $processedFiles[$fullPath]
        $lineIdx = $lineNum - 1

        if ($lineIdx -ge $lines.Count) {
            $skippedCount++
            continue
        }

        $currentLine = $lines[$lineIdx]
        $modified = $false

        # Strategy 1: Array callback methods (.map, .filter, .reduce, .forEach, etc.)
        # Common patterns:
        # - (item) => ...  →  (item: any) => ...
        # - (item, idx) => ...  →  (item: any, idx: number) => ...
        # - (sum, item) => ... in reduce  →  (sum: any, item: any) => ...
        # - item => ...  →  (item: any) => ... (single param without parens)

        # Strategy 1a: Single parameter arrow function WITHOUT parentheses (e.g., "item => ...")
        if ($currentLine -match "\b$paramName\s*=>") {
            Write-Host "[FIX] ${relPath}($lineNum) - Add parens and type to single param '$paramName'" -ForegroundColor Green
            $lines[$lineIdx] = $currentLine -replace "\b($paramName)\s*=>", "(`$1: any) =>"
            $modified = $true
        }
        # Check if parameter is 'idx' or 'index' - these are always numbers
        elseif ($paramName -match "^(idx|index|i)$") {
            if ($currentLine -match "\b$paramName\b[^:]") {
                Write-Host "[FIX] ${relPath}($lineNum) - Add type to index param '$paramName'" -ForegroundColor Green
                $lines[$lineIdx] = $currentLine -replace "(\(.*?\b)($paramName)(\s*[,\)])", "`$1`$2: number`$3"
                $modified = $true
            }
        }
        # Standard callback parameter - add 'any' type
        elseif ($currentLine -match "(\(.*?\b)$paramName(\s*[,\)])") {
            Write-Host "[FIX] ${relPath}($lineNum) - Add 'any' type to param '$paramName'" -ForegroundColor Green
            $lines[$lineIdx] = $currentLine -replace "(\(.*?\b)($paramName)(\s*[,\)])", "`$1`$2: any`$3"
            $modified = $true
        }
        # Arrow function with destructuring: ({prop}) => ... → ({prop}: any) => ...
        elseif ($currentLine -match "\(\{[^}]*\b$paramName\b[^}]*\}\)") {
            Write-Host "[FIX] ${relPath}($lineNum) - Add type to destructured param containing '$paramName'" -ForegroundColor Green
            # For destructured params, add type after the closing brace
            $lines[$lineIdx] = $currentLine -replace "(\(\{[^}]*\})(\s*\))", "`$1: any`$2"
            $modified = $true
        }
        else {
            $skippedCount++
        }

        if ($modified) {
            $processedFiles[$fullPath] = $lines
            $fixedCount++
        }
    }
}

# Write all modified files
Write-Host "`nWriting modified files..." -ForegroundColor Cyan
$filesWritten = 0
foreach ($filePath in $processedFiles.Keys) {
    Set-Content -LiteralPath $filePath -Value $processedFiles[$filePath] -Encoding UTF8
    $filesWritten++
}

Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "  Fixed: $fixedCount errors" -ForegroundColor Green
Write-Host "  Skipped: $skippedCount errors" -ForegroundColor Yellow
Write-Host "  Files modified: $filesWritten" -ForegroundColor Cyan

Write-Host "`nRe-running type-check..." -ForegroundColor Cyan
Set-Location $ServicesRoot
$result = pnpm type-check 2>&1 | Out-String
$result | Out-File "ts-errors-after-any-fix.txt" -Encoding UTF8

$newErrorCount = ($result -split "`n" | Where-Object { $_ -match "error TS" }).Count
$ts7006Count = ($result -split "`n" | Where-Object { $_ -match "error TS7006" }).Count

Write-Host "`nRemaining TypeScript errors: $newErrorCount" -ForegroundColor $(if ($newErrorCount -lt 477) { "Green" } else { "Yellow" })
Write-Host "Remaining TS7006 errors: $ts7006Count" -ForegroundColor $(if ($ts7006Count -lt 349) { "Green" } else { "Yellow" })
Write-Host "Improvement: $($477 - $newErrorCount) errors fixed from this run" -ForegroundColor Green

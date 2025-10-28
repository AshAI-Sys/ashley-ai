# Simplified PowerShell script to fix TS6133 unused variable errors
# Processes errors one by one with simple text replacement

$ErrorFile = "ts-errors.txt"
$ServicesRoot = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

Write-Host "Starting Simple TS6133 Fix..." -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Read all valid TS6133 errors (must start with src/)
$errors = Get-Content $ErrorFile | Where-Object { $_ -match "^src/.* error TS6133" }
Write-Host "Found $($errors.Count) valid TS6133 errors`n" -ForegroundColor Yellow

$fixedCount = 0
$skippedCount = 0
$processedFiles = @{}

foreach ($errorLine in $errors) {
    # Parse error line: src/path/file.ts(line,col): error TS6133: 'varName' is declared but
    if ($errorLine -match "^(src/[^(]+)\((\d+),(\d+)\): error TS6133: '([^']+)'") {
        $relPath = $matches[1]
        $lineNum = [int]$matches[2]
        $varName = $matches[4]

        $fullPath = Join-Path $ServicesRoot $relPath

        # Read file if not already processed
        if (-not $processedFiles.ContainsKey($fullPath)) {
            if (Test-Path $fullPath) {
                $processedFiles[$fullPath] = Get-Content $fullPath
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

        # Fix Strategy 1: Remove unused single imports
        if ($currentLine -match "^\s*import\s+\{\s*$varName\s*\}\s+from") {
            Write-Host "[FIX] ${relPath}($lineNum) - Remove unused import $varName" -ForegroundColor Green
            $lines[$lineIdx] = "// Unused import removed: $varName"
            $modified = $true
        }
        # Fix Strategy 2: Remove from multi-import list
        elseif ($currentLine -match "^\s*import\s+\{[^}]*\b$varName\b[^}]*\}\s+from") {
            Write-Host "[FIX] ${relPath}($lineNum) - Remove $varName from imports" -ForegroundColor Green
            # Remove the variable from import list
            $newLine = $currentLine -replace ",\s*$varName\s*,", ","  # Middle of list
            $newLine = $newLine -replace "\{\s*$varName\s*,", "{"     # Start of list
            $newLine = $newLine -replace ",\s*$varName\s*\}", "}"     # End of list
            $newLine = $newLine -replace "\{\s*$varName\s*\}", "{}"   # Only item

            # If empty import, comment out entire line
            if ($newLine -match "\{\s*\}") {
                $lines[$lineIdx] = "// Unused import removed: $varName"
            } else {
                $lines[$lineIdx] = $newLine
            }
            $modified = $true
        }
        # Fix Strategy 3: Prefix function parameters with underscore
        elseif ($currentLine -match "\basync\s+(function|\w+)\s*\(" -or
                $currentLine -match "^\s*export\s+(async\s+)?function" -or
                $currentLine -match "=\s*(async\s*)?\([^)]*\)\s*=>" -or
                $currentLine -match "^\s*(async\s*)?\([^)]*\)\s*=>") {

            # Only prefix if not already prefixed
            if ($varName -notmatch "^_") {
                Write-Host "[FIX] ${relPath}($lineNum) - Prefix param $varName with underscore" -ForegroundColor Green
                $lines[$lineIdx] = $currentLine -replace "\b$varName\b", "_$varName"
                $modified = $true
            } else {
                $skippedCount++
            }
        }
        # Fix Strategy 4: Comment out unused const/let/var
        elseif ($currentLine -match "^\s*(const|let|var)\s+$varName\b") {
            Write-Host "[FIX] ${relPath}($lineNum) - Comment out unused variable $varName" -ForegroundColor Green
            if ($currentLine -match "^(\s*)") {
                $indent = $matches[1]
            } else {
                $indent = ""
            }
            $lines[$lineIdx] = "$indent// Unused: " + $currentLine.Trim()
            $modified = $true
        }
        # Fix Strategy 5: Prefix destructured vars with underscore
        elseif ($currentLine -match "[\{\[].*\b$varName\b.*[\}\]]" -and $varName -notmatch "^_") {
            Write-Host "[FIX] ${relPath}($lineNum) - Prefix destructured $varName with underscore" -ForegroundColor Green
            $lines[$lineIdx] = $currentLine -replace "\b$varName\b", "_$varName"
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
    Set-Content -Path $filePath -Value $processedFiles[$filePath] -Encoding UTF8
    $filesWritten++
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "  Fixed: $fixedCount errors" -ForegroundColor Green
Write-Host "  Skipped: $skippedCount errors" -ForegroundColor Yellow
Write-Host "  Files modified: $filesWritten" -ForegroundColor Cyan

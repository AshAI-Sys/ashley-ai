# PowerShell script to fix TS2724 import errors (remove underscore prefixes)

$ErrorFile = "ts-errors-COMPLETE.txt"
$ServicesRoot = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

Write-Host "Starting TS2724 Import Fix..." -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Read all TS2724 errors
$errors = Get-Content $ErrorFile | Where-Object { $_ -match "error TS2724" }
Write-Host "Found $($errors.Count) TS2724 import errors`n" -ForegroundColor Yellow

$fixedCount = 0
$processedFiles = @{}

foreach ($errorLine in $errors) {
    # Parse: file.ts(line,col): error TS2724: '"module"' has no exported member named '_Name'. Did you mean 'Name'?
    if ($errorLine -match "^([^(]+)\((\d+),(\d+)\): error TS2724.*named '(_\w+)'\. Did you mean '(\w+)'") {
        $relPath = $matches[1].Trim()
        $lineNum = [int]$matches[2]
        $wrongName = $matches[4]  # e.g., "_Image"
        $correctName = $matches[5] # e.g., "Image"

        $fullPath = Join-Path $ServicesRoot $relPath

        # Read file if not already processed
        if (-not $processedFiles.ContainsKey($fullPath)) {
            if (Test-Path -LiteralPath $fullPath) {
                $processedFiles[$fullPath] = Get-Content -LiteralPath $fullPath
            } else {
                Write-Host "  [SKIP] File not found: $relPath" -ForegroundColor Red
                continue
            }
        }

        $lines = $processedFiles[$fullPath]
        $lineIdx = $lineNum - 1

        if ($lineIdx -ge $lines.Count) {
            continue
        }

        $currentLine = $lines[$lineIdx]

        # Fix the import - replace _Name with Name
        if ($currentLine -match "\b$wrongName\b") {
            Write-Host "[FIX] ${relPath}($lineNum) - Replace '$wrongName' with '$correctName'" -ForegroundColor Green
            $lines[$lineIdx] = $currentLine -replace "\b$wrongName\b", $correctName
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

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "  Fixed: $fixedCount import errors" -ForegroundColor Green
Write-Host "  Files modified: $filesWritten" -ForegroundColor Cyan

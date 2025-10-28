# PowerShell script to fix TS6133 unused variable errors
# This script processes ts-errors.txt and fixes unused variables systematically

$ErrorFile = "ts-errors.txt"
$ServicesRoot = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

Write-Host "Starting TypeScript TS6133 Unused Variable Fix..." -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Read all TS6133 errors
$errors = Get-Content $ErrorFile | Where-Object { $_ -match "error TS6133" }
Write-Host "Found $($errors.Count) TS6133 unused variable errors`n" -ForegroundColor Yellow

# Parse errors into structured data
$errorList = @()
foreach ($line in $errors) {
    if ($line -match "^([^(]+)\((\d+),(\d+)\): error TS6133: '([^']+)' is declared but") {
        $filePath = $matches[1].Trim()
        if ($filePath -ne "") {
            $errorList += @{
                File = $filePath
                Line = [int]$matches[2]
                Column = [int]$matches[3]
                Variable = $matches[4]
            }
        }
    }
}

Write-Host "Parsed $($errorList.Count) errors successfully`n" -ForegroundColor Green

# Group errors by file for efficient processing
$errorsByFile = $errorList | Group-Object -Property File

$fixedCount = 0
$skippedCount = 0

foreach ($fileGroup in $errorsByFile) {
    $filePath = Join-Path $ServicesRoot $fileGroup.Name

    if (-not (Test-Path $filePath)) {
        Write-Host "  [SKIP] File not found: $($fileGroup.Name)" -ForegroundColor Red
        $skippedCount += $fileGroup.Count
        continue
    }

    Write-Host "Processing: $($fileGroup.Name)" -ForegroundColor Cyan
    $content = Get-Content $filePath -Raw
    $lines = Get-Content $filePath

    $modified = $false
    $errorsInFile = $fileGroup.Group | Sort-Object -Property Line -Descending

    foreach ($errInfo in $errorsInFile) {
        $lineIdx = $errInfo.Line - 1
        $varName = $errInfo.Variable

        if ($lineIdx -ge $lines.Count) {
            Write-Host "  [SKIP] Line $($errInfo.Line) out of range for variable '$varName'" -ForegroundColor Yellow
            $skippedCount++
            continue
        }

        $currentLine = $lines[$lineIdx]

        # Strategy 1: Remove unused imports (import statements at top of file)
        if ($currentLine -match "^\s*import\s+.*\b$varName\b" -and $errInfo.Line -lt 30) {
            Write-Host "  [FIX] Line $($errInfo.Line): Removing unused import '$varName'" -ForegroundColor Green

            # If it's the only import, remove entire line
            if ($currentLine -match "import\s+\{\s*$varName\s*\}") {
                $lines[$lineIdx] = "// Removed unused import: $varName"
            }
            # If it's one of multiple imports, remove just this one
            elseif ($currentLine -match "import\s+\{[^}]+\}") {
                $lines[$lineIdx] = $currentLine -replace ",?\s*$varName\s*,?", ""
                $lines[$lineIdx] = $lines[$lineIdx] -replace "\{\s*,", "{"
                $lines[$lineIdx] = $lines[$lineIdx] -replace ",\s*\}", "}"
                $lines[$lineIdx] = $lines[$lineIdx] -replace "\{\s*\}", ""

                # If no imports left, comment out the line
                if ($lines[$lineIdx] -match "import\s+\{\s*\}") {
                    $lines[$lineIdx] = "// Removed unused import: $varName"
                }
            }

            $modified = $true
            $fixedCount++
        }
        # Strategy 2: Fix function parameters by prefixing with underscore
        elseif ($currentLine -match "(\basync\s+)?(function|\([^)]*\)|=>)" -and $currentLine -match "\b$varName\b") {
            Write-Host "  [FIX] Line $($errInfo.Line): Prefixing unused parameter '$varName' with underscore" -ForegroundColor Green

            # Add underscore prefix if not already present
            if (-not ($varName -match "^_")) {
                $lines[$lineIdx] = $currentLine -replace "\b$varName\b", "_$varName"
            }
            # If already has underscore, use TypeScript directive
            else {
                # Add void statement on next line to suppress warning
                if ($currentLine -match "^(\s*)") {
                    $indent = $matches[1]
                } else {
                    $indent = ""
                }
                $lines[$lineIdx] = $currentLine
                if ($lineIdx + 1 -lt $lines.Count) {
                    $lines = @($lines[0..$lineIdx]) + @("$indent  void $varName; // TypeScript unused parameter") + @($lines[($lineIdx + 1)..($lines.Count - 1)])
                }
            }

            $modified = $true
            $fixedCount++
        }
        # Strategy 3: Comment out unused const/let/var declarations
        elseif ($currentLine -match "\b(const|let|var)\s+$varName\b") {
            Write-Host "  [FIX] Line $($errInfo.Line): Commenting out unused variable '$varName'" -ForegroundColor Green

            if ($currentLine -match "^(\s*)") {
                $indent = $matches[1]
            } else {
                $indent = ""
            }
            $lines[$lineIdx] = "$indent// Unused: $($currentLine.Trim())"

            $modified = $true
            $fixedCount++
        }
        # Strategy 4: For destructured variables, prefix with underscore
        elseif ($currentLine -match "\{\s*[^}]*\b$varName\b[^}]*\}" -or $currentLine -match "\[\s*[^\]]*\b$varName\b[^\]]*\]") {
            Write-Host "  [FIX] Line $($errInfo.Line): Prefixing destructured variable '$varName' with underscore" -ForegroundColor Green

            if (-not ($varName -match "^_")) {
                $lines[$lineIdx] = $currentLine -replace "\b$varName\b", "_$varName"
            }

            $modified = $true
            $fixedCount++
        }
        else {
            Write-Host "  [SKIP] Line $($errInfo.Line): Could not determine fix for '$varName'" -ForegroundColor Yellow
            $skippedCount++
        }
    }

    if ($modified) {
        # Write modified content back to file
        $lines | Set-Content $filePath -Encoding UTF8
        Write-Host "  [SAVED] Fixed $($errorsInFile.Count) errors in $($fileGroup.Name)`n" -ForegroundColor Green
    }
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "  Fixed: $fixedCount errors" -ForegroundColor Green
Write-Host "  Skipped: $skippedCount errors" -ForegroundColor Yellow
Write-Host "`nRe-running type-check to verify fixes..." -ForegroundColor Cyan

# Re-run type-check to see remaining errors
Set-Location $ServicesRoot
$result = pnpm type-check 2>&1 | Out-String
$newErrors = ($result -split "`n" | Where-Object { $_ -match "error TS" }).Count

Write-Host "`nRemaining TypeScript errors: $newErrors" -ForegroundColor $(if ($newErrors -lt 729) { "Green" } else { "Yellow" })
Write-Host "Improvement: $($729 - $newErrors) errors fixed" -ForegroundColor Green

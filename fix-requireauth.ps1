#!/usr/bin/env pwsh
# Fix missing closing parentheses for requireAuth wrappers in API routes
#
# Pattern: export const METHOD = requireAuth(async (...) => {...}
# Should be: export const METHOD = requireAuth(async (...) => {...})

Write-Host "🔧 Fixing requireAuth wrapper closures..." -ForegroundColor Cyan
Write-Host ""

$basePath = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api"
$filesFixed = 0
$totalChanges = 0

# Get all route.ts files
$routeFiles = Get-ChildItem -Path $basePath -Filter "route.ts" -Recurse

foreach ($file in $routeFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $changed = $false

    # Split into lines for processing
    $lines = $content -split "`n"
    $newLines = @()

    for ($i = 0; $i < $lines.Length; $i++) {
        $line = $lines[$i]

        # Check if this line is a closing brace that should have a parenthesis
        # Look for: }  followed by a blank line or a new export/async function
        if ($line -match '^\s*}\s*$' -and $i -gt 0) {
            # Check if previous lines indicate we're in a requireAuth wrapper
            $inRequireAuth = $false
            $bracketDepth = 1  # We're at a closing brace, so start at 1

            # Scan backwards to find the matching opening brace and check for requireAuth
            for ($j = $i - 1; $j -ge 0 -and $bracketDepth -gt 0; $j--) {
                $prevLine = $lines[$j]

                # Count braces
                $openBraces = ($prevLine.ToCharArray() | Where-Object { $_ -eq '{' }).Count
                $closeBraces = ($prevLine.ToCharArray() | Where-Object { $_ -eq '}' }).Count
                $bracketDepth = $bracketDepth + $closeBraces - $openBraces

                # Check if this line has requireAuth(async
                if ($prevLine -match 'requireAuth\(async') {
                    $inRequireAuth = $true
                    break
                }

                # If we hit another export, stop
                if ($prevLine -match '^export const') {
                    break
                }
            }

            # If we're in a requireAuth wrapper and the next line suggests end of function
            if ($inRequireAuth) {
                $nextLine = if ($i + 1 -lt $lines.Length) { $lines[$i + 1] } else { "" }

                # Check if next line is blank, starts with export, or starts with async function
                if ($nextLine -match '^\s*$' -or
                    $nextLine -match '^export' -or
                    $nextLine -match '^async function' -or
                    $nextLine -match '^function' -or
                    $i + 1 -eq $lines.Length) {

                    # This closing brace likely needs a parenthesis
                    $indent = if ($line -match '^(\s*)') { $Matches[1] } else { "" }
                    $newLines += "$indent})"
                    $changed = $true
                    $totalChanges++
                    continue
                }
            }
        }

        $newLines += $line
    }

    if ($changed) {
        $newContent = $newLines -join "`n"
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        $filesFixed++
        $relativePath = $file.FullName.Replace("$basePath\", "")
        Write-Host "  ✓ Fixed: $relativePath" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Files fixed: $filesFixed" -ForegroundColor Green
Write-Host "  Total changes: $totalChanges" -ForegroundColor Green
Write-Host ""

if ($filesFixed -gt 0) {
    Write-Host "🔍 Running type-check to verify..." -ForegroundColor Cyan
    Push-Location "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"
    $errors = pnpm type-check 2>&1 | Select-String "error TS"
    Pop-Location

    if ($errors) {
        $errorCount = ($errors | Measure-Object).Count
        Write-Host "⚠️  $errorCount TypeScript errors remain" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Top 10 errors:" -ForegroundColor Yellow
        $errors | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" }
    } else {
        Write-Host "✅ Type check passed!" -ForegroundColor Green
    }
} else {
    Write-Host "ℹ️  No files needed fixing" -ForegroundColor Yellow
}

Write-Host ""

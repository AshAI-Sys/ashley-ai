# Fix Dynamic Routes - Add export const dynamic = 'force-dynamic' to all API routes

$apiDir = "src\app\api"
$routeFiles = Get-ChildItem -Path $apiDir -Filter "route.ts" -Recurse

$fixed = 0
$skipped = 0
$errors = 0

Write-Host "Found $($routeFiles.Count) route files to process..." -ForegroundColor Cyan

foreach ($file in $routeFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw

        # Check if already has dynamic export
        if ($content -match "export\s+const\s+dynamic\s*=") {
            Write-Host "Skipped (already has dynamic): $($file.Name)" -ForegroundColor Yellow
            $skipped++
            continue
        }

        # Find the last import statement
        $lines = Get-Content -Path $file.FullName
        $lastImportLine = -1

        for ($i = 0; $i -lt $lines.Length; $i++) {
            $line = $lines[$i]
            if ($line -match "^import\s+" -or $line -match "^}\s+from") {
                $lastImportLine = $i
            }
        }

        if ($lastImportLine -ge 0) {
            # Insert after last import
            $newLines = @()
            $newLines += $lines[0..$lastImportLine]
            $newLines += ""
            $newLines += "export const dynamic = 'force-dynamic';"
            $newLines += ""
            if ($lastImportLine + 1 -lt $lines.Length) {
                $newLines += $lines[($lastImportLine + 1)..($lines.Length - 1)]
            }

            Set-Content -Path $file.FullName -Value $newLines
            Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
            $fixed++
        } else {
            # No imports found, add at the top
            $newContent = "export const dynamic = 'force-dynamic';`n`n$content"
            Set-Content -Path $file.FullName -Value $newContent
            Write-Host "Fixed (no imports): $($file.Name)" -ForegroundColor Green
            $fixed++
        }
    } catch {
        Write-Host "Error processing $($file.Name): $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "Fixed: $fixed files" -ForegroundColor Green
Write-Host "Skipped: $skipped files" -ForegroundColor Yellow
Write-Host "Errors: $errors files" -ForegroundColor Red
Write-Host "========================================"

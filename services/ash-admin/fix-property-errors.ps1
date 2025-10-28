# PowerShell script to fix TS2339 property errors

$ServicesRoot = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

Write-Host "Starting TS2339 Property Error Fix..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$fixedCount = 0

# Fix 1: Replace _params with params (remove underscore)
$files = @(
    "src/app/api/designs/[id]/print-locations/route.ts",
    "src/app/api/orders/[id]/color-variants/route.ts",
    "src/app/api/packing/cartons/[id]/contents/route.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path $ServicesRoot $file
    if (Test-Path -LiteralPath $fullPath) {
        $content = Get-Content -LiteralPath $fullPath -Raw
        if ($content -match '\b_params\b') {
            Write-Host "[FIX] $file - Replace _params with params" -ForegroundColor Green
            $content = $content -replace '\b_params\b', 'params'
            Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
            $fixedCount++
        }
    }
}

# Fix 2: Replace toast.info() with toast()
$toastFiles = @(
    "src/app/inventory/auto-reorder-settings/page.tsx",
    "src/app/inventory/page.tsx"
)

foreach ($file in $toastFiles) {
    $fullPath = Join-Path $ServicesRoot $file
    if (Test-Path -LiteralPath $fullPath) {
        $content = Get-Content -LiteralPath $fullPath -Raw
        if ($content -match 'toast\.info\(') {
            Write-Host "[FIX] $file - Replace toast.info() with toast()" -ForegroundColor Green
            $content = $content -replace 'toast\.info\(', 'toast('
            Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
            $fixedCount++
        }
    }
}

# Fix 3: Fix printing runs page _data property
$printRunFile = "src/app/printing/runs/[id]/page.tsx"
$fullPath = Join-Path $ServicesRoot $printRunFile
if (Test-Path -LiteralPath $fullPath) {
    $content = Get-Content -LiteralPath $fullPath -Raw
    if ($content -match '\b_data\b') {
        Write-Host "[FIX] $printRunFile - Replace _data with data" -ForegroundColor Green
        $content = $content -replace '\b_data\b', 'data'
        Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
        $fixedCount++
    }
}

# Fix 4: Fix inventory manager ____severity
$invManagerFile = "src/lib/inventory/inventory-manager.ts"
$fullPath = Join-Path $ServicesRoot $invManagerFile
if (Test-Path -LiteralPath $fullPath) {
    $content = Get-Content -LiteralPath $fullPath -Raw
    if ($content -match '____severity') {
        Write-Host "[FIX] $invManagerFile - Replace ____severity with _severity" -ForegroundColor Green
        $content = $content -replace '____severity', '_severity'
        Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
        $fixedCount++
    }
}

# Fix 5: Fix error-handling trace_id
$errorHandlingFile = "src/lib/error-handling.ts"
$fullPath = Join-Path $ServicesRoot $errorHandlingFile
if (Test-Path -LiteralPath $fullPath) {
    $lines = Get-Content -LiteralPath $fullPath
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "trace_id.*Unknown error") {
            Write-Host "[FIX] $errorHandlingFile - Fix trace_id property access on line $($i+1)" -ForegroundColor Green
            # Add type guard
            $lines[$i] = $lines[$i] -replace "error\.trace_id", "(typeof error === 'object' && error && 'trace_id' in error) ? error.trace_id : undefined"
            Set-Content -LiteralPath $fullPath -Value $lines -Encoding UTF8
            $fixedCount++
            break
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "  Fixed: $fixedCount property errors" -ForegroundColor Green

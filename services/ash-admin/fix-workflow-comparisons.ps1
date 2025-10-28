# PowerShell script to fix TS2367 workflow step comparison errors

$ServicesRoot = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"

Write-Host "Starting TS2367 Workflow Comparison Fix..." -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

$fixedCount = 0

# Fix DTFWorkflow.tsx
$dtfFile = "src/components/printing/DTFWorkflow.tsx"
$fullPath = Join-Path $ServicesRoot $dtfFile
if (Test-Path -LiteralPath $fullPath) {
    Write-Host "[FIX] $dtfFile - Fix step comparisons" -ForegroundColor Green
    $content = Get-Content -LiteralPath $fullPath -Raw
    $content = $content -replace 'activeStep === "setup"', 'activeStep === "film_setup"'
    $content = $content -replace 'activeStep === "print"', 'activeStep === "printing"'
    $content = $content -replace 'activeStep === "powder"', 'activeStep === "powder_application"'
    $content = $content -replace 'activeStep === "cure"', 'activeStep === "curing"'
    $content = $content -replace 'activeStep === "quality"', 'activeStep === "quality_control"'
    Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
    $fixedCount += 5
}

# Fix EmbroideryWorkflow.tsx
$embroideryFile = "src/components/printing/EmbroideryWorkflow.tsx"
$fullPath = Join-Path $ServicesRoot $embroideryFile
if (Test-Path -LiteralPath $fullPath) {
    Write-Host "[FIX] $embroideryFile - Fix step comparisons" -ForegroundColor Green
    $content = Get-Content -LiteralPath $fullPath -Raw
    $content = $content -replace 'activeStep === "design"', 'activeStep === "design_setup"'
    $content = $content -replace 'activeStep === "setup"', 'activeStep === "machine_setup"'
    $content = $content -replace 'activeStep === "quality"', 'activeStep === "quality_control"'
    Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
    $fixedCount += 3
}

# Fix SilkscreenWorkflow.tsx
$silkscreenFile = "src/components/printing/SilkscreenWorkflow.tsx"
$fullPath = Join-Path $ServicesRoot $silkscreenFile
if (Test-Path -LiteralPath $fullPath) {
    Write-Host "[FIX] $silkscreenFile - Fix step comparisons" -ForegroundColor Green
    $content = Get-Content -LiteralPath $fullPath -Raw
    $content = $content -replace 'activeStep === "prep"', 'activeStep === "screen_prep"'
    $content = $content -replace 'activeStep === "setup"', 'activeStep === "ink_setup"'
    $content = $content -replace 'activeStep === "print"', 'activeStep === "printing"'
    $content = $content -replace 'activeStep === "cure"', 'activeStep === "curing"'
    Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
    $fixedCount += 4
}

# Fix SublimationWorkflow.tsx
$sublimationFile = "src/components/printing/SublimationWorkflow.tsx"
$fullPath = Join-Path $ServicesRoot $sublimationFile
if (Test-Path -LiteralPath $fullPath) {
    Write-Host "[FIX] $sublimationFile - Fix step comparisons" -ForegroundColor Green
    $content = Get-Content -LiteralPath $fullPath -Raw
    $content = $content -replace 'activeStep === "setup"', 'activeStep === "digital_setup"'
    $content = $content -replace 'activeStep === "print"', 'activeStep === "printing"'
    $content = $content -replace 'activeStep === "press"', 'activeStep === "heat_press"'
    $content = $content -replace 'activeStep === "quality"', 'activeStep === "quality_control"'
    Set-Content -LiteralPath $fullPath -Value $content -NoNewline -Encoding UTF8
    $fixedCount += 4
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "  Fixed: $fixedCount step comparison errors" -ForegroundColor Green

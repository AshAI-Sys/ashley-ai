# Clean Backup Script for Ashley AI
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$source = "C:\Users\Khell\Desktop\Ashley AI"
$dest = "C:\Users\Khell\Desktop\Ashley-AI-Backup-$timestamp"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Ashley AI Clean Backup Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Source: $source" -ForegroundColor Yellow
Write-Host "Destination: $dest" -ForegroundColor Yellow
Write-Host ""
Write-Host "Excluding:" -ForegroundColor Red
Write-Host "  - node_modules (dependencies)" -ForegroundColor Gray
Write-Host "  - .next, .turbo (build cache)" -ForegroundColor Gray
Write-Host "  - dist, build, out (build output)" -ForegroundColor Gray
Write-Host "  - logs, .cache, .temp (temporary files)" -ForegroundColor Gray
Write-Host "  - .git (version control)" -ForegroundColor Gray
Write-Host "  - *.log, *.tmp (log files)" -ForegroundColor Gray
Write-Host "  - dev.db* (development database)" -ForegroundColor Gray
Write-Host "  - .env.local, pnpm-lock.yaml (local config)" -ForegroundColor Gray
Write-Host ""

# Create destination directory
New-Item -ItemType Directory -Path $dest -Force | Out-Null

# Run robocopy with exclusions
$result = robocopy $source $dest /E `
    /XD "node_modules" ".next" ".turbo" "dist" "build" "out" ".cache" ".temp" "logs" "coverage" ".git" `
    /XF "*.log" "*.tmp" "dev.db" "dev.db-journal" ".env.local" "pnpm-lock.yaml" `
    /R:1 /W:1 /MT:8 /NP

# Robocopy exit codes: 0-7 are success, 8+ are errors
$exitCode = $LASTEXITCODE
if ($exitCode -le 7) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "✅ BACKUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backup location: $dest" -ForegroundColor Cyan

    # Get backup size
    $size = (Get-ChildItem -Path $dest -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Backup size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan

    # Count files
    $fileCount = (Get-ChildItem -Path $dest -Recurse -File | Measure-Object).Count
    Write-Host "Total files: $fileCount" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "❌ BACKUP FAILED!" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "Exit code: $exitCode" -ForegroundColor Red
    Write-Host ""
}

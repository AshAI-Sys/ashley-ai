# Ashley AI Quick Backup Script
# Run this in PowerShell

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$backupName = "Ashley AI - Backup $timestamp"
$source = "C:\Users\Khell\Desktop\Ashley AI"
$destination = "C:\Users\Khell\Desktop\$backupName"

Write-Host "Creating Ashley AI backup..." -ForegroundColor Green
Write-Host "Source: $source" -ForegroundColor Yellow
Write-Host "Destination: $destination" -ForegroundColor Yellow

# Create backup directory
New-Item -ItemType Directory -Path $destination -Force | Out-Null

# Copy files excluding heavy folders
$excludePatterns = @(
    "node_modules",
    ".next",
    "dist",
    "build",
    "*.log",
    "*.tmp"
)

Write-Host "Copying source files (excluding node_modules, build artifacts)..." -ForegroundColor Cyan

# Copy with exclusions
robocopy $source $destination /E /XD node_modules .next dist build .git /XF *.log *.tmp /R:1 /W:1 /NP

if ($LASTEXITCODE -le 3) {
    Write-Host "Files copied successfully!" -ForegroundColor Green

    # Create ZIP
    Write-Host "Creating ZIP archive..." -ForegroundColor Cyan
    $zipPath = "$destination.zip"
    Compress-Archive -Path $destination -DestinationPath $zipPath -Force

    # Remove temp folder
    Remove-Item -Path $destination -Recurse -Force

    Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
    Write-Host "📦 Backup saved as: $zipPath" -ForegroundColor Yellow

    # Show backup size
    $backupSize = (Get-Item $zipPath).Length / 1MB
    Write-Host "📊 Backup size: $([math]::Round($backupSize, 2)) MB" -ForegroundColor Cyan
} else {
    Write-Host "❌ Backup failed!" -ForegroundColor Red
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
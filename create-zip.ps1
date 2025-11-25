$date = Get-Date -Format 'yyyy-MM-dd'
$zipName = "ashley-ai-handoff-$date.zip"
$source = 'C:\Users\Khell\Desktop\Ashley AI'
$output = Join-Path $source $zipName

Write-Host 'Creating handoff package...' -ForegroundColor Cyan
Write-Host "Package: $zipName" -ForegroundColor Yellow
Write-Host ''

# Items to include
$items = @(
    'services',
    'packages',
    '.env.example',
    'package.json',
    'pnpm-workspace.yaml',
    'pnpm-lock.yaml',
    'turbo.json',
    'README.md',
    'CLAUDE.md',
    'PRODUCTION-SETUP.md',
    'PROJECT-HANDOFF-PACKAGE.md',
    'HANDOFF-CHECKLIST.md',
    'HOW-TO-CREATE-PACKAGE.md',
    'PACKAGE-FILE-LIST.md',
    'PARA-SA-COMPANY-README.md',
    'SYSTEM-STATUS-NOV-2025.md',
    'MISSING-FEATURES-ROADMAP.md',
    'SECURITY-AUDIT-REPORT.md',
    'LOAD-TESTING.md',
    'PERFORMANCE-OPTIMIZATION-GUIDE.md',
    'INVENTORY-QR-SYSTEM-UPDATE.md'
)

Write-Host 'Compressing files...' -ForegroundColor Cyan
Write-Host 'This may take 2-3 minutes...' -ForegroundColor Yellow
Write-Host ''

# Create array of full paths
$filesToZip = @()
foreach ($item in $items) {
    $path = Join-Path $source $item
    if (Test-Path $path) {
        $filesToZip += $path
        Write-Host "  Adding: $item" -ForegroundColor Gray
    }
}

# Remove old ZIP if exists
if (Test-Path $output) {
    Remove-Item $output -Force
}

# Create ZIP
Compress-Archive -Path $filesToZip -DestinationPath $output -CompressionLevel Optimal

$sizeBytes = (Get-Item $output).Length
$sizeMB = [math]::Round($sizeBytes / 1MB, 2)

Write-Host ''
Write-Host '================================================' -ForegroundColor Green
Write-Host '  HANDOFF PACKAGE CREATED SUCCESSFULLY!' -ForegroundColor Green
Write-Host '================================================' -ForegroundColor Green
Write-Host ''
Write-Host "Location: $output" -ForegroundColor Yellow
Write-Host "Size: $sizeMB MB" -ForegroundColor Yellow
Write-Host ''
Write-Host 'Ready to send to company!' -ForegroundColor Green
Write-Host ''

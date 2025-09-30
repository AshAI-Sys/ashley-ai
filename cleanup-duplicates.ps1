# Cleanup duplicate .js files where .tsx version exists
# This script removes .js files that have corresponding .tsx files

$rootPath = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app"
$jsFiles = Get-ChildItem -Path $rootPath -Recurse -Filter "*.js" -File
$removedCount = 0
$skippedCount = 0

Write-Host "Scanning for duplicate .js files with .tsx versions..." -ForegroundColor Yellow
Write-Host "Total .js files found: $($jsFiles.Count)" -ForegroundColor Cyan
Write-Host ""

foreach ($jsFile in $jsFiles) {
    $tsxFile = $jsFile.FullName -replace '\.js$', '.tsx'

    if (Test-Path $tsxFile) {
        $relativePath = $jsFile.FullName.Replace($rootPath + "\", "")
        Write-Host "  Removing: $relativePath" -ForegroundColor Red
        Remove-Item -Path $jsFile.FullName -Force
        $removedCount++
    } else {
        $skippedCount++
    }
}

Write-Host ""
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "  Removed: $removedCount files" -ForegroundColor Red
Write-Host "  Skipped: $skippedCount files (no .tsx version)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: You should restart the dev server to clear Next.js cache." -ForegroundColor Cyan
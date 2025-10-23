# PowerShell script to fix unused variable warnings systematically

$baseDir = "c:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src"

Write-Host "Starting TypeScript unused variable fixes..." -ForegroundColor Green

# Counter for fixes
$fixCount = 0

# Pattern 1: Fix unused 'user' parameter in requireAuth callbacks
Write-Host "`nFixing unused 'user' parameters..." -ForegroundColor Cyan
Get-ChildItem -Path "$baseDir\app\api" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $originalContent = $content

    # Replace various patterns of unused 'user' parameter
    $content = $content -replace '(requireAuth\(async \([^,]+,\s+)user(\s*\))', '${1}_user${2}'
    $content = $content -replace '(\{\s+)user(\s*:\s*\w+\s*\})', '${1}user: _user${2}'

    if ($content -ne $originalContent) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "  Fixed: $($_.FullName)" -ForegroundColor Yellow
        $fixCount++
    }
}

# Pattern 2: Fix unused 'request' parameter
Write-Host "`nFixing unused 'request' parameters..." -ForegroundColor Cyan
Get-ChildItem -Path "$baseDir\app\api" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $originalContent = $content

    # Replace patterns where request is unused
    $content = $content -replace '(async \()request(\s*:\s*NextRequest)', '${1}_request${2}'
    $content = $content -replace '(async \()request(\s*:\s*Request)', '${1}_request${2}'

    if ($content -ne $originalContent) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "  Fixed: $($_.FullName)" -ForegroundColor Yellow
        $fixCount++
    }
}

# Pattern 3: Fix unused 'req' parameter
Write-Host "`nFixing unused 'req' parameters..." -ForegroundColor Cyan
Get-ChildItem -Path "$baseDir\app\api" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $originalContent = $content

    $content = $content -replace '(async \()req(\s*:\s*NextRequest)', '${1}_req${2}'

    if ($content -ne $originalContent) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "  Fixed: $($_.FullName)" -ForegroundColor Yellow
        $fixCount++
    }
}

Write-Host "`n✓ Fixed $fixCount files" -ForegroundColor Green
Write-Host "`nRun TypeScript compiler to verify fixes..." -ForegroundColor Cyan

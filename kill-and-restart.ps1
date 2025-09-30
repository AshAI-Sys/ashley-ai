# Kill all Node.js processes on port 3001 and restart server
Write-Host "Killing processes on port 3001..." -ForegroundColor Yellow

# Find and kill all processes using port 3001
$processes = netstat -ano | Select-String ":3001" | ForEach-Object {
    $line = $_ -replace '\s+', ' '
    $parts = $line -split ' '
    $parts[-1]
} | Select-Object -Unique | Where-Object { $_ -ne "0" }

foreach ($pid in $processes) {
    try {
        Stop-Process -Id $pid -Force -ErrorAction Stop
        Write-Host "Killed process $pid" -ForegroundColor Green
    } catch {
        Write-Host "Could not kill process $pid (may already be stopped)" -ForegroundColor Yellow
    }
}

# Wait for ports to be released
Start-Sleep -Seconds 2

# Clear Next.js build cache
Write-Host "`nClearing Next.js build cache..." -ForegroundColor Yellow
$nextDir = "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\.next"
if (Test-Path $nextDir) {
    Remove-Item -Path $nextDir -Recurse -Force
    Write-Host "Build cache cleared" -ForegroundColor Green
} else {
    Write-Host "No build cache found" -ForegroundColor Yellow
}

# Regenerate Prisma client
Write-Host "`nRegenerating Prisma client..." -ForegroundColor Yellow
Set-Location "C:\Users\Khell\Desktop\Ashley AI\packages\database"
& npx prisma generate

# Start the server
Write-Host "`nStarting development server..." -ForegroundColor Yellow
Set-Location "C:\Users\Khell\Desktop\Ashley AI\services\ash-admin"
& pnpm dev
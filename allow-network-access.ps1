# Allow Network Access for Ashley AI
# Right-click this file and select "Run with PowerShell as Administrator"

Write-Host "Adding Windows Firewall rules for Ashley AI..." -ForegroundColor Cyan
Write-Host ""

# Remove old rules if they exist
netsh advfirewall firewall delete rule name="Ashley AI - Port 3001" 2>$null
netsh advfirewall firewall delete rule name="Ashley AI - Port 3003" 2>$null
netsh advfirewall firewall delete rule name="Node.js Server" 2>$null

# Add new rules
Write-Host "Adding firewall rule for port 3001 (Admin Interface)..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="Ashley AI - Port 3001" dir=in action=allow protocol=TCP localport=3001

Write-Host "Adding firewall rule for port 3003 (Client Portal)..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="Ashley AI - Port 3003" dir=in action=allow protocol=TCP localport=3003

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Firewall rules added." -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Ashley AI server is now accessible from other devices!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access URLs:" -ForegroundColor Cyan
    Write-Host "  From this computer: http://localhost:3001" -ForegroundColor White
    Write-Host "  From other devices: http://192.168.1.6:3001" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to close..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to add firewall rules" -ForegroundColor Red
    Write-Host "Make sure you ran this as Administrator" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to close..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

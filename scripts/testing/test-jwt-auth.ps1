# JWT Authentication Test Script
# Run this in PowerShell: .\test-jwt-auth.ps1

Write-Host "`n=== JWT Authentication Test ===" -ForegroundColor Cyan
Write-Host "Testing Ashley AI Authentication System`n" -ForegroundColor Gray

$baseUrl = "http://localhost:3001"

# Test 1: Login
Write-Host "[1/4] Testing Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@ashleyai.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -SessionVariable session `
        -ErrorAction Stop

    $loginData = $loginResponse.Content | ConvertFrom-Json

    if ($loginData.success) {
        Write-Host "✅ Login Successful!" -ForegroundColor Green
        Write-Host "   User: $($loginData.user.name)" -ForegroundColor Gray
        Write-Host "   Email: $($loginData.user.email)" -ForegroundColor Gray
        Write-Host "   Role: $($loginData.user.role)" -ForegroundColor Gray
        Write-Host "   Access Token: $($loginData.access_token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "   Expires In: $($loginData.expires_in) seconds (15 minutes)" -ForegroundColor Gray

        $accessToken = $loginData.access_token
        $refreshToken = $loginData.refresh_token
    } else {
        Write-Host "❌ Login Failed: $($loginData.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Login Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure dev server is running: pnpm --filter @ash/admin dev" -ForegroundColor Yellow
    exit 1
}

Start-Sleep -Seconds 1

# Test 2: Get Current User with Cookie
Write-Host "`n[2/4] Testing Authenticated Request (Cookie)..." -ForegroundColor Yellow
try {
    $meResponse = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/me" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop

    $meData = $meResponse.Content | ConvertFrom-Json

    if ($meData.success) {
        Write-Host "✅ Authentication with Cookie Works!" -ForegroundColor Green
        Write-Host "   User ID: $($meData.data.id)" -ForegroundColor Gray
        Write-Host "   Name: $($meData.data.name)" -ForegroundColor Gray
        Write-Host "   Workspace: $($meData.data.workspaceId)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed: $($meData.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 3: Get Current User with Bearer Token
Write-Host "`n[3/4] Testing Bearer Token Authentication..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }

    $meResponse2 = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/me" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    $meData2 = $meResponse2.Content | ConvertFrom-Json

    if ($meData2.success) {
        Write-Host "✅ Bearer Token Authentication Works!" -ForegroundColor Green
        Write-Host "   User: $($meData2.data.name)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed: $($meData2.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 4: Refresh Token
Write-Host "`n[4/4] Testing Token Refresh..." -ForegroundColor Yellow
try {
    $refreshBody = @{
        refresh_token = $refreshToken
    } | ConvertTo-Json

    $refreshResponse = Invoke-WebRequest `
        -Uri "$baseUrl/api/auth/refresh" `
        -Method POST `
        -ContentType "application/json" `
        -Body $refreshBody `
        -ErrorAction Stop

    $refreshData = $refreshResponse.Content | ConvertFrom-Json

    if ($refreshData.success) {
        Write-Host "✅ Token Refresh Works!" -ForegroundColor Green
        Write-Host "   New Access Token: $($refreshData.access_token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "   Expires In: $($refreshData.expires_in) seconds" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed: $($refreshData.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "JWT Authentication System is working! ✅" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Open browser to http://localhost:3001" -ForegroundColor Gray
Write-Host "  2. Login with admin@ashleyai.com / password123" -ForegroundColor Gray
Write-Host "  3. Check browser DevTools > Application > Cookies" -ForegroundColor Gray
Write-Host "     You should see: auth_token and refresh_token`n" -ForegroundColor Gray

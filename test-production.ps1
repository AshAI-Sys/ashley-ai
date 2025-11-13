# Ashley AI - Production Testing Script
# Tests all critical features after deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$BaseUrl,

    [Parameter(Mandatory=$false)]
    [string]$AuthToken = ""
)

Write-Host "🧪 Ashley AI - Production Testing" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing URL: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

$testResults = @()
$passCount = 0
$failCount = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = ""
    )

    Write-Host "Testing: $Name..." -NoNewline

    try {
        $url = "$BaseUrl$Endpoint"

        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $url -Method GET -Headers $Headers -UseBasicParsing -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $Headers -Body $Body -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
        }

        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            $script:passCount++
            return @{ Name = $Name; Status = "PASS"; StatusCode = $response.StatusCode }
        } else {
            Write-Host " ⚠️  WARN (Status: $($response.StatusCode))" -ForegroundColor Yellow
            return @{ Name = $Name; Status = "WARN"; StatusCode = $response.StatusCode }
        }
    }
    catch {
        Write-Host " ❌ FAIL" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:failCount++
        return @{ Name = $Name; Status = "FAIL"; Error = $_.Exception.Message }
    }
}

# Test 1: Homepage
$testResults += Test-Endpoint -Name "Homepage" -Endpoint "/"

# Test 2: Health Check
$testResults += Test-Endpoint -Name "Health Check API" -Endpoint "/api/health"

# Test 3: Database Health
$testResults += Test-Endpoint -Name "Database Connection" -Endpoint "/api/health/db"

# Test 4: Login Page
$testResults += Test-Endpoint -Name "Login Page" -Endpoint "/login"

# If auth token provided, test authenticated endpoints
if ($AuthToken) {
    Write-Host ""
    Write-Host "Testing authenticated endpoints..." -ForegroundColor Cyan

    $headers = @{
        "Authorization" = "Bearer $AuthToken"
    }

    # Test 5: HR Leave Types
    $testResults += Test-Endpoint -Name "HR Leave Types API" -Endpoint "/api/hr/leave-types" -Headers $headers

    # Test 6: HR Benefit Types
    $testResults += Test-Endpoint -Name "HR Benefit Types API" -Endpoint "/api/hr/benefit-types" -Headers $headers

    # Test 7: Drivers API
    $testResults += Test-Endpoint -Name "Drivers API" -Endpoint "/api/delivery/drivers" -Headers $headers

    # Test 8: Inventory Products
    $testResults += Test-Endpoint -Name "Inventory Products API" -Endpoint "/api/inventory/products" -Headers $headers

    # Test 9: Orders API
    $testResults += Test-Endpoint -Name "Orders API" -Endpoint "/api/orders" -Headers $headers

    # Test 10: Employees API
    $testResults += Test-Endpoint -Name "Employees API" -Endpoint "/api/hr/employees" -Headers $headers
} else {
    Write-Host ""
    Write-Host "⚠️  Auth token not provided. Skipping authenticated endpoints." -ForegroundColor Yellow
    Write-Host "   To test authenticated endpoints, provide token:" -ForegroundColor Yellow
    Write-Host "   .\test-production.ps1 -BaseUrl 'https://your-app.vercel.app' -AuthToken 'your-jwt-token'" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testResults.Count)" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "✅ All tests passed! System is healthy." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please review errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Detailed Results:" -ForegroundColor Cyan
$testResults | Format-Table -AutoSize

# Return exit code
exit $failCount

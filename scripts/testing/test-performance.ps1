# Ashley AI - Performance Testing Script
# Tests critical API endpoints and measures response times

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ASHLEY AI - PERFORMANCE TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"
$results = @()

# Test function
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$Iterations = 5
    )

    Write-Host "Testing: $Name" -ForegroundColor Yellow
    $times = @()
    $statusCodes = @()

    for ($i = 1; $i -le $Iterations; $i++) {
        try {
            $response = curl -s -o nul -w "%{http_code}|%{time_total}" "$Url" 2>&1
            $parts = $response -split '\|'
            $statusCode = $parts[0]
            $time = [double]$parts[1]

            $times += $time
            $statusCodes += $statusCode

            Write-Host "  [$i/$Iterations] Status: $statusCode - Time: $($time)s" -ForegroundColor Gray
            Start-Sleep -Milliseconds 200
        }
        catch {
            Write-Host "  [$i/$Iterations] ERROR: $_" -ForegroundColor Red
        }
    }

    if ($times.Count -gt 0) {
        $avgTime = ($times | Measure-Object -Average).Average
        $minTime = ($times | Measure-Object -Minimum).Minimum
        $maxTime = ($times | Measure-Object -Maximum).Maximum
        $successRate = ($statusCodes | Where-Object { $_ -eq "200" }).Count / $Iterations * 100

        # Performance grade
        $grade = if ($avgTime -lt 0.3) { "A" }
                 elseif ($avgTime -lt 0.5) { "B" }
                 elseif ($avgTime -lt 0.8) { "C" }
                 elseif ($avgTime -lt 1.5) { "D" }
                 else { "F" }

        $gradeColor = switch ($grade) {
            "A" { "Green" }
            "B" { "Cyan" }
            "C" { "Yellow" }
            "D" { "Magenta" }
            "F" { "Red" }
        }

        Write-Host "  Average: $($avgTime.ToString('0.000'))s | Min: $($minTime.ToString('0.000'))s | Max: $($maxTime.ToString('0.000'))s | Success: $successRate% | Grade: " -NoNewline
        Write-Host $grade -ForegroundColor $gradeColor
        Write-Host ""

        return @{
            Name = $Name
            Url = $Url
            AvgTime = $avgTime
            MinTime = $minTime
            MaxTime = $maxTime
            SuccessRate = $successRate
            Grade = $grade
        }
    }
}

Write-Host "Starting performance tests..." -ForegroundColor Green
Write-Host ""

# Test critical API endpoints
$endpoints = @(
    @{ Name = "Health Check"; Url = "$baseUrl/api/health" },
    @{ Name = "Dashboard Stats - Printing"; Url = "$baseUrl/api/printing/dashboard" },
    @{ Name = "Dashboard Stats - HR"; Url = "$baseUrl/api/hr/stats" },
    @{ Name = "Dashboard Stats - Delivery"; Url = "$baseUrl/api/delivery/stats" },
    @{ Name = "Dashboard Stats - Finance"; Url = "$baseUrl/api/finance/stats" },
    @{ Name = "Orders List"; Url = "$baseUrl/api/orders?page=1&limit=20" },
    @{ Name = "Clients List"; Url = "$baseUrl/api/clients?page=1&limit=20" },
    @{ Name = "Employees List"; Url = "$baseUrl/api/hr/employees?page=1&limit=20" }
)

foreach ($endpoint in $endpoints) {
    $result = Test-Endpoint -Name $endpoint.Name -Url $endpoint.Url -Iterations 5
    if ($result) {
        $results += $result
    }
}

# Summary Report
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PERFORMANCE TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host ("+" + ("-" * 78) + "+")
Write-Host ("| {0,-40} {1,10} {2,10} {3,8} |" -f "ENDPOINT", "AVG TIME", "SUCCESS", "GRADE")
Write-Host ("+" + ("-" * 78) + "+")

foreach ($result in $results) {
    $gradeColor = switch ($result.Grade) {
        "A" { "Green" }
        "B" { "Cyan" }
        "C" { "Yellow" }
        "D" { "Magenta" }
        "F" { "Red" }
    }

    Write-Host ("| {0,-40} " -f $result.Name) -NoNewline
    Write-Host ("{0,10}s " -f $result.AvgTime.ToString('0.000')) -NoNewline
    Write-Host ("{0,9}% " -f $result.SuccessRate.ToString('0.0')) -NoNewline
    Write-Host ("{0,5}" -f $result.Grade) -ForegroundColor $gradeColor -NoNewline
    Write-Host "   |"
}

Write-Host ("+" + ("-" * 78) + "+")
Write-Host ""

# Overall Grade
$avgOfAvgs = ($results.AvgTime | Measure-Object -Average).Average
$avgSuccess = ($results.SuccessRate | Measure-Object -Average).Average

$overallGrade = if ($avgOfAvgs -lt 0.3 -and $avgSuccess -gt 95) { "A" }
                elseif ($avgOfAvgs -lt 0.5 -and $avgSuccess -gt 90) { "B" }
                elseif ($avgOfAvgs -lt 0.8 -and $avgSuccess -gt 85) { "C" }
                elseif ($avgOfAvgs -lt 1.5 -and $avgSuccess -gt 75) { "D" }
                else { "F" }

$overallColor = switch ($overallGrade) {
    "A" { "Green" }
    "B" { "Cyan" }
    "C" { "Yellow" }
    "D" { "Magenta" }
    "F" { "Red" }
}

Write-Host "OVERALL SYSTEM GRADE: " -NoNewline
Write-Host $overallGrade -ForegroundColor $overallColor
Write-Host "Average Response Time: $($avgOfAvgs.ToString('0.000'))s"
Write-Host "Average Success Rate: $($avgSuccess.ToString('0.0'))%"
Write-Host ""

# Recommendations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$slowEndpoints = $results | Where-Object { $_.AvgTime -gt 0.5 }
if ($slowEndpoints.Count -gt 0) {
    Write-Host "⚠️  SLOW ENDPOINTS (>500ms):" -ForegroundColor Yellow
    foreach ($endpoint in $slowEndpoints) {
        Write-Host "   • $($endpoint.Name): $($endpoint.AvgTime.ToString('0.000'))s" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Cyan
    Write-Host "   1. Enable Redis caching for dashboard stats"
    Write-Host "   2. Add database indexes for frequently queried fields"
    Write-Host "   3. Implement pagination for large datasets"
    Write-Host "   4. Use database connection pooling"
    Write-Host ""
}

$failedEndpoints = $results | Where-Object { $_.SuccessRate -lt 100 }
if ($failedEndpoints.Count -gt 0) {
    Write-Host "❌ ENDPOINTS WITH FAILURES:" -ForegroundColor Red
    foreach ($endpoint in $failedEndpoints) {
        Write-Host "   • $($endpoint.Name): $($endpoint.SuccessRate.ToString('0.0'))% success" -ForegroundColor Red
    }
    Write-Host ""
}

if ($overallGrade -in @("A", "B")) {
    Write-Host "✅ EXCELLENT! System performance is production-ready." -ForegroundColor Green
} elseif ($overallGrade -eq "C") {
    Write-Host "⚠️  ACCEPTABLE: Minor optimizations recommended before production." -ForegroundColor Yellow
} else {
    Write-Host "❌ CRITICAL: Significant performance improvements required." -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

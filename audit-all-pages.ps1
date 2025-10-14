# Page Audit Script - Check all routes
# Run: .\audit-all-pages.ps1

Write-Host "`n=== ASHLEY AI - COMPLETE PAGE AUDIT ===" -ForegroundColor Cyan
Write-Host "Checking all routes and pages...`n" -ForegroundColor Gray

$baseUrl = "http://localhost:3001"

# All routes from sidebar navigation
$routes = @(
    @{ Name = "Dashboard"; Path = "/dashboard"; Category = "Core" }
    @{ Name = "Clients"; Path = "/clients"; Category = "Core" }
    @{ Name = "Orders"; Path = "/orders"; Category = "Core" }
    @{ Name = "Design & Approval"; Path = "/designs"; Category = "Production" }
    @{ Name = "Cutting Operations"; Path = "/cutting"; Category = "Production" }
    @{ Name = "Printing Operations"; Path = "/printing"; Category = "Production" }
    @{ Name = "Sewing Operations"; Path = "/sewing"; Category = "Production" }
    @{ Name = "Quality Control"; Path = "/quality-control"; Category = "Production" }
    @{ Name = "Finishing & Packing"; Path = "/finishing-packing"; Category = "Production" }
    @{ Name = "Delivery Management"; Path = "/delivery"; Category = "Production" }
    @{ Name = "Finance"; Path = "/finance"; Category = "Business" }
    @{ Name = "HR & Payroll"; Path = "/hr-payroll"; Category = "Business" }
    @{ Name = "Government Reports"; Path = "/government"; Category = "Business" }
    @{ Name = "SMS Notifications"; Path = "/sms-notifications"; Category = "Communication" }
    @{ Name = "Maintenance"; Path = "/maintenance"; Category = "Operations" }
    @{ Name = "User Management"; Path = "/admin/users"; Category = "Admin" }
    @{ Name = "Employee Onboarding"; Path = "/admin/onboarding"; Category = "Admin" }
    @{ Name = "Merchandising AI"; Path = "/merchandising"; Category = "AI" }
    @{ Name = "Automation Engine"; Path = "/automation"; Category = "AI" }
    @{ Name = "Advanced Analytics"; Path = "/analytics"; Category = "Analytics" }
    @{ Name = "AI Features"; Path = "/ai-features"; Category = "AI" }
    @{ Name = "Inventory"; Path = "/inventory"; Category = "Operations" }
    @{ Name = "Performance"; Path = "/performance"; Category = "Analytics" }
    @{ Name = "Tenant Settings"; Path = "/admin/tenants"; Category = "Admin" }
)

$results = @()
$working = 0
$notWorking = 0
$comingSoon = 0

foreach ($route in $routes) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$($route.Path)" `
            -Method GET `
            -TimeoutSec 5 `
            -ErrorAction Stop

        $content = $response.Content
        $status = $response.StatusCode

        # Check if page has "Coming Soon" or placeholder content
        $hasComingSoon = $content -match "Coming Soon|Under Construction|TODO|Not yet implemented"
        $hasContent = $content.Length -gt 5000

        if ($hasComingSoon) {
            $pageStatus = "Coming Soon"
            $icon = "⏳"
            $color = "Yellow"
            $comingSoon++
        } elseif ($hasContent) {
            $pageStatus = "Working"
            $icon = "✅"
            $color = "Green"
            $working++
        } else {
            $pageStatus = "Empty/Basic"
            $icon = "⚠️"
            $color = "DarkYellow"
            $notWorking++
        }

        Write-Host "$icon $($route.Name.PadRight(25))" -NoNewline -ForegroundColor $color
        Write-Host " | Status: $($status) | $pageStatus" -ForegroundColor Gray

        $results += [PSCustomObject]@{
            Name = $route.Name
            Path = $route.Path
            Category = $route.Category
            Status = $pageStatus
            HttpCode = $status
            HasContent = $hasContent
        }

    } catch {
        Write-Host "❌ $($route.Name.PadRight(25))" -NoNewline -ForegroundColor Red
        Write-Host " | Error: $($_.Exception.Message)" -ForegroundColor Red

        $notWorking++

        $results += [PSCustomObject]@{
            Name = $route.Name
            Path = $route.Path
            Category = $route.Category
            Status = "Error"
            HttpCode = "N/A"
            HasContent = $false
        }
    }

    Start-Sleep -Milliseconds 200
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Pages: $($routes.Count)" -ForegroundColor White
Write-Host "✅ Working: $working" -ForegroundColor Green
Write-Host "⏳ Coming Soon: $comingSoon" -ForegroundColor Yellow
Write-Host "❌ Not Working/Empty: $notWorking" -ForegroundColor Red

# Breakdown by category
Write-Host "`n=== BY CATEGORY ===" -ForegroundColor Cyan
$results | Group-Object -Property Category | ForEach-Object {
    Write-Host "`n$($_.Name):" -ForegroundColor Magenta
    $_.Group | Format-Table -Property Name, Status, Path -AutoSize
}

# Export results
$results | Export-Csv -Path "page-audit-results.csv" -NoTypeInformation
Write-Host "`nResults exported to: page-audit-results.csv" -ForegroundColor Gray

# Pages that need work
Write-Host "`n=== PAGES THAT NEED WORK ===" -ForegroundColor Yellow
$needsWork = $results | Where-Object { $_.Status -eq "Coming Soon" -or $_.Status -eq "Empty/Basic" -or $_.Status -eq "Error" }
$needsWork | Format-Table -Property Name, Status, Path -AutoSize

Write-Host "`nAudit Complete!`n" -ForegroundColor Green

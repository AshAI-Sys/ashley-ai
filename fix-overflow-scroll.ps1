# Fix Unnecessary Overflow Scrollbars
# Removes overflow-x-auto from standard tables that don't need horizontal scroll

$files = @(
    "services/ash-admin/src/app/admin/audit/page.tsx",
    "services/ash-admin/src/app/admin/onboarding/page.tsx",
    "services/ash-admin/src/app/capa/page.tsx",
    "services/ash-admin/src/app/cutting/page.tsx",
    "services/ash-admin/src/app/delivery/page.tsx",
    "services/ash-admin/src/app/finishing-packing/page.tsx",
    "services/ash-admin/src/app/maintenance/page.tsx",
    "services/ash-admin/src/app/quality-control/capa/page.tsx",
    "services/ash-admin/src/app/settings/audit-logs/page.tsx",
    "services/ash-admin/src/app/settings/notifications/page.tsx"
)

$count = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw

        # Replace standard pattern: <div className="overflow-x-auto"> followed by <table>
        # Only for tables with standard columns (not very wide tables)
        $newContent = $content -replace '<div className="overflow-x-auto">\s*<table', '<div><table'

        # Also remove overflow-y-auto from modals/containers that don't need it
        $newContent = $newContent -replace 'overflow-y-auto max-h-screen', 'max-h-screen'

        if ($content -ne $newContent) {
            Set-Content -Path $file -Value $newContent -NoNewline
            Write-Host "✅ Fixed: $file" -ForegroundColor Green
            $count++
        } else {
            Write-Host "⏭️  Skipped: $file (no changes needed)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✨ Total files fixed: $count" -ForegroundColor Cyan

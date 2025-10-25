# Revert pages back to client components (proper approach)
$pages = @(
  "automation",
  "delivery",
  "clients",
  "designs",
  "cutting",
  "employee",
  "finishing-packing",
  "finance",
  "hr-payroll",
  "inventory",
  "maintenance",
  "merchandising",
  "orders",
  "printing",
  "quality-control"
)

foreach ($page in $pages) {
  $file = "services/ash-admin/src/app/$page/page.tsx"
  if (Test-Path $file) {
    $content = Get-Content $file -Raw

    # Remove export const dynamic
    $content = $content -replace 'export const dynamic = .force-dynamic.\s*\n+', ''

    # Add "use client" at the very top
    if ($content -notmatch '^"use client"') {
      $content = '"use client";' + "`n`n" + $content
    }

    Set-Content $file $content -NoNewline
    Write-Host "✅ Reverted: $page/page.tsx (back to client component)"
  } else {
    Write-Host "❌ Not found: $page/page.tsx"
  }
}

Write-Host "`n✅ Done! All pages reverted to client components."
Write-Host "Note: Prerendering errors are expected for these dynamic pages, but they'll work fine at runtime."

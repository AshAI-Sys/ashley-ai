# Fix prerendering by removing "use client" and keeping export const dynamic
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

    # Remove both "use client" and existing dynamic export
    $content = $content -replace '"use client";?\s*\n', ''
    $content = $content -replace "'use client';?\s*\n", ''
    $content = $content -replace 'export const dynamic = .force-dynamic.\s*\n', ''

    # Add export const dynamic at the top before imports
    if ($content -notmatch "^export const dynamic") {
      $content = "export const dynamic = 'force-dynamic'`n`n" + $content
    }

    Set-Content $file $content -NoNewline
    Write-Host "✅ Updated: $page/page.tsx (removed use client, kept dynamic export)"
  } else {
    Write-Host "❌ Not found: $page/page.tsx"
  }
}

Write-Host "`n✅ Done! All pages converted to server components with force-dynamic."
Write-Host "Run 'cd services/ash-admin && pnpm build' to test."

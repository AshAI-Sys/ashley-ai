# Fix files with brackets in names
$rootPath = "c:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src"
$importStatement = 'import { formatDate as formatDateUtil } from "@/lib/utils/date";'

$bracketFiles = @(
    "app/clients/[id]/brands/page.tsx",
    "app/clients/[id]/page.tsx",
    "app/designs/[id]/approval/page.tsx",
    "app/designs/[id]/page.tsx",
    "app/sewing/runs/[id]/page.tsx",
    "app/delivery/tracking/[id]/page.tsx",
    "app/designs/[id]/versions/page.tsx"
)

$fixedCount = 0

foreach ($file in $bracketFiles) {
    $filePath = Join-Path $rootPath $file

    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  Not found: $file" -ForegroundColor Yellow
        continue
    }

    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content

        # Add import if not present
        if ($content -notmatch 'from "@/lib/utils/date"') {
            $lastImportIndex = $content.LastIndexOf('import ')
            if ($lastImportIndex -ge 0) {
                $afterLastImport = $content.IndexOf(';', $lastImportIndex)
                if ($afterLastImport -ge 0) {
                    $content = $content.Insert($afterLastImport + 1, "`n$importStatement")
                }
            }
        }

        # Replace patterns
        $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleDateString\(\)', '$1 ? formatDateUtil($1) : "-"'
        $content = $content -replace '([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\.toLocaleDateString\(\)', '$1 ? formatDateUtil($1) : "-"'
        $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleString\(\)', '$1 ? formatDateUtil($1, "datetime") : "-"'
        $content = $content -replace '([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\.toLocaleString\(\)(?!\s*\.)', '$1 ? formatDateUtil($1, "datetime") : "-"'

        if ($content -ne $originalContent) {
            Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed: $file" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "⏭️  No changes: $file" -ForegroundColor Gray
        }

    } catch {
        Write-Host "❌ Error: $file - $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Fixed $fixedCount bracket files" -ForegroundColor Cyan

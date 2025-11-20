# Comprehensive Date Parsing Fix Script
# Fixes all unsafe .toLocaleDateString() and .toLocaleString() patterns

$rootPath = "c:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src"
$importStatement = 'import { formatDate as formatDateUtil } from "@/lib/utils/date";'

# List of files to fix (from grep results)
$filesToFix = @(
    "app\admin\reports\page.tsx",
    "app\admin\users\page.tsx",
    "app\capa\page.tsx",
    "app\clients\[id]\brands\page.tsx",
    "app\clients\[id]\page.tsx",
    "app\cutting\issue-fabric\page.tsx",
    "app\cutting\scan-bundle\page.tsx",
    "app\delivery\page.tsx",
    "app\designs\[id]\approval\page.tsx",
    "app\designs\[id]\page.tsx",
    "app\maintenance\page.tsx",
    "app\printing\page.tsx",
    "app\quality-control\capa\page.tsx",
    "components\approval-workflow\BatchApprovalActions.tsx",
    "app\sewing\runs\new\page.tsx",
    "app\sewing\runs\[id]\page.tsx",
    "app\delivery\tracking\[id]\page.tsx",
    "app\designs\[id]\versions\page.tsx",
    "app\automation\page.tsx",
    "app\inventory\history\page.tsx",
    "components\audit\activity-tab.tsx",
    "components\sewing\AshleyAIMonitor.tsx",
    "components\approval-workflow\ThreadedComments.tsx",
    "lib\export.ts",
    "lib\integrations\email.ts",
    "lib\integrations\slack.ts"
)

$fixedCount = 0
$errorCount = 0

foreach ($file in $filesToFix) {
    $filePath = Join-Path $rootPath $file

    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  File not found: $file" -ForegroundColor Yellow
        continue
    }

    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content

        # Check if import is already present
        if ($content -notmatch 'from "@/lib/utils/date"') {
            # Add import after the last import statement
            $lastImportIndex = $content.LastIndexOf('import ')
            if ($lastImportIndex -ge 0) {
                # Find the end of the last import line
                $afterLastImport = $content.IndexOf(';', $lastImportIndex)
                if ($afterLastImport -ge 0) {
                    $content = $content.Insert($afterLastImport + 1, "`n$importStatement")
                }
            }
        }

        # Replace unsafe .toLocaleDateString() patterns
        # Pattern 1: new Date(variable).toLocaleDateString()
        $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleDateString\(\)', '$1 ? formatDateUtil($1) : "-"'

        # Pattern 2: dateVariable.toLocaleDateString()  (only if not already in formatDateUtil)
        $content = $content -replace '([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\.toLocaleDateString\(\)', '$1 ? formatDateUtil($1) : "-"'

        # Replace unsafe .toLocaleString() patterns (only for dates, not currency)
        # Only replace if it's clearly a Date object
        $content = $content -replace 'new Date\(([^)]+)\)\.toLocaleString\(\)', '$1 ? formatDateUtil($1, "datetime") : "-"'

        # Save only if changes were made
        if ($content -ne $originalContent) {
            Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✅ Fixed: $file" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "⏭️  No changes: $file" -ForegroundColor Gray
        }

    } catch {
        Write-Host "❌ Error fixing $file : $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Fix Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Fixed: $fixedCount files" -ForegroundColor Green
Write-Host "  ⏭️  Skipped: $($filesToFix.Count - $fixedCount - $errorCount) files" -ForegroundColor Yellow
Write-Host "  ❌ Errors: $errorCount files" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

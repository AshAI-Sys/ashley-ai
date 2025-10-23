# Comprehensive TypeScript Error Fix Script
$ErrorActionPreference = "Continue"
$basePath = "c:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api"

# Common fix patterns
function Fix-File {
    param($filePath)

    if (-not (Test-Path $filePath)) {
        return $false
    }

    $content = Get-Content $filePath -Raw
    $original = $content

    # Pattern 1: Fix missing });  before export statements
    $content = $content -replace '(\}\s*catch.*?\}\s*\})\s*\n\s*(//.*\n)?export\s+const', '$1' + "`n});`n`n`$2export const"

    # Pattern 2: Add missing }); at end of requireAuth/requireRole wrappers
    if ($content -match 'requireAuth\(async.*\{' -and -not $content.TrimEnd().EndsWith('});')) {
        if ($content.TrimEnd().EndsWith('}')) {
            $content = $content.TrimEnd() + "`n});"
        }
    }

    # Pattern 3: Fix missing semicolons in JSON returns
    $content = $content -replace '(\s+\})\s*\n\s*catch', '$1;' + "`n  } catch"

    if ($content -ne $original) {
        Set-Content -Path $filePath -Value $content -NoNewline
        return $true
    }
    return $false
}

# Get list of files from error output
$files = @(
    "analytics\metrics\route.ts",
    "analytics\profit\route.ts",
    "audit-logs\route.ts",
    "auth\2fa\verify\route.ts",
    "auth\me\route.ts",
    "automation\stats\route.ts",
    "backups\route.ts",
    "bundles\[id]\status\route.ts",
    "dashboards\route.ts",
    "designs\route.ts",
    "sewing\operations\route.ts",
    "tenants\limits\route.ts"
)

$fixed = 0
foreach ($file in $files) {
    $fullPath = Join-Path $basePath $file
    if (Fix-File $fullPath) {
        Write-Host "Fixed: $file"
        $fixed++
    }
}

Write-Host "`nTotal fixed: $fixed files"

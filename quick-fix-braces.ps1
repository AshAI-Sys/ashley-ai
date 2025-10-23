# Quick fix for missing closing braces in TypeScript files
$rootPath = "c:\Users\Khell\Desktop\Ashley AI\services\ash-admin\src\app\api"

# Pattern 1: Fix lines with });[newline]} (extra closing brace)
# Pattern 2: Fix lines with });[newline without closing brace]
# Pattern 3: Add missing }); before export statements

$files = @(
    "ai-chat\chat\route.ts",
    "ai-chat\conversations\[id]\route.ts",
    "ai\bottleneck\route.ts",
    "ai\scheduling\scenario\route.ts",
    "analytics\metrics\route.ts",
    "analytics\profit\route.ts",
    "audit-logs\route.ts",
    "auth\2fa\verify\route.ts",
    "auth\employee-login\route.ts",
    "auth\me\route.ts",
    "automation\alerts\route.ts",
    "automation\notifications\route.ts",
    "automation\stats\route.ts",
    "automation\templates\route.ts",
    "backups\route.ts",
    "upload\route.ts"
)

$fixCount = 0

foreach ($file in $files) {
    $filePath = Join-Path $rootPath $file
    if (-not (Test-Path $filePath)) {
        Write-Host "File not found: $filePath"
        continue
    }

    $content = Get-Content $filePath -Raw
    $original = $content

    # Fix pattern: });[whitespace]export (missing closing brace)
    $content = $content -replace '(\);)\s*(export\s+(const|async))', "`$1`n});`n`n`$2"

    # Fix pattern: missing }); at end before last export
    if ($content -match '(?s)(.*\s+\}\s*catch.*?\}\s*\})\s*(export\s+const)' -and $content -notmatch '(?s)\}\);[\r\n]+export\s+const\s+\w+\s*=') {
        $content = $content -replace '(\}\s*\})\s*(export\s+const)', "`$1`n});`n`n`$2"
    }

    # Fix pattern: }[newline] right before file end (need });)
    $content = $content -replace '(\}\s*)$', "`});`n"

    if ($content -ne $original) {
        Set-Content -Path $filePath -Value $content -NoNewline
        $fixCount++
        Write-Host "Fixed: $file"
    }
}

Write-Host "`nFixed $fixCount files"

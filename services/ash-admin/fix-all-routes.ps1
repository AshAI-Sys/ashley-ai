# Mass-fix all route.ts files with missing closing braces
# This fixes the pattern where `});` should be `}\n});`

$ErrorActionPreference = 'Stop'
$fixed = 0
$errors = 0

Write-Host "🔧 Scanning for files with syntax errors..." -ForegroundColor Cyan

# Find all route.ts files
$files = Get-ChildItem -Path "src\app\api" -Filter "*.ts" -Recurse

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content

        # Pattern 1: Fix `  });` at end of catch blocks (should be `  }\n});`)
        $content = $content -replace '(\n  \} catch \([^)]+\) \{[\s\S]+?\n    \);\n  }\);)', {
            $match = $args[0].Value
            $match -replace '  }\);$', '  }`n});'
        }

        # Pattern 2: Fix `});` after return statements in catch blocks
        $content = $content -replace '(\n    \);(\n  }\);)$', "`n    );`n  }`n});"

        # Pattern 3: Fix missing `});` after catch blocks
        $content = $content -replace '(\n  \} catch[^\{]+\{[^\}]+\n    \);)\n  }\);', '$1`n  }`n});'

        # Pattern 4: Fix `  });` after try-catch when there's an export after
        $content = $content -replace '(\n  }\)\n\n\/\/ [A-Z]+)', '  }`n});`n`n//$1'

        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $fixed++
            Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Error fixing $($file.Name): $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  Fixed: $fixed files" -ForegroundColor Green
Write-Host "  Errors: $errors files" -ForegroundColor Red
Write-Host "`n🚀 Running production build..." -ForegroundColor Yellow

# Run build immediately
& pnpm build

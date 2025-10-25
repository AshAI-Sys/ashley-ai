@echo off
REM Auto-fix script for requireAuth closure patterns (Windows version)
REM Created: 2025-10-25

setlocal enabledelayedexpansion

set "TARGET_DIR=%~dp0services\ash-admin\src\app\api"
if not "%~1"=="" set "TARGET_DIR=%~1"

echo ====================================
echo Auto-fixing requireAuth closures
echo Target: %TARGET_DIR%
echo ====================================
echo.

set FIXES=0

REM Use PowerShell for complex operations
powershell -Command "$ErrorActionPreference='SilentlyContinue'; Get-ChildItem -Path '%TARGET_DIR%' -Filter 'route.ts' -Recurse | ForEach-Object { $file = $_.FullName; $content = Get-Content $file -Raw; if ($content -match 'requireAuth') { Write-Host \"Checking: $file\"; if ($content -match 'return requireAuth\(async') { Write-Host \"  [FIX] Double requireAuth wrapper\" -ForegroundColor Yellow; $content = $content -replace 'return requireAuth\(async[^\n]*\n', ''; Set-Content -Path $file -Value $content -NoNewline; } $lines = Get-Content $file; if ($lines[-1] -match '^}$' -and $content -match 'requireAuth') { Write-Host \"  [FIX] Missing closure }); at end\" -ForegroundColor Yellow; $lines[-1] = '});'; $lines | Set-Content $file; } } }"

echo.
echo ====================================
echo Auto-fix complete!
echo ====================================
echo.
echo Next steps:
echo   1. cd services\ash-admin
echo   2. pnpm build
echo   3. Review any remaining errors
echo.

pause

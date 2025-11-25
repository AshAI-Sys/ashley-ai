@echo off
REM Ashley AI - Create Handoff Package Script (Windows Batch)
REM This script creates a complete ZIP package for client delivery

echo ================================================
echo    Ashley AI - Handoff Package Creator
echo ================================================
echo.

set "PROJECT_ROOT=%~dp0"
set "PACKAGE_NAME=ashley-ai-handoff-%date:~-4,4%-%date:~-10,2%-%date:~-7,2%"
set "OUTPUT_ZIP=%PROJECT_ROOT%%PACKAGE_NAME%.zip"

echo Creating handoff package...
echo Package name: %PACKAGE_NAME%
echo.

REM Check if 7-Zip is installed
where 7z >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using 7-Zip to create archive...

    REM Create ZIP file with 7-Zip
    7z a -tzip "%OUTPUT_ZIP%" ^
        "%PROJECT_ROOT%services" ^
        "%PROJECT_ROOT%packages" ^
        "%PROJECT_ROOT%.env.example" ^
        "%PROJECT_ROOT%package.json" ^
        "%PROJECT_ROOT%pnpm-workspace.yaml" ^
        "%PROJECT_ROOT%pnpm-lock.yaml" ^
        "%PROJECT_ROOT%turbo.json" ^
        "%PROJECT_ROOT%README.md" ^
        "%PROJECT_ROOT%CLAUDE.md" ^
        "%PROJECT_ROOT%PRODUCTION-SETUP.md" ^
        "%PROJECT_ROOT%PROJECT-HANDOFF-PACKAGE.md" ^
        "%PROJECT_ROOT%HANDOFF-CHECKLIST.md" ^
        "%PROJECT_ROOT%SYSTEM-STATUS-NOV-2025.md" ^
        "%PROJECT_ROOT%MISSING-FEATURES-ROADMAP.md" ^
        "%PROJECT_ROOT%SECURITY-AUDIT-REPORT.md" ^
        "%PROJECT_ROOT%LOAD-TESTING.md" ^
        "%PROJECT_ROOT%PERFORMANCE-OPTIMIZATION-GUIDE.md" ^
        "%PROJECT_ROOT%INVENTORY-QR-SYSTEM-UPDATE.md" ^
        -xr!node_modules -xr!.next -xr!dist -xr!build -xr!coverage -xr!.turbo -xr!*.log -xr!.env -xr!*.db -xr!*.db-journal

    echo.
    echo ================================================
    echo    HANDOFF PACKAGE CREATED SUCCESSFULLY!
    echo ================================================
    echo.
    echo Package Location: %OUTPUT_ZIP%
    echo.
    echo Ready to send to company!
    echo.

) else (
    echo ERROR: 7-Zip not found!
    echo.
    echo Please install 7-Zip from: https://www.7-zip.org/
    echo Or use the PowerShell script instead: create-handoff-package.ps1
    echo.
)

pause

@echo off
echo 🚀 Ashley AI - Creating Stage 9 Complete Backup...
echo 📅 Date: September 16, 2025
echo 🎯 Including: Finance Operations completion

set BACKUP_DIR=C:\Users\Khell\Desktop\Ashley-AI-Stage9-Complete-09-16-2025

echo 📁 Creating backup directory...
mkdir "%BACKUP_DIR%" 2>nul

echo 📋 Copying documentation files...
copy "*.md" "%BACKUP_DIR%\" >nul
copy "*.html" "%BACKUP_DIR%\" >nul
copy "*.json" "%BACKUP_DIR%\" >nul
copy "*.js" "%BACKUP_DIR%\" >nul
copy "*.ts" "%BACKUP_DIR%\" >nul
copy "*.yaml" "%BACKUP_DIR%\" >nul
copy "*.yml" "%BACKUP_DIR%\" >nul

echo 📦 Copying core directories...
xcopy "packages" "%BACKUP_DIR%\packages\" /E /I /H /Y >nul
xcopy "services" "%BACKUP_DIR%\services\" /E /I /H /Y >nul
xcopy "docs" "%BACKUP_DIR%\docs\" /E /I /H /Y >nul
xcopy "scripts" "%BACKUP_DIR%\scripts\" /E /I /H /Y >nul

echo 📄 Creating backup info...
echo # Ashley AI - Stage 9 Complete Backup > "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Created: %DATE% %TIME% >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Status: 9/14 Stages Complete (64%% Progress) >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo Latest: Stage 9 - Finance Operations >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo. >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo ✅ Includes: >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - Complete database schema with 50+ models >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - 14 new finance models for Stage 9 >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - All API endpoints and UI components >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - Interactive demos and documentation >> "%BACKUP_DIR%\BACKUP_INFO.txt"
echo - Complete system architecture >> "%BACKUP_DIR%\BACKUP_INFO.txt"

echo 🚀 Creating quick start guide...
echo # Quick Start Guide > "%BACKUP_DIR%\QUICK_START.txt"
echo. >> "%BACKUP_DIR%\QUICK_START.txt"
echo 1. Install dependencies: npm install or pnpm install >> "%BACKUP_DIR%\QUICK_START.txt"
echo 2. Generate database: cd packages/database && npx prisma generate >> "%BACKUP_DIR%\QUICK_START.txt"
echo 3. Start system: pnpm --filter admin dev >> "%BACKUP_DIR%\QUICK_START.txt"
echo 4. Access: http://localhost:3001 >> "%BACKUP_DIR%\QUICK_START.txt"
echo 5. Finance: http://localhost:3001/finance >> "%BACKUP_DIR%\QUICK_START.txt"
echo 6. Demo: Open ashley-ai-complete-demo.html >> "%BACKUP_DIR%\QUICK_START.txt"

echo ✅ Backup completed successfully!
echo 📍 Location: %BACKUP_DIR%
echo 📊 Status: Stage 9 Finance Operations included
echo 🎯 Ready for Stage 10: HR & Payroll

pause
explorer "%BACKUP_DIR%"
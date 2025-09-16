@echo off
REM Ashley AI - Auto Commit Script
REM Automatically commits pending changes every time it runs

echo 🚀 Ashley AI - Auto Commit Script
echo 📅 %DATE% %TIME%

REM Check if there are changes to commit
git status --porcelain > temp_status.txt
if not exist temp_status.txt (
    echo ❌ Cannot check git status
    pause
    exit /b 1
)

for /f %%i in ("temp_status.txt") do set size=%%~zi
del temp_status.txt

if %size% equ 0 (
    echo ✅ No changes to commit - working tree is clean
    pause
    exit /b 0
)

echo 📋 Changes detected, preparing auto-commit...

REM Add all changes
echo 📁 Adding all changes...
git add .

REM Check git status after adding
git status

REM Create auto-commit with timestamp
set timestamp=%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%_%TIME:~0,2%-%TIME:~3,2%-%TIME:~6,2%
set timestamp=%timestamp: =0%

echo 💾 Creating auto-commit...
git commit -m "Auto-commit: Ashley AI updates - %timestamp%

🤖 Automatic commit of pending changes
📅 Date: %DATE%
⏰ Time: %TIME%

Changes include:
- Any modified files in the Ashley AI system
- Documentation updates
- Code changes
- Configuration updates

🚀 Generated with Ashley AI Auto-Commit Script

Co-Authored-By: Claude <noreply@anthropic.com>"

if %ERRORLEVEL% equ 0 (
    echo ✅ Auto-commit successful!
    git status
) else (
    echo ❌ Auto-commit failed!
)

echo 🎯 Auto-commit process completed
pause
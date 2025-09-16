@echo off
REM Ashley AI - Setup Auto Commit with Scheduled Task

echo 🚀 Ashley AI - Auto Commit Setup
echo 🎯 This will create automatic git commits every 30 minutes

echo.
echo 📋 Setup Options:
echo [1] Manual Auto-Commit (run script when needed)
echo [2] Scheduled Auto-Commit (every 30 minutes)
echo [3] Git Hook Auto-Commit (on file changes)
echo [4] Watch Folder Auto-Commit (continuous monitoring)
echo.

set /p choice=Choose option (1-4):

if "%choice%"=="1" goto MANUAL
if "%choice%"=="2" goto SCHEDULED
if "%choice%"=="3" goto HOOKS
if "%choice%"=="4" goto WATCH

:MANUAL
echo.
echo 📝 Manual Auto-Commit Setup:
echo ✅ auto-commit.bat - Double-click to commit changes
echo ✅ auto-commit.ps1 - PowerShell version with more features
echo.
echo 🎯 Usage:
echo - Double-click auto-commit.bat when you want to commit
echo - Or run: powershell -ExecutionPolicy Bypass auto-commit.ps1
echo.
echo 💡 Tip: Create desktop shortcuts for quick access!
pause
goto END

:SCHEDULED
echo.
echo ⏰ Creating Scheduled Task for Auto-Commit...
echo 📅 Will run every 30 minutes

REM Create scheduled task
schtasks /create /tn "Ashley-AI-Auto-Commit" /tr "\"%CD%\auto-commit.bat\"" /sc minute /mo 30 /f

if %ERRORLEVEL% equ 0 (
    echo ✅ Scheduled task created successfully!
    echo 🎯 Auto-commit will run every 30 minutes
    echo 📊 To view: schtasks /query /tn "Ashley-AI-Auto-Commit"
    echo 🗑️ To delete: schtasks /delete /tn "Ashley-AI-Auto-Commit" /f
) else (
    echo ❌ Failed to create scheduled task. Run as Administrator.
)
pause
goto END

:HOOKS
echo.
echo 🔗 Setting up Git Hooks for Auto-Commit...

REM Create pre-commit hook (optional - commits before each manual commit)
if not exist ".git\hooks" mkdir ".git\hooks"

echo #!/bin/sh > .git\hooks\pre-commit
echo # Ashley AI Auto-Commit Hook >> .git\hooks\pre-commit
echo echo "🚀 Ashley AI - Pre-commit auto-commit" >> .git\hooks\pre-commit
echo git add . >> .git\hooks\pre-commit

echo ✅ Git hooks setup complete!
echo 🎯 Changes will be auto-added before each commit
pause
goto END

:WATCH
echo.
echo 👀 Setting up Folder Watch Auto-Commit...
echo ⚠️  This requires PowerShell and runs continuously

REM Create folder watcher script
echo # Ashley AI - Folder Watcher Auto Commit > auto-commit-watcher.ps1
echo $watcher = New-Object System.IO.FileSystemWatcher >> auto-commit-watcher.ps1
echo $watcher.Path = "%CD%" >> auto-commit-watcher.ps1
echo $watcher.Filter = "*.*" >> auto-commit-watcher.ps1
echo $watcher.IncludeSubdirectories = $true >> auto-commit-watcher.ps1
echo $watcher.EnableRaisingEvents = $true >> auto-commit-watcher.ps1
echo Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action { >> auto-commit-watcher.ps1
echo     Start-Sleep 10 >> auto-commit-watcher.ps1
echo     if (git status --porcelain) { >> auto-commit-watcher.ps1
echo         Write-Host "🔄 Auto-committing changes..." >> auto-commit-watcher.ps1
echo         ^& "%CD%\auto-commit.ps1" >> auto-commit-watcher.ps1
echo     } >> auto-commit-watcher.ps1
echo } >> auto-commit-watcher.ps1
echo Write-Host "👀 Watching for changes in Ashley AI..." >> auto-commit-watcher.ps1
echo try { while ($true) { Start-Sleep 1 } } finally { $watcher.Dispose() } >> auto-commit-watcher.ps1

echo ✅ Folder watcher created!
echo 🎯 Run: powershell -ExecutionPolicy Bypass auto-commit-watcher.ps1
echo ⚠️  This will run continuously until stopped (Ctrl+C)
pause
goto END

:END
echo.
echo 🎉 Ashley AI Auto-Commit Setup Complete!
echo 📂 Files created:
echo   - auto-commit.bat (manual)
echo   - auto-commit.ps1 (PowerShell)
if "%choice%"=="2" echo   - Scheduled task: Ashley-AI-Auto-Commit
if "%choice%"=="4" echo   - auto-commit-watcher.ps1 (continuous)
echo.
echo 🚀 Your Ashley AI system will now auto-commit changes!
pause
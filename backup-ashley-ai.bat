@echo off
echo Creating Ashley AI Backup...

:: Get current date/time for backup folder name
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/: " %%a in ("%TIME%") do (set mytime=%%a%%b)
set backup_name=Ashley AI - Backup %mydate%-%mytime%

:: Create backup directory
echo Creating backup folder: %backup_name%
mkdir "C:\Users\Khell\Desktop\%backup_name%"

:: Copy source files (excluding node_modules and build artifacts)
echo Copying source files...
robocopy "C:\Users\Khell\Desktop\Ashley AI" "C:\Users\Khell\Desktop\%backup_name%" /E /XD node_modules .next dist build .git /XF *.log

:: Create a ZIP file (requires PowerShell)
echo Creating ZIP archive...
powershell -command "Compress-Archive -Path 'C:\Users\Khell\Desktop\%backup_name%' -DestinationPath 'C:\Users\Khell\Desktop\%backup_name%.zip' -Force"

:: Remove temporary folder (optional)
echo Cleaning up temporary folder...
rmdir /s /q "C:\Users\Khell\Desktop\%backup_name%"

echo Backup completed: %backup_name%.zip
pause
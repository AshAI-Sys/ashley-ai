@echo off
echo ===========================================
echo Ashley AI - Auto Fix Pending Changes
echo ===========================================
echo.

echo [1/4] Adding all new files to git...
git add .

echo [2/4] Regenerating Prisma client after schema changes...
cd packages\database
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Error: Prisma generate failed
    pause
    exit /b 1
)
cd ..\..

echo [3/4] Running database migration if needed...
cd packages\database
call npx prisma migrate dev --name auto-fix-changes
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Migration may have failed or no changes detected
)
cd ..\..

echo [4/4] Committing all changes...
git add .
git commit -m "Auto-fix: Update system after Stage 11 Maintenance Management implementation

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

if %errorlevel% equ 0 (
    echo ✅ SUCCESS: All pending changes have been committed!
) else (
    echo ⚠️  Warning: Commit may have failed (possibly no changes or already committed)
)

echo.
echo ===========================================
echo Auto-fix completed!
echo ===========================================
pause
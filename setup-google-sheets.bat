@echo off
echo ============================================
echo Ashley AI - Google Sheets Setup Helper
echo ============================================
echo.
echo This script will help you set up Google Sheets integration
echo Account: ashai.system@gmail.com
echo.
echo STEP 1: Open Google Cloud Console
echo ============================================
echo.
echo 1. Open your browser and go to:
echo    https://console.cloud.google.com
echo.
echo 2. Make sure you're logged in as: ashai.system@gmail.com
echo.
pause
echo.
echo STEP 2: Create New Project
echo ============================================
echo.
echo 1. Click "Select a Project" (top left)
echo 2. Click "NEW PROJECT" button
echo 3. Enter project name: Ashley-AI-Data-Sync
echo 4. Click "CREATE"
echo 5. Wait for project creation to complete
echo.
pause
echo.
echo STEP 3: Enable Required APIs
echo ============================================
echo.
echo 1. Make sure your new project is selected
echo 2. Go to "APIs & Services" -> "Library"
echo 3. Search for "Google Sheets API" and click ENABLE
echo 4. Go back to Library
echo 5. Search for "Google Drive API" and click ENABLE
echo.
pause
echo.
echo STEP 4: Create Service Account
echo ============================================
echo.
echo 1. Go to "IAM & Admin" -> "Service Accounts"
echo 2. Click "CREATE SERVICE ACCOUNT"
echo 3. Enter details:
echo    - Service account name: ashley-ai-sheets-sync
echo    - Description: Service account for Ashley AI Google Sheets sync
echo 4. Click "CREATE AND CONTINUE"
echo 5. Grant role: "Editor"
echo 6. Click "CONTINUE" then "DONE"
echo.
pause
echo.
echo STEP 5: Create JSON Key
echo ============================================
echo.
echo 1. Click on the service account you just created
echo 2. Go to "KEYS" tab
echo 3. Click "ADD KEY" -> "Create new key"
echo 4. Select "JSON" format
echo 5. Click "CREATE"
echo.
echo A JSON file will be downloaded to your Downloads folder!
echo.
pause
echo.
echo STEP 6: Copy JSON Credentials
echo ============================================
echo.
echo The JSON file has been downloaded. Now we need to copy its contents.
echo.
echo 1. Open the downloaded JSON file with Notepad
echo 2. Copy ALL the contents (Ctrl+A, Ctrl+C)
echo 3. We'll use it in the next step
echo.
pause
echo.
echo STEP 7: Add to Environment Variables
echo ============================================
echo.
echo FOR LOCAL DEVELOPMENT:
echo ---------------------
echo 1. Create/edit file: services\ash-admin\.env.local
echo 2. Add this line:
echo    GOOGLE_SERVICE_ACCOUNT_JSON='paste-json-here'
echo.
echo FOR VERCEL PRODUCTION:
echo ---------------------
echo 1. Go to: https://vercel.com/ash-ais-projects/ash
echo 2. Click "Settings" -> "Environment Variables"
echo 3. Click "Add New"
echo 4. Name: GOOGLE_SERVICE_ACCOUNT_JSON
echo 5. Value: Paste the entire JSON contents
echo 6. Select: Production, Preview, Development
echo 7. Click "Save"
echo 8. Redeploy your application
echo.
pause
echo.
echo STEP 8: Apply Database Migration
echo ============================================
echo.
echo Running Prisma migration to add SystemSettings table...
echo.
cd packages\database
npx prisma db push
echo.
echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Make sure you added the JSON credentials to .env.local OR Vercel
echo 2. Restart your development server: pnpm --filter @ash/admin dev
echo 3. Go to: http://localhost:3001/integrations/google-sheets
echo 4. Click "Sync All Data" button
echo 5. Click "Open Spreadsheet" to view your data!
echo.
echo The spreadsheet will be automatically shared with ashai.system@gmail.com
echo.
pause

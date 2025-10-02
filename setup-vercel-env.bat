@echo off
echo ========================================
echo  Setup Vercel Environment Variables
echo ========================================
echo.
echo You need to add environment variables to Vercel.
echo.
echo IMPORTANT: You'll need your PostgreSQL connection string!
echo If you don't have one yet:
echo   1. Go to https://neon.tech
echo   2. Create a free account
echo   3. Create a new project called "ashley-ai"
echo   4. Copy the connection string
echo.
pause
echo.
echo Now, let's add the variables one by one...
echo.

cd services/ash-admin

echo [1/7] Adding DATABASE_URL...
echo Paste your PostgreSQL connection string (from Neon.tech)
echo Example: postgresql://user:password@host.neon.tech/db?sslmode=require
vercel env add DATABASE_URL production
echo.

echo [2/7] Adding NEXTAUTH_SECRET...
echo Paste: 3m+lTdu21gGfqItEpZaYTBTLgVVpIJcMN1wg0fxnzJg=
vercel env add NEXTAUTH_SECRET production
echo.

echo [3/7] Adding JWT_SECRET...
echo Paste: PbBXB94xaQ/ixP5TUQ586BsQJbbJLieLODw0pse1NiM=
vercel env add JWT_SECRET production
echo.

echo [4/7] Adding ENCRYPTION_KEY...
echo Paste: AwHb90Svsu0H0831cU7YvDKDBCmIIZ1y0foCXhk1Fkw=
vercel env add ENCRYPTION_KEY production
echo.

echo [5/7] Adding NODE_ENV...
echo Paste: production
vercel env add NODE_ENV production
echo.

echo [6/7] Adding NEXTAUTH_URL...
echo Paste: https://ash-admin.vercel.app
echo (You can update this later with your actual URL)
vercel env add NEXTAUTH_URL production
echo.

echo [7/7] Adding APP_URL...
echo Paste: https://ash-admin.vercel.app
echo (You can update this later with your actual URL)
vercel env add APP_URL production
echo.

echo ========================================
echo  Environment Variables Added!
echo ========================================
echo.
echo Now deploying to Vercel...
vercel --prod
echo.
pause

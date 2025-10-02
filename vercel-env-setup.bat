@echo off
echo Setting up Vercel Environment Variables...
echo.
echo IMPORTANT: Replace YOUR_DATABASE_URL and YOUR_APP_URL before running these commands!
echo.
echo Copy and paste these commands ONE BY ONE:
echo.
echo vercel env add DATABASE_URL production
echo (Then paste your PostgreSQL connection string)
echo.
echo vercel env add NEXTAUTH_SECRET production
echo (Then paste: 3m+lTdu21gGfqItEpZaYTBTLgVVpIJcMN1wg0fxnzJg=)
echo.
echo vercel env add JWT_SECRET production
echo (Then paste: PbBXB94xaQ/ixP5TUQ586BsQJbbJLieLODw0pse1NiM=)
echo.
echo vercel env add ENCRYPTION_KEY production
echo (Then paste: AwHb90Svsu0H0831cU7YvDKDBCmIIZ1y0foCXhk1Fkw=)
echo.
echo vercel env add NEXTAUTH_URL production
echo (Then paste: https://your-app-name.vercel.app)
echo.
echo vercel env add NODE_ENV production
echo (Then paste: production)
echo.
echo vercel env add APP_URL production
echo (Then paste: https://your-app-name.vercel.app)
echo.
pause

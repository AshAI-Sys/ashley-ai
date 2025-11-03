#!/bin/bash

# Add Environment Variables to Vercel via API
# This script uses Vercel CLI token for authentication

echo "🔧 Adding environment variables to Vercel..."

PROJECT_NAME="ashley-ai-admin"

# Get Vercel token from CLI
VERCEL_TOKEN=$(vercel whoami --token 2>/dev/null || echo "")

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Not logged in to Vercel CLI. Run: vercel login"
    exit 1
fi

# Get project ID
PROJECT_ID=$(vercel ls ashley-ai-admin --token "$VERCEL_TOKEN" 2>&1 | grep -o 'prj_[a-zA-Z0-9]*' | head -1)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Could not find project ID"
    exit 1
fi

echo "✅ Found project: $PROJECT_ID"

# Add DATABASE_URL
echo "Adding DATABASE_URL..."
vercel env add DATABASE_URL production --yes <<< "postgresql://neondb_owner:npg_oVNf76Kpqasx@ep-falling-fire-a1ru8mim-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Add JWT_SECRET
echo "Adding JWT_SECRET..."
vercel env add JWT_SECRET production --yes <<< "SDJreOujhwwyOiM2rajKVQl1jABwpDQh09T18k3Np28="

# Add NEXTAUTH_SECRET
echo "Adding NEXTAUTH_SECRET..."
vercel env add NEXTAUTH_SECRET production --yes <<< "lL2UmJTCdaQJLmFDlqaOBGOuPcFDle0U5mvAW/ncHLQ="

# Add NEXTAUTH_URL
echo "Adding NEXTAUTH_URL..."
vercel env add NEXTAUTH_URL production --yes <<< "https://ashley-ai-admin-pihyceh57-ash-ais-projects.vercel.app"

echo "✅ Environment variables added!"
echo "🔄 Vercel will auto-redeploy with new variables..."

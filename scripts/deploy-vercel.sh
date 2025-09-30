#!/bin/bash

# ========================================
# Ashley AI - Vercel Deployment Script
# ========================================

set -e

echo "=========================================="
echo "Ashley AI - Vercel Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Login to Vercel
echo -e "${BLUE}Logging in to Vercel...${NC}"
vercel login

echo ""

# Deploy Admin Service
echo -e "${BLUE}Deploying Admin Service (ash-admin)...${NC}"
cd services/ash-admin
vercel --prod --yes
echo -e "${GREEN}✓ Admin service deployed!${NC}"

cd ../..
echo ""

# Deploy Portal Service
echo -e "${BLUE}Deploying Portal Service (ash-portal)...${NC}"
cd services/ash-portal
vercel --prod --yes
echo -e "${GREEN}✓ Portal service deployed!${NC}"

cd ../..
echo ""

echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Important:${NC} Don't forget to:"
echo "  1. Configure environment variables in Vercel dashboard"
echo "  2. Set up external PostgreSQL database (Railway, Supabase, etc.)"
echo "  3. Configure custom domains"
echo "  4. Test deployed applications"
echo ""
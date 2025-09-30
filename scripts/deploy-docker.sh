#!/bin/bash

# ========================================
# Ashley AI - Docker Production Deployment
# ========================================

set -e

echo "=========================================="
echo "Ashley AI - Docker Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production.local ]; then
    echo -e "${YELLOW}WARNING: .env.production.local not found${NC}"
    echo -e "${YELLOW}Creating from .env.production template...${NC}"
    cp .env.production .env.production.local
    echo -e "${RED}Please edit .env.production.local with your production values${NC}"
    exit 1
fi

# Build images
echo -e "${BLUE}Building Docker images...${NC}"
docker-compose -f docker-compose.production.yml build --no-cache

echo -e "${GREEN}✓ Images built successfully${NC}"
echo ""

# Start services
echo -e "${BLUE}Starting production services...${NC}"
docker-compose -f docker-compose.production.yml up -d

echo -e "${GREEN}✓ Services started${NC}"
echo ""

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 15

# Check status
echo -e "${BLUE}Checking service status...${NC}"
docker-compose -f docker-compose.production.yml ps

echo ""
echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}Services:${NC}"
echo "  Admin: http://localhost:3001"
echo "  Portal: http://localhost:3003"
echo "  Nginx: http://localhost:80 (https://localhost:443)"
echo ""
echo -e "${BLUE}Database:${NC}"
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.production.yml down"
echo "  Restart: docker-compose -f docker-compose.production.yml restart"
echo ""
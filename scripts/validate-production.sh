#!/bin/bash
# Ashley AI - Production Deployment Validation Script

set -e

echo "🔍 Ashley AI Production Deployment Validation"
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for passed/failed checks
PASSED=0
FAILED=0

# Function to check if a file exists
check_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "✅ ${GREEN}PASS${NC}: $description"
        ((PASSED++))
        return 0
    else
        echo -e "❌ ${RED}FAIL${NC}: $description (file not found: $file)"
        ((FAILED++))
        return 1
    fi
}

# Function to validate file content
check_content() {
    local file=$1
    local pattern=$2
    local description=$3

    if [ -f "$file" ] && grep -q "$pattern" "$file"; then
        echo -e "✅ ${GREEN}PASS${NC}: $description"
        ((PASSED++))
        return 0
    else
        echo -e "❌ ${RED}FAIL${NC}: $description"
        ((FAILED++))
        return 1
    fi
}

# Function to validate script syntax
check_script() {
    local script=$1
    local description=$2

    if [ -f "$script" ] && bash -n "$script" 2>/dev/null; then
        echo -e "✅ ${GREEN}PASS${NC}: $description"
        ((PASSED++))
        return 0
    else
        echo -e "❌ ${RED}FAIL${NC}: $description"
        ((FAILED++))
        return 1
    fi
}

echo ""
echo "📋 Checking Production Configuration Files..."
echo "--------------------------------------------"

# Check Docker Compose files
check_file "docker-compose.production.yml" "Production Docker Compose exists"
check_file "docker-compose.monitoring.yml" "Monitoring Docker Compose exists"
check_file "Dockerfile" "Dockerfile exists"

# Check environment files
check_file ".env.production.example" "Production environment template exists"
check_file ".env.development" "Development environment exists"

# Check Nginx configuration
check_file "nginx/nginx.conf" "Nginx configuration exists"

# Check deployment scripts
check_file "scripts/deploy.sh" "Deployment script exists"
check_file "scripts/backup.sh" "Backup script exists"
check_file "scripts/optimize-production.sh" "Production optimization script exists"

echo ""
echo "🔧 Validating Script Syntax..."
echo "-------------------------------"

# Validate script syntax
check_script "scripts/deploy.sh" "Deployment script syntax"
check_script "scripts/backup.sh" "Backup script syntax"
check_script "scripts/optimize-production.sh" "Optimization script syntax"

echo ""
echo "📊 Checking Production Configuration Content..."
echo "-----------------------------------------------"

# Check Docker Compose content
check_content "docker-compose.production.yml" "postgres" "PostgreSQL service configured"
check_content "docker-compose.production.yml" "nginx" "Nginx service configured"
check_content "docker-compose.production.yml" "redis" "Redis service configured"

# Check monitoring configuration
check_content "docker-compose.monitoring.yml" "prometheus" "Prometheus configured"
check_content "docker-compose.monitoring.yml" "grafana" "Grafana configured"
check_content "docker-compose.monitoring.yml" "loki" "Loki configured"

# Check Nginx configuration
check_content "nginx/nginx.conf" "ssl_certificate" "SSL certificates configured"
check_content "nginx/nginx.conf" "proxy_pass" "Reverse proxy configured"
check_content "nginx/nginx.conf" "rate_limiting" "Rate limiting configured"

# Check environment template
check_content ".env.production.example" "DATABASE_URL" "Database URL template"
check_content ".env.production.example" "JWT_SECRET" "JWT secret template"
check_content ".env.production.example" "NEXTAUTH_SECRET" "NextAuth secret template"

echo ""
echo "🗄️ Validating Database Configuration..."
echo "--------------------------------------"

# Check Prisma configuration
check_file "packages/database/prisma/schema.prisma" "Prisma schema exists"
check_content "packages/database/prisma/schema.prisma" "postgresql" "PostgreSQL provider configured"

echo ""
echo "🔐 Checking Security Configuration..."
echo "------------------------------------"

# Check if secrets are properly templated (not hardcoded)
if grep -q "your-secret" .env.production.example; then
    echo -e "✅ ${GREEN}PASS${NC}: Secrets are properly templated"
    ((PASSED++))
else
    echo -e "❌ ${RED}FAIL${NC}: Secrets may not be properly templated"
    ((FAILED++))
fi

# Check SSL configuration
check_content "nginx/nginx.conf" "ssl_protocols TLSv1.2 TLSv1.3" "Modern SSL protocols configured"
check_content "nginx/nginx.conf" "Strict-Transport-Security" "HSTS header configured"

echo ""
echo "📦 Validating Package Configuration..."
echo "-------------------------------------"

# Check package.json
check_file "package.json" "Root package.json exists"
check_content "package.json" "test" "Test scripts configured"
check_content "package.json" "build" "Build scripts configured"

# Check if testing dependencies are installed
if [ -f "package.json" ] && grep -q "jest" package.json; then
    echo -e "✅ ${GREEN}PASS${NC}: Testing framework configured"
    ((PASSED++))
else
    echo -e "❌ ${RED}FAIL${NC}: Testing framework not configured"
    ((FAILED++))
fi

echo ""
echo "🚀 Checking CI/CD Configuration..."
echo "---------------------------------"

# Check GitHub workflows
check_file ".github/workflows/ci.yml" "CI workflow exists"
check_file ".github/workflows/performance.yml" "Performance testing workflow exists"

echo ""
echo "📁 Checking Directory Structure..."
echo "---------------------------------"

# Check required directories
for dir in "services/ash-admin" "services/ash-portal" "packages/database" "nginx" "scripts" "monitoring"; do
    if [ -d "$dir" ]; then
        echo -e "✅ ${GREEN}PASS${NC}: Directory $dir exists"
        ((PASSED++))
    else
        echo -e "❌ ${RED}FAIL${NC}: Directory $dir missing"
        ((FAILED++))
    fi
done

echo ""
echo "🔄 Testing Docker Configuration..."
echo "---------------------------------"

# Test Docker Compose file syntax
if docker-compose -f docker-compose.production.yml config >/dev/null 2>&1; then
    echo -e "✅ ${GREEN}PASS${NC}: Production Docker Compose syntax valid"
    ((PASSED++))
else
    echo -e "❌ ${RED}FAIL${NC}: Production Docker Compose syntax invalid"
    ((FAILED++))
fi

if docker-compose -f docker-compose.monitoring.yml config >/dev/null 2>&1; then
    echo -e "✅ ${GREEN}PASS${NC}: Monitoring Docker Compose syntax valid"
    ((PASSED++))
else
    echo -e "❌ ${RED}FAIL${NC}: Monitoring Docker Compose syntax invalid"
    ((FAILED++))
fi

echo ""
echo "📊 Validation Summary"
echo "===================="
echo -e "✅ ${GREEN}Passed:${NC} $PASSED checks"
echo -e "❌ ${RED}Failed:${NC} $FAILED checks"

# Calculate success rate
TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED * 100) / TOTAL ))
    echo -e "📈 Success Rate: ${SUCCESS_RATE}%"
else
    echo -e "📈 Success Rate: 0%"
fi

echo ""

# Final result
if [ $FAILED -eq 0 ]; then
    echo -e "🎉 ${GREEN}ALL CHECKS PASSED!${NC}"
    echo -e "Ashley AI production deployment is ${GREEN}READY${NC} for deployment! 🚀"
    exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "⚠️ ${YELLOW}MOSTLY READY${NC}"
    echo -e "Ashley AI production deployment is ${YELLOW}mostly ready${NC} with $FAILED minor issues."
    echo "Please review the failed checks above."
    exit 0
else
    echo -e "🚨 ${RED}DEPLOYMENT NOT READY${NC}"
    echo -e "Ashley AI production deployment has ${RED}$FAILED critical issues${NC}."
    echo "Please fix the failed checks before deploying to production."
    exit 1
fi
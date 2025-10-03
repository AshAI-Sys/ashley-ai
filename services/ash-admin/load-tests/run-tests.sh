#!/bin/bash

# Ashley AI Load Testing Runner
# This script runs all k6 load tests

echo "🚀 Starting Ashley AI Load Tests..."
echo "=================================="
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed"
    echo "📦 Install k6: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Check if server is running
echo "🔍 Checking if server is running on localhost:3001..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running on localhost:3001"
    echo "💡 Start the server with: pnpm --filter @ash/admin dev"
    exit 1
fi

echo ""
echo "📋 Test Plan:"
echo "  1. API Endpoints - Smoke Test (30s)"
echo "  2. Database Queries - Stress Test (4min)"
echo "  3. Authentication - Spike Test (2.5min)"
echo ""

# Create results directory
mkdir -p ./results
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULT_DIR="./results/${TIMESTAMP}"
mkdir -p "$RESULT_DIR"

echo "💾 Results will be saved to: $RESULT_DIR"
echo ""

# Function to run a single test
run_test() {
    local test_name=$1
    local test_file=$2
    local test_type=$3

    echo "🧪 Running $test_name..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    k6 run \
        --out json="${RESULT_DIR}/${test_type}-results.json" \
        "$test_file"

    if [ $? -eq 0 ]; then
        echo "✅ $test_name completed successfully"
    else
        echo "❌ $test_name failed"
        return 1
    fi

    echo ""
    sleep 3
}

# Run individual tests
run_test "API Endpoints Test" "./api-endpoints.test.js" "api-endpoints"
run_test "Database Queries Test" "./database-queries.test.js" "database-queries"
run_test "Authentication Workflow Test" "./auth-workflow.test.js" "auth-workflow"

# Generate summary report
echo ""
echo "📊 Generating Summary Report..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Copy results to latest
cp -r "$RESULT_DIR" ./results/latest

echo ""
echo "✅ All tests completed!"
echo ""
echo "📁 Results saved to:"
echo "   $RESULT_DIR"
echo ""
echo "📊 View reports:"
echo "   - JSON: ${RESULT_DIR}/*.json"
echo "   - HTML: ${RESULT_DIR}/load-test-summary.html"
echo ""
echo "🎉 Load testing complete!"

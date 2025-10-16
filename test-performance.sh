#!/bin/bash

# Ashley AI - Performance Testing Script
# Tests critical API endpoints and measures response times

echo "========================================"
echo "  ASHLEY AI - PERFORMANCE TEST SUITE"
echo "========================================"
echo ""

BASE_URL="http://localhost:3001"
ITERATIONS=5

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"

    echo -e "${YELLOW}Testing: $name${NC}"

    local total_time=0
    local success_count=0
    local times=()

    for ((i=1; i<=$ITERATIONS; i++)); do
        response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" "$url" 2>&1)
        status_code=$(echo $response | cut -d'|' -f1)
        time=$(echo $response | cut -d'|' -f2)

        times+=($time)
        total_time=$(echo "$total_time + $time" | bc)

        if [ "$status_code" = "200" ]; then
            success_count=$((success_count + 1))
            echo "  [$i/$ITERATIONS] Status: $status_code - Time: ${time}s"
        else
            echo -e "  [$i/$ITERATIONS] ${RED}Status: $status_code - Time: ${time}s${NC}"
        fi

        sleep 0.2
    done

    # Calculate statistics
    avg_time=$(echo "scale=3; $total_time / $ITERATIONS" | bc)
    success_rate=$(echo "scale=1; $success_count * 100 / $ITERATIONS" | bc)

    # Sort times for min/max
    min_time=$(printf '%s\n' "${times[@]}" | sort -n | head -1)
    max_time=$(printf '%s\n' "${times[@]}" | sort -n | tail -1)

    # Grade
    grade="F"
    if (( $(echo "$avg_time < 0.3" | bc -l) )); then
        grade="A"
    elif (( $(echo "$avg_time < 0.5" | bc -l) )); then
        grade="B"
    elif (( $(echo "$avg_time < 0.8" | bc -l) )); then
        grade="C"
    elif (( $(echo "$avg_time < 1.5" | bc -l) )); then
        grade="D"
    fi

    echo "  Average: ${avg_time}s | Min: ${min_time}s | Max: ${max_time}s | Success: ${success_rate}% | Grade: $grade"
    echo ""

    # Store results
    echo "$name|$avg_time|$success_rate|$grade" >> /tmp/perf_results.txt
}

# Clear previous results
rm -f /tmp/perf_results.txt

echo "Starting performance tests..."
echo ""

# Test critical API endpoints
test_endpoint "Health Check" "$BASE_URL/api/health"
test_endpoint "Dashboard Stats - Printing" "$BASE_URL/api/printing/dashboard"
test_endpoint "Dashboard Stats - HR" "$BASE_URL/api/hr/stats"
test_endpoint "Dashboard Stats - Delivery" "$BASE_URL/api/delivery/stats"
test_endpoint "Dashboard Stats - Finance" "$BASE_URL/api/finance/stats"
test_endpoint "Orders List" "$BASE_URL/api/orders?page=1&limit=20"
test_endpoint "Clients List" "$BASE_URL/api/clients?page=1&limit=20"
test_endpoint "Employees List" "$BASE_URL/api/hr/employees?page=1&limit=20"

# Summary Report
echo "========================================"
echo "  PERFORMANCE TEST SUMMARY"
echo "========================================"
echo ""

echo "+--------------------------------------------------------------------------------+"
printf "| %-40s %10s %10s %8s |\n" "ENDPOINT" "AVG TIME" "SUCCESS" "GRADE"
echo "+--------------------------------------------------------------------------------+"

while IFS='|' read -r name avg_time success_rate grade; do
    grade_color=$NC
    case $grade in
        A) grade_color=$GREEN ;;
        B) grade_color=$CYAN ;;
        C) grade_color=$YELLOW ;;
        D|F) grade_color=$RED ;;
    esac

    printf "| %-40s %9ss %9s%% " "$name" "$avg_time" "$success_rate"
    echo -e "${grade_color}   $grade   ${NC}|"
done < /tmp/perf_results.txt

echo "+--------------------------------------------------------------------------------+"
echo ""

# Calculate overall grade
total_avg=0
total_success=0
count=0

while IFS='|' read -r name avg_time success_rate grade; do
    total_avg=$(echo "$total_avg + $avg_time" | bc)
    total_success=$(echo "$total_success + $success_rate" | bc)
    count=$((count + 1))
done < /tmp/perf_results.txt

overall_avg=$(echo "scale=3; $total_avg / $count" | bc)
overall_success=$(echo "scale=1; $total_success / $count" | bc)

# Overall grade
overall_grade="F"
if (( $(echo "$overall_avg < 0.3 && $overall_success > 95" | bc -l) )); then
    overall_grade="A"
    grade_color=$GREEN
elif (( $(echo "$overall_avg < 0.5 && $overall_success > 90" | bc -l) )); then
    overall_grade="B"
    grade_color=$CYAN
elif (( $(echo "$overall_avg < 0.8 && $overall_success > 85" | bc -l) )); then
    overall_grade="C"
    grade_color=$YELLOW
elif (( $(echo "$overall_avg < 1.5 && $overall_success > 75" | bc -l) )); then
    overall_grade="D"
    grade_color=$RED
else
    grade_color=$RED
fi

echo -n "OVERALL SYSTEM GRADE: "
echo -e "${grade_color}$overall_grade${NC}"
echo "Average Response Time: ${overall_avg}s"
echo "Average Success Rate: ${overall_success}%"
echo ""

# Recommendations
echo "========================================"
echo "  RECOMMENDATIONS"
echo "========================================"
echo ""

# Check for slow endpoints
slow_found=0
while IFS='|' read -r name avg_time success_rate grade; do
    if (( $(echo "$avg_time > 0.5" | bc -l) )); then
        if [ $slow_found -eq 0 ]; then
            echo -e "${YELLOW}⚠️  SLOW ENDPOINTS (>500ms):${NC}"
            slow_found=1
        fi
        echo -e "   ${YELLOW}• $name: ${avg_time}s${NC}"
    fi
done < /tmp/perf_results.txt

if [ $slow_found -eq 1 ]; then
    echo ""
    echo -e "${CYAN}Recommendations:${NC}"
    echo "   1. Enable Redis caching for dashboard stats"
    echo "   2. Add database indexes for frequently queried fields"
    echo "   3. Implement pagination for large datasets"
    echo "   4. Use database connection pooling"
    echo ""
fi

# Overall assessment
if [ "$overall_grade" = "A" ] || [ "$overall_grade" = "B" ]; then
    echo -e "${GREEN}✅ EXCELLENT! System performance is production-ready.${NC}"
elif [ "$overall_grade" = "C" ]; then
    echo -e "${YELLOW}⚠️  ACCEPTABLE: Minor optimizations recommended before production.${NC}"
else
    echo -e "${RED}❌ CRITICAL: Significant performance improvements required.${NC}"
fi

echo ""
echo "Test completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Cleanup
rm -f /tmp/perf_results.txt

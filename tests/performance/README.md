# Performance Testing with K6

Comprehensive load testing suite for Ashley AI Manufacturing ERP system.

## Prerequisites

### Install K6

**Windows** (using Chocolatey):
```bash
choco install k6
```

**Windows** (using Scoop):
```bash
scoop install k6
```

**macOS**:
```bash
brew install k6
```

**Linux**:
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Test Scenarios

### 1. API Load Test (`k6-api-load-test.js`)
Tests various load scenarios on API endpoints.

**Scenarios:**
- **Smoke Test** (30s, 1 VU) - Verify basic functionality
- **Load Test** (5m, 0→10→0 VUs) - Normal expected load
- **Stress Test** (16m, 0→10→50→100→0 VUs) - Push beyond capacity
- **Spike Test** (6.5m, 5→100→5 VUs) - Sudden traffic surge
- **Soak Test** (30m, 20 VUs) - Sustained load over time

**Run Smoke Test:**
```bash
k6 run -e SCENARIO=smoke tests/performance/k6-api-load-test.js
```

**Run Load Test:**
```bash
k6 run -e SCENARIO=load tests/performance/k6-api-load-test.js
```

**Run Stress Test:**
```bash
k6 run -e SCENARIO=stress tests/performance/k6-api-load-test.js
```

**Run All (default - load test):**
```bash
k6 run tests/performance/k6-api-load-test.js
```

### 2. Manufacturing Workflow Test (`k6-manufacturing-workflow.js`)
Tests complete manufacturing workflow through all production stages.

**Workflow:**
1. Order Management
2. Cutting Operations
3. Printing Operations
4. Quality Control
5. Delivery
6. Finance

**Run:**
```bash
k6 run tests/performance/k6-manufacturing-workflow.js
```

**Customize:**
```bash
# Custom VUs and duration
k6 run --vus 20 --duration 10m tests/performance/k6-manufacturing-workflow.js

# With custom API URL
k6 run -e API_URL=https://your-server.com tests/performance/k6-manufacturing-workflow.js
```

## Performance Thresholds

### API Load Test
- **P95 Duration**: < 500ms
- **P99 Duration**: < 1000ms
- **Error Rate**: < 1%
- **Failed Requests**: < 5%

### Manufacturing Workflow
- **Workflow Success Rate**: > 95%
- **Stage Latency P95**: < 1000ms
- **Request Duration P95**: < 500ms

## Interpreting Results

### Key Metrics
- **http_req_duration**: Time to complete requests
- **http_req_waiting**: Time to first byte
- **http_reqs**: Total requests per second
- **vus**: Number of virtual users
- **errors**: Custom error rate metric
- **workflow_success**: Percentage of completed workflows

### Success Criteria
✅ **All thresholds passing** - System performing well
⚠️ **Some thresholds failing** - Optimization needed
❌ **Many thresholds failing** - Performance issues

## Example Output

```
scenarios: (100.00%) 1 scenario, 10 max VUs, 5m30s max duration

✓ orders loaded
✓ cutting lays loaded
✓ printing runs loaded
✓ shipments loaded

checks.........................: 98.50% ✓ 394  ✗ 6
data_received..................: 1.2 MB 4.0 kB/s
data_sent......................: 180 kB 600 B/s
http_req_duration..............: avg=245ms min=102ms med=230ms max=890ms p(90)=380ms p(95)=450ms
http_req_failed................: 1.50% ✓ 6    ✗ 394
http_reqs......................: 400    1.33/s
iteration_duration.............: avg=7.5s  min=7s    med=7.4s  max=8.9s  p(90)=8s   p(95)=8.5s
iterations.....................: 50     0.17/s
vus............................: 10     min=10 max=10
vus_max........................: 10     min=10 max=10
workflow_success...............: 96.00% ✓ 48   ✗ 2
```

## Advanced Usage

### Custom Thresholds
```bash
k6 run --threshold http_req_duration=p(95)<300 tests/performance/k6-api-load-test.js
```

### Output to JSON
```bash
k6 run --out json=results.json tests/performance/k6-api-load-test.js
```

### Cloud Testing (k6 Cloud)
```bash
k6 cloud tests/performance/k6-api-load-test.js
```

### Summary Export
```bash
k6 run --summary-export=summary.json tests/performance/k6-api-load-test.js
```

## Baseline Performance

Run before major changes to establish baseline:

```bash
# Create baseline
k6 run tests/performance/k6-api-load-test.js > baseline-$(date +%Y%m%d).txt

# Compare against baseline
k6 run tests/performance/k6-api-load-test.js > current-results.txt
diff baseline-YYYYMMDD.txt current-results.txt
```

## CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Run Performance Tests
  run: |
    # Install k6
    sudo gpg -k
    sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update
    sudo apt-get install k6

    # Run tests
    k6 run tests/performance/k6-api-load-test.js
```

## Troubleshooting

### Connection Refused
- Ensure server is running on localhost:3001
- Set custom API_URL: `k6 run -e API_URL=http://your-server:port`

### High Error Rates
- Check server logs
- Reduce VUs or duration
- Increase server resources

### Slow Response Times
- Profile application code
- Check database queries
- Review network latency

## Best Practices

1. **Start Small**: Run smoke tests first
2. **Gradual Increase**: Move from load → stress → spike
3. **Monitor Resources**: Watch CPU, memory, disk I/O during tests
4. **Establish Baselines**: Record results before optimizations
5. **Test Regularly**: Include in CI/CD pipeline
6. **Test Production-like**: Use similar data volumes and configurations

## Resources

- [K6 Documentation](https://k6.io/docs/)
- [K6 Test Types](https://k6.io/docs/test-types/introduction/)
- [K6 Metrics](https://k6.io/docs/using-k6/metrics/)
- [K6 Thresholds](https://k6.io/docs/using-k6/thresholds/)

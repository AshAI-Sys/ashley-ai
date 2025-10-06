/**
 * TEST SCRIPT - Verify All 8 Fixed Pages
 * Tests that all pages load without errors after optional chaining fixes
 */

const pages = [
  {
    name: 'HR-Payroll',
    url: 'http://localhost:3001/hr-payroll',
    severity: 'HIGH',
    fixes: ['Status filter (ACTIVE/INACTIVE)', 'Optional chaining for attendance']
  },
  {
    name: 'Cutting',
    url: 'http://localhost:3001/cutting',
    severity: 'HIGH',
    fixes: ['camelCase/snake_case fix', 'Optional chaining for orders', 'Division by zero protection']
  },
  {
    name: 'Designs',
    url: 'http://localhost:3001/designs',
    severity: 'HIGH',
    fixes: ['Array access safety', 'Optional chaining for approvals']
  },
  {
    name: 'Finance',
    url: 'http://localhost:3001/finance',
    severity: 'MEDIUM',
    fixes: ['Optional chaining for client/brand/supplier']
  },
  {
    name: 'Printing',
    url: 'http://localhost:3001/printing',
    severity: 'MEDIUM',
    fixes: ['Optional chaining for orders/machines', 'Array handling']
  },
  {
    name: 'Sewing',
    url: 'http://localhost:3001/sewing',
    severity: 'MEDIUM',
    fixes: ['Optional chaining for operators', 'Division safety']
  },
  {
    name: 'Quality Control',
    url: 'http://localhost:3001/quality-control',
    severity: 'MEDIUM',
    fixes: ['Comprehensive optional chaining', 'Search filter safety']
  },
  {
    name: 'Delivery',
    url: 'http://localhost:3001/delivery',
    severity: 'MEDIUM',
    fixes: ['Optional chaining for orders/drivers', 'Courier support']
  }
];

async function testPage(page) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${page.name} (${page.severity} severity)`);
  console.log(`URL: ${page.url}`);
  console.log(`Fixes: ${page.fixes.join(', ')}`);
  console.log('='.repeat(60));

  try {
    const response = await fetch(page.url);
    const status = response.status;
    const html = await response.text();

    // Check for errors in HTML
    const hasError = html.includes('Application error') ||
                     html.includes('Unhandled Runtime Error') ||
                     html.includes('TypeError') ||
                     html.includes('Cannot read property') ||
                     html.includes('undefined is not an object');

    if (status === 200 && !hasError) {
      console.log(`✅ PASS - Status ${status}, no errors detected`);
      return { success: true, page: page.name, status };
    } else if (hasError) {
      console.log(`❌ FAIL - Page has runtime errors`);
      // Extract error message
      const errorMatch = html.match(/Error: ([^\n<]+)/);
      if (errorMatch) {
        console.log(`   Error: ${errorMatch[1]}`);
      }
      return { success: false, page: page.name, status, error: 'Runtime error detected' };
    } else {
      console.log(`⚠️  WARN - Status ${status}`);
      return { success: false, page: page.name, status };
    }
  } catch (error) {
    console.log(`❌ FAIL - ${error.message}`);
    return { success: false, page: page.name, error: error.message };
  }
}

async function runAllTests() {
  console.log('\n' + '█'.repeat(60));
  console.log('  TESTING ALL 8 FIXED PAGES');
  console.log('  Date: ' + new Date().toLocaleString());
  console.log('█'.repeat(60));

  const results = [];

  // Test all pages sequentially
  for (const page of pages) {
    const result = await testPage(page);
    results.push(result);
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\nTotal Pages: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  console.log('\nDetailed Results:');
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`  ${icon} ${pages[index].name} - ${result.success ? 'PASS' : 'FAIL'}`);
    if (!result.success && result.error) {
      console.log(`     Error: ${result.error}`);
    }
  });

  // High severity pages
  const highSeverityResults = results.slice(0, 3);
  const highSeverityPassed = highSeverityResults.filter(r => r.success).length;
  console.log(`\n🔴 HIGH SEVERITY: ${highSeverityPassed}/3 passed`);

  // Medium severity pages
  const mediumSeverityResults = results.slice(3);
  const mediumSeverityPassed = mediumSeverityResults.filter(r => r.success).length;
  console.log(`🟡 MEDIUM SEVERITY: ${mediumSeverityPassed}/5 passed`);

  if (passed === results.length) {
    console.log('\n' + '█'.repeat(60));
    console.log('  🎉 ALL TESTS PASSED! SYSTEM READY FOR DEPLOYMENT');
    console.log('█'.repeat(60) + '\n');
  } else {
    console.log('\n' + '█'.repeat(60));
    console.log('  ⚠️  SOME TESTS FAILED - REVIEW NEEDED');
    console.log('█'.repeat(60) + '\n');
  }

  return results;
}

// Run tests
runAllTests().catch(console.error);

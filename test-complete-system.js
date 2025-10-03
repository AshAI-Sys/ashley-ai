/**
 * ASHLEY AI - COMPLETE SYSTEM TEST
 * Tests all 15 manufacturing stages + employee accounts
 */

const BASE_URL = 'http://localhost:3001'

// Test results tracking
const results = {
  passed: [],
  failed: [],
  warnings: []
}

function logTest(name, status, message = '') {
  const timestamp = new Date().toLocaleTimeString()
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${emoji} [${timestamp}] ${name}: ${status}`)
  if (message) console.log(`   ${message}`)

  if (status === 'PASS') results.passed.push(name)
  else if (status === 'FAIL') results.failed.push(name)
  else results.warnings.push(name)
}

async function testEndpoint(name, method, url, body = null, expectedStatus = 200) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (response.status === expectedStatus) {
      logTest(name, 'PASS', `Status: ${response.status}`)
      return { success: true, data }
    } else {
      logTest(name, 'FAIL', `Expected ${expectedStatus}, got ${response.status}`)
      return { success: false, data }
    }
  } catch (error) {
    logTest(name, 'FAIL', error.message)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('\n🚀 ASHLEY AI - COMPLETE SYSTEM TEST\n')
  console.log('='  .repeat(60))

  // ===== 1. AUTHENTICATION TESTS =====
  console.log('\n📋 1. AUTHENTICATION TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Admin Login Endpoint',
    'POST',
    `${BASE_URL}/api/auth/login`,
    { email: 'admin@ashleyai.com', password: 'password123' },
    200
  )

  await testEndpoint(
    'Employee Login Endpoint (Invalid)',
    'POST',
    `${BASE_URL}/api/auth/employee-login`,
    { email: 'fake@test.com', password: 'wrong' },
    401
  )

  // ===== 2. CLIENT MANAGEMENT =====
  console.log('\n📋 2. CLIENT MANAGEMENT TESTS')
  console.log('-'.repeat(60))

  const clientResult = await testEndpoint(
    'Create New Client',
    'POST',
    `${BASE_URL}/api/clients`,
    {
      name: 'ABC Manufacturing Inc.',
      contact_person: 'Pedro Santos',
      email: 'pedro@abcmfg.com',
      phone: '09171234567',
      address: 'Quezon City, Metro Manila'
    },
    201
  )

  const clientId = clientResult.data?.data?.id

  await testEndpoint(
    'Get All Clients',
    'GET',
    `${BASE_URL}/api/clients?page=1&limit=10`,
    null,
    200
  )

  if (clientId) {
    await testEndpoint(
      'Get Single Client',
      'GET',
      `${BASE_URL}/api/clients/${clientId}`,
      null,
      200
    )
  }

  // ===== 3. ORDER MANAGEMENT =====
  console.log('\n📋 3. ORDER MANAGEMENT TESTS')
  console.log('-'.repeat(60))

  const orderResult = await testEndpoint(
    'Create New Order',
    'POST',
    `${BASE_URL}/api/orders`,
    {
      clientId: clientId || 'cmgal7ds70005nra2lajao1hu',
      orderNumber: 'ORD-TEST-' + Date.now(),
      status: 'DRAFT',
      totalAmount: 250000,
      deliveryDate: '2025-12-31',
      notes: 'Test order - 1000 pieces polo shirts'
    },
    201
  )

  const orderId = orderResult.data?.data?.order?.id

  await testEndpoint(
    'Get All Orders',
    'GET',
    `${BASE_URL}/api/orders?page=1&limit=10`,
    null,
    200
  )

  // ===== 4. HR & EMPLOYEE TESTS =====
  console.log('\n📋 4. HR & EMPLOYEE MANAGEMENT TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get All Employees',
    'GET',
    `${BASE_URL}/api/hr/employees?limit=10`,
    null,
    200
  )

  await testEndpoint(
    'Get HR Statistics',
    'GET',
    `${BASE_URL}/api/hr/stats`,
    null,
    200
  )

  // Note: Employee creation requires authentication with hr:write permission
  logTest('Create Employee (Requires Auth)', 'WARN', 'Skipped - needs admin authentication')

  // ===== 5. CUTTING OPERATIONS =====
  console.log('\n📋 5. CUTTING OPERATIONS TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get Cutting Lays',
    'GET',
    `${BASE_URL}/api/cutting/lays?page=1&limit=10`,
    null,
    200
  )

  await testEndpoint(
    'Get Bundles',
    'GET',
    `${BASE_URL}/api/cutting/bundles?page=1&limit=10`,
    null,
    200
  )

  // ===== 6. PRINTING OPERATIONS =====
  console.log('\n📋 6. PRINTING OPERATIONS TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get Print Runs',
    'GET',
    `${BASE_URL}/api/printing/print-runs?page=1&limit=10`,
    null,
    200
  )

  // ===== 7. SEWING OPERATIONS =====
  console.log('\n📋 7. SEWING OPERATIONS TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get Sewing Runs',
    'GET',
    `${BASE_URL}/api/sewing/sewing-runs?page=1&limit=10`,
    null,
    200
  )

  // ===== 8. QUALITY CONTROL =====
  console.log('\n📋 8. QUALITY CONTROL TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get QC Checks',
    'GET',
    `${BASE_URL}/api/qc/checks?page=1&limit=10`,
    null,
    200
  )

  await testEndpoint(
    'Get Defect Codes',
    'GET',
    `${BASE_URL}/api/qc/defect-codes`,
    null,
    200
  )

  // ===== 9. FINISHING OPERATIONS =====
  console.log('\n📋 9. FINISHING OPERATIONS TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get Finishing Runs',
    'GET',
    `${BASE_URL}/api/finishing/runs?page=1&limit=10`,
    null,
    200
  )

  // ===== 10. DELIVERY OPERATIONS =====
  console.log('\n📋 10. DELIVERY OPERATIONS TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get Shipments',
    'GET',
    `${BASE_URL}/api/delivery/shipments?page=1&limit=10`,
    null,
    200
  )

  // ===== 11. FINANCE OPERATIONS =====
  console.log('\n📋 11. FINANCE OPERATIONS TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get Invoices',
    'GET',
    `${BASE_URL}/api/finance/invoices?page=1&limit=10`,
    null,
    200
  )

  await testEndpoint(
    'Get Financial Statistics',
    'GET',
    `${BASE_URL}/api/finance/stats`,
    null,
    200
  )

  // Note: Creating invoice requires auth
  logTest('Create Invoice (Requires Auth)', 'WARN', 'Skipped - needs finance:write permission')

  // ===== 12. MAINTENANCE =====
  console.log('\n📋 12. MAINTENANCE MANAGEMENT TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get Assets',
    'GET',
    `${BASE_URL}/api/maintenance/assets?page=1&limit=10`,
    null,
    200
  )

  await testEndpoint(
    'Get Work Orders',
    'GET',
    `${BASE_URL}/api/maintenance/work-orders?page=1&limit=10`,
    null,
    200
  )

  // ===== 13. MERCHANDISING AI =====
  console.log('\n📋 13. MERCHANDISING AI TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get Demand Forecasts',
    'GET',
    `${BASE_URL}/api/merchandising/demand-forecast`,
    null,
    200
  )

  await testEndpoint(
    'Get Product Recommendations',
    'GET',
    `${BASE_URL}/api/merchandising/recommendations`,
    null,
    200
  )

  // ===== 14. AUTOMATION & REMINDERS =====
  console.log('\n📋 14. AUTOMATION & REMINDERS TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get Automation Rules',
    'GET',
    `${BASE_URL}/api/automation/rules?page=1&limit=10`,
    null,
    200
  )

  await testEndpoint(
    'Get Notifications',
    'GET',
    `${BASE_URL}/api/automation/notifications?page=1&limit=10`,
    null,
    200
  )

  // ===== 15. AI CHAT ASSISTANT =====
  console.log('\n📋 15. AI CHAT ASSISTANT TESTS')
  console.log('-'.repeat(60))

  await testEndpoint(
    'Get Chat Conversations',
    'GET',
    `${BASE_URL}/api/ai-chat/conversations`,
    null,
    200
  )

  // Note: AI chat requires API key
  logTest('AI Chat Message (Requires API Key)', 'WARN', 'Skipped - needs OpenAI API key')

  // ===== HEALTH CHECK =====
  console.log('\n📋 SYSTEM HEALTH CHECK')
  console.log('-'.repeat(60))

  await testEndpoint(
    'API Health Check',
    'GET',
    `${BASE_URL}/api/health`,
    null,
    200
  )

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ PASSED: ${results.passed.length}`)
  console.log(`❌ FAILED: ${results.failed.length}`)
  console.log(`⚠️  WARNINGS: ${results.warnings.length}`)
  console.log(`📈 TOTAL: ${results.passed.length + results.failed.length + results.warnings.length}`)

  const passRate = (results.passed.length / (results.passed.length + results.failed.length) * 100).toFixed(1)
  console.log(`\n🎯 PASS RATE: ${passRate}%`)

  if (results.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:')
    results.failed.forEach(test => console.log(`   - ${test}`))
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:')
    results.warnings.forEach(test => console.log(`   - ${test}`))
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ Testing complete!\n')
}

// Run tests
runTests().catch(console.error)

/**
 * ASH AI System Integration Test
 * Tests core functionality across all services
 */

const axios = require('axios')
const { execSync } = require('child_process')

const BASE_URL = 'http://localhost:3000'
let authToken = null
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
}

// Test helper functions
function logTest(name, passed, details = '') {
  const status = passed ? '✅' : '❌'
  console.log(`${status} ${name}${details ? ': ' + details : ''}`)
  testResults.tests.push({ name, passed, details })
  if (passed) testResults.passed++
  else testResults.failed++
}

async function makeRequest(method, url, data = null, useAuth = true) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: useAuth && authToken ? { Authorization: `Bearer ${authToken}` } : {},
    }
    if (data) config.data = data
    
    const response = await axios(config)
    return { success: true, data: response.data, status: response.status }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    }
  }
}

async function testSystemHealth() {
  console.log('\n🔍 Testing System Health...')
  
  // Test API Gateway health
  const apiHealth = await makeRequest('GET', '/health', null, false)
  logTest('API Gateway Health', apiHealth.success, apiHealth.data?.service)
  
  // Test Core service health (direct)
  try {
    const coreHealth = await axios.get('http://localhost:4000/health')
    logTest('Core Service Health', true, coreHealth.data.service)
  } catch (error) {
    logTest('Core Service Health', false, 'Service not responding')
  }
  
  // Test Ashley AI health (direct)
  try {
    const aiHealth = await axios.get('http://localhost:4001/health')
    logTest('Ashley AI Health', true, aiHealth.data.service)
  } catch (error) {
    logTest('Ashley AI Health', false, 'Service not responding')
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...')
  
  // Test login
  const loginData = {
    email: 'admin@demo.com',
    password: 'admin123',
    workspace_slug: 'demo-apparel'
  }
  
  const login = await makeRequest('POST', '/api/auth/login', loginData, false)
  logTest('Admin Login', login.success, login.success ? 'Token received' : login.error?.message)
  
  if (login.success) {
    authToken = login.data.access_token
    logTest('JWT Token Validation', !!authToken, `Token length: ${authToken.length}`)
    
    // Test authenticated endpoint
    const me = await makeRequest('GET', '/api/auth/me')
    logTest('Get Current User', me.success, me.success ? me.data.user?.email : me.error?.message)
  }
}

async function testClientManagement() {
  console.log('\n🏢 Testing Client Management...')
  
  // Get all clients
  const clients = await makeRequest('GET', '/api/clients?limit=10')
  logTest('Get Clients List', clients.success, clients.success ? `Found ${clients.data.data?.length} clients` : clients.error?.message)
  
  if (clients.success && clients.data.data?.length > 0) {
    const clientId = clients.data.data[0].id
    
    // Get specific client
    const client = await makeRequest('GET', `/api/clients/${clientId}`)
    logTest('Get Client Details', client.success, client.success ? client.data.name : client.error?.message)
    
    // Get client brands
    const brands = await makeRequest('GET', `/api/clients/${clientId}/brands`)
    logTest('Get Client Brands', brands.success, brands.success ? `Found ${brands.data.length} brands` : brands.error?.message)
  }
  
  // Test client creation
  const newClient = {
    name: 'Test Client Ltd.',
    contact_person: 'John Test',
    email: 'john@testclient.com',
    phone: '+63-917-123-0000',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      region: 'NCR',
      country: 'Philippines'
    },
    payment_terms: 30
  }
  
  const createClient = await makeRequest('POST', '/api/clients', newClient)
  logTest('Create New Client', createClient.success, createClient.success ? createClient.data.name : createClient.error?.message)
}

async function testOrderManagement() {
  console.log('\n📋 Testing Order Management...')
  
  // Get all orders
  const orders = await makeRequest('GET', '/api/orders?limit=5')
  logTest('Get Orders List', orders.success, orders.success ? `Found ${orders.data.data?.length} orders` : orders.error?.message)
  
  if (orders.success && orders.data.data?.length > 0) {
    const orderId = orders.data.data[0].id
    
    // Get specific order
    const order = await makeRequest('GET', `/api/orders/${orderId}`)
    logTest('Get Order Details', order.success, order.success ? `Order ${order.data.order_number}` : order.error?.message)
    
    // Get order routing
    const routing = await makeRequest('GET', `/api/orders/${orderId}/routing`)
    logTest('Get Order Routing', routing.success, routing.success ? `${routing.data.length} steps` : 'No routing found')
    
    // Generate routing if none exists
    if (routing.success && routing.data.length === 0) {
      const generateRouting = await makeRequest('POST', `/api/orders/${orderId}/routing`)
      logTest('Generate Order Routing', generateRouting.success, generateRouting.success ? `${generateRouting.data.routing_steps?.length} steps created` : generateRouting.error?.message)
    }
  }
  
  // Test order creation
  const clients = await makeRequest('GET', '/api/clients?limit=1')
  if (clients.success && clients.data.data?.length > 0) {
    const clientId = clients.data.data[0].id
    
    const newOrder = {
      client_id: clientId,
      delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Test order for system validation',
      line_items: [
        {
          description: 'Test T-Shirt with Screen Print',
          quantity: 100,
          unit_price: 200.00,
          printing_method: 'silkscreen',
          garment_type: 'T-Shirt',
          size_breakdown: { 'S': 20, 'M': 40, 'L': 30, 'XL': 10 }
        }
      ]
    }
    
    const createOrder = await makeRequest('POST', '/api/orders', newOrder)
    logTest('Create New Order', createOrder.success, createOrder.success ? `Order ${createOrder.data.order_number}` : createOrder.error?.message)
  }
}

async function testAshleyAI() {
  console.log('\n🤖 Testing Ashley AI...')
  
  // Get orders for AI testing
  const orders = await makeRequest('GET', '/api/orders?limit=1')
  if (orders.success && orders.data.data?.length > 0) {
    const orderId = orders.data.data[0].id
    const workspaceId = orders.data.data[0].workspace_id
    
    // Test capacity analysis (direct to AI service)
    try {
      const capacityAnalysis = await axios.post('http://localhost:4001/api/analysis/capacity/' + orderId, {
        workspace_id: workspaceId
      })
      logTest('Ashley AI Capacity Analysis', true, `Can meet deadline: ${capacityAnalysis.data.analysis.can_meet_deadline}`)
    } catch (error) {
      logTest('Ashley AI Capacity Analysis', false, error.response?.data?.message || 'AI service error')
    }
    
    // Test quality risk prediction
    try {
      const qualityRisk = await axios.post('http://localhost:4001/api/analysis/quality-risk/' + orderId, {
        workspace_id: workspaceId
      })
      logTest('Ashley AI Quality Prediction', true, `Risk level: ${qualityRisk.data.prediction.risk_level}`)
    } catch (error) {
      logTest('Ashley AI Quality Prediction', false, error.response?.data?.message || 'AI service error')
    }
    
    // Test route validation
    try {
      const routeValidation = await axios.post('http://localhost:4001/api/analysis/route-validation/' + orderId, {
        workspace_id: workspaceId
      })
      logTest('Ashley AI Route Validation', true, `Route valid: ${routeValidation.data.validation.is_valid}`)
    } catch (error) {
      logTest('Ashley AI Route Validation', false, error.response?.data?.message || 'AI service error')
    }
  }
}

async function testDashboardAggregation() {
  console.log('\n📊 Testing Dashboard Aggregation...')
  
  const dashboard = await makeRequest('GET', '/api/dashboard')
  logTest('Dashboard Data Aggregation', dashboard.success, dashboard.success ? 'BFF aggregation working' : dashboard.error?.message)
}

async function runAllTests() {
  console.log('🧪 ASH AI System Integration Tests')
  console.log('================================')
  
  try {
    await testSystemHealth()
    await testAuthentication()
    
    if (authToken) {
      await testClientManagement()
      await testOrderManagement()
      await testAshleyAI()
      await testDashboardAggregation()
    } else {
      console.log('\n❌ Skipping authenticated tests - login failed')
    }
    
  } catch (error) {
    console.error('\n💥 Test suite error:', error.message)
  }
  
  // Final results
  console.log('\n📊 Test Results Summary')
  console.log('======================')
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`)
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:')
    testResults.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   • ${test.name}: ${test.details}`)
    })
  }
  
  console.log('\n🎉 System test completed!')
  return testResults.failed === 0
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('Test runner error:', error)
    process.exit(1)
  })
}

module.exports = { runAllTests }
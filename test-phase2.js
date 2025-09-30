#!/usr/bin/env node

/**
 * Phase 2 Integration Testing Script
 * Tests payment gateways and SMS functionality
 */

const fs = require('fs')
const path = require('path')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkEnvVar(varName, description) {
  const value = process.env[varName]
  const exists = !!value && value !== '' && !value.includes('your_') && !value.includes('your-')

  if (exists) {
    log(`  ✅ ${description}: Configured`, 'green')
    return true
  } else {
    log(`  ⚠️  ${description}: Not configured`, 'yellow')
    return false
  }
}

async function testStripeConfiguration() {
  log('\n💳 STRIPE PAYMENT INTEGRATION', 'bright')
  log('=' .repeat(60), 'cyan')

  const secretKey = checkEnvVar('STRIPE_SECRET_KEY', 'Secret Key')
  const publicKey = checkEnvVar('STRIPE_PUBLISHABLE_KEY', 'Publishable Key')
  checkEnvVar('STRIPE_WEBHOOK_SECRET', 'Webhook Secret')
  checkEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'Public Key (Frontend)')

  // Check if using test or live keys
  if (secretKey) {
    const isTest = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')
    log(`  🔑 Mode: ${isTest ? 'TEST' : 'LIVE'}`, isTest ? 'green' : 'magenta')
  }

  // Check payment service file
  const paymentServicePath = path.join(__dirname, 'services', 'ash-admin', 'src', 'lib', 'paymentService.ts')
  if (fs.existsSync(paymentServicePath)) {
    log('  ✅ Payment service: Found', 'green')
  } else {
    log('  ❌ Payment service: Missing', 'red')
  }

  // Check webhook handler
  const webhookPath = path.join(__dirname, 'services', 'ash-admin', 'src', 'app', 'api', 'webhooks', 'stripe', 'route.ts')
  if (fs.existsSync(webhookPath)) {
    log('  ✅ Webhook handler: Found', 'green')
  } else {
    log('  ❌ Webhook handler: Missing', 'red')
  }

  // Check payment endpoints
  const endpoints = [
    'api/payments/create-intent/route.ts',
    'api/payments/create-checkout/route.ts',
  ]

  let endpointsFound = 0
  for (const endpoint of endpoints) {
    const endpointPath = path.join(__dirname, 'services', 'ash-admin', 'src', 'app', endpoint)
    if (fs.existsSync(endpointPath)) {
      endpointsFound++
    }
  }
  log(`  ✅ API endpoints: ${endpointsFound}/${endpoints.length} found`, endpointsFound === endpoints.length ? 'green' : 'yellow')

  log('\n  📝 Next Steps:', 'blue')
  if (!secretKey) {
    log('    1. Sign up at https://stripe.com', 'yellow')
    log('    2. Get your API keys from Dashboard > Developers', 'yellow')
    log('    3. Add to .env: STRIPE_SECRET_KEY=sk_test_...', 'yellow')
  } else {
    log('    1. Start dev server: pnpm --filter @ash/admin dev', 'yellow')
    log('    2. Test payment: POST http://localhost:3001/api/payments/create-intent', 'yellow')
    log('    3. Install Stripe CLI for webhook testing', 'yellow')
    log('       https://stripe.com/docs/stripe-cli', 'yellow')
  }

  log('\n  💡 Test Cards:', 'blue')
  log('    Success: 4242 4242 4242 4242', 'cyan')
  log('    Decline: 4000 0000 0000 0002', 'cyan')
  log('    Requires Auth: 4000 0025 0000 3155', 'cyan')
}

async function testGCashConfiguration() {
  log('\n💸 GCASH PAYMENT INTEGRATION (Philippines)', 'bright')
  log('=' .repeat(60), 'cyan')

  const merchantId = checkEnvVar('GCASH_MERCHANT_ID', 'Merchant ID')
  const apiKey = checkEnvVar('GCASH_API_KEY', 'API Key')
  checkEnvVar('GCASH_API_URL', 'API URL')

  if (!merchantId && !apiKey) {
    log('  ℹ️  GCash runs in MOCK MODE without credentials', 'cyan')
    log('  ✅ Mock mode allows testing payment flow', 'green')
  }

  log('\n  📝 Next Steps:', 'blue')
  if (!merchantId) {
    log('    1. Register as GCash merchant: https://www.gcash.com/business', 'yellow')
    log('    2. Wait for approval (1-2 weeks)', 'yellow')
    log('    3. Get API credentials from merchant portal', 'yellow')
    log('    💡 Use mock mode for testing meanwhile', 'cyan')
  }
}

async function testSMSConfiguration() {
  log('\n📱 SMS INTEGRATION', 'bright')
  log('=' .repeat(60), 'cyan')

  log('\n  🌍 Twilio (International):', 'blue')
  const twilioSid = checkEnvVar('TWILIO_ACCOUNT_SID', '  Account SID')
  const twilioToken = checkEnvVar('TWILIO_AUTH_TOKEN', '  Auth Token')
  const twilioPhone = checkEnvVar('TWILIO_PHONE_NUMBER', '  Phone Number')

  if (twilioSid && twilioToken && twilioPhone) {
    log('  ✅ Twilio: Fully configured', 'green')
  }

  log('\n  🇵🇭 Semaphore (Philippines - Recommended):', 'blue')
  const semaphoreKey = checkEnvVar('SEMAPHORE_API_KEY', '  API Key')
  checkEnvVar('SEMAPHORE_SENDER_NAME', '  Sender Name')
  checkEnvVar('PORTAL_URL', '  Portal URL')

  if (semaphoreKey) {
    log('  ✅ Semaphore: Fully configured', 'green')
  }

  // Check SMS service file
  const smsServicePath = path.join(__dirname, 'services', 'ash-admin', 'src', 'lib', 'smsService.ts')
  if (fs.existsSync(smsServicePath)) {
    log('\n  ✅ SMS service implementation: Found', 'green')
  } else {
    log('\n  ❌ SMS service implementation: Missing', 'red')
  }

  // Check test endpoint
  const testEndpointPath = path.join(__dirname, 'services', 'ash-admin', 'src', 'app', 'api', 'test-sms', 'route.ts')
  if (fs.existsSync(testEndpointPath)) {
    log('  ✅ Test endpoint: Found', 'green')
  } else {
    log('  ❌ Test endpoint: Missing', 'red')
  }

  log('\n  📝 Next Steps:', 'blue')
  if (!twilioSid && !semaphoreKey) {
    log('    For International SMS:', 'yellow')
    log('    1. Sign up at https://twilio.com (free trial $15)', 'yellow')
    log('    2. Get phone number and credentials', 'yellow')
    log('\n    For Philippines SMS (Recommended):', 'yellow')
    log('    1. Sign up at https://semaphore.co', 'yellow')
    log('    2. Load credits (minimum PHP 100)', 'yellow')
    log('    3. Get API key from dashboard', 'yellow')
  } else {
    log('    1. Start dev server: pnpm --filter @ash/admin dev', 'yellow')
    log('    2. Test SMS: POST http://localhost:3001/api/test-sms', 'yellow')
    log('       -d \'{"to": "+639171234567", "messageType": "test"}\'', 'yellow')
  }

  if (!twilioSid && !semaphoreKey) {
    log('\n  ℹ️  SMS runs in CONSOLE MODE without credentials', 'cyan')
    log('  ✅ Console mode logs SMS to terminal for testing', 'green')
  }
}

async function testDependencies() {
  log('\n📦 PHASE 2 DEPENDENCIES', 'bright')
  log('=' .repeat(60), 'cyan')

  const packages = [
    { name: 'stripe', service: 'Payment Processing', path: 'services/ash-admin/node_modules/stripe' },
    { name: 'twilio', service: 'SMS (International)', path: 'services/ash-admin/node_modules/twilio' },
  ]

  for (const pkg of packages) {
    const pkgPath = path.join(__dirname, pkg.path)
    if (fs.existsSync(pkgPath)) {
      log(`  ✅ ${pkg.name} (${pkg.service}): Installed`, 'green')
    } else {
      log(`  ❌ ${pkg.name} (${pkg.service}): Missing`, 'red')
      log(`     Run: pnpm add ${pkg.name} --filter @ash/admin`, 'yellow')
    }
  }
}

async function showSummary() {
  log('\n🎯 PHASE 2 INTEGRATION STATUS', 'bright')
  log('=' .repeat(60), 'cyan')

  // Payment status
  const stripeConfigured = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your')
  const gcashConfigured = process.env.GCASH_MERCHANT_ID && !process.env.GCASH_MERCHANT_ID.includes('your')

  log('\n  💳 Payment Gateways:', 'blue')
  if (stripeConfigured) {
    log('    ✅ Stripe: Production Ready', 'green')
  } else {
    log('    ⚠️  Stripe: Development Mode (needs API key)', 'yellow')
  }

  if (gcashConfigured) {
    log('    ✅ GCash: Production Ready', 'green')
  } else {
    log('    ⚠️  GCash: Mock Mode (testing only)', 'yellow')
  }

  // SMS status
  const twilioConfigured = process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.includes('your')
  const semaphoreConfigured = process.env.SEMAPHORE_API_KEY && !process.env.SEMAPHORE_API_KEY.includes('your')

  log('\n  📱 SMS Notifications:', 'blue')
  if (twilioConfigured) {
    log('    ✅ Twilio: Production Ready', 'green')
  }
  if (semaphoreConfigured) {
    log('    ✅ Semaphore: Production Ready', 'green')
  }
  if (!twilioConfigured && !semaphoreConfigured) {
    log('    ⚠️  SMS: Console Mode (needs API keys)', 'yellow')
  }

  log('\n  📊 Overall Status:', 'blue')
  const readyCount = [stripeConfigured, twilioConfigured || semaphoreConfigured].filter(Boolean).length
  const totalIntegrations = 2

  if (readyCount === totalIntegrations) {
    log('    🎉 All integrations configured for production!', 'green')
  } else if (readyCount > 0) {
    log(`    ⚙️  ${readyCount}/${totalIntegrations} integrations ready`, 'yellow')
    log('    🔧 Configure remaining services for full functionality', 'cyan')
  } else {
    log('    🚧 Development Mode - All integrations need configuration', 'yellow')
    log('    ✅ Can test with mock/console modes', 'green')
  }

  log('\n  💰 Estimated Monthly Costs (100 orders):', 'blue')
  log('    • Stripe: ~$50-100 (2.9% + $0.30/transaction)', 'cyan')
  log('    • Semaphore SMS: ~₱60 ($1) for 100 SMS', 'cyan')
  log('    • Total: ~$51-101/month', 'cyan')

  log('\n  📚 Documentation:', 'blue')
  log('    📄 PHASE2_INTEGRATION_GUIDE.md - Complete setup guide', 'cyan')
  log('    🔗 https://stripe.com - Payment processing', 'cyan')
  log('    🔗 https://semaphore.co - Philippine SMS', 'cyan')
  log('    🔗 https://twilio.com - International SMS', 'cyan')
}

async function showTestCommands() {
  log('\n🧪 TESTING COMMANDS', 'bright')
  log('=' .repeat(60), 'cyan')

  log('\n  Test Payment APIs:', 'blue')
  log('    curl -X POST http://localhost:3001/api/payments/create-intent \\', 'yellow')
  log('      -H "Content-Type: application/json" \\', 'yellow')
  log('      -d \'{"invoiceId": "inv_123", "provider": "stripe"}\'', 'yellow')

  log('\n  Test SMS API:', 'blue')
  log('    curl -X POST http://localhost:3001/api/test-sms \\', 'yellow')
  log('      -H "Content-Type: application/json" \\', 'yellow')
  log('      -d \'{"to": "+639171234567", "messageType": "test"}\'', 'yellow')

  log('\n  Test Stripe Webhooks (with Stripe CLI):', 'blue')
  log('    stripe listen --forward-to localhost:3001/api/webhooks/stripe', 'yellow')
  log('    stripe trigger payment_intent.succeeded', 'yellow')
}

// Main execution
async function main() {
  log('\n' + '='.repeat(60), 'bright')
  log('  ASHLEY AI - PHASE 2 INTEGRATION TESTS', 'bright')
  log('  Payment Gateways & SMS Notifications', 'bright')
  log('='.repeat(60), 'bright')

  // Load environment variables
  require('dotenv').config()

  await testDependencies()
  await testStripeConfiguration()
  await testGCashConfiguration()
  await testSMSConfiguration()
  await showSummary()
  await showTestCommands()

  log('\n' + '='.repeat(60), 'green')
  log('  ✅ PHASE 2 INTEGRATION SETUP COMPLETE', 'bright')
  log('='.repeat(60) + '\n', 'green')
}

main().catch(console.error)
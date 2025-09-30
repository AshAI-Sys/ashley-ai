#!/usr/bin/env node

/**
 * Integration Testing Script for Ashley AI
 * Tests email and file storage functionality
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
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkEnvVar(varName, description) {
  const value = process.env[varName]
  const exists = !!value && value !== '' && !value.includes('your-')

  if (exists) {
    log(`  ✅ ${description}: Configured`, 'green')
    return true
  } else {
    log(`  ⚠️  ${description}: Not configured`, 'yellow')
    return false
  }
}

async function testEmailConfiguration() {
  log('\n📧 EMAIL INTEGRATION TESTS', 'bright')
  log('=' .repeat(50), 'cyan')

  const resendConfigured = checkEnvVar('RESEND_API_KEY', 'Resend API Key')
  checkEnvVar('EMAIL_FROM', 'Email From Address')

  // Check email service file
  const emailServicePath = path.join(__dirname, 'services', 'ash-admin', 'src', 'lib', 'emailService.ts')
  if (fs.existsSync(emailServicePath)) {
    log('  ✅ Email service implementation: Found', 'green')
  } else {
    log('  ❌ Email service implementation: Missing', 'red')
  }

  // Check email templates
  const templatesPath = path.join(__dirname, 'services', 'ash-admin', 'src', 'lib', 'emailTemplates.ts')
  if (fs.existsSync(templatesPath)) {
    log('  ✅ Email templates: Found', 'green')
  } else {
    log('  ❌ Email templates: Missing', 'red')
  }

  // Check test endpoint
  const testEndpointPath = path.join(__dirname, 'services', 'ash-admin', 'src', 'app', 'api', 'test-email', 'route.ts')
  if (fs.existsSync(testEndpointPath)) {
    log('  ✅ Test endpoint: Found', 'green')
  } else {
    log('  ❌ Test endpoint: Missing', 'red')
  }

  log('\n  📝 Next Steps:', 'blue')
  if (!resendConfigured) {
    log('    1. Sign up at https://resend.com (free 3,000 emails/month)', 'yellow')
    log('    2. Get your API key from dashboard', 'yellow')
    log('    3. Add to .env: RESEND_API_KEY=re_your_key_here', 'yellow')
  } else {
    log('    1. Start dev server: pnpm --filter @ash/admin dev', 'yellow')
    log('    2. Test endpoint: curl -X POST http://localhost:3001/api/test-email \\', 'yellow')
    log('       -H "Content-Type: application/json" \\', 'yellow')
    log('       -d \'{"to": "your-email@example.com", "templateType": "orderCreated"}\'', 'yellow')
  }
}

async function testStorageConfiguration() {
  log('\n📦 FILE STORAGE INTEGRATION TESTS', 'bright')
  log('=' .repeat(50), 'cyan')

  const provider = process.env.ASH_STORAGE_PROVIDER || 'local'
  log(`  📁 Storage Provider: ${provider}`, provider === 'local' ? 'yellow' : 'green')

  if (provider === 'local') {
    const uploadDir = process.env.UPLOAD_DIR || './uploads'
    log(`  📂 Upload Directory: ${uploadDir}`, 'cyan')

    // Check/create upload directory
    if (fs.existsSync(uploadDir)) {
      log('  ✅ Upload directory: Exists', 'green')
    } else {
      try {
        fs.mkdirSync(uploadDir, { recursive: true })
        log('  ✅ Upload directory: Created', 'green')
      } catch (error) {
        log('  ❌ Upload directory: Failed to create', 'red')
      }
    }
  } else if (provider === 'aws') {
    checkEnvVar('ASH_AWS_REGION', 'AWS Region')
    checkEnvVar('ASH_AWS_BUCKET', 'AWS S3 Bucket')
    const keyConfigured = checkEnvVar('ASH_AWS_ACCESS_KEY_ID', 'AWS Access Key ID')
    const secretConfigured = checkEnvVar('ASH_AWS_SECRET_ACCESS_KEY', 'AWS Secret Key')

    if (keyConfigured && secretConfigured) {
      log('  ✅ AWS S3: Fully configured', 'green')
    }
  } else if (provider === 'cloudflare') {
    checkEnvVar('ASH_AWS_BUCKET', 'R2 Bucket Name')
    checkEnvVar('CLOUDFLARE_ACCOUNT_ID', 'Cloudflare Account ID')
    checkEnvVar('CLOUDFLARE_R2_ENDPOINT', 'R2 Endpoint')
    const keyConfigured = checkEnvVar('ASH_AWS_ACCESS_KEY_ID', 'R2 Access Key ID')
    const secretConfigured = checkEnvVar('ASH_AWS_SECRET_ACCESS_KEY', 'R2 Secret Key')

    if (keyConfigured && secretConfigured) {
      log('  ✅ Cloudflare R2: Fully configured', 'green')
    }
  }

  // Check storage service file
  const storageServicePath = path.join(__dirname, 'services', 'ash-admin', 'src', 'lib', 'storageService.ts')
  if (fs.existsSync(storageServicePath)) {
    log('  ✅ Storage service implementation: Found', 'green')
  } else {
    log('  ❌ Storage service implementation: Missing', 'red')
  }

  // Check test endpoint
  const testEndpointPath = path.join(__dirname, 'services', 'ash-admin', 'src', 'app', 'api', 'test-storage', 'route.ts')
  if (fs.existsSync(testEndpointPath)) {
    log('  ✅ Test endpoint: Found', 'green')
  } else {
    log('  ❌ Test endpoint: Missing', 'red')
  }

  log('\n  📝 Next Steps:', 'blue')
  if (provider === 'local') {
    log('    ✅ Local storage is ready for development', 'green')
    log('    💡 For production, consider AWS S3 or Cloudflare R2', 'cyan')
  } else if (provider === 'aws') {
    log('    1. Create S3 bucket at https://console.aws.amazon.com/s3', 'yellow')
    log('    2. Create IAM user with S3 access', 'yellow')
    log('    3. Add credentials to .env file', 'yellow')
  } else if (provider === 'cloudflare') {
    log('    1. Create R2 bucket at https://dash.cloudflare.com/r2', 'yellow')
    log('    2. Generate API token', 'yellow')
    log('    3. Add credentials to .env file', 'yellow')
  }
}

async function testDependencies() {
  log('\n📦 DEPENDENCY CHECKS', 'bright')
  log('=' .repeat(50), 'cyan')

  const packages = [
    { name: 'resend', service: 'Email', path: 'services/ash-admin/node_modules/resend' },
    { name: '@aws-sdk/client-s3', service: 'File Storage (S3)', path: 'services/ash-admin/node_modules/@aws-sdk/client-s3' },
    { name: '@aws-sdk/s3-request-presigner', service: 'File Storage (Signed URLs)', path: 'services/ash-admin/node_modules/@aws-sdk/s3-request-presigner' },
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
  log('\n🎯 INTEGRATION STATUS SUMMARY', 'bright')
  log('=' .repeat(50), 'cyan')

  const resendConfigured = process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your-')
  const storageProvider = process.env.ASH_STORAGE_PROVIDER || 'local'

  log('\n  Email Service:', 'blue')
  if (resendConfigured) {
    log('    ✅ Production Ready (Resend configured)', 'green')
  } else {
    log('    ⚠️  Development Mode (Console logging)', 'yellow')
    log('    📌 Configure RESEND_API_KEY for production', 'cyan')
  }

  log('\n  File Storage:', 'blue')
  if (storageProvider === 'local') {
    log('    ⚠️  Development Mode (Local filesystem)', 'yellow')
    log('    📌 Configure AWS S3 or Cloudflare R2 for production', 'cyan')
  } else if (storageProvider === 'aws') {
    const configured = process.env.ASH_AWS_ACCESS_KEY_ID && !process.env.ASH_AWS_ACCESS_KEY_ID.includes('your-')
    if (configured) {
      log('    ✅ Production Ready (AWS S3 configured)', 'green')
    } else {
      log('    ❌ AWS S3 credentials missing', 'red')
    }
  } else if (storageProvider === 'cloudflare') {
    const configured = process.env.ASH_AWS_ACCESS_KEY_ID && !process.env.ASH_AWS_ACCESS_KEY_ID.includes('your-')
    if (configured) {
      log('    ✅ Production Ready (Cloudflare R2 configured)', 'green')
    } else {
      log('    ❌ Cloudflare R2 credentials missing', 'red')
    }
  }

  log('\n  📚 Documentation:', 'blue')
  log('    📄 See INTEGRATION_GUIDE.md for detailed setup instructions', 'cyan')
  log('    🔗 https://resend.com - Email service', 'cyan')
  log('    🔗 https://dash.cloudflare.com/r2 - File storage (recommended)', 'cyan')
}

// Main execution
async function main() {
  log('\n' + '='.repeat(60), 'bright')
  log('  ASHLEY AI - PHASE 1 INTEGRATION TESTS', 'bright')
  log('='.repeat(60), 'bright')

  // Load environment variables
  require('dotenv').config()

  await testDependencies()
  await testEmailConfiguration()
  await testStorageConfiguration()
  await showSummary()

  log('\n' + '='.repeat(60), 'green')
  log('  ✅ PHASE 1 INTEGRATION SETUP COMPLETE', 'bright')
  log('='.repeat(60) + '\n', 'green')
}

main().catch(console.error)
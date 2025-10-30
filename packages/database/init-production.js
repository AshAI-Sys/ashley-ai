/**
 * Initialize Production Database Script
 *
 * This script:
 * 1. Pushes Prisma schema to production PostgreSQL database
 * 2. Creates initial admin user and workspace
 *
 * Usage:
 *   node init-production.js
 */

const { execSync } = require('child_process');
const path = require('path');

// Production database URL
const PROD_DB_URL = 'postgresql://neondb_owner:npg_oVNf76Kpqasx@ep-falling-fire-a1ru8mim-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

console.log('🚀 Initializing Production Database...\n');

// Step 1: Push schema to database
console.log('📊 Step 1: Pushing Prisma schema to PostgreSQL...');
try {
  execSync(`npx prisma db push --accept-data-loss`, {
    env: { ...process.env, DATABASE_URL: PROD_DB_URL },
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ Schema pushed successfully!\n');
} catch (error) {
  console.error('❌ Failed to push schema:', error.message);
  process.exit(1);
}

// Step 2: Generate Prisma Client
console.log('📦 Step 2: Generating Prisma Client...');
try {
  execSync(`npx prisma generate`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('✅ Prisma Client generated!\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client:', error.message);
  process.exit(1);
}

console.log('🎉 Production database initialized successfully!');
console.log('\n📝 Next steps:');
console.log('1. Visit your production site');
console.log('2. Register the first admin user');
console.log('3. Start using Ashley AI!\n');

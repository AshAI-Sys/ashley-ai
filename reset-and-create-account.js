/* eslint-disable no-console, no-unused-vars */
/**
 * Complete Database Reset and Account Creation
 * This script will:
 * 1. Delete the old database
 * 2. Create a fresh database with the correct schema
 * 3. Create your admin account
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function run() {
  try {
    console.log('\n🔄 Starting complete database reset...\n');

    // Step 1: Delete old database
    const dbPath = path.join(__dirname, 'packages', 'database', 'prisma', 'dev.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✓ Deleted old database');
    } else {
      console.log('ℹ No existing database found');
    }

    // Step 2: Push schema to create new database
    console.log('\n⏳ Creating new database schema...');
    process.chdir(path.join(__dirname, 'packages', 'database'));
    await execPromise('npx prisma db push --accept-data-loss');
    console.log('✓ Database schema created');

    // Step 3: Generate Prisma client
    console.log('\n⏳ Generating Prisma client...');
    await execPromise('npx prisma generate');
    console.log('✓ Prisma client generated');

    // Step 4: Create admin account
    console.log('\n⏳ Creating admin account...');
    process.chdir(path.join(__dirname));
    const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
    const bcrypt = require('./node_modules/.pnpm/bcryptjs@2.4.3/node_modules/bcryptjs');

    const prisma = new PrismaClient();

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Ashley AI Manufacturing',
        slug: 'ashley-ai',
        is_active: true,
        settings: JSON.stringify({
          timezone: 'Asia/Manila',
          currency: 'PHP',
          date_format: 'YYYY-MM-DD',
          time_format: '24h',
        }),
      },
    });
    console.log('✓ Workspace created');

    // Hash password
    const passwordHash = await bcrypt.hash('Admin123!', 12);

    // Create admin user WITH email_verified field
    const adminUser = await prisma.user.create({
      data: {
        workspace_id: workspace.id,
        email: 'admin@ashleyai.com',
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        position: 'System Administrator',
        department: 'Management',
        is_active: true,
        email_verified: true, // ← THIS IS THE KEY FIELD
        requires_2fa: false,
        two_factor_enabled: false,
        permissions: JSON.stringify(['*']),
      },
    });
    console.log('✓ Admin user created');

    await prisma.$disconnect();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE RESET COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 LOGIN CREDENTIALS:');
    console.log('   Email: admin@ashleyai.com');
    console.log('   Password: Admin123!');
    console.log('\n🌐 Access URL: http://localhost:3001');
    console.log('\n⚠️  IMPORTANT: Restart your dev server for changes to take effect!');
    console.log('   Run: pnpm --filter @ash/admin dev\n');

  } catch (error) {
    console.error('\n✖ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

run();

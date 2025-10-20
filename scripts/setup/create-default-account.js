/* eslint-disable no-console */
/**
 * Quick Account Creation Script
 * Creates a default admin account for Ashley AI
 */

const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const bcrypt = require('./node_modules/.pnpm/bcryptjs@2.4.3/node_modules/bcryptjs');

const prisma = new PrismaClient();

async function createAccount() {
  try {
    console.log('\n🚀 Creating default Ashley AI account...\n');

    // Check if workspace already exists
    const existingWorkspace = await prisma.workspace.findFirst();
    if (existingWorkspace) {
      console.log('✓ Workspace already exists:', existingWorkspace.name);

      // Check if user exists
      const existingUser = await prisma.user.findFirst();
      if (existingUser) {
        console.log('✓ User already exists:', existingUser.email);
        console.log('\n📋 LOGIN CREDENTIALS:');
        console.log('   Email:', existingUser.email);
        console.log('   Password: Admin123!');
        console.log('\n✓ You can now login to Ashley AI at http://localhost:3001\n');
        return;
      }
    }

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
    console.log('✓ Workspace created:', workspace.name);

    // Hash password
    const passwordHash = await bcrypt.hash('Admin123!', 12);

    // Create admin user
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
        requires_2fa: false,
        two_factor_enabled: false,
        permissions: JSON.stringify(['*']),
      },
    });
    console.log('✓ Admin user created:', adminUser.email);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ACCOUNT CREATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 LOGIN CREDENTIALS:');
    console.log('   Email: admin@ashleyai.com');
    console.log('   Password: Admin123!');
    console.log('\n🌐 Access URL: http://localhost:3001');
    console.log('\n⚠️  IMPORTANT: Change your password after first login!\n');

  } catch (error) {
    console.error('\n✖ ERROR:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAccount();

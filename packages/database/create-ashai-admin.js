const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating admin user for ashai.system@gmail.com...\n');

  try {
    // Check if workspace exists
    let workspace = await prisma.workspace.findUnique({
      where: { slug: 'demo-workspace' }
    });

    if (!workspace) {
      // Create workspace if it doesn't exist
      workspace = await prisma.workspace.create({
        data: {
          name: 'Demo Workspace',
          slug: 'demo-workspace',
          is_active: true,
        },
      });
      console.log('✅ Workspace created:', workspace.slug);
    } else {
      console.log('✅ Workspace found:', workspace.slug);
    }

    // Hash password (12 rounds - production strength)
    const password = 'Admin@12345';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create or update admin user
    const admin = await prisma.user.upsert({
      where: {
        workspace_id_email: {
          workspace_id: workspace.id,
          email: 'ashai.system@gmail.com',
        },
      },
      update: {
        password_hash: hashedPassword,
        email_verified: true,
        is_active: true,
      },
      create: {
        email: 'ashai.system@gmail.com',
        password_hash: hashedPassword,
        first_name: 'Joshua',
        last_name: 'Chua',
        role: 'admin',
        email_verified: true,
        is_active: true,
        workspace_id: workspace.id,
      },
    });

    console.log('✅ Admin user created/updated:', admin.email);

    // Clear any failed login attempts and account lockouts
    try {
      const deletedAuth = await prisma.authEvent.deleteMany({
        where: {
          user_id: admin.id,
          event_type: { in: ['LOGIN_FAILED', 'LOGIN_BLOCKED_LOCKED'] }
        }
      });
      console.log('✅ Cleared', deletedAuth.count, 'failed login attempts');

      // Clear account lockout records if any
      const deletedLockouts = await prisma.accountLockout.deleteMany({
        where: { email: admin.email }
      });
      console.log('✅ Cleared', deletedLockouts.count, 'account lockout records');
    } catch (error) {
      console.log('⚠️  Note: Could not clear lockouts (tables may not exist)');
    }

    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('   Email:', admin.email);
    console.log('   Password: Admin@12345');
    console.log('   Workspace:', workspace.slug);
    console.log('\n✅ You can now login at: https://ashley-ai-admin.vercel.app/login\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

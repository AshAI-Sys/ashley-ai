const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🚀 Creating Production Admin Account...\n');

  try {
    // Check if workspace exists, create if not
    let workspace = await prisma.workspace.findFirst({
      where: { slug: 'ashley-ai-prod' }
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'Ashley AI Production',
          slug: 'ashley-ai-prod',
          is_active: true,
          settings: JSON.stringify({
            timezone: 'Asia/Manila',
            currency: 'PHP',
            date_format: 'YYYY-MM-DD',
            time_format: '24h',
          }),
        },
      });
      console.log('✅ Workspace created:', workspace.slug);
    } else {
      console.log('✅ Workspace found:', workspace.slug);
    }

    // Email and password (NO special character required)
    const email = 'ashai.system@gmail.com';
    const password = 'Ash2025'; // Min 8 chars, uppercase, lowercase, number - NO special char

    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('');

    // Hash password with bcrypt (12 rounds - production strength)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Find existing user first
    const existingUser = await prisma.user.findFirst({
      where: { email: email }
    });

    let admin;
    if (existingUser) {
      // FORCE UPDATE existing user with new password
      console.log('⚠️  User exists. FORCING password update...');
      admin = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password_hash: hashedPassword,
          email_verified: true,
          is_active: true,
          first_name: 'Joshua',
          last_name: 'Chua',
          role: 'admin',
          position: 'System Administrator',
          department: 'Management',
        },
      });
    } else {
      // Create new user
      admin = await prisma.user.create({
        data: {
          workspace_id: workspace.id,
          email: email,
          password_hash: hashedPassword,
          first_name: 'Joshua',
          last_name: 'Chua',
          role: 'admin',
          position: 'System Administrator',
          department: 'Management',
          email_verified: true,
          is_active: true,
          permissions: JSON.stringify(['*']), // Full admin permissions
        },
      });
    }

    // Verify password immediately
    const passwordVerification = await bcrypt.compare(password, admin.password_hash);
    console.log('🔐 Password verification:', passwordVerification ? '✅ VALID' : '❌ INVALID');

    console.log('✅ Admin user created/updated successfully!\n');

    // Clear any failed login attempts
    try {
      const deletedAuth = await prisma.authEvent.deleteMany({
        where: {
          user_id: admin.id,
          event_type: { in: ['LOGIN_FAILED', 'LOGIN_BLOCKED_LOCKED'] }
        }
      });
      console.log('✅ Cleared', deletedAuth.count, 'failed login attempts');

      const deletedLockouts = await prisma.accountLockout.deleteMany({
        where: { email: admin.email }
      });
      console.log('✅ Cleared', deletedLockouts.count, 'account lockout records\n');
    } catch (error) {
      console.log('⚠️  Note: Could not clear lockouts (tables may not exist)\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ PRODUCTION ADMIN ACCOUNT READY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('   Email:    ', email);
    console.log('   Password: ', password);
    console.log('   Workspace:', workspace.slug);
    console.log('');

    console.log('🌐 LOGIN URL:');
    console.log('   Production: https://ash-83sjhgr1o-ash-ais-projects.vercel.app/login');
    console.log('   Local:      http://localhost:3001/login');
    console.log('');

    console.log('⚠️  IMPORTANT: Change your password after first login!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

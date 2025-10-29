const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAndVerifyLatestUser() {
  try {
    // Find the most recently created user
    const user = await prisma.user.findFirst({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        email_verified: true,
        created_at: true
      }
    });

    if (!user) {
      console.log('❌ No users found in database');
      process.exit(1);
    }

    console.log('📋 Latest registered user:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Not set');
    console.log(`   Created: ${user.created_at}`);
    console.log(`   Verified: ${user.email_verified ? 'Yes ✅' : 'No ❌'}`);
    console.log('');

    if (user.email_verified) {
      console.log('✅ This user is already verified!');
      console.log('🔓 You can login at: http://localhost:3001/login');
      process.exit(0);
    }

    // Verify the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        updated_at: new Date()
      }
    });

    console.log('✅ Email verified successfully!');
    console.log('🔓 You can now login at: http://localhost:3001/login');
    console.log('');
    console.log('📧 Login credentials:');
    console.log(`   Email: ${user.email}`);
    console.log('   Password: (the password you used during registration)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findAndVerifyLatestUser();

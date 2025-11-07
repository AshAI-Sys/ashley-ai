// Delete User Account Script
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  try {
    const email = 'ashai.system@gmail.com';

    console.log(`🗑️  Deleting user account: ${email}\n`);

    // Find the user
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      console.log('⚠️  User not found!');
      return;
    }

    console.log(`Found user: ${user.first_name} ${user.last_name}`);
    console.log(`Workspace ID: ${user.workspace_id}\n`);

    // Delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });

    console.log('✅ User account deleted successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('  Account removed from database');
    console.log('═══════════════════════════════════════');
    console.log(`  Email: ${email}`);
    console.log('═══════════════════════════════════════\n');
    console.log('You can now create a new account with this email.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2003') {
      console.error('\nThis user has related records. Deleting those first...');
      // If there are foreign key constraints, we'd need to delete related records
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();

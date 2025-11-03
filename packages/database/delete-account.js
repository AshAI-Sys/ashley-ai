const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Find the user
    const user = await prisma.user.findFirst({
      where: { email: 'ashai.system@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('🗑️  Deleting user:', user.email);
    
    // Delete user (will cascade delete sessions, auth events, etc)
    await prisma.user.delete({
      where: { id: user.id }
    });

    console.log('✅ User deleted successfully!');
    console.log('\n📝 You can now create a new account at:');
    console.log('   https://ashley-ai-admin.vercel.app/register\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

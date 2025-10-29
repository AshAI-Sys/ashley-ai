const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUser() {
  try {
    const email = process.argv[2] || 'kelvinmorfe17@gmail.com';

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      process.exit(0);
    }

    console.log(`🗑️  Deleting user: ${email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.first_name || ''} ${user.last_name || ''}`.trim());
    console.log('');

    // Delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });

    console.log('✅ User deleted successfully!');
    console.log('');
    console.log('🎉 You can now register again with this email at:');
    console.log('   http://localhost:3001/register');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();

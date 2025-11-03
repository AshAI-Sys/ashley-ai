const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Delete by ID
    await prisma.user.delete({
      where: { id: 'cmhigo2d40001nn3msw6rjf73' }
    });
    console.log('✅ User deleted successfully by ID!');
    
    // Verify deletion
    const check = await prisma.user.findFirst({
      where: { email: 'ashai.system@gmail.com' }
    });
    
    if (check) {
      console.log('❌ User still exists!');
    } else {
      console.log('✅ Confirmed: User no longer exists');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

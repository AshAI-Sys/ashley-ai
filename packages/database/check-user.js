const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'ashai.system@gmail.com' },
      include: { workspace: true }
    });

    console.log('\n📊 User Workspace Info:');
    console.log('========================');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Workspace ID:', user.workspace_id);
    console.log('Workspace Name:', user.workspace?.name);
    console.log('Workspace Slug:', user.workspace?.slug);
    console.log('\n');

    // Check inventory in user's workspace
    const inventoryCount = await prisma.finishedUnit.count({
      where: { workspace_id: user.workspace_id }
    });
    
    console.log('📦 Inventory in user workspace:', inventoryCount, 'units');
    console.log('\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();

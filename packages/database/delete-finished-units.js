const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Delete all finished units from wrong workspace
    const deleted = await prisma.finishedUnit.deleteMany({
      where: {
        workspace_id: 'cmhct6xsi0001zkoghpx0f15o' // Wrong workspace
      }
    });
    
    console.log(`🗑️  Deleted ${deleted.count} units from wrong workspace`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();

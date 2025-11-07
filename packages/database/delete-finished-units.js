const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllFinishedUnits() {
  try {
    console.log('🗑️  Deleting all finished units...');

    const deleted = await prisma.finishedUnit.deleteMany({});

    console.log(`✅ Deleted ${deleted.count} finished units`);
    console.log('✅ Database cleaned - Ready for fresh import');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllFinishedUnits();

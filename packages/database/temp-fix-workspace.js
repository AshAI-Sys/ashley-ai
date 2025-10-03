const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createWorkspace() {
  try {
    const workspace = await prisma.workspace.upsert({
      where: { id: 'demo-workspace-1' },
      update: {},
      create: {
        id: 'demo-workspace-1',
        name: 'Demo Workspace',
        slug: 'demo-workspace',
        is_active: true,
      },
    });
    console.log('✅ Workspace created:', workspace);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createWorkspace();

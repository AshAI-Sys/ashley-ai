const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUser() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: 'admin@ashleyai.com',
        workspace_id: 'demo-workspace-1'
      },
    });
    console.log('User found:', user);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findUser();

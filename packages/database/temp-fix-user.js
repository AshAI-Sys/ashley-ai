const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUser() {
  try {
    const user = await prisma.user.upsert({
      where: { id: 'demo-user-1' },
      update: {},
      create: {
        id: 'demo-user-1',
        email: 'admin@ashleyai.com',
        password_hash: 'demo-hash',
        role: 'admin',
        workspace_id: 'demo-workspace-1',
        first_name: 'Admin',
        last_name: 'User',
        is_active: true,
      },
    });
    console.log('✅ User created:', user);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();

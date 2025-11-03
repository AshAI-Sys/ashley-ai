const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  // Find ALL users with this email (in any workspace)
  const users = await prisma.user.findMany({
    where: { 
      email: 'ashai.system@gmail.com'
    },
    include: {
      workspace: true
    }
  });
  
  console.log('Found', users.length, 'user(s) with email ashai.system@gmail.com\n');
  
  for (const user of users) {
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Workspace:', user.workspace.name, '(slug:', user.workspace.slug + ')');
    console.log('Workspace ID:', user.workspace_id);
    console.log('---');
  }
  
  // Delete ALL of them
  if (users.length > 0) {
    console.log('\n🗑️  Deleting ALL users...\n');
    for (const user of users) {
      await prisma.user.delete({ where: { id: user.id } });
      console.log('✅ Deleted user in workspace:', user.workspace.name);
    }
    console.log('\n✅ All users deleted!');
  }
  
  await prisma.$disconnect();
})();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const users = await prisma.user.findMany({
    where: { 
      email: { contains: 'ashai' }
    }
  });
  
  console.log('Found', users.length, 'users with email containing "ashai"');
  users.forEach(u => {
    console.log('-', u.email, '(ID:', u.id + ')');
  });
  
  await prisma.$disconnect();
})();

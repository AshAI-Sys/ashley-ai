const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Testing Prisma client connection...');

prisma.$queryRaw`SELECT 1`
  .then(() => {
    console.log('SUCCESS: Database connected');
    return prisma.$disconnect();
  })
  .catch(e => {
    console.error('ERROR:', e.message);
    return prisma.$disconnect();
  });
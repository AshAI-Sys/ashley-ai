const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Testing admin service Prisma connection...');

async function testConnection() {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('SUCCESS: Database connected');

    // Test client creation
    const existingClient = await prisma.client.findFirst();
    console.log('SUCCESS: Client query worked');
    console.log('Existing client:', existingClient ? 'Found' : 'None found');

  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
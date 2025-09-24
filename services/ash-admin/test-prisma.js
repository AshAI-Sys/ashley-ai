const { prisma } = require('./src/lib/db');

console.log('Available Prisma models:');
console.log(Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));

console.log('\nTesting client model...');
if (prisma.client) {
  console.log('✓ prisma.client exists');
} else {
  console.log('✗ prisma.client does NOT exist');
}

process.exit(0);
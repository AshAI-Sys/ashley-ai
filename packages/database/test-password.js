const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'ashai.system@gmail.com' }
  });

  if (!user) {
    console.log('User not found!');
    return;
  }

  console.log('Testing password...');
  const testPassword = 'Admin@12345';
  const isValid = await bcrypt.compare(testPassword, user.password_hash);
  
  console.log('Password:', testPassword);
  console.log('Result:', isValid ? '✅ CORRECT' : '❌ WRONG');
  
  if (!isValid) {
    console.log('\nRe-hashing password with correct method...');
    const newHash = await bcrypt.hash(testPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: newHash }
    });
    console.log('✅ Password updated!');
  }
  
  await prisma.$disconnect();
}

main();

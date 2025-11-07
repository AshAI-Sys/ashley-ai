const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testPassword() {
  const user = await prisma.user.findFirst({
    where: { email: 'ashai.system@gmail.com' }
  });
  
  if (!user) {
    console.log('❌ User not found');
    await prisma.$disconnect();
    return;
  }
  
  console.log('\n🔍 Testing password verification...');
  console.log('User:', user.email);
  console.log('Password Hash:', user.password_hash.substring(0, 20) + '...');
  
  // Test with the password we set
  const testPassword = 'Admin123!';
  const isMatch = await bcrypt.compare(testPassword, user.password_hash);
  
  console.log('\nPassword Test: "Admin123!"');
  console.log('Result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
  
  if (!isMatch) {
    console.log('\n⚠️  Password does not match! Creating new hash...');
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('New hash:', newHash.substring(0, 20) + '...');
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: newHash }
    });
    
    console.log('✅ Password hash updated in database');
  }
  
  await prisma.$disconnect();
}

testPassword().catch(console.error);

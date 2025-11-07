const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  // First find the user
  const existingUser = await prisma.user.findFirst({
    where: { email: 'ashai.system@gmail.com' }
  });
  
  if (!existingUser) {
    console.log('❌ User not found');
    await prisma.$disconnect();
    return;
  }
  
  // Hash new password
  const newPassword = 'Admin123!';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update using ID
  const user = await prisma.user.update({
    where: { 
      id: existingUser.id 
    },
    data: {
      password_hash: hashedPassword,
      email_verified: true
    }
  });
  
  console.log('\n✅ Password successfully reset!');
  console.log('Email:', user.email);
  console.log('New Password: Admin123!');
  console.log('\n🔑 You can now login with:');
  console.log('   Email: ashai.system@gmail.com');
  console.log('   Password: Admin123!\n');
  
  await prisma.$disconnect();
}

resetPassword().catch(console.error);

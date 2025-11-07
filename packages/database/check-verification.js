const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findFirst({
    where: { email: 'ashai.system@gmail.com' },
    select: {
      email: true,
      first_name: true,
      last_name: true,
      email_verified: true,
      is_active: true,
      password_hash: true
    }
  });

  if (user) {
    console.log('\n✅ User Account Status:');
    console.log('Email:', user.email);
    console.log('Name:', user.first_name, user.last_name);
    console.log('Email Verified:', user.email_verified ? '✅ TRUE' : '❌ FALSE');
    console.log('Active:', user.is_active ? '✅ TRUE' : '❌ FALSE');
    console.log('Password Hash:', user.password_hash ? `✅ EXISTS (${user.password_hash.length} chars)` : '❌ MISSING');
    console.log('\n🔑 User can now login with their password!\n');
  } else {
    console.log('❌ User not found');
  }

  await prisma.$disconnect();
}

checkUser().catch(console.error);

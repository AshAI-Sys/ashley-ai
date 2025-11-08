const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAccount() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'ashai.system@gmail.com' },
      include: { workspace: true }
    });

    if (user) {
      console.log('\n✅ USER FOUND IN DATABASE:\n');
      console.log('Email:', user.email);
      console.log('Active:', user.is_active);
      console.log('Email Verified:', user.email_verified);
      console.log('Workspace:', user.workspace?.slug);
      console.log('Workspace Active:', user.workspace?.is_active);
      console.log('Password Hash (first 30 chars):', user.password_hash?.substring(0, 30));
      console.log('Role:', user.role);
      console.log('Name:', user.first_name, user.last_name);
      console.log('\n');
    } else {
      console.log('\n❌ USER NOT FOUND\n');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccount();

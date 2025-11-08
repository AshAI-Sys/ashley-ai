const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyPassword() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'ashai.system@gmail.com' }
    });

    if (!user) {
      console.log('\n❌ USER NOT FOUND\n');
      return;
    }

    console.log('\n🔐 Testing Password Verification:\n');

    // Test password 'Ash2025'
    const testPassword = 'Ash2025';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);

    console.log('Email:', user.email);
    console.log('Testing Password:', testPassword);
    console.log('Password Hash:', user.password_hash);
    console.log('Password Valid:', isValid ? '✅ YES' : '❌ NO');
    console.log('\n');

    if (!isValid) {
      console.log('⚠️  Password does NOT match! Need to reset it.\n');
    } else {
      console.log('✅ Password matches! Login should work.\n');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPassword();

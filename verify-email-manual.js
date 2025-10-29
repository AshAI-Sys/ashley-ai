const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyEmail() {
  try {
    // Get the email address from command line argument
    const email = process.argv[2];

    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node verify-email-manual.js your-email@example.com');
      process.exit(1);
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    if (user.email_verified) {
      console.log(`✅ Email ${email} is already verified!`);
      process.exit(0);
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        updated_at: new Date()
      }
    });

    console.log('✅ Email verified successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 User ID: ${user.id}`);
    console.log('');
    console.log('🎉 You can now login at http://localhost:3001/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEmail();

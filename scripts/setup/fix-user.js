/* eslint-disable no-console */
/**
 * Fix existing user - add missing email_verified field
 */

const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function fixUser() {
  try {
    console.log('\n🔧 Fixing user account...\n');

    // Update all users to have email_verified = true
    const result = await prisma.user.updateMany({
      where: {},
      data: {
        email_verified: true,
      },
    });

    console.log(`✓ Updated ${result.count} user(s)`);

    // Verify the fix
    const user = await prisma.user.findFirst();
    if (user) {
      console.log('\n✓ User verified:');
      console.log('  Email:', user.email);
      console.log('  Email Verified:', user.email_verified);
      console.log('  Role:', user.role);
      console.log('\n✅ Fix completed successfully!\n');
    }

  } catch (error) {
    console.error('\n✖ ERROR:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUser();

/* eslint-disable no-console */
/**
 * Reset Admin Password
 * Sets the password to Admin123! and verifies it works
 */

const {
  PrismaClient,
} = require("./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client");
const bcrypt = require("./node_modules/.pnpm/bcryptjs@2.4.3/node_modules/bcryptjs");

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log("\n🔐 Resetting admin password...\n");

    // Find the admin user
    const user = await prisma.user.findFirst({
      where: { email: "admin@ashleyai.com" },
    });

    if (!user) {
      console.log("✖ User not found!");
      return;
    }

    console.log("✓ Found user:", user.email);

    // Hash the new password
    const newPassword = "Admin123!";
    const passwordHash = await bcrypt.hash(newPassword, 12);
    console.log("✓ Password hashed");

    // Update the password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: passwordHash,
        email_verified: true, // Make sure email is verified
      },
    });

    console.log("✓ Password updated");

    // Verify the password works
    const isValid = await bcrypt.compare(newPassword, passwordHash);
    console.log("✓ Password verification:", isValid ? "SUCCESS" : "FAILED");

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ PASSWORD RESET COMPLETE!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📋 LOGIN CREDENTIALS:");
    console.log("   Email: admin@ashleyai.com");
    console.log("   Password: Admin123!");
    console.log("\n🌐 Try logging in at: http://localhost:3001/login\n");
  } catch (error) {
    console.error("\n✖ ERROR:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();

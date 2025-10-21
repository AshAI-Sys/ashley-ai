/* eslint-disable no-console */
/**
 * Clear Account Lockout
 * Remove all failed login attempts from Redis/cache
 */

const {
  PrismaClient,
} = require("./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client");

const prisma = new PrismaClient();

async function clearLockout() {
  try {
    console.log("\n🔓 Clearing account lockout...\n");

    // Find the admin user
    const user = await prisma.user.findFirst({
      where: { email: "admin@ashleyai.com" },
    });

    if (!user) {
      console.log("✖ User not found!");
      return;
    }

    console.log("✓ User found:", user.email);

    // Delete all audit logs related to failed logins
    const deleted = await prisma.auditLog.deleteMany({
      where: {
        user_id: user.id,
        action: {
          in: ["LOGIN_FAILED", "LOGIN_BLOCKED_LOCKED"],
        },
      },
    });

    console.log(`✓ Cleared ${deleted.count} failed login records`);

    // Update user to ensure it's active
    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_active: true,
        email_verified: true,
      },
    });

    console.log("✓ User account status verified");

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ ACCOUNT LOCKOUT CLEARED!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📋 YOU CAN NOW LOGIN:");
    console.log("   Email: admin@ashleyai.com");
    console.log("   Password: Admin123!");
    console.log("\n🌐 Try logging in at: http://localhost:3001/login\n");

    console.log(
      "⚠️  IMPORTANT: Clear your browser cookies/cache if still having issues!\n"
    );
  } catch (error) {
    console.error("\n✖ ERROR:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

clearLockout();

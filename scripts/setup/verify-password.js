/* eslint-disable no-console */
/**
 * Verify Password Hash
 * Check if the password hash in database matches Admin123!
 */

const {
  PrismaClient,
} = require("./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client");
const bcrypt = require("./node_modules/.pnpm/bcryptjs@2.4.3/node_modules/bcryptjs");

const prisma = new PrismaClient();

async function verifyPassword() {
  try {
    console.log("\n🔍 Verifying password...\n");

    // Find the admin user
    const user = await prisma.user.findFirst({
      where: { email: "admin@ashleyai.com" },
    });

    if (!user) {
      console.log("✖ User not found!");
      return;
    }

    console.log("✓ User found:", user.email);
    console.log("  User ID:", user.id);
    console.log("  Active:", user.is_active);
    console.log("  Email Verified:", user.email_verified);
    console.log(
      "  Password Hash:",
      user.password_hash ? user.password_hash.substring(0, 30) + "..." : "NULL"
    );

    if (!user.password_hash) {
      console.log("\n✖ ERROR: No password hash found!");
      return;
    }

    // Test multiple password variations
    const testPasswords = [
      "Admin123!",
      "admin123!",
      "ADMIN123!",
      "Admin1234",
      "Admin123",
    ];

    console.log("\n🔐 Testing password variations:\n");

    for (const testPwd of testPasswords) {
      const isValid = await bcrypt.compare(testPwd, user.password_hash);
      console.log(`  "${testPwd}" → ${isValid ? "✅ MATCH" : "❌ NO MATCH"}`);
    }

    // Generate a fresh hash for Admin123!
    console.log('\n🔧 Generating fresh hash for "Admin123!"...');
    const freshHash = await bcrypt.hash("Admin123!", 12);
    const freshCheck = await bcrypt.compare("Admin123!", freshHash);
    console.log(
      "  Fresh hash verification:",
      freshCheck ? "✅ WORKS" : "❌ FAILED"
    );

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Recommendation:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("Run: node reset-password.js");
    console.log("This will set a fresh password hash.\n");
  } catch (error) {
    console.error("\n✖ ERROR:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPassword();

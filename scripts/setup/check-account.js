/* eslint-disable no-console */
const {
  PrismaClient,
} = require("./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client");

const prisma = new PrismaClient();

async function checkAccount() {
  try {
    const workspace = await prisma.workspace.findFirst();
    const user = await prisma.user.findFirst();

    console.log("\n=== DATABASE ACCOUNT CHECK ===\n");

    if (workspace) {
      console.log("✓ WORKSPACE EXISTS:");
      console.log("  Name:", workspace.name);
      console.log("  Slug:", workspace.slug);
      console.log("  ID:", workspace.id);
    } else {
      console.log("✗ NO WORKSPACE FOUND");
    }

    console.log("");

    if (user) {
      console.log("✓ USER EXISTS:");
      console.log("  Email:", user.email);
      console.log("  Role:", user.role);
      console.log("  Name:", user.first_name, user.last_name);
      console.log("  Active:", user.is_active);
    } else {
      console.log("✗ NO USER FOUND");
    }

    console.log("\n=============================\n");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccount();

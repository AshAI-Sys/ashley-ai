/**
 * PRODUCTION SEED FILE - NO DEMO DATA
 *
 * This file creates ONLY the essential data needed for production:
 * 1. One workspace (customize the name for your company)
 * 2. One admin user (customize email and password)
 *
 * NO demo clients, orders, or sample data included.
 *
 * Usage:
 * pnpm --filter @ash/database seed-production
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

// Terminal input helper
function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("\n🏭 Ashley AI - Production Database Initialization");
  console.log("================================================\n");
  console.log("⚠️  This will create a PRODUCTION-READY database with NO demo data.\n");

  // Get workspace information
  console.log("📋 Step 1: Workspace Setup");
  console.log("---------------------------");
  const companyName = await askQuestion("Enter your company name (e.g., 'ABC Garments Inc'): ");
  const companySlug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Get admin user information
  console.log("\n👤 Step 2: Admin User Setup");
  console.log("---------------------------");
  const adminEmail = await askQuestion("Enter admin email: ");
  const adminPassword = await askQuestion("Enter admin password (min 8 characters): ");
  const adminFirstName = await askQuestion("Enter admin first name: ");
  const adminLastName = await askQuestion("Enter admin last name: ");

  // Validate inputs
  if (!companyName || !adminEmail || !adminPassword || !adminFirstName || !adminLastName) {
    console.error("\n❌ Error: All fields are required!");
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error("\n❌ Error: Password must be at least 8 characters!");
    process.exit(1);
  }

  if (!adminEmail.includes("@")) {
    console.error("\n❌ Error: Invalid email address!");
    process.exit(1);
  }

  console.log("\n🔒 Hashing password...");
  const passwordHash = await bcrypt.hash(adminPassword, 12); // 12 rounds for production

  console.log("\n🌱 Creating workspace...");
  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: companySlug },
    update: {
      name: companyName,
      is_active: true,
    },
    create: {
      name: companyName,
      slug: companySlug,
      is_active: true,
    },
  });
  console.log("✅ Workspace created:", workspace.name);

  console.log("\n👤 Creating admin user...");
  // Create admin user
  const user = await prisma.user.upsert({
    where: {
      workspace_id_email: {
        workspace_id: workspace.id,
        email: adminEmail.toLowerCase(),
      },
    },
    update: {
      password_hash: passwordHash,
      first_name: adminFirstName,
      last_name: adminLastName,
      role: "admin",
      position: "System Administrator",
      is_active: true,
    },
    create: {
      email: adminEmail.toLowerCase(),
      password_hash: passwordHash,
      first_name: adminFirstName,
      last_name: adminLastName,
      role: "admin",
      workspace_id: workspace.id,
      position: "System Administrator",
      department: "Management",
      is_active: true,
    },
  });
  console.log("✅ Admin user created:", user.email);

  console.log("\n✅ Production database initialized successfully!");
  console.log("\n📝 Login Credentials:");
  console.log("======================");
  console.log(`Email:    ${user.email}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Workspace: ${workspace.name}`);
  console.log("\n⚠️  IMPORTANT: Change your password after first login!");
  console.log("\n🚀 You can now start the application with: pnpm --filter @ash/admin dev");
}

main()
  .catch((e) => {
    console.error("\n❌ Error during database initialization:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

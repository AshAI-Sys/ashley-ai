/**
 * MINIMAL SEED FILE - Development/Testing Only
 *
 * ⚠️  FOR PRODUCTION: Use seed-production.ts instead
 *     pnpm --filter @ash/database seed-production
 *
 * This file creates minimal data for development/testing:
 * - One workspace
 * - One admin user
 * - NO demo clients, orders, or sample data
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🌱 Development Database Seed (Minimal Data Only)");
  console.log("=================================================");
  console.log("⚠️  For production, use: pnpm --filter @ash/database seed-production\n");

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "ashley-ai" },
    update: {},
    create: {
      name: "Ashley AI",
      slug: "ashley-ai",
      is_active: true,
    },
  });
  console.log("✅ Workspace:", workspace.name);

  // Hash password (development default: admin123)
  const passwordHash = await bcrypt.hash("admin123", 12);

  // Create admin user
  const user = await prisma.user.upsert({
    where: {
      workspace_id_email: {
        workspace_id: workspace.id,
        email: "admin@ashleyai.local",
      },
    },
    update: {},
    create: {
      email: "admin@ashleyai.local",
      password_hash: passwordHash,
      first_name: "System",
      last_name: "Administrator",
      role: "admin",
      workspace_id: workspace.id,
      position: "System Administrator",
      department: "Management",
      is_active: true,
    },
  });
  console.log("✅ Admin user:", user.email);

  console.log("\n✅ Database seeded successfully (minimal data)!");
  console.log("\n📝 Development Login:");
  console.log("======================");
  console.log("Email:    admin@ashleyai.local");
  console.log("Password: admin123");
  console.log("\n⚠️  This is for DEVELOPMENT ONLY!");
  console.log("⚠️  For production, run: pnpm --filter @ash/database seed-production");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

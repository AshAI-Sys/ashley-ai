/**
 * Direct Database Seeding Script for Production
 *
 * This script connects directly to your Render PostgreSQL database
 * and creates the admin user without needing to deploy code changes.
 *
 * Usage:
 * 1. Set your DATABASE_URL environment variable
 * 2. Run: node seed-production.js
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://ashley_ai_db_fnky_user:npg_Il0Wxopyjv5n@ep-snowy-firefly-a1wq4mcr-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🌱 Starting production database seed...");
  console.log(
    "📍 Database:",
    DATABASE_URL.split("@")[1]?.split("/")[0] || "unknown"
  );

  try {
    // Create demo workspace
    const workspace = await prisma.workspace.upsert({
      where: { slug: "demo-workspace" },
      update: {},
      create: {
        id: "demo-workspace-1",
        name: "Demo Workspace",
        slug: "demo-workspace",
        is_active: true,
      },
    });
    console.log("✅ Workspace created:", workspace.slug);

    // Hash password for demo user
    const passwordHash = await bcrypt.hash("password123", 10);

    // Create demo user
    const user = await prisma.user.upsert({
      where: {
        workspace_id_email: {
          workspace_id: workspace.id,
          email: "admin@ashleyai.com",
        },
      },
      update: {
        password_hash: passwordHash,
      },
      create: {
        email: "admin@ashleyai.com",
        password_hash: passwordHash,
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        workspace_id: workspace.id,
        position: "System Administrator",
        department: "IT",
        is_active: true,
      },
    });
    console.log("✅ User created:", user.email);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("   Email: admin@ashleyai.com");
    console.log("   Password: password123");
    console.log("\n🌐 Login URL: https://ashley-aiy.onrender.com/login");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

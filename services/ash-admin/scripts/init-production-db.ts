/**
 * Production Database Initialization Script
 *
 * This script creates the initial workspace and admin user for Ashley AI.
 * Run this ONCE during production deployment.
 *
 * Usage:
 *   npx tsx scripts/init-production-db.ts
 *
 * Environment Variables Required:
 *   - DATABASE_URL: PostgreSQL connection string
 *   - ADMIN_EMAIL: Initial admin email
 *   - ADMIN_PASSWORD: Initial admin password (min 8 chars, must be strong)
 *   - WORKSPACE_NAME: Company/workspace name
 *   - WORKSPACE_SLUG: Unique workspace identifier (alphanumeric + hyphens)
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

// Terminal colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 50;
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  try {
    log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
    log("  ASHLEY AI - Production Database Initialization  ", "bold");
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "cyan");

    // Check if workspace already exists
    const existingWorkspace = await prisma.workspace.findFirst();
    if (existingWorkspace) {
      log("⚠️  WARNING: A workspace already exists in the database!", "yellow");
      log(
        `   Existing workspace: ${existingWorkspace.name} (${existingWorkspace.slug})`,
        "yellow"
      );

      const proceed = await promptUser(
        "\n   Do you want to continue? This will create another workspace. (yes/no): "
      );
      if (proceed.toLowerCase() !== "yes") {
        log("\n✖ Operation cancelled.", "red");
        process.exit(0);
      }
    }

    // Get configuration from environment or prompt
    let adminEmail = process.env.ADMIN_EMAIL;
    let adminPassword = process.env.ADMIN_PASSWORD;
    let workspaceName = process.env.WORKSPACE_NAME;
    let workspaceSlug = process.env.WORKSPACE_SLUG;
    let adminFirstName = process.env.ADMIN_FIRST_NAME || "Admin";
    let adminLastName = process.env.ADMIN_LAST_NAME || "User";

    // Interactive mode if env vars not provided
    if (!adminEmail || !adminPassword || !workspaceName || !workspaceSlug) {
      log("📝 Interactive Setup Mode", "cyan");
      log("   (Press Ctrl+C to cancel)\n", "cyan");

      // Workspace information
      if (!workspaceName) {
        workspaceName = await promptUser(
          'Enter workspace name (e.g., "Acme Manufacturing"): '
        );
        while (!workspaceName || workspaceName.length < 3) {
          log("   ✖ Workspace name must be at least 3 characters", "red");
          workspaceName = await promptUser("Enter workspace name: ");
        }
      }

      if (!workspaceSlug) {
        const defaultSlug = workspaceName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        workspaceSlug =
          (await promptUser(
            `Enter workspace slug (default: "${defaultSlug}"): `
          )) || defaultSlug;
        while (!validateSlug(workspaceSlug)) {
          log(
            "   ✖ Slug must be lowercase alphanumeric with hyphens (3-50 chars)",
            "red"
          );
          workspaceSlug = await promptUser("Enter workspace slug: ");
        }
      }

      // Admin user information
      if (!adminEmail) {
        adminEmail = await promptUser("\nEnter admin email: ");
        while (!validateEmail(adminEmail)) {
          log("   ✖ Invalid email format", "red");
          adminEmail = await promptUser("Enter admin email: ");
        }
      }

      if (!adminPassword) {
        adminPassword = await promptUser(
          "Enter admin password (min 8 chars, uppercase, lowercase, number, special): "
        );
        let passwordCheck = validatePassword(adminPassword);
        while (!passwordCheck.valid) {
          log("   ✖ Password validation failed:", "red");
          passwordCheck.errors.forEach(err => log(`      - ${err}`, "red"));
          adminPassword = await promptUser("Enter admin password: ");
          passwordCheck = validatePassword(adminPassword);
        }
      }
    }

    // Validate all inputs
    if (!validateEmail(adminEmail)) {
      throw new Error(`Invalid email format: ${adminEmail}`);
    }

    if (!validateSlug(workspaceSlug)) {
      throw new Error(`Invalid workspace slug: ${workspaceSlug}`);
    }

    const passwordCheck = validatePassword(adminPassword);
    if (!passwordCheck.valid) {
      throw new Error(
        `Password validation failed:\n${passwordCheck.errors.join("\n")}`
      );
    }

    // Check for duplicate slug
    const duplicateWorkspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (duplicateWorkspace) {
      throw new Error(`Workspace with slug "${workspaceSlug}" already exists`);
    }

    // Check for duplicate email
    const duplicateUser = await prisma.user.findFirst({
      where: { email: adminEmail.toLowerCase() },
    });

    if (duplicateUser) {
      throw new Error(`User with email "${adminEmail}" already exists`);
    }

    log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
    log("  Creating Production Database...", "bold");
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "cyan");

    log(`📦 Workspace: ${workspaceName} (${workspaceSlug})`, "cyan");
    log(`👤 Admin: ${adminEmail}\n`, "cyan");

    // Create workspace
    log("⏳ Creating workspace...", "yellow");
    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: workspaceSlug,
        is_active: true,
        settings: JSON.stringify({
          timezone: "Asia/Manila",
          currency: "PHP",
          date_format: "YYYY-MM-DD",
          time_format: "24h",
        }),
      },
    });
    log("✓ Workspace created successfully", "green");

    // Hash password
    log("⏳ Hashing password...", "yellow");
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    log("✓ Password hashed", "green");

    // Create admin user
    log("⏳ Creating admin user...", "yellow");
    const adminUser = await prisma.user.create({
      data: {
        workspace_id: workspace.id,
        email: adminEmail.toLowerCase(),
        password_hash: passwordHash,
        first_name: adminFirstName,
        last_name: adminLastName,
        role: "admin",
        position: "System Administrator",
        department: "Management",
        is_active: true,
        requires_2fa: false,
        two_factor_enabled: false,
        permissions: JSON.stringify(["*"]), // Full permissions
      },
    });
    log("✓ Admin user created successfully", "green");

    log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "green");
    log("  ✓ PRODUCTION DATABASE INITIALIZED SUCCESSFULLY!  ", "bold");
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n", "green");

    log("📋 Summary:", "cyan");
    log(`   Workspace ID: ${workspace.id}`, "cyan");
    log(`   Workspace Name: ${workspace.name}`, "cyan");
    log(`   Workspace Slug: ${workspace.slug}`, "cyan");
    log(`   Admin ID: ${adminUser.id}`, "cyan");
    log(`   Admin Email: ${adminUser.email}`, "cyan");
    log(`   Admin Role: ${adminUser.role}\n`, "cyan");

    log("🔐 Login Credentials:", "yellow");
    log(`   Email: ${adminEmail}`, "yellow");
    log(`   Password: [hidden for security]`, "yellow");
    log("\n⚠️  IMPORTANT: Save these credentials securely!\n", "red");

    log("🚀 Next Steps:", "cyan");
    log("   1. Start your application server", "cyan");
    log("   2. Navigate to the login page", "cyan");
    log("   3. Sign in with the admin credentials", "cyan");
    log("   4. Change your password after first login", "cyan");
    log("   5. Create additional users as needed\n", "cyan");
  } catch (error) {
    log("\n✖ ERROR: Failed to initialize database", "red");
    if (error instanceof Error) {
      log(`   ${error.message}\n`, "red");
    }
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

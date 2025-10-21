import { prisma } from "./services/ash-admin/src/lib/db";

async function checkRegistrationIssue() {
  console.log("🔍 Checking registration issue...\n");

  try {
    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { slug: "reefer" },
    });

    if (workspace) {
      console.log('⚠️  Workspace "reefer" already exists!');
      console.log("   Name:", workspace.name);
      console.log("   Slug:", workspace.slug);
      console.log("   ID:", workspace.id);
      console.log("");
    } else {
      console.log('✅ Workspace "reefer" is available\n');
    }

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: { email: "kelvinmorfe17@gmail.com" },
    });

    if (user) {
      console.log('⚠️  User "kelvinmorfe17@gmail.com" already exists!');
      console.log("   Name:", user.first_name, user.last_name);
      console.log("   Email:", user.email);
      console.log("   Role:", user.role);
      console.log("   Verified:", user.email_verified);
      console.log("");
      console.log("💡 SOLUTION: Either:");
      console.log("   1. Use a different email address");
      console.log('   2. Use a different workspace name (not "Reefer")');
      console.log("   3. Delete this existing user first");
      console.log(
        "   4. Login with existing credentials instead of registering"
      );
      console.log("");
    } else {
      console.log('✅ Email "kelvinmorfe17@gmail.com" is available\n');
    }

    // List all users
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        first_name: true,
        last_name: true,
        role: true,
      },
    });

    console.log("📋 Existing users in database:");
    if (allUsers.length === 0) {
      console.log("   (none)");
    } else {
      allUsers.forEach(u => {
        console.log(
          `   - ${u.email} (${u.first_name} ${u.last_name}) - ${u.role}`
        );
      });
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRegistrationIssue();

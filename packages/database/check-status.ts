import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkStatus() {
  try {
    const users = await prisma.user.count();
    const workspaces = await prisma.workspace.count();

    console.log("\n📊 Database Status:\n");
    console.log(`   Total Users: ${users}`);
    console.log(`   Total Workspaces: ${workspaces}`);

    if (users === 0 && workspaces === 0) {
      console.log("\n✅ Database is EMPTY and READY for new registration!");
    } else {
      console.log("\n📋 Existing Data Found:");

      if (workspaces > 0) {
        const allWorkspaces = await prisma.workspace.findMany({
          select: { name: true, slug: true },
        });
        console.log("\n   Workspaces:");
        allWorkspaces.forEach(ws => {
          console.log(`   - ${ws.name} (${ws.slug})`);
        });
      }

      if (users > 0) {
        const allUsers = await prisma.user.findMany({
          select: { email: true, first_name: true, last_name: true },
        });
        console.log("\n   Users:");
        allUsers.forEach(u => {
          console.log(`   - ${u.email} (${u.first_name} ${u.last_name})`);
        });
      }
    }

    console.log("");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStatus();

// Quick script to create demo workspace
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Creating demo workspace...");

  // Check if workspace exists
  const existing = await prisma.workspace.findUnique({
    where: { id: "demo-workspace-1" },
  });

  if (existing) {
    console.log("✅ Demo workspace already exists");
    return;
  }

  // Create demo workspace
  const workspace = await prisma.workspace.create({
    data: {
      id: "demo-workspace-1",
      name: "Demo Workspace",
      slug: "demo-workspace",
      is_active: true,
    },
  });

  console.log("✅ Created demo workspace:", workspace);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

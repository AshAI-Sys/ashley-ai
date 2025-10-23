import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const workspaces = await prisma.workspace.findMany();
  console.log("Workspaces:", workspaces);
  
  const user = await prisma.user.findUnique({
    where: { email: "kelvinmorfe17@gmail.com" }
  });
  console.log("\nUser workspace_id:", user?.workspace_id);
}
main().finally(() => prisma.$disconnect());

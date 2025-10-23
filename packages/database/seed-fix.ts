import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Fixing seed data for correct workspace...");
  
  // Get the actual workspace
  const workspace = await prisma.workspace.findFirst({
    where: { slug: "ashley-ai" }
  });
  
  if (!workspace) {
    console.log("❌ Workspace not found!");
    return;
  }
  
  console.log(`✅ Found workspace: ${workspace.name} (${workspace.id})`);

  // Delete existing seed data for this workspace
  console.log("🗑️  Deleting existing seed data...");
  await prisma.employee.deleteMany({
    where: { workspace_id: workspace.id }
  });
  await prisma.order.deleteMany({
    where: { workspace_id: workspace.id }
  });
  await prisma.client.deleteMany({
    where: { workspace_id: workspace.id }
  });
  console.log("✅ Existing data deleted");

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        workspace_id: workspace.id,
        name: "Nike Philippines",
        contact_person: "Juan Dela Cruz",
        email: "juan@nike.ph",
        phone: "+63 917 123 4567",
        address: "BGC, Taguig City",
        is_active: true,
      },
    }),
    prisma.client.create({
      data: {
        workspace_id: workspace.id,
        name: "Adidas Sports",
        contact_person: "Maria Santos",
        email: "maria@adidas.ph",
        phone: "+63 917 234 5678",
        address: "Makati City",
        is_active: true,
      },
    }),
    prisma.client.create({
      data: {
        workspace_id: workspace.id,
        name: "Uniqlo Fashion",
        contact_person: "Pedro Garcia",
        email: "pedro@uniqlo.ph",
        phone: "+63 917 345 6789",
        address: "Bonifacio Global City",
        is_active: true,
      },
    }),
  ]);
  
  console.log(`✅ Created ${clients.length} clients`);
  
  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        workspace_id: workspace.id,
        client_id: clients[0].id,
        order_number: "ORD-2024-001",
        status: "confirmed",
        total_amount: 150000,
        currency: "PHP",
        delivery_date: new Date("2024-12-31"),
      },
    }),
    prisma.order.create({
      data: {
        workspace_id: workspace.id,
        client_id: clients[0].id,
        order_number: "ORD-2024-002",
        status: "in_production",
        total_amount: 250000,
        currency: "PHP",
        delivery_date: new Date("2025-01-15"),
      },
    }),
    prisma.order.create({
      data: {
        workspace_id: workspace.id,
        client_id: clients[1].id,
        order_number: "ORD-2024-003",
        status: "pending_approval",
        total_amount: 180000,
        currency: "PHP",
        delivery_date: new Date("2025-01-20"),
      },
    }),
    prisma.order.create({
      data: {
        workspace_id: workspace.id,
        client_id: clients[1].id,
        order_number: "ORD-2024-004",
        status: "completed",
        total_amount: 320000,
        currency: "PHP",
        delivery_date: new Date("2024-11-30"),
      },
    }),
    prisma.order.create({
      data: {
        workspace_id: workspace.id,
        client_id: clients[2].id,
        order_number: "ORD-2024-005",
        status: "draft",
        total_amount: 95000,
        currency: "PHP",
        delivery_date: new Date("2025-02-01"),
      },
    }),
  ]);
  
  console.log(`✅ Created ${orders.length} orders`);

  // Hash password for employees
  const passwordHash = await bcrypt.hash("password123", 12);

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        workspace_id: workspace.id,
        employee_number: "EMP-001",
        first_name: "Anna",
        last_name: "Reyes",
        email: "anna.reyes@ashley.ai",
        password_hash: passwordHash,
        department: "Cutting",
        position: "Cutting Supervisor",
        hire_date: new Date("2024-01-15"),
        salary_type: "MONTHLY",
        base_salary: 25000,
        is_active: true,
      },
    }),
    prisma.employee.create({
      data: {
        workspace_id: workspace.id,
        employee_number: "EMP-002",
        first_name: "Carlos",
        last_name: "Mendoza",
        email: "carlos.mendoza@ashley.ai",
        password_hash: passwordHash,
        department: "Printing",
        position: "Printing Operator",
        hire_date: new Date("2024-02-01"),
        salary_type: "DAILY",
        base_salary: 750,
        is_active: true,
      },
    }),
    prisma.employee.create({
      data: {
        workspace_id: workspace.id,
        employee_number: "EMP-003",
        first_name: "Diana",
        last_name: "Cruz",
        email: "diana.cruz@ashley.ai",
        password_hash: passwordHash,
        department: "Sewing",
        position: "Sewing Operator",
        hire_date: new Date("2024-03-10"),
        salary_type: "PIECE",
        base_salary: 0,
        piece_rate: 15,
        is_active: true,
      },
    }),
    prisma.employee.create({
      data: {
        workspace_id: workspace.id,
        employee_number: "EMP-004",
        first_name: "Eduardo",
        last_name: "Lopez",
        email: "eduardo.lopez@ashley.ai",
        password_hash: passwordHash,
        department: "Quality Control",
        position: "QC Inspector",
        hire_date: new Date("2024-04-05"),
        salary_type: "MONTHLY",
        base_salary: 22000,
        is_active: true,
      },
    }),
    prisma.employee.create({
      data: {
        workspace_id: workspace.id,
        employee_number: "EMP-005",
        first_name: "Fe",
        last_name: "Santos",
        email: "fe.santos@ashley.ai",
        password_hash: passwordHash,
        department: "HR",
        position: "HR Manager",
        hire_date: new Date("2024-01-20"),
        salary_type: "MONTHLY",
        base_salary: 35000,
        is_active: true,
      },
    }),
  ]);
  
  console.log(`✅ Created ${employees.length} employees`);
  
  console.log("\n🎉 Seed data fixed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   Workspace: ${workspace.name}`);
  console.log(`   Clients: ${clients.length}`);
  console.log(`   Orders: ${orders.length}`);
  console.log(`   Employees: ${employees.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

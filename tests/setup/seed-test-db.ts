/**
 * Test Database Seeding Script
 *
 * Seeds the test database with realistic data for testing
 * Run with: npx tsx tests/setup/seed-test-db.ts
 */

import { PrismaClient } from "@ash-ai/database";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

async function seedTestDatabase() {
  console.log("🌱 Seeding test database...");

  try {
    // Clean existing data
    console.log("🧹 Cleaning existing data...");
    await prisma.$transaction([
      prisma.orderActivityLog.deleteMany(),
      prisma.orderFile.deleteMany(),
      prisma.printLocation.deleteMany(),
      prisma.colorVariant.deleteMany(),
      prisma.garmentAddon.deleteMany(),
      prisma.order.deleteMany(),
      prisma.brand.deleteMany(),
      prisma.client.deleteMany(),
      prisma.attendanceLog.deleteMany(),
      prisma.employee.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    // Create test users
    console.log("👤 Creating test users...");
    const adminPassword = await bcrypt.hash("password123", 10);
    const managerPassword = await bcrypt.hash("password123", 10);
    const operatorPassword = await bcrypt.hash("password123", 10);

    const adminUser = await prisma.user.create({
      data: {
        email: "admin@ashleyai.com",
        password_hash: adminPassword,
        first_name: "Admin",
        last_name: "User",
        role: "ADMIN",
        is_active: true,
        position: "System Administrator",
        department: "IT",
      },
    });

    const managerUser = await prisma.user.create({
      data: {
        email: "manager@ashleyai.com",
        password_hash: managerPassword,
        first_name: "Manager",
        last_name: "User",
        role: "MANAGER",
        is_active: true,
        position: "Production Manager",
        department: "Production",
      },
    });

    const operatorUser = await prisma.user.create({
      data: {
        email: "operator@ashleyai.com",
        password_hash: operatorPassword,
        first_name: "Operator",
        last_name: "User",
        role: "OPERATOR",
        is_active: true,
        position: "Machine Operator",
        department: "Production",
      },
    });

    console.log(`✅ Created ${3} test users`);

    // Create test employees
    console.log("👥 Creating test employees...");
    const employees = await Promise.all([
      prisma.employee.create({
        data: {
          employee_number: "EMP-001",
          first_name: "John",
          last_name: "Doe",
          position: "Sewing Operator",
          department: "Production",
          salary_type: "PIECE",
          piece_rate: 15.0,
          is_active: true,
          hire_date: new Date("2024-01-15"),
        },
      }),
      prisma.employee.create({
        data: {
          employee_number: "EMP-002",
          first_name: "Jane",
          last_name: "Smith",
          position: "Quality Inspector",
          department: "Quality Control",
          salary_type: "HOURLY",
          hourly_rate: 18.5,
          is_active: true,
          hire_date: new Date("2024-02-01"),
        },
      }),
      prisma.employee.create({
        data: {
          employee_number: "EMP-003",
          first_name: "Mike",
          last_name: "Johnson",
          position: "Cutting Operator",
          department: "Production",
          salary_type: "DAILY",
          daily_rate: 150.0,
          is_active: true,
          hire_date: new Date("2024-03-10"),
        },
      }),
    ]);

    console.log(`✅ Created ${employees.length} test employees`);

    // Create test clients
    console.log("🏢 Creating test clients...");
    const client1 = await prisma.client.create({
      data: {
        name: "Test Client Inc.",
        contact_person: "John Client",
        email: "john@testclient.com",
        phone: "+1-555-0101",
        address: "123 Test Street, Test City, TC 12345",
      },
    });

    const client2 = await prisma.client.create({
      data: {
        name: "Sample Company Ltd.",
        contact_person: "Jane Sample",
        email: "jane@sampleco.com",
        phone: "+1-555-0102",
        address: "456 Sample Ave, Sample Town, ST 67890",
      },
    });

    console.log(`✅ Created ${2} test clients`);

    // Create test brands
    console.log("🏷️  Creating test brands...");
    const brand1 = await prisma.brand.create({
      data: {
        client_id: client1.id,
        name: "TestBrand Premium",
        description: "Premium test brand for quality testing",
      },
    });

    const brand2 = await prisma.brand.create({
      data: {
        client_id: client2.id,
        name: "SampleWear",
        description: "Sample brand for testing workflows",
      },
    });

    console.log(`✅ Created ${2} test brands`);

    // Create test orders
    console.log("📦 Creating test orders...");
    const orders = await Promise.all([
      // Order 1: PENDING
      prisma.order.create({
        data: {
          order_number: "ORD-TEST-001",
          client_id: client1.id,
          brand_id: brand1.id,
          description: "Test Order - Cotton T-Shirts",
          quantity: 1000,
          status: "PENDING",
          priority: "NORMAL",
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          po_number: "PO-2024-001",
          order_type: "NEW",
          design_name: "Summer Collection 2024",
          fabric_type: "COTTON_JERSEY",
          size_distribution: "BOXTYPE",
        },
      }),
      // Order 2: IN_PROGRESS
      prisma.order.create({
        data: {
          order_number: "ORD-TEST-002",
          client_id: client2.id,
          brand_id: brand2.id,
          description: "Test Order - Polyester Hoodies",
          quantity: 500,
          status: "IN_PROGRESS",
          priority: "HIGH",
          due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          po_number: "PO-2024-002",
          order_type: "REORDER",
          design_name: "Winter Warmth Series",
          fabric_type: "POLYESTER",
          size_distribution: "OVERSIZED",
        },
      }),
      // Order 3: COMPLETED
      prisma.order.create({
        data: {
          order_number: "ORD-TEST-003",
          client_id: client1.id,
          brand_id: brand1.id,
          description: "Test Order - Tank Tops",
          quantity: 750,
          status: "COMPLETED",
          priority: "NORMAL",
          due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          po_number: "PO-2024-003",
          order_type: "NEW",
          design_name: "Athletic Pro Line",
          fabric_type: "POLYESTER_BLEND",
          size_distribution: "BOXTYPE",
        },
      }),
      // Order 4: URGENT
      prisma.order.create({
        data: {
          order_number: "ORD-TEST-004",
          client_id: client2.id,
          brand_id: brand2.id,
          description: "Test Order - Urgent Rush Order",
          quantity: 200,
          status: "PENDING",
          priority: "URGENT",
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          po_number: "PO-2024-004",
          order_type: "NEW",
          design_name: "Rush Collection",
          fabric_type: "COTTON_BLEND",
          size_distribution: "OVERSIZED",
        },
      }),
    ]);

    console.log(`✅ Created ${orders.length} test orders`);

    // Create color variants for orders
    console.log("🎨 Creating color variants...");
    const colorVariants = await Promise.all([
      prisma.colorVariant.create({
        data: {
          order_id: orders[0].id,
          color_name: "Black",
          percentage: 40,
        },
      }),
      prisma.colorVariant.create({
        data: {
          order_id: orders[0].id,
          color_name: "White",
          percentage: 35,
        },
      }),
      prisma.colorVariant.create({
        data: {
          order_id: orders[0].id,
          color_name: "Navy Blue",
          percentage: 25,
        },
      }),
      prisma.colorVariant.create({
        data: {
          order_id: orders[1].id,
          color_name: "Grey",
          percentage: 60,
        },
      }),
      prisma.colorVariant.create({
        data: {
          order_id: orders[1].id,
          color_name: "Maroon",
          percentage: 40,
        },
      }),
    ]);

    console.log(`✅ Created ${colorVariants.length} color variants`);

    // Create attendance logs
    console.log("📅 Creating attendance logs...");
    const today = new Date();
    const attendanceLogs = await Promise.all([
      prisma.attendanceLog.create({
        data: {
          employee_id: employees[0].id,
          date: today.toISOString().split("T")[0],
          time_in: "08:00:00",
          time_out: "17:00:00",
          break_minutes: 60,
          regular_hours: 8.0,
          overtime_hours: 0,
          status: "PRESENT",
        },
      }),
      prisma.attendanceLog.create({
        data: {
          employee_id: employees[1].id,
          date: today.toISOString().split("T")[0],
          time_in: "08:30:00",
          time_out: "18:00:00",
          break_minutes: 60,
          regular_hours: 8.0,
          overtime_hours: 1.5,
          status: "PRESENT",
        },
      }),
      prisma.attendanceLog.create({
        data: {
          employee_id: employees[2].id,
          date: today.toISOString().split("T")[0],
          time_in: "08:00:00",
          time_out: "17:00:00",
          break_minutes: 60,
          regular_hours: 8.0,
          overtime_hours: 0,
          status: "PRESENT",
        },
      }),
    ]);

    console.log(`✅ Created ${attendanceLogs.length} attendance logs`);

    console.log("\n✨ Test database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Users: 3`);
    console.log(`   Employees: ${employees.length}`);
    console.log(`   Clients: 2`);
    console.log(`   Brands: 2`);
    console.log(`   Orders: ${orders.length}`);
    console.log(`   Color Variants: ${colorVariants.length}`);
    console.log(`   Attendance Logs: ${attendanceLogs.length}`);

    return {
      users: [adminUser, managerUser, operatorUser],
      employees,
      clients: [client1, client2],
      brands: [brand1, brand2],
      orders,
      colorVariants,
      attendanceLogs,
    };
  } catch (error) {
    console.error("❌ Error seeding test database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedTestDatabase()
    .then(() => {
      console.log("\n✅ Seeding completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("\n❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedTestDatabase };

// Finance Data Seeder
// Adds invoices, payments, and bills to existing orders

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("💰 Seeding finance data...\n");

  // Get workspace and existing orders
  const workspace = await prisma.workspace.findFirst({
    where: { slug: "demo-workspace" },
  });

  if (!workspace) {
    throw new Error("Workspace not found. Run seed-comprehensive.ts first.");
  }

  const orders = await prisma.order.findMany({
    where: { workspace_id: workspace.id },
    include: { client: true, brand: true, line_items: true },
    take: 10,
  });

  if (orders.length === 0) {
    console.log("⚠️  No orders found. Please run seed-comprehensive.ts first.");
    return;
  }

  console.log(`Found ${orders.length} orders to create invoices for\n`);

  // Delete existing finance data to avoid duplicates
  await prisma.payment.deleteMany({ where: { workspace_id: workspace.id } });
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({ where: { workspace_id: workspace.id } });
  await prisma.expense.deleteMany({ where: { workspace_id: workspace.id } });
  console.log("✅ Cleared existing finance data\n");

  // Create invoices for orders
  let invoiceCount = 0;
  let paymentCount = 0;

  for (const order of orders) {
    const invoiceDate = new Date(order.created_at);
    invoiceDate.setDate(invoiceDate.getDate() + 5); // Invoice 5 days after order

    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

    // Determine invoice status based on order status
    let invoiceStatus:
      | "DRAFT"
      | "SENT"
      | "PAID"
      | "PARTIAL"
      | "OVERDUE"
      | "CANCELLED" = "DRAFT";
    let paidAmount = 0;

    if (order.status === "COMPLETED" || order.status === "DELIVERED") {
      invoiceStatus = Math.random() > 0.5 ? "PAID" : "PARTIAL";
      paidAmount =
        invoiceStatus === "PAID"
          ? order.total_amount
          : order.total_amount * 0.5;
    } else if (
      order.status === "IN_PRODUCTION" ||
      order.status === "QC_PASSED"
    ) {
      invoiceStatus = "SENT";
    } else if (order.status === "CANCELLED") {
      invoiceStatus = "CANCELLED";
    }

    // Check if overdue
    if (invoiceStatus === "SENT" && dueDate < new Date()) {
      invoiceStatus = "OVERDUE";
    }

    // Create invoice
    const invoiceNumber = `INV-2025-${String(invoiceCount + 1).padStart(4, "0")}`;
    const invoice = await prisma.invoice.create({
      data: {
        workspace_id: workspace.id,
        client_id: order.client_id,
        order_id: order.id,
        invoice_number: invoiceNumber,
        status: invoiceStatus.toLowerCase(),
        issue_date: invoiceDate,
        due_date: dueDate,
        subtotal: order.total_amount,
        tax_amount: order.total_amount * 0.12, // 12% VAT
        total_amount: order.total_amount * 1.12,
        currency: order.currency,
        payment_terms: 30, // 30 days as integer
        notes: `Invoice for Order ${order.order_number}`,
        metadata: JSON.stringify({
          order_number: order.order_number,
          client_name: order.client?.name,
          brand_name: order.brand?.name,
          amount_paid: paidAmount * 1.12,
          balance: (order.total_amount - paidAmount) * 1.12,
        }),
      },
    });

    // Create invoice items from order line items
    if (order.line_items && order.line_items.length > 0) {
      for (const lineItem of order.line_items) {
        await prisma.invoiceItem.create({
          data: {
            invoice_id: invoice.id,
            description:
              lineItem.description ||
              `${lineItem.garment_type} - ${lineItem.printing_method}`,
            quantity: lineItem.quantity,
            unit_price: lineItem.unit_price,
            line_total: lineItem.total_price,
          },
        });
      }
    } else {
      // Create a single invoice item if no line items
      await prisma.invoiceItem.create({
        data: {
          invoice_id: invoice.id,
          description: `Order ${order.order_number}`,
          quantity: 1,
          unit_price: order.total_amount,
          line_total: order.total_amount,
        },
      });
    }

    invoiceCount++;

    // Create payment if invoice is paid or partial
    if (invoiceStatus === "PAID" || invoiceStatus === "PARTIAL") {
      const paymentDate = new Date(invoiceDate);
      paymentDate.setDate(
        paymentDate.getDate() + (invoiceStatus === "PAID" ? 15 : 10)
      );

      const payment = await prisma.payment.create({
        data: {
          workspace_id: workspace.id,
          invoice_id: invoice.id,
          payment_number: `PAY-2025-${String(paymentCount + 1).padStart(4, "0")}`,
          amount: paidAmount * 1.12,
          payment_date: paymentDate,
          payment_method: ["BANK_TRANSFER", "CHECK", "CASH", "CARD"][
            Math.floor(Math.random() * 4)
          ],
          status: "completed",
          reference: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          currency: order.currency,
          notes: `Payment for Invoice ${invoiceNumber}`,
          metadata: JSON.stringify({
            invoice_no: invoiceNumber,
            order_number: order.order_number,
          }),
        },
      });

      paymentCount++;
    }
  }

  console.log(`✅ Created ${invoiceCount} invoices`);
  console.log(`✅ Created ${paymentCount} payments\n`);

  // Create some expenses
  console.log("💸 Creating expenses...");

  const expenseTypes = [
    {
      description: "Office Rent - January 2025",
      amount: 25000,
      category: "RENT",
    },
    { description: "Electricity Bill", amount: 8500, category: "UTILITIES" },
    {
      description: "Internet & Phone Services",
      amount: 3200,
      category: "UTILITIES",
    },
    {
      description: "Fabric Purchase - Cotton",
      amount: 125000,
      category: "MATERIALS",
    },
    { description: "Printing Supplies", amount: 18000, category: "OFFICE" },
    {
      description: "Employee Salaries - Production",
      amount: 95000,
      category: "LABOR",
    },
    {
      description: "Delivery Service - J&T",
      amount: 12500,
      category: "MARKETING",
    },
    {
      description: "Equipment Maintenance",
      amount: 7800,
      category: "UTILITIES",
    },
  ];

  let expenseCount = 0;
  for (const expenseData of expenseTypes) {
    const expenseDate = new Date();
    expenseDate.setDate(expenseDate.getDate() - Math.floor(Math.random() * 30));

    const approved = Math.random() > 0.3;

    await prisma.expense.create({
      data: {
        workspace_id: workspace.id,
        expense_number: `EXP-2025-${String(expenseCount + 1).padStart(4, "0")}`,
        description: expenseData.description,
        amount: expenseData.amount,
        expense_date: expenseDate,
        category: expenseData.category,
        payment_method: ["BANK_TRANSFER", "CHECK", "CASH"][
          Math.floor(Math.random() * 3)
        ],
        approved: approved,
        currency: "PHP",
        supplier: "Various Vendors",
      },
    });

    expenseCount++;
  }

  console.log(`✅ Created ${expenseCount} expenses\n`);

  console.log("💰 Finance data seeding complete!");
}

main()
  .catch(e => {
    console.error("❌ Error seeding finance data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

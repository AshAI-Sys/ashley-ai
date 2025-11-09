/* eslint-disable */
import { NextRequest} from "next/server";
import { prisma } from "@/lib/db";
import {
  createSuccessResponse,
  validateRequiredFields,
  validateEnum,
  validateNumber,
  validateDate,
  NotFoundError,
  withErrorHandling,
  ValidationError,
} from "../../../../lib/error-handling";
import { requireAnyPermission } from "../../../../lib/auth-middleware";
import { requireAuth } from "@/lib/auth-middleware";
import { withAudit } from "@/lib/audit-middleware";
import { syncAfterChange } from "@/lib/google-sheets-auto-sync";

export const dynamic = 'force-dynamic';


export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const client_id = searchParams.get("client_id");
  const brand_id = searchParams.get("brand_id");
  const overdue_only = searchParams.get("overdue_only");

  const where: any = {};
  if (status && status !== "all") where.status = status;
  if (client_id) where.client_id = client_id;
  if (brand_id) where.brand_id = brand_id;

  // For overdue invoices
  if (overdue_only === "true") {
    where.due_date = { lt: new Date() };
    where.status = { in: ["sent", "pending"] };
  }

  const invoices = await prisma.invoice.findMany({
    where,
    take: 100, // Limit to 100 invoices
    include: {
      client: { select: { name: true } },
      order: { select: { order_number: true } },
      invoice_items: true,
      payments: {
        select: {
          id: true,
          amount: true,
          payment_method: true,
          payment_date: true,
          created_at: true,
        },
      },
    },
    orderBy: { issue_date: "desc" },
      });

  // Calculate days overdue and other metrics
  const processedInvoices = (invoices || []).map((invoice: any) => {
    const today = new Date();
    const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;
    const daysOverdue =
      dueDate && invoice.status !== "paid" && dueDate < today
        ? Math.ceil(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        : null;

    // Calculate balance from payments
    const totalPaid = invoice.payments.reduce(
      (sum: any, payment: any) => sum + payment.amount,
      0
    );
    const balance = invoice.total_amount - totalPaid;

    return {
      id: invoice.id,
      invoice_no: invoice.invoice_number,
      client: invoice.client,
      brand: null, // No brand relation in current schema
      total: invoice.total_amount,
      balance: balance,
      status:
        dueDate && dueDate < today && balance > 0
          ? "OVERDUE"
          : balance === 0
            ? "PAID"
            : invoice.status.toUpperCase(),
      date_issued: invoice.issue_date,
      due_date: invoice.due_date,
      days_overdue: daysOverdue,
      payment_history: invoice.payments.map((payment: any) => ({
        amount: Number(payment.amount),
        source: payment.payment_method || "UNKNOWN",
        date: payment.created_at,
      })),
    };
  });

  return createSuccessResponse(processedInvoices);
});

export const POST = requireAnyPermission(["finance:create"])(
  withAudit(
    withErrorHandling(async (request: NextRequest, _user: any) => {
    const data = await request.json();
    const { brand_id,
      client_id,
      order_id,
      lines,
      discount = 0,
      tax_mode = "VAT_INCLUSIVE",
      due_date,
    } = data;

    // Validate required fields
    const validationError = validateRequiredFields(data, [
      "brand_id",
      "client_id",
      "lines",
    ]);
    if (validationError) {
      throw validationError;
    }

  // Validate tax mode enum
    const taxModeError = validateEnum(
      tax_mode,
      ["VAT_INCLUSIVE", "VAT_EXCLUSIVE", "ZERO_RATED"],
      "tax_mode"
    );
    if (taxModeError) {
      throw taxModeError;
    }

  // Validate discount percentage
    if (discount < 0 || discount > 100) {
      throw new ValidationError(
        "Discount must be between 0 and 100",
        "discount"
      );
    }

    // Validate lines array
    if (!Array.isArray(lines) || lines.length === 0) {
      throw new ValidationError(
        "At least one invoice line is required",
        "lines"
      );
    }

    // Validate each line item
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineError = validateRequiredFields(line, [
        "description",
        "qty",
        "unit_price",
      ]);
      if (lineError) {
        throw new ValidationError(
          `Line ${i + 1}: ${lineError.message}`,
          `lines[${i}]`
        );
      }

      const qtyError = validateNumber(line.qty, `lines[${i}].qty`, 0.01);
      if (qtyError) {
        throw qtyError;
      }

      const priceError = validateNumber(
        line.unit_price,
        `lines[${i}].unit_price`,
        0
      );
      if (priceError) {
        throw priceError;
      }
    }

    // Validate due date if provided
    if (due_date) {
      const dateError = validateDate(due_date, "due_date");
      if (dateError) {
        throw dateError;
      }
    }

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id: client_id }});
    if (!client) {
      throw new NotFoundError("Client");
    }

    // Verify order exists if provided
    if (order_id) {
      const order = await prisma.order.findUnique({ where: { id: order_id }});
      if (!order) {
        throw new NotFoundError("Order");
      }
    }

    // Generate invoice number
    const year = new Date().getFullYear();
    const invoiceCount = await prisma.invoice.count({
      where: {
        workspace_id: "default",
        issue_date: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });
    const invoiceNo = `INV-${year}-${String(invoiceCount + 1).padStart(5, "0")}`;

    // Calculate totals
    let subtotal = 0;
    const processedLines = lines.map((line: any) => {
      const lineTotal = line.qty * line.unit_price;
      subtotal += lineTotal;
      return {
        ...line,
        line_total: lineTotal,
      };
    });

    const discountAmount = (subtotal * discount) / 100;
    const netAmount = subtotal - discountAmount;

    let vatAmount = 0;
    let total = netAmount;

    if (tax_mode === "VAT_INCLUSIVE") {
      vatAmount = (netAmount * 0.12) / 1.12;
      total = netAmount;
    } else if (tax_mode === "VAT_EXCLUSIVE") {
      vatAmount = netAmount * 0.12;
      total = netAmount + vatAmount;
    }

    // Create invoice with transaction
    const invoice = await prisma.invoice.create({
      data: {
        workspace_id: "default",
        client_id,
        order_id,
        invoice_number: invoiceNo,
        issue_date: new Date(),
        due_date: due_date ? new Date(due_date) : null,
        status: "draft",
        subtotal,
        discount_amount: discountAmount,
        tax_amount: vatAmount,
        total_amount: total,
        currency: "PHP",
        invoice_items: {
          create: processedLines.map((line: any) => ({
            description: line.description,
            quantity: line.qty,
            unit_price: line.unit_price,
            tax_rate: 0.12,
            line_total: line.line_total,
          })),
        },
      },
      include: {
        client: { select: { name: true } },
        invoice_items: true,
      },
    });

    // Trigger auto-sync to Google Sheets (non-blocking)
    await syncAfterChange("default", 'finance');

    return createSuccessResponse(invoice, 201);
    }),
    { resource: "invoice", action: "CREATE" }
  )
);

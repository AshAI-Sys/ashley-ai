"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const error_handling_1 = require("../../../../lib/error-handling");
const auth_middleware_1 = require("../../../../lib/auth-middleware");
exports.GET = (0, error_handling_1.withErrorHandling)(async (request) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const client_id = searchParams.get("client_id");
    const brand_id = searchParams.get("brand_id");
    const overdue_only = searchParams.get("overdue_only");
    const where = {};
    if (status && status !== "all")
        where.status = status;
    if (client_id)
        where.client_id = client_id;
    if (brand_id)
        where.brand_id = brand_id;
    // For overdue invoices
    if (overdue_only === "true") {
        where.due_date = { lt: new Date() };
        where.status = { in: ["sent", "pending"] };
    }
    const invoices = await db_1.prisma.invoice.findMany({
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
    const processedInvoices = (invoices || []).map(invoice => {
        const today = new Date();
        const dueDate = invoice.due_date ? new Date(invoice.due_date) : null;
        const daysOverdue = dueDate && invoice.status !== "paid" && dueDate < today
            ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            : null;
        // Calculate balance from payments
        const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const balance = invoice.total_amount - totalPaid;
        return {
            id: invoice.id,
            invoice_no: invoice.invoice_number,
            client: invoice.client,
            brand: null, // No brand relation in current schema
            total: invoice.total_amount,
            balance: balance,
            status: dueDate && dueDate < today && balance > 0
                ? "OVERDUE"
                : balance === 0
                    ? "PAID"
                    : invoice.status.toUpperCase(),
            date_issued: invoice.issue_date,
            due_date: invoice.due_date,
            days_overdue: daysOverdue,
            payment_history: invoice.payments.map(payment => ({
                amount: Number(payment.amount),
                source: payment.payment_method || "UNKNOWN",
                date: payment.created_at,
            })),
        };
    });
    return (0, error_handling_1.createSuccessResponse)(processedInvoices);
});
exports.POST = (0, auth_middleware_1.requireAnyPermission)(["finance:create"])((0, error_handling_1.withErrorHandling)(async (request, user) => {
    const data = await request.json();
    const { brand_id, client_id, order_id, lines, discount = 0, tax_mode = "VAT_INCLUSIVE", due_date, } = data;
    // Validate required fields
    const validationError = (0, error_handling_1.validateRequiredFields)(data, [
        "brand_id",
        "client_id",
        "lines",
    ]);
    if (validationError) {
        throw validationError;
    }
    // Validate tax mode enum
    const taxModeError = (0, error_handling_1.validateEnum)(tax_mode, ["VAT_INCLUSIVE", "VAT_EXCLUSIVE", "ZERO_RATED"], "tax_mode");
    if (taxModeError) {
        throw taxModeError;
    }
    // Validate discount percentage
    if (discount < 0 || discount > 100) {
        throw new error_handling_1.ValidationError("Discount must be between 0 and 100", "discount");
    }
    // Validate lines array
    if (!Array.isArray(lines) || lines.length === 0) {
        throw new error_handling_1.ValidationError("At least one invoice line is required", "lines");
    }
    // Validate each line item
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineError = (0, error_handling_1.validateRequiredFields)(line, [
            "description",
            "qty",
            "unit_price",
        ]);
        if (lineError) {
            throw new error_handling_1.ValidationError(`Line ${i + 1}: ${lineError.message}`, `lines[${i}]`);
        }
        const qtyError = (0, error_handling_1.validateNumber)(line.qty, `lines[${i}].qty`, 0.01);
        if (qtyError) {
            throw qtyError;
        }
        const priceError = (0, error_handling_1.validateNumber)(line.unit_price, `lines[${i}].unit_price`, 0);
        if (priceError) {
            throw priceError;
        }
    }
    // Validate due date if provided
    if (due_date) {
        const dateError = (0, error_handling_1.validateDate)(due_date, "due_date");
        if (dateError) {
            throw dateError;
        }
    }
    // Verify client exists
    const client = await db_1.prisma.client.findUnique({ where: { id: client_id } });
    if (!client) {
        throw new error_handling_1.NotFoundError("Client");
    }
    // Verify order exists if provided
    if (order_id) {
        const order = await db_1.prisma.order.findUnique({ where: { id: order_id } });
        if (!order) {
            throw new error_handling_1.NotFoundError("Order");
        }
        // Generate invoice number
        const year = new Date().getFullYear();
        const invoiceCount = await db_1.prisma.invoice.count({
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
        const processedLines = lines.map((line) => {
            const lineTotal = line.qty * line.unit_price;
            subtotal += lineTotal;
            return {
                ...line,
                line_total: lineTotal,
            };
            const discountAmount = (subtotal * discount) / 100;
            const netAmount = subtotal - discountAmount;
            let vatAmount = 0;
            let total = netAmount;
            if (tax_mode === "VAT_INCLUSIVE") {
                vatAmount = (netAmount * 0.12) / 1.12;
                total = netAmount;
            }
            else if (tax_mode === "VAT_EXCLUSIVE") {
                vatAmount = netAmount * 0.12;
                total = netAmount + vatAmount;
            }
            // Create invoice with transaction
            const invoice = await db_1.prisma.invoice.create({
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
                        create: processedLines.map((line) => ({
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
            return (0, error_handling_1.createSuccessResponse)(invoice, 201);
        });
        try { }
        catch (error) {
            if (error instanceof error_handling_1.ValidationError) {
                return server_1.NextResponse.json({ success: false, error: error.message, field: error.field }, { status: 400 });
            }
            console.error("Error creating invoice:", error);
            return server_1.NextResponse.json({ success: false, error: "Failed to create invoice" }, { status: 500 });
        }
    }
}));

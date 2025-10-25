"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const { searchParams } = new URL(request.url);
        const invoice_id = searchParams.get("invoice_id");
        const payment_method = searchParams.get("payment_method");
        const date_from = searchParams.get("date_from");
        const date_to = searchParams.get("date_to");
        const where = {};
        if (invoice_id)
            where.invoice_id = invoice_id;
        if (payment_method && payment_method !== "all")
            where.payment_method = payment_method;
        if (date_from || date_to) {
            where.payment_date = {};
            if (date_from)
                where.payment_date.gte = new Date(date_from);
            if (date_to)
                where.payment_date.lte = new Date(date_to);
        }
        const payments = await db_1.prisma.payment.findMany({
            where,
            include: {
                invoice: {
                    select: {
                        invoice_number: true,
                        total_amount: true,
                        client: { select: { name: true } },
                    },
                },
            },
            orderBy: { payment_date: "desc" },
        });
        return server_1.NextResponse.json({
            success: true,
            data: payments,
        });
    }
    catch (error) {
        console.error("Error fetching payments:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to fetch payments" }, { status: 500 });
    }
});
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const data = await request.json();
        const { invoice_id, payment_method, amount, reference, payment_date } = data;
        if (!invoice_id) {
            return server_1.NextResponse.json({ success: false, error: "Invoice ID is required" }, { status: 400 });
        }
        // Get invoice to verify
        const invoice = await db_1.prisma.invoice.findUnique({
            where: { id: invoice_id },
            select: {
                total_amount: true,
                status: true,
                workspace_id: true,
                invoice_number: true,
            },
        });
        if (!invoice) {
            return server_1.NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
        }
        // Start transaction
        const result = await db_1.prisma.$transaction(async (tx) => {
            // Generate payment number
            const paymentCount = await tx.payment.count({
                where: { workspace_id: invoice.workspace_id },
            });
            const payment_number = `PAY-${String(paymentCount + 1).padStart(6, "0")}`;
            // Create payment record
            const payment = await tx.payment.create({
                data: {
                    workspace_id: invoice.workspace_id,
                    invoice_id,
                    payment_number,
                    amount,
                    payment_method,
                    reference,
                    payment_date: new Date(payment_date || Date.now()),
                    status: "completed",
                    processed_at: new Date(),
                },
            });
            // Calculate total paid for this invoice
            const totalPaid = await tx.payment.aggregate({
                where: {
                    invoice_id,
                    status: "completed",
                },
                _sum: { amount: true },
            });
            const paidAmount = totalPaid._sum.amount || 0;
            let newStatus = "pending";
            if (paidAmount >= invoice.total_amount) {
                newStatus = "paid";
            }
            else if (paidAmount > 0) {
                newStatus = "sent";
            }
            // Update invoice status
            await tx.invoice.update({
                where: { id: invoice_id },
                data: {
                    status: newStatus,
                    paid_at: newStatus === "paid" ? new Date() : null,
                },
            });
            return payment;
        });
        // Fetch the complete payment record with relationships
        const paymentWithDetails = await db_1.prisma.payment.findUnique({
            where: { id: result.id },
            include: {
                invoice: {
                    select: {
                        invoice_number: true,
                        total_amount: true,
                        client: { select: { name: true } },
                    },
                },
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: paymentWithDetails,
        }, { status: 201 });
    }
    catch (error) {
        console.error("Error processing payment:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to process payment" }, { status: 500 });
    }
});

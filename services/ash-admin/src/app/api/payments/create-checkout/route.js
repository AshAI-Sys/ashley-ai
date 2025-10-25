"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const paymentService_1 = require("@/lib/paymentService");
const error_handling_1 = require("@/lib/error-handling");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
/**
 * Create Stripe Checkout Session
 * POST /api/payments/create-checkout
 *
 * Creates a hosted Stripe Checkout session for invoice payment
 */
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { invoiceId } = body;
        if (!invoiceId) {
            return (0, error_handling_1.createErrorResponse)(new error_handling_1.ValidationError("Invoice ID is required"));
        }
        // Get invoice details
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                client: true,
            },
        });
        if (!invoice) {
            return (0, error_handling_1.createErrorResponse)(new error_handling_1.NotFoundError("Invoice not found"));
        }
        if (invoice.status === "PAID") {
            return (0, error_handling_1.createErrorResponse)(new error_handling_1.ValidationError("Invoice is already paid"));
        }
        // Calculate remaining amount
        const payments = await prisma.payment.aggregate({
            where: {
                invoice_id: invoiceId,
                status: "COMPLETED",
            },
            _sum: { amount: true },
        });
        const paidAmount = payments._sum.amount || 0;
        const remainingAmount = parseFloat(invoice.total_amount.toString()) -
            parseFloat(paidAmount.toString());
        if (remainingAmount <= 0) {
            return (0, error_handling_1.createErrorResponse)(new error_handling_1.ValidationError("Invoice has no remaining balance"));
        }
        // Create checkout session
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
        const result = await paymentService_1.paymentService.createStripeCheckoutSession({
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoice_number,
            amount: paymentService_1.paymentService.toSmallestUnit(remainingAmount, invoice.currency),
            currency: invoice.currency,
            customerEmail: invoice.client?.email || "customer@example.com",
            successUrl: `${baseUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}&invoice=${invoice.id}`,
            cancelUrl: `${baseUrl}/invoices/${invoice.id}`,
            metadata: {
                order_id: invoice.order_id || "",
                client_name: invoice.client?.name || "",
            },
        });
        if (!result.success) {
            return (0, error_handling_1.createErrorResponse)(new error_handling_1.ValidationError(result.error || "Failed to create checkout session"));
        }
        return (0, error_handling_1.createSuccessResponse)({
            checkoutSession: {
                id: result.transactionId,
                url: result.paymentUrl,
            },
            invoice: {
                id: invoice.id,
                number: invoice.invoice_number,
                amount: remainingAmount,
                currency: invoice.currency,
            },
        });
    }
    catch (error) {
        console.error("Error creating checkout session:", error);
        return (0, error_handling_1.createErrorResponse)(error instanceof Error
            ? error.message
            : "Failed to create checkout session", 500);
    }
});

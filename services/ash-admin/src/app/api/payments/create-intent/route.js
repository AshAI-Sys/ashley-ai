"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const paymentService_1 = require("@/lib/paymentService");
const error_handling_1 = require("@/lib/error-handling");
const database_1 = require("@/lib/database");
const auth_middleware_1 = require("@/lib/auth-middleware");
const prisma = database_1.db;
/**
 * Create Payment Intent
 * POST /api/payments/create-intent
 *
 * Creates a Stripe Payment Intent for invoice payment
 */
exports.POST = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const body = await request.json();
        const { invoiceId, provider = "stripe" } = body;
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
            return (0, error_handling_1.createErrorResponse)(new error_handling_1.NotFoundError("Invoice"));
        }
        if (invoice.status === "paid") {
            return (0, error_handling_1.createErrorResponse)(new error_handling_1.ValidationError("Invoice is already paid"));
        }
        // Calculate remaining amount
        const payments = await prisma.payment.aggregate({
            where: {
                invoice_id: invoiceId,
                status: "completed",
            },
            _sum: { amount: true },
        });
        const paidAmount = payments._sum.amount || 0;
        const remainingAmount = parseFloat(invoice.total_amount.toString()) -
            parseFloat(paidAmount.toString());
        if (remainingAmount <= 0) {
            return (0, error_handling_1.createErrorResponse)(new error_handling_1.ValidationError("Invoice has no remaining balance"));
        }
        // Create payment based on provider
        if (provider === "stripe") {
            const result = await paymentService_1.paymentService.createStripePaymentIntent({
                amount: paymentService_1.paymentService.toSmallestUnit(remainingAmount, invoice.currency || "PHP"),
                currency: invoice.currency || "PHP",
                description: `Payment for Invoice ${invoice.invoice_number}`,
                customerEmail: invoice.client.email || undefined,
                invoiceId: invoice.id,
                metadata: {
                    invoice_number: invoice.invoice_number,
                    order_id: invoice.order_id || "",
                    client_name: invoice.client.name,
                },
            });
            if (!result.success) {
                return (0, error_handling_1.createErrorResponse)(new error_handling_1.AppError(error_handling_1.ErrorCode.EXTERNAL_SERVICE_ERROR, result.error || "Failed to create payment intent", 500));
            }
            return (0, error_handling_1.createSuccessResponse)({
                paymentIntent: {
                    id: result.transactionId,
                    clientSecret: result.clientSecret,
                    amount: remainingAmount,
                    currency: invoice.currency,
                },
                invoice: {
                    id: invoice.id,
                    number: invoice.invoice_number,
                    totalAmount: invoice.total_amount,
                    paidAmount,
                    remainingAmount,
                },
            });
        }
        else if (provider === "gcash") {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
            const result = await paymentService_1.paymentService.createGCashPayment({
                amount: paymentService_1.paymentService.toSmallestUnit(remainingAmount, "PHP"),
                description: `Invoice ${invoice.invoice_number}`,
                referenceNumber: invoice.invoice_number,
                customerName: invoice.client.name,
                customerEmail: undefined,
                successUrl: `${baseUrl}/payments/success?invoice=${invoice.id}`,
                failureUrl: `${baseUrl}/payments/failed?invoice=${invoice.id}`,
            });
            if (!result.success) {
                return (0, error_handling_1.createErrorResponse)(new error_handling_1.AppError(error_handling_1.ErrorCode.EXTERNAL_SERVICE_ERROR, result.error || "Failed to create GCash payment", 500));
            }
            return (0, error_handling_1.createSuccessResponse)({
                payment: {
                    id: result.transactionId,
                    url: result.paymentUrl,
                    amount: remainingAmount,
                    currency: "PHP",
                    provider: "gcash",
                },
                invoice: {
                    id: invoice.id,
                    number: invoice.invoice_number,
                },
            });
        }
        else {
            return (0, error_handling_1.createErrorResponse)(new error_handling_1.ValidationError("Unsupported payment provider"));
        }
    }
    catch (error) {
        console.error("Error creating payment intent:", error);
        return (0, error_handling_1.handleApiError)(error);
    }
});

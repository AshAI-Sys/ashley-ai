/* eslint-disable */
import { NextRequest } from "next/server";
import { paymentService } from "@/lib/paymentService";
import {
  createSuccessResponse,
  createErrorResponse,
  ValidationError,
  NotFoundError,
} from "@/lib/error-handling";
import { db } from "@/lib/database";
import { requireAuth } from "@/lib/auth-middleware";

const prisma = db;

/**
 * Create Stripe Checkout Session
 * POST /api/payments/create-checkout
 *
 * Creates a hosted Stripe Checkout session for invoice payment
 */
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return createErrorResponse(new ValidationError("Invoice ID is required"));
    }

    // Get invoice details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
      },
      });

    if (!invoice) {
      return createErrorResponse(new NotFoundError("Invoice not found"));
    }

    if (invoice.status === "PAID") {
      return createErrorResponse(
        new ValidationError("Invoice is already paid")
      );
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
    const remainingAmount =
      parseFloat(invoice.total_amount.toString()) -
      parseFloat(paidAmount.toString());

    if (remainingAmount <= 0) {
      return createErrorResponse(
        new ValidationError("Invoice has no remaining balance")
      );
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    const result = await paymentService.createStripeCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      amount: paymentService.toSmallestUnit(remainingAmount, invoice.currency),
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
      return createErrorResponse(
        new ValidationError(result.error || "Failed to create checkout session")
      );
    }

    return createSuccessResponse({
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
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return createErrorResponse(
      error instanceof Error
        ? error.message
        : "Failed to create checkout session",
      500
    );
});

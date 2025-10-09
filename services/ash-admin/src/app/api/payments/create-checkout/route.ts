import { NextRequest } from 'next/server'
import { paymentService } from '@/lib/paymentService'
import { createSuccessResponse, createErrorResponse } from '@/lib/error-handling'
import { db } from '@ash-ai/database';

const prisma = db

/**
 * Create Stripe Checkout Session
 * POST /api/payments/create-checkout
 *
 * Creates a hosted Stripe Checkout session for invoice payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceId } = body

    if (!invoiceId) {
      return createErrorResponse('Invoice ID is required', 400)
    }

    // Get invoice details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
      },
    })

    if (!invoice) {
      return createErrorResponse('Invoice not found', 404)
    }

    if (invoice.status === 'PAID') {
      return createErrorResponse('Invoice is already paid', 400)
    }

    // Calculate remaining amount
    const payments = await prisma.payment.aggregate({
      where: {
        invoice_id: invoiceId,
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    })

    const paidAmount = payments._sum.amount || 0
    const remainingAmount = parseFloat(invoice.total_amount.toString()) - parseFloat(paidAmount.toString())

    if (remainingAmount <= 0) {
      return createErrorResponse('Invoice has no remaining balance', 400)
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const result = await paymentService.createStripeCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      amount: paymentService.toSmallestUnit(remainingAmount, invoice.currency),
      currency: invoice.currency,
      customerEmail: invoice.client?.email || 'customer@example.com',
      successUrl: `${baseUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}&invoice=${invoice.id}`,
      cancelUrl: `${baseUrl}/invoices/${invoice.id}`,
      metadata: {
        order_id: invoice.order_id || '',
        client_name: invoice.client?.name || '',
      },
    })

    if (!result.success) {
      return createErrorResponse(result.error || 'Failed to create checkout session', 500)
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
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create checkout session',
      500
    )
  }
}
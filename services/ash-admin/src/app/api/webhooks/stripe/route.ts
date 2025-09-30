import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/paymentService'
import { PrismaClient } from '@prisma/client'
import { emailService } from '@/lib/emailService'
import { emailTemplates } from '@/lib/emailTemplates'

const prisma = new PrismaClient()

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 *
 * Handles Stripe events for payment lifecycle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ Missing stripe-signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const event = paymentService.verifyStripeWebhook(body, signature)

    if (!event) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`📥 Stripe webhook received: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event)
        break

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event)
        break

      case 'payment_intent.created':
        console.log('✅ Payment Intent created:', event.data.object.id)
        break

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true, type: event.type })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentIntentSucceeded(event: any) {
  const paymentIntent = event.data.object
  const invoiceId = paymentIntent.metadata?.invoice_id
  const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata?.customer_email

  console.log(`✅ Payment succeeded: ${paymentIntent.id}`)
  console.log(`   Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`)
  console.log(`   Invoice: ${invoiceId}`)

  if (!invoiceId) {
    console.warn('⚠️  No invoice_id in payment metadata')
    return
  }

  try {
    // Find invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: true,
        order: true,
      },
    })

    if (!invoice) {
      console.error(`❌ Invoice not found: ${invoiceId}`)
      return
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoice_id: invoiceId,
        amount: paymentIntent.amount / 100,
        payment_method: 'STRIPE',
        payment_date: new Date(),
        transaction_id: paymentIntent.id,
        status: 'COMPLETED',
        notes: `Stripe payment: ${paymentIntent.id}`,
      },
    })

    console.log(`✅ Payment record created: ${payment.id}`)

    // Update invoice status
    const totalPaid = await prisma.payment.aggregate({
      where: {
        invoice_id: invoiceId,
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    })

    const isPaid = (totalPaid._sum.amount || 0) >= parseFloat(invoice.total_amount.toString())

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: isPaid ? 'PAID' : 'PARTIALLY_PAID',
        paid_at: isPaid ? new Date() : null,
      },
    })

    console.log(`✅ Invoice updated: ${invoice.invoice_number} - ${isPaid ? 'PAID' : 'PARTIALLY_PAID'}`)

    // Send confirmation email
    if (customerEmail && invoice.client) {
      await emailService.sendEmail({
        to: customerEmail,
        ...emailTemplates.paymentReceived({
          clientName: invoice.client.name,
          invoiceNumber: invoice.invoice_number,
          amount: `₱${(paymentIntent.amount / 100).toLocaleString()}`,
          paymentDate: new Date().toLocaleDateString(),
          paymentMethod: 'Credit Card (Stripe)',
        }),
      })

      console.log(`✅ Payment confirmation email sent to ${customerEmail}`)
    }
  } catch (error) {
    console.error('❌ Error processing payment:', error)
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(event: any) {
  const paymentIntent = event.data.object
  const invoiceId = paymentIntent.metadata?.invoice_id

  console.log(`❌ Payment failed: ${paymentIntent.id}`)
  console.log(`   Reason: ${paymentIntent.last_payment_error?.message}`)

  if (!invoiceId) {
    return
  }

  try {
    // Create failed payment record
    await prisma.payment.create({
      data: {
        invoice_id: invoiceId,
        amount: paymentIntent.amount / 100,
        payment_method: 'STRIPE',
        payment_date: new Date(),
        transaction_id: paymentIntent.id,
        status: 'FAILED',
        notes: `Failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
      },
    })

    console.log(`✅ Failed payment record created`)
  } catch (error) {
    console.error('❌ Error recording failed payment:', error)
  }
}

/**
 * Handle completed checkout session
 */
async function handleCheckoutSessionCompleted(event: any) {
  const session = event.data.object
  const invoiceId = session.metadata?.invoice_id

  console.log(`✅ Checkout session completed: ${session.id}`)
  console.log(`   Invoice: ${invoiceId}`)
  console.log(`   Amount: ${session.amount_total / 100} ${session.currency?.toUpperCase()}`)

  // Get the payment intent to process the payment
  if (session.payment_intent) {
    const paymentIntent = await paymentService.getStripePaymentIntent(
      session.payment_intent as string
    )

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment will be handled by payment_intent.succeeded event
      console.log('ℹ️  Payment will be processed by payment_intent.succeeded event')
    }
  }
}

/**
 * Handle refunded charge
 */
async function handleChargeRefunded(event: any) {
  const charge = event.data.object
  const refund = charge.refunds?.data[0]

  console.log(`💸 Charge refunded: ${charge.id}`)
  console.log(`   Refund amount: ${refund?.amount / 100} ${charge.currency?.toUpperCase()}`)

  // Update payment record with refund information
  try {
    const payment = await prisma.payment.findFirst({
      where: { transaction_id: charge.payment_intent },
    })

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          notes: `${payment.notes || ''}\nRefunded: ${refund?.id} - ${new Date().toISOString()}`,
        },
      })

      console.log(`✅ Payment marked as refunded: ${payment.id}`)
    }
  } catch (error) {
    console.error('❌ Error processing refund:', error)
  }
}
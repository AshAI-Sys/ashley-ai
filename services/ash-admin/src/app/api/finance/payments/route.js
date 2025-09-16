import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const invoiceId = searchParams.get('invoiceId');
    const paymentMethod = searchParams.get('paymentMethod');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (invoiceId) {
      where.invoice_id = invoiceId;
    }
    if (paymentMethod) {
      where.payment_method = paymentMethod;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              invoice_number: true,
              total_amount: true,
              client: {
                select: { name: true }
              }
            }
          },
          bank_account: {
            select: { account_name: true, bank_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.payment.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: payments,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      invoice_id,
      amount,
      payment_method,
      reference,
      bank_account_id,
      payment_date,
      notes
    } = body;

    // Generate payment number
    const lastPayment = await prisma.payment.findFirst({
      orderBy: { created_at: 'desc' },
      select: { payment_number: true }
    });

    const nextNumber = lastPayment
      ? parseInt(lastPayment.payment_number.split('-')[1]) + 1
      : 1;

    const payment_number = `PMT-${nextNumber.toString().padStart(6, '0')}`;

    const payment = await prisma.payment.create({
      data: {
        payment_number,
        invoice_id,
        amount,
        payment_method,
        reference,
        bank_account_id,
        payment_date: payment_date ? new Date(payment_date) : new Date(),
        status: 'completed', // Default to completed for manual entries
        notes
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoice_number: true,
            total_amount: true,
            client: {
              select: { name: true }
            }
          }
        },
        bank_account: {
          select: { account_name: true }
        }
      }
    });

    // Update invoice status if fully paid
    if (invoice_id) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoice_id },
        include: {
          payments: {
            where: { status: 'completed' }
          }
        }
      });

      if (invoice) {
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        const balance = invoice.total_amount - totalPaid;

        let newStatus = invoice.status;
        if (balance <= 0.01) { // Account for floating point precision
          newStatus = 'paid';
        } else if (totalPaid > 0) {
          newStatus = 'pending'; // Partially paid
        }

        if (newStatus !== invoice.status) {
          await prisma.invoice.update({
            where: { id: invoice_id },
            data: {
              status: newStatus,
              paid_at: newStatus === 'paid' ? new Date() : null
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment recorded successfully'
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}

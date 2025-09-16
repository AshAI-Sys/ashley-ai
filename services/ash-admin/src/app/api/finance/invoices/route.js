import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (clientId) {
      where.client_id = clientId;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, email: true }
          },
          order: {
            select: { id: true, order_number: true }
          },
          invoice_items: true,
          payments: {
            select: { id: true, amount: true, status: true, payment_date: true }
          },
          _count: {
            select: { payments: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.invoice.count({ where })
    ]);

    // Calculate totals and status
    const enrichedInvoices = invoices.map(invoice => {
      const totalPaid = invoice.payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const balance = invoice.total_amount - totalPaid;
      const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && balance > 0;

      return {
        ...invoice,
        total_paid: totalPaid,
        balance,
        is_overdue: isOverdue,
        days_overdue: isOverdue ? Math.floor((new Date() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24)) : 0
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedInvoices,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      client_id,
      order_id,
      items,
      discount_amount = 0,
      tax_percent = 12, // Philippines VAT
      payment_terms = 30,
      notes,
      terms_conditions,
      due_date
    } = body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const itemDiscount = itemTotal * (item.discount_percent || 0) / 100;
      return sum + (itemTotal - itemDiscount);
    }, 0);

    const discountedSubtotal = subtotal - (discount_amount || 0);
    const tax_amount = discountedSubtotal * (tax_percent / 100);
    const total_amount = discountedSubtotal + tax_amount;

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { created_at: 'desc' },
      select: { invoice_number: true }
    });

    const nextNumber = lastInvoice
      ? parseInt(lastInvoice.invoice_number.split('-')[1]) + 1
      : 1;

    const invoice_number = `INV-${nextNumber.toString().padStart(6, '0')}`;

    // Calculate due date if not provided
    const calculatedDueDate = due_date
      ? new Date(due_date)
      : new Date(Date.now() + (payment_terms * 24 * 60 * 60 * 1000));

    const invoice = await prisma.invoice.create({
      data: {
        client_id,
        order_id,
        invoice_number,
        subtotal,
        discount_amount: discount_amount || 0,
        tax_amount,
        total_amount,
        due_date: calculatedDueDate,
        payment_terms,
        notes,
        terms_conditions,
        status: 'draft',
        invoice_items: {
          create: items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount_percent: item.discount_percent || 0,
            tax_percent: tax_percent,
            line_total: item.quantity * item.unit_price * (1 - (item.discount_percent || 0) / 100),
            order_line_item_id: item.order_line_item_id
          }))
        }
      },
      include: {
        client: true,
        order: true,
        invoice_items: true
      }
    });

    return NextResponse.json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

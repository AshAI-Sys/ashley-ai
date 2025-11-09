import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getClientFromRequest } from '@/lib/client-portal-auth';

export const dynamic = 'force-dynamic';


// Get client invoices and payment history
export async function GET(request: NextRequest) {
  try {
    const session = await getClientFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for invoices
    const where: any = {
      workspace_id: session.workspace_id,
      client_id: session.client_id,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Fetch invoices with items and payments
    const [invoices, totalCount] = await Promise.all([
      db.invoice.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
          order: {
            select: {
              id: true,
              order_number: true,
              status: true,
            },
          },
          invoice_items: {
            select: {
              id: true,
              description: true,
              quantity: true,
              unit_price: true,
              line_total: true,
            },
          },
          payments: {
            select: {
              id: true,
              payment_number: true,
              amount: true,
              payment_method: true,
              payment_date: true,
              status: true,
            },
          },
        },
      }),
      db.invoice.count({ where }),
    ]);

    // Calculate summary statistics
    // Get all pending/overdue invoices with their payments
    const pendingInvoices = await db.invoice.findMany({
      where: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        status: {
          in: ['PENDING', 'OVERDUE', 'PARTIAL'],
        },
      },
      select: {
        total_amount: true,
        payments: {
          select: {
            amount: true,
          },
        },
      },
    });

    const totalOwedAmount = pendingInvoices.reduce((sum, inv) => {
      const paidAmount = inv.payments.reduce((total, payment) => total + payment.amount, 0);
      return sum + (inv.total_amount - paidAmount);
    }, 0);

    const totalPaid = await db.payment.aggregate({
      where: {
        workspace_id: session.workspace_id,
        invoice: {
          client_id: session.client_id,
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    const overdueCount = await db.invoice.count({
      where: {
        workspace_id: session.workspace_id,
        client_id: session.client_id,
        status: 'OVERDUE',
      },
    });

    const outstandingBalance = totalOwedAmount;

    return NextResponse.json({
      success: true,
      invoices,
      summary: {
        outstanding_balance: outstandingBalance,
        total_paid: totalPaid._sum?.amount || 0,
        overdue_count: overdueCount,
      },
      pagination: {
        total: totalCount,
        limit,
        offset,
        has_more: offset + invoices.length < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment data' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // month, quarter, year
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : null;

    // Calculate date ranges
    let startDate, endDate;
    const today = new Date();

    if (period === 'month') {
      const targetMonth = month || today.getMonth() + 1;
      startDate = new Date(year, targetMonth - 1, 1);
      endDate = new Date(year, targetMonth, 0, 23, 59, 59);
    } else if (period === 'quarter') {
      const quarter = Math.ceil((month || today.getMonth() + 1) / 3);
      startDate = new Date(year, (quarter - 1) * 3, 1);
      endDate = new Date(year, quarter * 3, 0, 23, 59, 59);
    } else if (period === 'year') {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    // Parallel queries for better performance
    const [
      invoiceStats,
      paymentStats,
      expenseStats,
      recentInvoices,
      overdueInvoices,
      topClients,
      monthlyRevenue
    ] = await Promise.all([
      // Invoice statistics
      prisma.invoice.aggregate({
        where: {
          created_at: { gte: startDate, lte: endDate }
        },
        _count: { id: true },
        _sum: { total_amount: true }
      }),

      // Payment statistics
      prisma.payment.aggregate({
        where: {
          payment_date: { gte: startDate, lte: endDate },
          status: 'completed'
        },
        _count: { id: true },
        _sum: { amount: true }
      }),

      // Expense statistics
      prisma.expense.aggregate({
        where: {
          expense_date: { gte: startDate, lte: endDate },
          approved: true
        },
        _count: { id: true },
        _sum: { amount: true }
      }),

      // Recent invoices
      prisma.invoice.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          client: { select: { name: true } }
        }
      }),

      // Overdue invoices
      prisma.invoice.count({
        where: {
          due_date: { lt: today },
          status: { notIn: ['paid', 'cancelled'] }
        }
      }),

      // Top clients by revenue
      prisma.invoice.groupBy({
        by: ['client_id'],
        where: {
          created_at: { gte: startDate, lte: endDate },
          status: 'paid'
        },
        _sum: { total_amount: true },
        orderBy: { _sum: { total_amount: 'desc' } },
        take: 5
      }),

      // Monthly revenue trend (last 12 months)
      getMonthlyRevenueTrend(year)
    ]);

    // Get client names for top clients
    const clientIds = topClients.map(tc => tc.client_id);
    const clients = await prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true }
    });

    const topClientsWithNames = topClients.map(tc => ({
      ...tc,
      client_name: clients.find(c => c.id === tc.client_id)?.name || 'Unknown'
    }));

    // Calculate key metrics
    const totalRevenue = invoiceStats._sum.total_amount || 0;
    const totalPayments = paymentStats._sum.amount || 0;
    const totalExpenses = expenseStats._sum.amount || 0;
    const grossProfit = totalRevenue - totalExpenses;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    // Calculate outstanding receivables (simplified for SQLite)
    const outstandingInvoices = await prisma.invoice.findMany({
      where: {
        status: { notIn: ['paid', 'cancelled'] }
      },
      include: {
        payments: {
          where: { status: 'completed' }
        }
      }
    });

    const outstandingReceivables = outstandingInvoices.reduce((sum, invoice) => {
      const totalPaid = invoice.payments.reduce((paidSum, payment) => paidSum + payment.amount, 0);
      return sum + (invoice.total_amount - totalPaid);
    }, 0);

    const stats = {
      // Overview metrics
      overview: {
        total_revenue: totalRevenue,
        total_payments: totalPayments,
        total_expenses: totalExpenses,
        gross_profit: grossProfit,
        gross_margin: grossMargin,
        outstanding_receivables: outstandingReceivables
      },

      // Counts
      counts: {
        invoices: invoiceStats._count.id || 0,
        payments: paymentStats._count.id || 0,
        expenses: expenseStats._count.id || 0,
        overdue_invoices: overdueInvoices
      },

      // Recent data
      recent_invoices: recentInvoices,
      top_clients: topClientsWithNames,
      monthly_revenue: monthlyRevenue,

      // Period info
      period: {
        type: period,
        start_date: startDate,
        end_date: endDate,
        year,
        month
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching finance stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch finance statistics' },
      { status: 500 }
    );
  }
}

async function getMonthlyRevenueTrend(year) {
  try {
    const monthlyData = await prisma.invoice.groupBy({
      by: ['issue_date'],
      where: {
        issue_date: {
          gte: new Date(year - 1, 0, 1),
          lte: new Date(year, 11, 31)
        },
        status: 'paid'
      },
      _sum: { total_amount: true }
    });

    // Format data by month
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year: year,
      revenue: 0
    }));

    monthlyData.forEach(data => {
      const month = new Date(data.issue_date).getMonth();
      if (monthlyRevenue[month]) {
        monthlyRevenue[month].revenue += data._sum.total_amount || 0;
      }
    });

    return monthlyRevenue;
  } catch (error) {
    console.error('Error getting monthly revenue trend:', error);
    return [];
  }
}

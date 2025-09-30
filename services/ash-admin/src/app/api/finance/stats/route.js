"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
async function GET(request) {
    try {
        const today = new Date();
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        // Run all queries in parallel for better performance
        const [totalRevenueResult, outstandingInvoicesResult, overdueInvoicesResult, pendingBillsResult, ytdRevenueResult, totalCogsResult, lastMonthRevenueResult] = await Promise.all([
            // Total revenue (current month)
            db_1.prisma.invoice.aggregate({
                where: {
                    status: 'PAID',
                    date_issued: {
                        gte: monthStart,
                        lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
                    }
                },
                _sum: { total: true }
            }),
            // Outstanding invoices
            db_1.prisma.invoice.aggregate({
                where: {
                    status: { in: ['OPEN', 'PARTIAL'] }
                },
                _sum: { balance: true }
            }),
            // Overdue invoices
            db_1.prisma.invoice.aggregate({
                where: {
                    status: { in: ['OPEN', 'PARTIAL'] },
                    due_date: { lt: today }
                },
                _sum: { balance: true }
            }),
            // Pending bills
            db_1.prisma.bill.aggregate({
                where: {
                    status: { in: ['OPEN', 'PARTIAL'] }
                },
                _sum: { total: true }
            }),
            // YTD Revenue
            db_1.prisma.invoice.aggregate({
                where: {
                    status: 'PAID',
                    date_issued: {
                        gte: yearStart,
                        lt: new Date(today.getFullYear() + 1, 0, 1)
                    }
                },
                _sum: { total: true }
            }),
            // Total COGS (approximation from order costs)
            db_1.prisma.poCost.aggregate({
                _sum: { cogs: true }
            }),
            // Last month revenue for growth calculation
            db_1.prisma.invoice.aggregate({
                where: {
                    status: 'PAID',
                    date_issued: {
                        gte: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                        lt: monthStart
                    }
                },
                _sum: { total: true }
            })
        ]);
        const currentRevenue = totalRevenueResult._sum.total || 0;
        const ytdRevenue = ytdRevenueResult._sum.total || 0;
        const totalCogs = totalCogsResult._sum.cogs || 0;
        const lastMonthRevenue = lastMonthRevenueResult._sum.total || 1; // Avoid division by zero
        // Calculate gross margin
        const grossMargin = ytdRevenue > 0 ? ((ytdRevenue - totalCogs) / ytdRevenue) * 100 : 0;
        // Calculate revenue growth
        const revenueGrowth = ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        // Get payment methods distribution
        const paymentDistribution = await db_1.prisma.payment.groupBy({
            by: ['source'],
            where: {
                received_at: {
                    gte: monthStart
                }
            },
            _sum: {
                amount: true
            }
        });
        // Get top clients by revenue
        const topClients = await db_1.prisma.invoice.groupBy({
            by: ['client_id'],
            where: {
                status: 'PAID',
                date_issued: {
                    gte: yearStart
                }
            },
            _sum: {
                total: true
            },
            orderBy: {
                _sum: {
                    total: 'desc'
                }
            },
            take: 5
        });
        // Get client names for top clients
        const clientIds = topClients.map(client => client.client_id);
        const clients = await db_1.prisma.client.findMany({
            where: { id: { in: clientIds } },
            select: { id: true, name: true }
        });
        const topClientsWithNames = topClients.map(client => {
            const clientInfo = clients.find(c => c.id === client.client_id);
            return {
                client_name: clientInfo?.name || 'Unknown',
                revenue: client._sum.total || 0
            };
        });
        // Calculate cash flow (simplified: incoming payments - outgoing bills)
        const [incomingPayments, outgoingBills] = await Promise.all([
            db_1.prisma.payment.aggregate({
                where: {
                    received_at: {
                        gte: monthStart
                    }
                },
                _sum: { amount: true }
            }),
            db_1.prisma.bill.aggregate({
                where: {
                    status: 'PAID',
                    updated_at: {
                        gte: monthStart
                    }
                },
                _sum: { total: true }
            })
        ]);
        const cashFlow = (incomingPayments._sum.amount || 0) - (outgoingBills._sum.total || 0);
        return server_1.NextResponse.json({
            success: true,
            data: {
                total_revenue: currentRevenue,
                outstanding_invoices: outstandingInvoicesResult._sum.balance || 0,
                overdue_invoices: overdueInvoicesResult._sum.balance || 0,
                pending_bills: pendingBillsResult._sum.total || 0,
                ytd_revenue: ytdRevenue,
                total_cogs: totalCogs,
                gross_margin: Math.round(grossMargin * 10) / 10,
                cash_flow: cashFlow,
                revenue_growth: Math.round(revenueGrowth * 10) / 10,
                payment_distribution: paymentDistribution.map(p => ({
                    source: p.source,
                    amount: p._sum.amount || 0
                })),
                top_clients: topClientsWithNames
            }
        });
    }
    catch (error) {
        console.error('Error calculating finance stats:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to calculate finance statistics' }, { status: 500 });
    }
}

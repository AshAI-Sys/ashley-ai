"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
/* eslint-disable */
const server_1 = require("next/server");
const db_1 = require("@/lib/db");
const auth_middleware_1 = require("@/lib/auth-middleware");
// Finance statistics API endpoint
exports.GET = (0, auth_middleware_1.requireAuth)(async (request, _user) => {
    try {
        const today = new Date();
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        // Run all queries in parallel for better performance
        const [totalRevenueResult, outstandingInvoicesResult, overdueInvoicesResult, ytdRevenueResult, lastMonthRevenueResult,] = await Promise.all([
            // Total revenue (current month)
            db_1.prisma.invoice.aggregate({
                where: {
                    status: "paid",
                    issue_date: {
                        gte: monthStart,
                        lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
                    },
                },
                _sum: { total_amount: true },
            }),
            // Outstanding invoices
            db_1.prisma.invoice.aggregate({
                where: {
                    status: { in: ["sent", "pending"] },
                },
                _sum: { total_amount: true },
            }),
            // Overdue invoices
            db_1.prisma.invoice.aggregate({
                where: {
                    status: { in: ["sent", "pending", "overdue"] },
                    due_date: { lt: today },
                },
                _sum: { total_amount: true },
            }),
            // YTD Revenue
            db_1.prisma.invoice.aggregate({
                where: {
                    status: "paid",
                    issue_date: {
                        gte: yearStart,
                        lt: new Date(today.getFullYear() + 1, 0, 1),
                    },
                },
                _sum: { total_amount: true },
            }),
            // Last month revenue for growth calculation
            db_1.prisma.invoice.aggregate({
                where: {
                    status: "paid",
                    issue_date: {
                        gte: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                        lt: monthStart,
                    },
                },
                _sum: { total_amount: true },
            }),
        ]);
        const currentRevenue = totalRevenueResult._sum.total_amount || 0;
        const ytdRevenue = ytdRevenueResult._sum.total_amount || 0;
        const totalCogs = 0; // Will be calculated from actual cost data later
        const lastMonthRevenue = lastMonthRevenueResult._sum.total_amount || 1; // Avoid division by zero
        // Calculate gross margin
        const grossMargin = ytdRevenue > 0 ? ((ytdRevenue - totalCogs) / ytdRevenue) * 100 : 0;
        // Calculate revenue growth
        const revenueGrowth = ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        // Get top clients by revenue
        const topClients = await db_1.prisma.invoice.groupBy({
            by: ["client_id"],
            where: {
                status: "paid",
                issue_date: {
                    gte: yearStart,
                },
            },
            _sum: {
                total_amount: true,
            },
            orderBy: {
                _sum: {
                    total_amount: "desc",
                },
            },
            take: 5,
        });
        // Get client names for top clients
        const clientIds = topClients.map(client => client.client_id);
        const clients = await db_1.prisma.client.findMany({
            where: { id: { in: clientIds } },
            take: 10, // Limit to 10 clients (should match clientIds length from topClients)
            select: { id: true, name: true },
        });
        const topClientsWithNames = topClients.map(client => {
            const clientInfo = clients.find(c => c.id === client.client_id);
            return {
                client_name: clientInfo?.name || "Unknown",
                revenue: client._sum.total_amount || 0,
            };
        });
        const cashFlow = 0; // Will be calculated from payments later
        return server_1.NextResponse.json({
            success: true,
            data: {
                total_revenue: currentRevenue,
                outstanding_invoices: outstandingInvoicesResult._sum.total_amount || 0,
                overdue_invoices: overdueInvoicesResult._sum.total_amount || 0,
                pending_bills: 0, // No bills table yet
                ytd_revenue: ytdRevenue,
                total_cogs: totalCogs,
                gross_margin: Math.round(grossMargin * 10) / 10,
                cash_flow: cashFlow,
                revenue_growth: Math.round(revenueGrowth * 10) / 10,
                payment_distribution: [],
                top_clients: topClientsWithNames,
            },
        });
    }
    catch (error) {
        console.error("Error calculating finance stats:", error);
        return server_1.NextResponse.json({ success: false, error: "Failed to calculate finance statistics" }, { status: 500 });
    }
});

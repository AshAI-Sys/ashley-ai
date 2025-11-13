/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';


// Finance statistics API endpoint
export const GET = requireAuth(async (_request: NextRequest, _user) => {
  try {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel for better performance
    const [
      totalReceivablesResult,
      overdueInvoicesResult,
      aging0_30Result,
      aging31_60Result,
      aging61_90Result,
      aging90PlusResult,
      ytdRevenueResult,
    ] = await Promise.all([
      // Total Receivables (AR)
      prisma.invoice.aggregate({
        where: {
          status: { in: ["sent", "pending", "partial"] },
        },
        _sum: { total_amount: true },
      }),

      // Overdue invoices
      prisma.invoice.aggregate({
        where: {
          status: { in: ["sent", "pending", "partial"] },
          due_date: { lt: today },
        },
        _sum: { total_amount: true },
      }),

      // Aging 0-30 days
      prisma.invoice.aggregate({
        where: {
          status: { in: ["sent", "pending", "partial"] },
          issue_date: { gte: thirtyDaysAgo },
        },
        _sum: { total_amount: true },
      }),

      // Aging 31-60 days
      prisma.invoice.aggregate({
        where: {
          status: { in: ["sent", "pending", "partial"] },
          issue_date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _sum: { total_amount: true },
      }),

      // Aging 61-90 days
      prisma.invoice.aggregate({
        where: {
          status: { in: ["sent", "pending", "partial"] },
          issue_date: { gte: ninetyDaysAgo, lt: sixtyDaysAgo },
        },
        _sum: { total_amount: true },
      }),

      // Aging 90+ days
      prisma.invoice.aggregate({
        where: {
          status: { in: ["sent", "pending", "partial"] },
          issue_date: { lt: ninetyDaysAgo },
        },
        _sum: { total_amount: true },
      }),

      // YTD Revenue
      prisma.invoice.aggregate({
        where: {
          status: "paid",
          issue_date: {
            gte: yearStart,
            lt: new Date(today.getFullYear() + 1, 0, 1),
          },
        },
        _sum: { total_amount: true },
      }),
    ]);

    const totalReceivables = totalReceivablesResult._sum.total_amount || 0;
    const overdueInvoices = overdueInvoicesResult._sum.total_amount || 0;
    const ytdRevenue = ytdRevenueResult._sum.total_amount || 0;

    // Calculate costing (placeholder - will be integrated with actual cost data)
    const materialsCost = 0; // From BOM/purchases
    const laborCost = 0; // From payroll allocations
    const overheadCost = 0; // From bills/expenses
    const totalCogs = materialsCost + laborCost + overheadCost;

    // Calculate P&L
    const grossProfit = ytdRevenue - totalCogs;
    const grossMargin = ytdRevenue > 0 ? (grossProfit / ytdRevenue) * 100 : 0;
    const netProfit = grossProfit; // Will subtract operating expenses later

    return NextResponse.json({
      success: true,
      data: {
        // AR Stats
        total_receivables: totalReceivables,
        overdue_invoices: overdueInvoices,
        aging_0_30: aging0_30Result._sum.total_amount || 0,
        aging_31_60: aging31_60Result._sum.total_amount || 0,
        aging_61_90: aging61_90Result._sum.total_amount || 0,
        aging_90_plus: aging90PlusResult._sum.total_amount || 0,

        // AP Stats
        total_payables: 0, // Will be calculated from bills
        overdue_bills: 0,
        upcoming_payments: 0,

        // P&L Stats
        total_revenue: ytdRevenue,
        total_cogs: totalCogs,
        gross_profit: grossProfit,
        gross_margin: Math.round(grossMargin * 10) / 10,
        net_profit: netProfit,

        // Costing Stats
        materials_cost: materialsCost,
        labor_cost: laborCost,
        overhead_cost: overheadCost,
      },
    });
  } catch (error) {
    console.error("Error calculating finance stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate finance statistics" },
      { status: 500 }
    );
  }
});

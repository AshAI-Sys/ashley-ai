import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { requireAuth } from "@/lib/auth-middleware";

const prisma = db;

// GET /api/analytics/profit - Get profit analysis data
export const GET = requireAuth(async (req: NextRequest, user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const url = new URL(req.url);

    const clientId = url.searchParams.get("clientId");
    const orderId = url.searchParams.get("orderId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const sortBy = url.searchParams.get("sortBy") || "analysis_date";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    const where: any = { workspace_id: workspaceId };

    if (clientId) where.client_id = clientId;
    if (orderId) where.order_id = orderId;

    if (startDate && endDate) {
      where.analysis_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const analyses = await prisma.profitAnalysis.findMany({
      where,
      include: {
        order: {
          select: {
            order_number: true,
            status: true,
            total_amount: true,
          },
        },
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    });

    // Calculate aggregate statistics
    const stats = {
      totalRevenue: analyses.reduce((sum, a) => sum + a.total_revenue, 0),
      totalCost: analyses.reduce((sum, a) => sum + a.total_cost, 0),
      totalGrossProfit: analyses.reduce((sum, a) => sum + a.gross_profit, 0),
      totalNetProfit: analyses.reduce((sum, a) => sum + a.net_profit, 0),
      avgGrossMargin:
        analyses.reduce((sum, a) => sum + a.gross_margin, 0) /
          analyses.length || 0,
      avgNetMargin:
        analyses.reduce((sum, a) => sum + a.net_margin, 0) / analyses.length ||
        0,
      totalOrders: analyses.length,
    };

    // Group by client for comparison
    const byClient: any = {};
    analyses.forEach(a => {
      if (!byClient[a.client_id]) {
        byClient[a.client_id] = {
          client_id: a.client_id,
          client_name: a.client.name,
          orders: 0,
          total_revenue: 0,
          total_profit: 0,
          avg_margin: 0,
          margins: [],
        };
      }
      byClient[a.client_id].orders += 1;
      byClient[a.client_id].total_revenue += a.total_revenue;
      byClient[a.client_id].total_profit += a.net_profit;
      byClient[a.client_id].margins.push(a.net_margin);
    });

    // Calculate average margins
    Object.values(byClient).forEach((client: any) => {
      client.avg_margin =
        client.margins.reduce((a: number, b: number) => a + b, 0) /
        client.margins.length;
      delete client.margins;
    });

    const clientComparison = Object.values(byClient).sort(
      (a: any, b: any) => b.total_profit - a.total_profit
    );

    return NextResponse.json({
      success: true,
      analyses,
      stats,
      clientComparison,
    });
  } catch (error: any) {
    console.error("Error fetching profit analysis:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

// POST /api/analytics/profit - Create profit analysis
export const POST = requireAuth(async (req: NextRequest, user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const body = await req.json();

    const {
      order_id,
      client_id,
      total_revenue,
      base_price,
      rush_fee = 0,
      design_fee = 0,
      shipping_fee = 0,
      material_cost,
      labor_cost,
      overhead_cost,
      shipping_cost = 0,
      wastage_cost = 0,
      production_days,
      lead_time_days,
      notes,
    } = body;

    if (
      !order_id ||
      !client_id ||
      !total_revenue ||
      !material_cost ||
      !labor_cost
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate totals and margins
    const totalCost =
      material_cost + labor_cost + overhead_cost + shipping_cost + wastage_cost;
    const grossProfit = total_revenue - totalCost;
    const grossMargin = (grossProfit / total_revenue) * 100;
    const netProfit = grossProfit - overhead_cost;
    const netMargin = (netProfit / total_revenue) * 100;

    const analysis = await prisma.profitAnalysis.create({
      data: {
        workspace_id: workspaceId,
        order_id,
        client_id,
        total_revenue,
        base_price: base_price || total_revenue,
        rush_fee,
        design_fee,
        shipping_fee,
        total_cost: totalCost,
        material_cost,
        labor_cost,
        overhead_cost,
        shipping_cost,
        wastage_cost,
        gross_profit: grossProfit,
        gross_margin: grossMargin,
        net_profit: netProfit,
        net_margin: netMargin,
        production_days: production_days || 0,
        lead_time_days: lead_time_days || 0,
        notes,
      },
      include: {
        order: {
          select: {
            order_number: true,
            status: true,
          },
        },
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("Error creating profit analysis:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

// PUT /api/analytics/profit - Auto-generate profit analysis for an order
export const PUT = requireAuth(async (req: NextRequest, user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order with related data
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        workspace_id: workspaceId,
      },
      include: {
        client: true,
        bundles: true,
        invoices: true,
        expenses: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Calculate costs from various sources
    const materialCost = order.expenses
      .filter((e: any) => e.category === "MATERIALS")
      .reduce((sum: number, e: any) => sum + e.amount, 0);

    const laborCost = order.expenses
      .filter((e: any) => e.category === "LABOR")
      .reduce((sum: number, e: any) => sum + e.amount, 0);

    const overheadCost = order.expenses
      .filter((e: any) => e.category === "OVERHEAD")
      .reduce((sum: number, e: any) => sum + e.amount, 0);

    const shippingCost = order.expenses
      .filter((e: any) => e.category === "SHIPPING")
      .reduce((sum: number, e: any) => sum + e.amount, 0);

    const totalRevenue = order.total_amount;
    const totalCost = materialCost + laborCost + overheadCost + shippingCost;
    const grossProfit = totalRevenue - totalCost;
    const grossMargin = (grossProfit / totalRevenue) * 100;
    const netProfit = grossProfit - overheadCost;
    const netMargin = (netProfit / totalRevenue) * 100;

    // Calculate production timeline
    const productionDays = order.delivery_date
      ? Math.ceil(
          (new Date(order.delivery_date).getTime() -
            new Date(order.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const analysis = await prisma.profitAnalysis.create({
      data: {
        workspace_id: workspaceId,
        order_id: order.id,
        client_id: order.client_id,
        total_revenue: totalRevenue,
        base_price: totalRevenue,
        total_cost: totalCost,
        material_cost: materialCost,
        labor_cost: laborCost,
        overhead_cost: overheadCost,
        shipping_cost: shippingCost,
        gross_profit: grossProfit,
        gross_margin: grossMargin,
        net_profit: netProfit,
        net_margin: netMargin,
        production_days: productionDays,
        lead_time_days: productionDays,
        notes: "Auto-generated from order data",
      },
      include: {
        order: {
          select: {
            order_number: true,
          },
        },
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      analysis,
      message: "Profit analysis auto-generated successfully",
    });
  } catch (error: any) {
    console.error("Error auto-generating profit analysis:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

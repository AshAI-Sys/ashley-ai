/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { dynamicPricingAI } from "@/lib/ai/dynamic-pricing";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// POST /api/ai/pricing - Get pricing recommendation
export const POST = requireAuth(async (req: NextRequest, _user) => {
  try {
    const {
      client_id,
      product_type,
      quantity,
      complexity,
      material_cost,
      labor_hours_estimate,
      deadline_days,
      season,
    } = await req.json();

    // Validate required fields
    if (
      !client_id ||
      !product_type ||
      !quantity ||
      !material_cost ||
      !labor_hours_estimate
    ) {
      }
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get client history
    const client = await prisma.client.findUnique({
      where: { id: client_id },
      include: {
        orders: {
          include: {
            invoices: {
              include: {
                payments: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      }
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Calculate client history metrics
    const totalOrders = client.orders.length;
    const totalRevenue = client.orders.reduce((sum, order) => {
      const orderRevenue = order.invoices.reduce(
        (isum, inv) => isum + parseFloat(inv.total_amount.toString()),
        0
      );
      return sum + orderRevenue;
    }, 0);

    const totalCost = client.orders.reduce((sum, order) => {
      return sum + parseFloat(order.total_amount.toString()) * 0.7; // Estimate 70% cost ratio
    }, 0);

    const averageMargin =
      totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 30;

    // Calculate payment reliability
    const totalInvoices = client.orders.flatMap(o => o.invoices).length;
    const paidInvoices = client.orders
      .flatMap(o => o.invoices)
      .filter(inv => inv.status === "PAID").length;
    const paymentReliability =
      totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 100;

    const clientHistory = {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      average_margin: averageMargin,
      payment_reliability: paymentReliability,
    };

    // Get current market conditions
    const allOrders = await prisma.order.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const demandLevel =
      allOrders.length > 50
        ? "VERY_HIGH"
        : allOrders.length > 30
          ? "HIGH"
          : allOrders.length > 15
            ? "NORMAL"
            : "LOW";

    // Estimate capacity utilization (simplified)
    const activeSewingRuns = await prisma.sewingRun.count({
      where: {
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
      },
    });

    const capacityUtilization = Math.min((activeSewingRuns / 20) * 100, 100);

    const marketConditions = {
      demand_level: demandLevel as "LOW" | "NORMAL" | "HIGH" | "VERY_HIGH",
      capacity_utilization: capacityUtilization,
      material_price_trend: "STABLE" as "FALLING" | "STABLE" | "RISING",
      seasonal_multiplier:
        season === "PEAK" ? 1.15 : season === "LOW" ? 0.9 : 1.0,
    };

    // Calculate pricing recommendation
    const recommendation = await dynamicPricingAI.calculatePricing(
      {
        client_id,
        product_type,
        quantity,
        complexity: complexity || "MODERATE",
        material_cost,
        labor_hours_estimate,
        deadline_days: deadline_days || 30,
        season,
        client_history: clientHistory,
      },
      marketConditions
    );

    return NextResponse.json({
      success: true,
      recommendation,
      client_history: clientHistory,
      market_conditions: marketConditions,
    });
  } catch (error: any) {
    console.error("Pricing calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate pricing", details: error.message },
      { status: 500 }
    );
  }
});

// GET /api/ai/pricing/scenarios?client_id=xxx&... - Get multiple pricing scenarios
export const GET = requireAuth(async (req: NextRequest, _user) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const client_id = searchParams.get("client_id");
    const product_type = searchParams.get("product_type");
    const quantity = parseInt(searchParams.get("quantity") || "0");
    const material_cost = parseFloat(searchParams.get("material_cost") || "0");
    const labor_hours = parseFloat(searchParams.get("labor_hours") || "0");

    if (
      !client_id ||
      !product_type ||
      !quantity ||
      !material_cost ||
      !labor_hours
    ) {
      }
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get client history (same as POST)
    const client = await prisma.client.findUnique({
      where: { id: client_id },
      include: {
        orders: {
          include: {
            invoices: {
              include: {
                payments: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      }
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const totalOrders = client.orders.length;
    const totalRevenue = client.orders.reduce((sum, order) => {
      const orderRevenue = order.invoices.reduce(
        (isum, inv) => isum + parseFloat(inv.total_amount.toString()),
        0
      );
      return sum + orderRevenue;
    }, 0);

    const totalCost = client.orders.reduce((sum, order) => {
      return sum + parseFloat(order.total_amount.toString()) * 0.7;
    }, 0);

    const averageMargin =
      totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 30;

    const totalInvoices = client.orders.flatMap(o => o.invoices).length;
    const paidInvoices = client.orders
      .flatMap(o => o.invoices)
      .filter(inv => inv.status === "PAID").length;
    const paymentReliability =
      totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 100;

    const clientHistory = {
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      average_margin: averageMargin,
      payment_reliability: paymentReliability,
    };

    // Get market conditions (same as POST)
    const allOrders = await prisma.order.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const demandLevel =
      allOrders.length > 50
        ? "VERY_HIGH"
        : allOrders.length > 30
          ? "HIGH"
          : allOrders.length > 15
            ? "NORMAL"
            : "LOW";

    const activeSewingRuns = await prisma.sewingRun.count({
      where: {
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
      },
    });

    const capacityUtilization = Math.min((activeSewingRuns / 20) * 100, 100);

    const marketConditions = {
      demand_level: demandLevel as "LOW" | "NORMAL" | "HIGH" | "VERY_HIGH",
      capacity_utilization: capacityUtilization,
      material_price_trend: "STABLE" as "FALLING" | "STABLE" | "RISING",
      seasonal_multiplier: 1.0,
    };

    // Get all three scenarios
    const scenarios = await dynamicPricingAI.analyzePricingScenarios(
      {
        client_id,
        product_type,
        quantity,
        complexity: "MODERATE",
        material_cost,
        labor_hours_estimate: labor_hours,
        deadline_days: 30,
        client_history: clientHistory,
      },
      marketConditions
    );

    return NextResponse.json({
      success: true,
      scenarios,
      client_history: clientHistory,
      market_conditions: marketConditions,
    });
  } catch (error: any) {
    console.error("Pricing scenarios error:", error);
    return NextResponse.json(
      { error: "Failed to calculate scenarios", details: error.message },
      { status: 500 }
    );
  }
});
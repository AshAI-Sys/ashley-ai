import { NextRequest, NextResponse } from "next/server";
import { dynamicPricingAI } from "@/lib/ai/dynamic-pricing";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// GET /api/ai/pricing/analysis - Analyze historical pricing performance
export const GET = requireAuth(async (req: NextRequest, user) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const client_id = searchParams.get("client_id");
    const days = parseInt(searchParams.get("days") || "90");

    // Build where clause
    const whereClause: any = {
      created_at: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      },
    };

    if (client_id) {
      whereClause.client_id = client_id;

    // Get orders with invoices and actual costs
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        client: true,
        invoices: true,
        cut_lays: true,
        sewing_runs: true,
        print_runs: true,
        line_items: true,
      },
      });

    // Transform orders into pricing analysis format
    const pricingData = orders.map(order => {
      // Calculate actual cost from production runs;
      const cuttingCost = 0; // Cut lays don't have labor_cost field
      const sewingCost = order.sewing_runs.reduce(
        (sum, run) => sum + (run.piece_rate_pay || 0),
        0
      );
      const printCost = 0; // Print runs don't have labor_cost field in current schema

      const materialCost = 0; // Material cost would come from material_requirements
      const actualCost = materialCost + cuttingCost + sewingCost + printCost;

      // Get quoted price from invoice
      const quotedPrice =
        order.invoices.length > 0
          ? parseFloat(order.invoices[0].total_amount.toString())
          : parseFloat(order.total_amount.toString());

      // Determine if accepted (has invoice or status is not CANCELLED)
      const accepted =
        order.status !== "CANCELLED" && order.invoices.length > 0;

      // Get total quantity from line items
      const totalQuantity = order.line_items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // Get product type from design_name or first line item description
      const productType =
        order.design_name || order.line_items[0]?.description || "UNKNOWN";

      return {
        client_id: order.client_id,
        product_type: productType,
        quantity: totalQuantity,
        quoted_price: quotedPrice,
        actual_cost: actualCost > 0 ? actualCost : quotedPrice * 0.7, // Estimate if no data
        accepted,
      };

    // Filter out invalid data
    const validData = pricingData.filter(
      d => d.quoted_price > 0 && d.actual_cost > 0
    );

    if (validData.length === 0) {
      return NextResponse.json({
        success: true,
        analysis: {
          average_margin: 0,
          acceptance_rate: 0,
          price_elasticity: 0,
          optimal_margin_range: { min: 0, max: 0 },
          insights: ["Not enough historical data for analysis"],
        },
        total_orders: 0,
      });

    // Perform analysis
    const analysis = await dynamicPricingAI.analyzeHistoricalPricing(validData);

    return NextResponse.json({
      success: true,
      analysis,
      total_orders: validData.length,
      date_range: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
  } catch (error: any) {
    console.error("Pricing analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze pricing", details: error.message },
      { status: 500 }
    );
  }

// POST /api/ai/pricing/analysis/optimize - Get optimization recommendations
export const POST = requireAuth(async (req: NextRequest, user) => {
  try {
    const { product_type, target_margin, min_acceptance_rate } = await req.json();

    // Get recent orders for this product type
    const orders = await prisma.order.findMany({
      where: {
        design_name: product_type ? { contains: product_type } : undefined,
        created_at: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        invoices: true,
        cut_lays: true,
        sewing_runs: true,
        print_runs: true,
        line_items: true,
      },
      });

    // Calculate average costs and prices
    const stats = orders.map(order => {;
      const cuttingCost = 0; // Cut lays don't have labor_cost field
      const sewingCost = order.sewing_runs.reduce(
        (sum, run) => sum + (run.piece_rate_pay || 0),
        0
      );
      const printCost = 0; // Print runs don't have labor_cost field

      const materialCost = 0; // Material cost would come from material_requirements
      const actualCost = materialCost + cuttingCost + sewingCost + printCost;

      const quotedPrice =
        order.invoices.length > 0
          ? parseFloat(order.invoices[0].total_amount.toString())
          : parseFloat(order.total_amount.toString());

      const margin =
        quotedPrice > 0 ? ((quotedPrice - actualCost) / quotedPrice) * 100 : 0;
      const accepted = order.status !== "CANCELLED";

      // Get total quantity from line items
      const totalQuantity = order.line_items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        cost: actualCost > 0 ? actualCost : quotedPrice * 0.7,
        price: quotedPrice,
        margin,
        accepted,
        quantity: totalQuantity,
      };

    const validStats = stats.filter(s => s.cost > 0 && s.price > 0);

    if (validStats.length < 5) {
      return NextResponse.json({
        success: true,
        recommendations: {
          message: "Not enough data for optimization",
          suggested_margin: target_margin || 30,
          confidence: "LOW",
        },
      });

    // Calculate averages
    const avgCost =
      validStats.reduce((sum, s) => sum + s.cost, 0) / validStats.length;
    const avgPrice =
      validStats.reduce((sum, s) => sum + s.price, 0) / validStats.length;
    const currentMargin = ((avgPrice - avgCost) / avgPrice) * 100;
    const acceptanceRate =
      (validStats.filter(s => s.accepted).length / validStats.length) * 100;

    // Generate recommendations
    const recommendations: any = {
      current_metrics: {
        average_cost: Math.round(avgCost * 100) / 100,
        average_price: Math.round(avgPrice * 100) / 100,
        current_margin: Math.round(currentMargin * 100) / 100,
        acceptance_rate: Math.round(acceptanceRate * 100) / 100,
      },
      insights: [],
    };

    const targetMarginValue = target_margin || 30;
    const minAcceptanceValue = min_acceptance_rate || 75;

    // Pricing optimization logic
    if (
      currentMargin < targetMarginValue &&
      acceptanceRate > minAcceptanceValue
    ) {
      // Can increase prices
      const suggestedPrice = avgCost / (1 - targetMarginValue / 100);
      const priceIncrease = ((suggestedPrice - avgPrice) / avgPrice) * 100;

      recommendations.insights.push(
        `💰 Opportunity to increase prices by ${priceIncrease.toFixed(1)}% to reach ${targetMarginValue}% margin`
      );
      recommendations.insights.push(
        `✅ High acceptance rate (${acceptanceRate.toFixed(0)}%) suggests room for price optimization`
      );
      recommendations.suggested_price = Math.round(suggestedPrice * 100) / 100;
    } else if (
      currentMargin > targetMarginValue &&
      acceptanceRate < minAcceptanceValue
    ) {
      // Should decrease prices
      const suggestedPrice = avgPrice * 0.95; // 5% reduction
      const priceDecrease = ((avgPrice - suggestedPrice) / avgPrice) * 100;

      recommendations.insights.push(
        `📉 Consider reducing prices by ${priceDecrease.toFixed(1)}% to improve acceptance rate`
      );
      recommendations.insights.push(
        `⚠️ Low acceptance rate (${acceptanceRate.toFixed(0)}%) indicates pricing may be too high`
      );
      recommendations.suggested_price = Math.round(suggestedPrice * 100) / 100;
    } else if (
      currentMargin >= targetMarginValue &&
      acceptanceRate >= minAcceptanceValue
    ) {
      // Optimal pricing
      recommendations.insights.push(
        "✅ Current pricing is optimal - meeting both margin and acceptance targets"
      );
      recommendations.insights.push(
        `💰 Margin: ${currentMargin.toFixed(1)}% (target: ${targetMarginValue}%)`
      );
      recommendations.insights.push(
        `📊 Acceptance: ${acceptanceRate.toFixed(0)}% (target: ${minAcceptanceValue}%)`
      );
      recommendations.suggested_price = Math.round(avgPrice * 100) / 100;
    } else {
      // Below both targets
      recommendations.insights.push(
        "⚠️ Pricing challenges detected - low margin and low acceptance"
      );
      recommendations.insights.push(
        "💡 Focus on cost reduction or value differentiation"
      );
      recommendations.suggested_price = Math.round(avgPrice * 100) / 100;
    }

    recommendations.confidence =
      validStats.length >= 20
        ? "HIGH"
        : validStats.length >= 10
          ? "MEDIUM"
          : "LOW";
    recommendations.sample_size = validStats.length;

    return NextResponse.json({
      success: true,
      recommendations,
  } catch (error: any) {
    console.error("Pricing optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize pricing", details: error.message },
      { status: 500 }
    );
  }

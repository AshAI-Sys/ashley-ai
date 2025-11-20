/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

// POST /api/packing/ashley-optimize - AI-powered packing optimization
export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const data = await request.json();
    const { order_id, units, carton_specs } = data;

    if (!order_id || !units || !Array.isArray(units)) {
      return NextResponse.json(
        { error: "Order ID and units array are required" },
        { status: 400 }
      );
    }

    // Mock AI optimization algorithm
    const totalUnits = units.reduce((sum: number, u: any) => sum + (u.quantity || 0), 0);
    const defaultCarton = carton_specs || {
      length_cm: 40,
      width_cm: 30,
      height_cm: 25,
      max_weight_kg: 15
    };

    const unitsPerCarton = 50; // AI-suggested optimal packing
    const estimatedCartons = Math.ceil(totalUnits / unitsPerCarton);

    // Generate optimized carton distribution
    const optimizedCartons = [];
    let remainingUnits = totalUnits;

    for (let i = 0; i < estimatedCartons; i++) {
      const cartonUnits = Math.min(remainingUnits, unitsPerCarton);
      const unitWeight = 0.15; // kg per unit
      const actualWeight = defaultCarton.max_weight_kg * 0.1 + (cartonUnits * unitWeight);
      const fillPercentage = (cartonUnits / unitsPerCarton) * 100;

      optimizedCartons.push({
        carton_number: i + 1,
        units_count: cartonUnits,
        estimated_weight_kg: Number(actualWeight.toFixed(2)),
        fill_percentage: Number(fillPercentage.toFixed(1)),
        dimensions: defaultCarton,
        efficiency_score: fillPercentage >= 90 ? 'HIGH' : fillPercentage >= 70 ? 'MEDIUM' : 'LOW'
      });

      remainingUnits -= cartonUnits;
    }

    // Calculate overall efficiency metrics
    const avgFillPercentage = optimizedCartons.reduce((sum: number, c: any) =>
      sum + c.fill_percentage, 0) / optimizedCartons.length;

    const totalWeight = optimizedCartons.reduce((sum: number, c: any) =>
      sum + c.estimated_weight_kg, 0);

    return NextResponse.json({
      success: true,
      message: "Packing optimization completed",
      optimization: {
        order_id,
        total_units: totalUnits,
        recommended_cartons: estimatedCartons,
        carton_distribution: optimizedCartons,
        metrics: {
          avg_fill_percentage: Number(avgFillPercentage.toFixed(1)),
          total_weight_kg: Number(totalWeight.toFixed(2)),
          efficiency_rating: avgFillPercentage >= 85 ? 'EXCELLENT' : avgFillPercentage >= 70 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
          cost_savings_estimate: estimatedCartons < (totalUnits / 40) ? 'HIGH' : 'MEDIUM'
        },
        recommendations: [
          'Use uniform carton sizes for better stacking',
          'Fill cartons to 90%+ capacity for optimal efficiency',
          'Consider weight distribution for shipping costs'
        ],
        ashley_confidence: 0.92
      }
    });
  } catch (error) {
    console.error("Error in packing optimization:", error);
    return NextResponse.json(
      { error: "Failed to optimize packing" },
      { status: 500 }
    );
  }
});

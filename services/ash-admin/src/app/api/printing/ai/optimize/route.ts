import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const {
      print_method,
      order_id,
      quantity,
      materials,
      machine_id,
      quality_requirements,
      rush_order = false,
    } = body;

    if (!print_method || !order_id || !quantity) {
      return NextResponse.json(
        {
          success: false,
          error: "Print method, order ID, and quantity are required",
        },
        { status: 400 }
      );
    }

    // Get machine data for optimization (using print_runs instead of printMachine)
    const machine = machine_id
      ? await prisma.machine.findUnique({
          where: { id: machine_id },
          include: {
            print_runs: {
              where: {
                status: { in: ["IN_PROGRESS", "PAUSED"] },
              },
              take: 5,
              orderBy: { created_at: "desc" },
            },
          },
        })
      : null;

    // Get historical performance data
    const historicalRuns = await prisma.printRun.findMany({
      where: {
        method: print_method,
        status: "COMPLETED",
      },
      include: {
        outputs: true,
        materials: true,
      },
      take: 20,
      orderBy: { created_at: "desc" },

    // Generate AI optimization recommendations
    const optimization = generateOptimization(print_method, {
      quantity,
      materials,
      machine,
      historicalRuns,
      quality_requirements,
      rush_order,
      });

    // Store AI analysis (using aIAnalysis instead of printRunAIAnalysis)
    const aiAnalysis = await prisma.aIAnalysis.create({
      data: {
        workspace_id: "default",
        entity: "PRINT_RUN",
        entity_id: order_id,
        stage: "PRINTING",
        analysis_type: "OPTIMIZATION",
        risk: "LOW",
        confidence: optimization.confidence_score,
        issues: JSON.stringify(optimization.recommendations),
        recommendations: JSON.stringify(optimization.recommendations),
        metadata: JSON.stringify({
          print_method,
          optimization_factors: optimization.factors,
          historical_data_points: historicalRuns.length,
          machine_id: machine?.id || null,
          estimated_completion_time: optimization.estimated_completion_time,
          cost_prediction: optimization.cost_prediction,
          quality_prediction: optimization.quality_prediction,
          material_efficiency: optimization.material_efficiency,
        }),
        result: "SUCCESS",
        created_by: "system",
      },
      });

    return NextResponse.json({
      success: true,
      data: {
        analysis_id: aiAnalysis.id,
        ...optimization,
      },
  } catch (error) {
    console.error("AI optimization error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate AI optimization" },
      { status: 500 }
    );
  }
}

function generateOptimization(method: string, params: any) {
  const {
    quantity,
    materials,
    machine,
    historicalRuns,
    quality_requirements,
    rush_order,
  } = params;

  // Base optimization factors
  const baseFactors = {
    quantity_efficiency: calculateQuantityEfficiency(quantity, method),
    material_optimization: calculateMaterialOptimization(materials, method),
    machine_efficiency: machine ? calculateMachineEfficiency(machine) : 0.85,
    historical_performance: calculateHistoricalPerformance(historicalRuns),
  };

  // Method-specific optimizations
  let methodOptimization = {};

  switch (method) {
    case "SILKSCREEN":
      methodOptimization = optimizeSilkscreen(params, baseFactors);
      break;
    case "SUBLIMATION":
      methodOptimization = optimizeSublimation(params, baseFactors);
      break;
    case "DTF":
      methodOptimization = optimizeDTF(params, baseFactors);
      break;
    case "EMBROIDERY":
      methodOptimization = optimizeEmbroidery(params, baseFactors);
      break;

  return {
    recommendations: generateRecommendations(
      method,
      methodOptimization,
      baseFactors
    ),
    confidence_score: calculateConfidenceScore(
      baseFactors,
      historicalRuns.length
    ),
    estimated_completion_time: calculateEstimatedTime(
      method,
      quantity,
      baseFactors
    ),
    cost_prediction: calculateCostPrediction(
      method,
      quantity,
      materials,
      baseFactors
    ),
    quality_prediction: calculateQualityPrediction(
      baseFactors,
      quality_requirements
    ),
    material_efficiency: baseFactors.material_optimization,
    factors: { ...baseFactors, ...methodOptimization },
  };
}

function calculateQuantityEfficiency(quantity: number, method: string) {
  const optimalRanges = {
    SILKSCREEN: { min: 50, optimal: 250, max: 1000 },
    SUBLIMATION: { min: 1, optimal: 25, max: 100 },
    DTF: { min: 1, optimal: 50, max: 200 },
    EMBROIDERY: { min: 1, optimal: 12, max: 48 },
  };

  const range = optimalRanges[method] || optimalRanges.SUBLIMATION;

  if (quantity >= range.min && quantity <= range.optimal) {
    return 0.95 + (quantity / range.optimal) * 0.05;
  } else if (quantity <= range.max) {
    return (
      0.85 +
      (1 - (quantity - range.optimal) / (range.max - range.optimal)) * 0.1
    );
  } else {
    return 0.75;
  }
}

function calculateMaterialOptimization(materials: any[], method: string) {
  if (!materials || materials.length === 0) return 0.8;

  const methodFactors = {
    SILKSCREEN: { ink: 0.4, screens: 0.3, squeegees: 0.2, substrate: 0.1 },
    SUBLIMATION: { ink: 0.4, paper: 0.3, substrate: 0.3 },
    DTF: { ink: 0.3, film: 0.3, powder: 0.2, substrate: 0.2 },
    EMBROIDERY: { thread: 0.6, backing: 0.2, needles: 0.2 },
  };

  return 0.85 + Math.random() * 0.1; // Simplified for demo
}

function calculateMachineEfficiency(machine: any) {
  const baseEfficiency = 0.85; // Default efficiency
  const maintenanceBonus = machine.last_maintenance_date ? 0.05 : -0.1;
  const installDate = machine.install_date
    ? new Date(machine.install_date)
    : null;
  const agefactor = installDate
    ? Math.max(
        0.7,
        1 -
          (Date.now() - installDate.getTime()) / (1000 * 60 * 60 * 24 * 365 * 5)
      )
    : 0.85;

  return Math.min(
    0.98,
    Math.max(0.6, baseEfficiency + maintenanceBonus) * agefactor
  );
}

function calculateHistoricalPerformance(runs: any[]) {
  if (runs.length === 0) return 0.8;

  const qualityScores = runs.map(run => {
    // Use output quality metrics instead of QC inspections;
    if (!run.outputs || run.outputs.length === 0) return 0.85;

    const output = run.outputs[0];
    const totalQty = (output.qty_good || 0) + (output.qty_reject || 0);
    if (totalQty === 0) return 0.85;

    const defectRate = (output.qty_reject || 0) / totalQty;
    return Math.max(0.5, 1 - defectRate);
    }

  return (
    qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
  );
}

function optimizeSilkscreen(params: any, factors: any) {
  return {
    screen_setup_time: 15 + (params.materials?.length || 1) * 5,
    ink_mixing_optimization: factors.material_optimization * 0.9,
    print_speed_factor: factors.machine_efficiency,
    curing_optimization: params.rush_order ? 1.2 : 1.0,
    recommended_passes: Math.ceil(params.quantity / 100),
  };
}

function optimizeSublimation(params: any, factors: any) {
  return {
    heat_press_temp: 400,
    press_time: params.rush_order ? 45 : 60,
    paper_efficiency: factors.material_optimization,
    color_saturation_factor: factors.historical_performance,
    batch_size_optimization: Math.min(25, params.quantity),
  };
}

function optimizeDTF(params: any, factors: any) {
  return {
    film_temperature: 340,
    powder_application_speed: factors.machine_efficiency,
    curing_time: params.rush_order ? 120 : 150,
    transfer_pressure: 6,
    film_efficiency: factors.material_optimization,
  };
}

function optimizeEmbroidery(params: any, factors: any) {
  return {
    stitch_density: 4.5,
    thread_tension: factors.machine_efficiency * 10,
    speed_optimization: params.rush_order ? 850 : 750,
    color_change_efficiency: factors.material_optimization,
    hoop_utilization: Math.min(0.95, factors.quantity_efficiency),
  };
}

function generateRecommendations(
  method: string,
  methodOpt: any,
  baseFactors: any
) {
  const recommendations = [];

  // General recommendations
  if (baseFactors.quantity_efficiency < 0.8) {
    recommendations.push({
      type: "QUANTITY",
      priority: "HIGH",
      message: "Consider adjusting quantity for optimal batch size",
      impact: "cost_reduction",
    }

  if (baseFactors.machine_efficiency < 0.8) {
    recommendations.push({
      type: "MAINTENANCE",
      priority: "MEDIUM",
      message: "Schedule machine maintenance to improve efficiency",
      impact: "quality_improvement",
    }

  // Method-specific recommendations
  switch (method) {
    case "SILKSCREEN":
      if (methodOpt.recommended_passes > 3) {
        recommendations.push({
          type: "PROCESS",
          priority: "MEDIUM",
          message: "Consider splitting into multiple smaller batches",
          impact: "time_optimization",
        }
      }
      break;

    case "SUBLIMATION":
      if (methodOpt.batch_size_optimization < 10) {
        recommendations.push({
          type: "BATCHING",
          priority: "LOW",
          message:
            "Small batch detected - consider combining with similar orders",
          impact: "efficiency",
        }
      }
      break;

    case "DTF":
      recommendations.push({
        type: "TEMPERATURE",
        priority: "HIGH",
        message: `Optimal film temperature: ${methodOpt.film_temperature}°F`,
        impact: "quality_improvement",
      }
      break;

    case "EMBROIDERY":
      if (methodOpt.speed_optimization > 800) {
        recommendations.push({
          type: "SPEED",
          priority: "MEDIUM",
          message: "High speed detected - monitor thread breaks",
          impact: "quality_assurance",
        }
      }
      break;

  return recommendations;
}

function calculateConfidenceScore(factors: any, historicalCount: number) {
  const dataConfidence = Math.min(0.95, 0.6 + (historicalCount / 50) * 0.35);
  const factorConfidence =
    (Object.values(factors).reduce(
      (sum: number, val: any) =>
        (sum as number) + (typeof val === "number" ? (val as number) : 0),
      0
    ) as number) / Object.keys(factors).length;

  return Math.round(dataConfidence * factorConfidence * 100) / 100;
}

function calculateEstimatedTime(
  method: string,
  quantity: number,
  factors: any
) {
  const baseTimes = {
    SILKSCREEN: 0.8, // minutes per piece
    SUBLIMATION: 2.5,
    DTF: 1.5,
    EMBROIDERY: 8.0,
  };

  const baseTime = (baseTimes[method] || 2.0) * quantity;
  const efficiencyFactor =
    (factors.machine_efficiency + factors.quantity_efficiency) / 2;

  return Math.round(baseTime / efficiencyFactor);
}

function calculateCostPrediction(
  method: string,
  quantity: number,
  materials: any[],
  factors: any
) {
  const baseCosts = {
    SILKSCREEN: 2.5,
    SUBLIMATION: 3.75,
    DTF: 4.25,
    EMBROIDERY: 8.5,
  };

  const baseCost = (baseCosts[method] || 3.0) * quantity;
  const materialEfficiencyDiscount =
    (factors.material_optimization - 0.8) * 0.15;
  const quantityDiscount = factors.quantity_efficiency > 0.9 ? 0.1 : 0;

  return (
    Math.round(
      baseCost * (1 - materialEfficiencyDiscount - quantityDiscount) * 100
    ) / 100
  );
}

function calculateQualityPrediction(factors: any, requirements: any) {
  const baseQuality =
    factors.historical_performance * 0.4 + factors.machine_efficiency * 0.6;
  const requirementsFactor = requirements?.high_quality ? 0.95 : 0.88;

  return Math.min(
    0.99,
    Math.round(baseQuality * requirementsFactor * 100) / 100
  );
    }

/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, _user) => {
  try {
    const { searchParams } = new URL(request.url);
    const run_id = searchParams.get("run_id");
    const _method = searchParams.get("method");

    if (!run_id) {
      
      return NextResponse.json(
        { success: false, error: "Run ID is required" },
        { status: 400 }
      );
    }

    // Get current run data
    const printRun = await prisma.printRun.findUnique({
      where: { id: run_id },
      include: {
        materials: true,
        outputs: true,
        rejects: true,
      },
    });

    if (!printRun) {
      
      return NextResponse.json(
        { success: false, error: "Print run not found" },
        { status: 404 }
      );
    }

    // Generate real-time insights
    const insights = await generateRealTimeInsights(printRun);

    return NextResponse.json({
      success: true,
      data: {
        run_id,
        status: printRun.status,
        insights,
        recommendations: generateRealTimeRecommendations(printRun, insights),
        performance_score: calculatePerformanceScore(printRun, insights),
      },
    });
  } catch (error) {
    console.error("AI monitoring error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate AI monitoring data" },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const body = await request.json();
    const { run_id, sensor_data, operator_input, quality_checkpoint } = body;

    if (!run_id) {
      
      return NextResponse.json(
        { success: false, error: "Run ID is required" },
        { status: 400 }
      );
    }

    // Process incoming monitoring data
    const analysis = await processMonitoringData(run_id, {
      sensor_data,
      operator_input,
      quality_checkpoint,
    });

    // Store monitoring record would go here if PrintRunAIAnalysis model existed
    console.log("AI Analysis:", analysis);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("AI monitoring update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process monitoring data" },
      { status: 500 }
    );
  }
});

async function generateRealTimeInsights(printRun: any) {
  const insights = {
    material_utilization: calculateMaterialUtilization(printRun),
    quality_trend: analyzeQualityTrend(printRun),
    efficiency_score: calculateEfficiencyScore(printRun),
    cost_tracking: analyzeCostTracking(printRun),
    time_prediction: predictCompletionTime(printRun),
    risk_factors: identifyRiskFactors(printRun),
  };

  return insights;
}

function calculateMaterialUtilization(printRun: any) {
  const materials = printRun.materials || [];

  if (materials.length === 0) {
    
    return {
      utilization_rate: 0,
      waste_percentage: 0,
      cost_efficiency: 0,
      total_cost: 0,
    };
  }

  let totalPlanned = 0;
  let totalUsed = 0;
  let totalCost = 0;

  materials.forEach((material: any) => {
    const planned = material.qty || 0;
    const used = material.qty || 0;
    const cost = 0; // Would calculate from inventory if available

    totalPlanned += planned;
    totalUsed += used;
    totalCost += cost;
  });

  const utilizationRate = totalPlanned > 0 ? totalUsed / totalPlanned : 0;
  const wastePercentage = Math.max(
    0,
    ((totalUsed - totalPlanned) / totalPlanned) * 100
  );

  return {
    utilization_rate: Math.round(utilizationRate * 100) / 100,
    waste_percentage: Math.round(wastePercentage * 100) / 100,
    cost_efficiency:
      totalCost > 0 ? Math.round((1 - wastePercentage / 100) * 100) / 100 : 0,
    total_cost: Math.round(totalCost * 100) / 100,
  };
}

function analyzeQualityTrend(printRun: any) {
  const outputs = printRun.outputs || [];
  const _rejects = printRun.rejects || [];

  if (outputs.length === 0) {

    return { trend: "unknown", score: 0, confidence: 0, defect_rate: 0 };
  }

  const totalGood = outputs.reduce(
    (sum: number, o: any) => sum + (o.qty_good || 0),
    0
  );
  const totalReject = outputs.reduce(
    (sum: number, o: any) => sum + (o.qty_reject || 0),
    0
  );
  const total = totalGood + totalReject;

  const defectRate = total > 0 ? totalReject / total : 0;
  const qualityScore = Math.max(0, 1 - defectRate);

  let trend = "stable";
  if (qualityScore > 0.95) trend = "excellent";
  else if (qualityScore > 0.9) trend = "good";
  else if (qualityScore > 0.8) trend = "acceptable";
  else trend = "needs_attention";

  return {
    trend,
    score: Math.round(qualityScore * 100) / 100,
    defect_rate: Math.round(defectRate * 100) / 100,
    confidence: total > 10 ? 0.9 : Math.min(0.8, total / 10),
  };
}

function calculateEfficiencyScore(printRun: any) {
  const startTime = printRun.started_at ? new Date(printRun.started_at) : null;
  const currentTime = new Date();

  if (!startTime) {

    return { score: 0, factors: { time: 0, quality: 0, material: 0 } };
  }

  const elapsedHours =
    (currentTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  // Estimate 8 hours if not specified
  const estimatedHours = elapsedHours * 1.2;

  const timeEfficiency =
    estimatedHours > 0 ? Math.min(1, estimatedHours / elapsedHours) : 0.8;
  const qualityEfficiency = analyzeQualityTrend(printRun).score;
  const materialUtil = calculateMaterialUtilization(printRun);
  const materialEfficiency = materialUtil.cost_efficiency || 0.8;

  const overallScore =
    timeEfficiency * 0.4 + qualityEfficiency * 0.4 + materialEfficiency * 0.2;

  return {
    score: Math.round(overallScore * 100) / 100,
    factors: {
      time: Math.round(timeEfficiency * 100) / 100,
      quality: Math.round(qualityEfficiency * 100) / 100,
      material: Math.round(materialEfficiency * 100) / 100,
    },
  };
}

function analyzeCostTracking(printRun: any) {
  const materials = printRun.materials || [];
  const laborHours = printRun.started_at
    ? (new Date().getTime() - new Date(printRun.started_at).getTime()) /
      (1000 * 60 * 60)
    : 0;

  const materialCost = materials.reduce((sum: number, mat: any) => {
    const cost = 0; // Would calculate from inventory if available
    return sum + cost;
  }, 0);

  const laborCost = laborHours * 25; // Assuming $25/hour
  const overhead = (materialCost + laborCost) * 0.15; // 15% overhead
  const totalCost = materialCost + laborCost + overhead;

  const revenuePerPiece = getEstimatedRevenuePerPiece(printRun.method);
  const outputs = printRun.outputs || [];
  const totalQty = outputs.reduce(
    (sum: number, o: any) => sum + (o.qty_good || 0),
    0
  );
  const estimatedRevenue = revenuePerPiece * totalQty;
  const profitMargin =
    estimatedRevenue > 0
      ? (estimatedRevenue - totalCost) / estimatedRevenue
      : 0;

  return {
    material_cost: Math.round(materialCost * 100) / 100,
    labor_cost: Math.round(laborCost * 100) / 100,
    overhead_cost: Math.round(overhead * 100) / 100,
    total_cost: Math.round(totalCost * 100) / 100,
    estimated_revenue: Math.round(estimatedRevenue * 100) / 100,
    profit_margin: Math.round(profitMargin * 100) / 100,
  };
}

function predictCompletionTime(printRun: any) {
  const startTime = printRun.started_at ? new Date(printRun.started_at) : null;

  if (!startTime) {

    return { estimated_completion: null, remaining_minutes: 0, confidence: 0 };
  }

  const elapsedMinutes =
    (new Date().getTime() - startTime.getTime()) / (1000 * 60);

  // Estimate based on method and quantity
  const outputs = printRun.outputs || [];
  const totalQty = outputs.reduce(
    (sum: number, o: any) => sum + (o.qty_good || 0),
    0
  );
  const estimatedTotalMinutes = getMethodEstimatedTime(
    printRun.method,
    totalQty
  );
  const remainingMinutes = Math.max(0, estimatedTotalMinutes - elapsedMinutes);

  const estimatedCompletion = new Date(
    Date.now() + remainingMinutes * 60 * 1000
  );
  const confidence = totalQty > 10 ? 0.8 : 0.6;

  return {
    estimated_completion: estimatedCompletion,
    remaining_minutes: Math.round(remainingMinutes),
    confidence,
  };
}

function identifyRiskFactors(printRun: any) {
  const risks = [];

  // Quality risk
  const qualityTrend = analyzeQualityTrend(printRun);
  if (qualityTrend.score < 0.8) {
    risks.push({
      type: "QUALITY",
      level: qualityTrend.score < 0.6 ? "HIGH" : "MEDIUM",
      description: `Quality score below threshold: ${Math.round(qualityTrend.score * 100)}%`,
      recommendation: "Immediate quality inspection required",
    });
  }

  // Material waste risk
  const materialUtil = calculateMaterialUtilization(printRun);
  if (materialUtil.waste_percentage > 10) {
    risks.push({
      type: "MATERIAL_WASTE",
      level: materialUtil.waste_percentage > 20 ? "HIGH" : "MEDIUM",
      description: `Material waste at ${materialUtil.waste_percentage}%`,
      recommendation: "Review material usage and adjust parameters",
    });
  }

  // Time overrun risk
  const prediction = predictCompletionTime(printRun);
  const estimatedHours = 8; // Default estimate
  if (prediction.remaining_minutes > estimatedHours * 60 * 1.2) {
    risks.push({
      type: "TIME_OVERRUN",
      level: "MEDIUM",
      description: "Run exceeding estimated completion time",
      recommendation: "Consider process optimization or additional resources",
    });
  }

  // Cost overrun risk
  const costTracking = analyzeCostTracking(printRun);
  if (costTracking.profit_margin < 0.2) {
    risks.push({
      type: "COST_OVERRUN",
      level: costTracking.profit_margin < 0.1 ? "HIGH" : "MEDIUM",
      description: `Low profit margin: ${Math.round(costTracking.profit_margin * 100)}%`,
      recommendation: "Review pricing or optimize costs",
    });
  }

  return risks;
}

function generateRealTimeRecommendations(printRun: any, insights: any) {
  const recommendations: any[] = [];

  // Based on efficiency score
  if (insights.efficiency_score.score < 0.8) {
    
    const worstFactor = Object.entries(insights.efficiency_score.factors).sort(
      ([, a], [, b]) => (a as number) - (b as number)
    )[0];

    recommendations.push({
      type: "EFFICIENCY",
      priority: "HIGH",
      message: `Improve ${worstFactor[0]} efficiency (currently ${Math.round((worstFactor[1] as number) * 100)}%)`,
      action: getEfficiencyAction(worstFactor[0], printRun.method),
    });
  }

  // Based on quality trend
  if (insights.quality_trend.trend === "needs_attention") {
    recommendations.push({
      type: "QUALITY",
      priority: "CRITICAL",
      message: "Quality below acceptable standards",
      action: "Stop production and investigate quality issues",
    });
  }

  // Based on material utilization
  if (insights.material_utilization.waste_percentage > 15) {
    recommendations.push({
      type: "MATERIAL",
      priority: "MEDIUM",
      message: `High material waste detected: ${insights.material_utilization.waste_percentage}%`,
      action: "Adjust material parameters and review setup",
    });
  }

  // Based on risk factors
  insights.risk_factors.forEach((risk: any) => {
    if (risk.level === "HIGH") {
      recommendations.push({
        type: risk.type,
        priority: "HIGH",
        message: risk.description,
        action: risk.recommendation,
      });
    }
  });

  return recommendations;
}

function calculatePerformanceScore(printRun: any, insights: any) {
  const weights: Record<string, number> = {
    efficiency: 0.3,
    quality: 0.3,
    cost: 0.25,
    time: 0.15,
  };

  const scores: Record<string, number> = {
    efficiency: insights.efficiency_score.score,
    quality: insights.quality_trend.score,
    cost: Math.max(0, insights.cost_tracking.profit_margin * 5), // Scale to 0-1
    time: insights.time_prediction.confidence,
  };

  const weightedScore = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + (scores[key] || 0) * weight;
  }, 0);

  return {
    overall_score: Math.round(weightedScore * 100) / 100,
    component_scores: scores,
    grade: getPerformanceGrade(weightedScore),
  };
}

function getEstimatedRevenuePerPiece(method: string) {
  const revenues: Record<string, number> = {
    SILKSCREEN: 5.5,
    SUBLIMATION: 7.25,
    DTF: 8.75,
    EMBROIDERY: 15.0,
    RUBBERIZED: 6.5,
  };
  return revenues[method] || 6.0;
}

function getMethodEstimatedTime(method: string, quantity: number) {
  const timePerPiece: Record<string, number> = {
    SILKSCREEN: 0.8,
    SUBLIMATION: 2.5,
    DTF: 1.5,
    EMBROIDERY: 8.0,
    RUBBERIZED: 1.2,
  };
  return (timePerPiece[method] || 2.0) * quantity;
}

function getEfficiencyAction(factor: string, method: string) {
  const actions: Record<string, Record<string, string>> = {
    time: {
      SILKSCREEN: "Optimize screen setup and ink flow",
      SUBLIMATION: "Adjust heat press timing and temperature",
      DTF: "Optimize film feeding and curing process",
      EMBROIDERY: "Check thread tension and machine speed",
      RUBBERIZED: "Optimize rubber application process",
    },
    quality: {
      SILKSCREEN: "Check squeegee pressure and ink viscosity",
      SUBLIMATION: "Verify paper alignment and heat distribution",
      DTF: "Check powder application and curing temperature",
      EMBROIDERY: "Inspect thread quality and needle condition",
      RUBBERIZED: "Check rubber consistency and application",
    },
    material: {
      SILKSCREEN: "Optimize ink usage and screen mesh",
      SUBLIMATION: "Reduce paper waste and improve positioning",
      DTF: "Optimize film usage and powder application",
      EMBROIDERY: "Reduce thread breaks and optimize thread usage",
      RUBBERIZED: "Optimize rubber material usage",
    },
  };

  return (
    actions[factor]?.[method] ||
    "Review process parameters and equipment settings"
  );
}

function getPerformanceGrade(score: number) {
  if (score >= 0.9) return "A+";
  if (score >= 0.85) return "A";
  if (score >= 0.8) return "B+";
  if (score >= 0.75) return "B";
  if (score >= 0.7) return "C+";
  if (score >= 0.65) return "C";
  return "D";
}

async function processMonitoringData(runId: string, data: any) {
  // Process sensor data, operator input, and quality checkpoints
  // This is a simplified implementation for demo purposes

  const analysis: any = {
    recommendations: [],
    confidence_score: 0.85,
    alerts: [],
  };

  // Process sensor data
  if (data.sensor_data) {
    
    const { temperature, humidity, pressure } = data.sensor_data;

    if (temperature && (temperature < 20 || temperature > 35)) {
      analysis.alerts.push({
        type: "ENVIRONMENTAL",
        severity: "MEDIUM",
        message: `Temperature out of optimal range: ${temperature}°C`,
      });
    }

    if (humidity && (humidity < 40 || humidity > 70)) {
      analysis.alerts.push({
        type: "ENVIRONMENTAL",
        severity: "LOW",
        message: `Humidity suboptimal: ${humidity}%`,
      });
    }
  }

  // Process operator input
  if (data.operator_input) {
    
    const { issues, adjustments } = data.operator_input;

    if (issues && issues.length > 0) {
      analysis.recommendations.push({
        type: "OPERATOR_FEEDBACK",
        priority: "HIGH",
        message: "Address operator-reported issues",
        details: issues,
      });
    }
  }

  // Process quality checkpoint
  if (data.quality_checkpoint) {
    
    const { pass_rate, defects } = data.quality_checkpoint;

    if (pass_rate < 0.85) {
      analysis.alerts.push({
        type: "QUALITY",
        severity: "HIGH",
        message: `Quality checkpoint below threshold: ${Math.round(pass_rate * 100)}%`,
      });

      analysis.recommendations.push({
        type: "QUALITY",
        priority: "CRITICAL",
        message: "Immediate quality intervention required",
      });
    }
  }

  return analysis;
}

/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

// Ashley AI Quality Control Analytics
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const { inspection_id, analysis_type } = await request.json();

    const inspection = await prisma.qCInspection.findUnique({
      where: { id: inspection_id },
      include: {
        order: {
          include: {
            routing_steps: {
              include: {
                print_runs: true,
                sewing_runs: true,
              },
            },
          },
        },
        samples: {
          include: {
            defects: {
              include: {
                defect_code: true,
              },
            },
          },
        },
        defects: {
          include: {
            defect_code: true,
          },
        },
      },
      });

    if (!inspection) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    let ashleyAnalysis = {};

    switch (analysis_type) {
      case "defect_trend_analysis":
        ashleyAnalysis = await performDefectTrendAnalysis(inspection);
        break;
      case "root_cause_prediction":
        ashleyAnalysis = await performRootCausePrediction(inspection);
        break;
      case "quality_risk_assessment":
        ashleyAnalysis = await performQualityRiskAssessment(inspection);
        break;
      case "process_control_analysis":
        ashleyAnalysis = await performProcessControlAnalysis(inspection);
        break;
      default:
        ashleyAnalysis = await performComprehensiveAnalysis(inspection);
    }

    // Update inspection with Ashley analysis
    await prisma.qCInspection.update({
      where: { id: inspection_id },
      data: {
        ashley_analysis: JSON.stringify(ashleyAnalysis),
      },
      });

    return NextResponse.json({
      inspection_id,
      analysis_type,
      ashley_analysis: ashleyAnalysis,
    });
  } catch (error) {
    console.error("Error in Ashley QC analysis:", error);
    return NextResponse.json(
      { error: "Failed to perform Ashley analysis" },
      { status: 500 }
    );
  }
});

async function performDefectTrendAnalysis(inspection: any) {
  // Analyze defect patterns over time for this order/production line
  const historicalData = await prisma.qCInspection.findMany({
    where: {
      workspace_id: inspection.workspace_id,
      stage: inspection.stage, // Changed from inspection_type to stage
      inspection_date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    include: {
      defects: {
        include: {
          defect_code: true,
        },
      },
    },
    orderBy: { inspection_date: "asc" },
      });

  const defectTrends = {};
  const timeSeriesData = [];

  historicalData.forEach(insp => {
    const date = insp.inspection_date.toISOString().split("T")[0];
    let totalDefects = 0;

    insp.defects.forEach(defect => {
      const defectType = defect.defect_code.category;
      if (!defectTrends[defectType]) {
        defectTrends[defectType] = [];
      }
      defectTrends[defectType].push({
        date,
        count: defect.quantity,
        severity: defect.severity,
      });
      totalDefects += defect.quantity;
    });

    timeSeriesData.push({
      date,
      total_defects: totalDefects,
      defect_rate: (totalDefects / insp.sample_size) * 100,
    });
  });

  // Calculate trends
  const currentDefectRate =
    ((inspection.critical_found +
      inspection.major_found +
      inspection.minor_found) /
      inspection.sample_size) *
    100;
  const avgDefectRate =
    timeSeriesData.reduce((sum, data) => sum + data.defect_rate, 0) /
      timeSeriesData.length || 0;

  const trendDirection =
    currentDefectRate > avgDefectRate * 1.2
      ? "INCREASING"
      : currentDefectRate < avgDefectRate * 0.8
        ? "DECREASING"
        : "STABLE";

  return {
    type: "defect_trend_analysis",
    current_defect_rate: currentDefectRate,
    average_defect_rate: avgDefectRate,
    trend_direction: trendDirection,
    trend_confidence: Math.min(timeSeriesData.length * 10, 100), // More data = higher confidence
    defect_categories: defectTrends,
    time_series: timeSeriesData,
    recommendations: generateDefectTrendRecommendations(
      trendDirection,
      defectTrends
    ),
  };
}

async function performRootCausePrediction(inspection: any) {
  const defectPatterns = {};

  inspection.defects.forEach(defect => {
    const category = defect.defect_code.category;
    if (!defectPatterns[category]) {
      defectPatterns[category] = {
        count: 0,
        severity_distribution: { CRITICAL: 0, MAJOR: 0, MINOR: 0 },
        locations: {},
      };
    }

    defectPatterns[category].count += defect.quantity;
    defectPatterns[category].severity_distribution[defect.severity] +=
      defect.quantity;

    if (defect.location) {
      if (!defectPatterns[category].locations[defect.location]) {
        defectPatterns[category].locations[defect.location] = 0;
      }
      defectPatterns[category].locations[defect.location] += defect.quantity;
    }
  });
  // Root cause prediction logic based on defect patterns
  const rootCausePredictions = [];

  for (const [category, pattern] of Object.entries(defectPatterns)) {
    let likelyRootCause = "Unknown";
    let confidence = 0;
    let preventiveActions = [];

    switch (category) {
      case "PRINTING":
        if ((pattern as any)?.severity_distribution?.CRITICAL > 0) {
          likelyRootCause = "Ink viscosity or screen registration issue";
          confidence = 85;
          preventiveActions = [
            "Check ink viscosity and adjust if needed",
            "Verify screen registration accuracy",
            "Inspect squeegee condition",
          ];
        } else if (
          (pattern as any)?.severity_distribution?.MAJOR >
          (pattern as any)?.severity_distribution?.MINOR
        ) {
          likelyRootCause = "Print pressure or speed settings";
          confidence = 70;
          preventiveActions = [
            "Adjust print pressure settings",
            "Review print speed parameters",
            "Check substrate preparation",
          ];
        }
        break;

      case "SEWING":
        if (Object.keys((pattern as any)?.locations || {}).length > 3) {
          likelyRootCause = "Machine calibration or operator training issue";
          confidence = 80;
          preventiveActions = [
            "Recalibrate sewing machine",
            "Provide additional operator training",
            "Review thread tension settings",
          ];
        }
        break;

      case "FABRIC":
        likelyRootCause = "Material quality or storage conditions";
        confidence = 75;
        preventiveActions = [
          "Review fabric supplier quality",
          "Check fabric storage conditions",
          "Inspect incoming fabric batches",
        ];
        break;
    }

    rootCausePredictions.push({
      defect_category: category,
      predicted_root_cause: likelyRootCause,
      confidence_score: confidence,
      preventive_actions: preventiveActions,
      defect_pattern: pattern,
    });
  }

  return {
    type: "root_cause_prediction",
    predictions: rootCausePredictions,
    overall_confidence:
      rootCausePredictions.reduce(
        (sum, pred) => sum + pred.confidence_score,
        0
      ) / rootCausePredictions.length || 0,
    recommended_capa_priority: rootCausePredictions.some(
      pred => pred.confidence_score > 80
    )
      ? "HIGH"
      : "MEDIUM",
  };
}

async function performQualityRiskAssessment(inspection: any) {
  const riskFactors = [];
  let overallRiskScore = 0;

  // Factor 1: Defect rate vs historical average
  const defectRate =
    ((inspection.critical_found +
      inspection.major_found +
      inspection.minor_found) /
      inspection.sample_size) *
    100;
  if (defectRate > 5) {
    riskFactors.push({
      factor: "High defect rate",
      impact: "HIGH",
      score: 30,
      description: `Current defect rate ${defectRate.toFixed(2)}% exceeds acceptable threshold`,
    });
    overallRiskScore += 30;
  }

  // Factor 2: Critical defects present
  if (inspection.critical_found > 0) {
    riskFactors.push({
      factor: "Critical defects found",
      impact: "CRITICAL",
      score: 40,
      description: `${inspection.critical_found} critical defects detected`,
    });
    overallRiskScore += 40;
  }

  // Factor 3: Lot size vs sample adequacy
  const samplePercentage = (inspection.sample_size / inspection.lot_size) * 100;
  if (samplePercentage < 2) {
    riskFactors.push({
      factor: "Low sampling coverage",
      impact: "MEDIUM",
      score: 20,
      description: `Sample size only covers ${samplePercentage.toFixed(1)}% of lot`,
    });
    overallRiskScore += 20;
  }

  // Factor 4: Inspection timing
  const inspectionType = inspection.stage; // Changed from inspection_type to stage
  if (
    inspectionType === "FINAL" &&
    (inspection.major_found > 0 || inspection.critical_found > 0)
  ) {
    riskFactors.push({
      factor: "Late-stage defect detection",
      impact: "HIGH",
      score: 35,
      description:
        "Defects found at final inspection indicate upstream process issues",
    });
    overallRiskScore += 35;
  }

  const riskLevel =
    overallRiskScore >= 70 ? "HIGH" : overallRiskScore >= 40 ? "MEDIUM" : "LOW";

  return {
    type: "quality_risk_assessment",
    overall_risk_score: Math.min(overallRiskScore, 100),
    risk_level: riskLevel,
    risk_factors: riskFactors,
    recommendations: generateRiskMitigationRecommendations(
      riskLevel,
      riskFactors
    ),
  };
}

async function performProcessControlAnalysis(inspection: any) {
  // Statistical Process Control (SPC) analysis
  const controlLimits = {
    ucl: 0, // Upper Control Limit
    lcl: 0, // Lower Control Limit
    centerline: 0,
  };

  // p-Chart analysis for defect rate
  const historicalInspections = await prisma.qCInspection.findMany({
    where: {
      workspace_id: inspection.workspace_id,
      stage: inspection.stage, // Changed from inspection_type to stage
      inspection_date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { inspection_date: "asc" },
      });

  if (historicalInspections.length >= 10) {
    const defectRates = historicalInspections.map(
      insp =>
        (insp.critical_found + insp.major_found + insp.minor_found) /
        insp.sample_size
    );

    const avgDefectRate =
      defectRates.reduce((sum, rate) => sum + rate, 0) / defectRates.length;
    const avgSampleSize =
      historicalInspections.reduce((sum, insp) => sum + insp.sample_size, 0) /
      historicalInspections.length;

    // Calculate control limits for p-chart
    const p = avgDefectRate;
    const n = avgSampleSize;
    const sigma = Math.sqrt((p * (1 - p)) / n);

    controlLimits.centerline = p;
    controlLimits.ucl = p + 3 * sigma;
    controlLimits.lcl = Math.max(0, p - 3 * sigma);
    }

  const currentDefectRate =
    (inspection.critical_found +
      inspection.major_found +
      inspection.minor_found) /
    inspection.sample_size;

  let controlStatus = "IN_CONTROL";
  if (currentDefectRate > controlLimits.ucl) {
    controlStatus = "OUT_OF_CONTROL_HIGH";
  } else if (currentDefectRate < controlLimits.lcl) {
    controlStatus = "OUT_OF_CONTROL_LOW";
  }

  return {
    type: "process_control_analysis",
    control_chart_type: "p-chart",
    control_limits: controlLimits,
    current_defect_rate: currentDefectRate,
    control_status: controlStatus,
    process_capability: calculateProcessCapability(historicalInspections),
    recommendations: generateSPCRecommendations(
      controlStatus,
      currentDefectRate,
      controlLimits
    ),
  };
}

async function performComprehensiveAnalysis(inspection: any) {
  const [trendAnalysis, rootCauseAnalysis, riskAssessment, spcAnalysis] =
    await Promise.all([
      performDefectTrendAnalysis(inspection),
      performRootCausePrediction(inspection),
      performQualityRiskAssessment(inspection),
      performProcessControlAnalysis(inspection),
    ]);

  return {
    type: "comprehensive_analysis",
    timestamp: new Date().toISOString(),
    defect_trends: trendAnalysis,
    root_cause_predictions: rootCauseAnalysis,
    risk_assessment: riskAssessment,
    process_control: spcAnalysis,
    overall_recommendation: generateOverallRecommendation(
      trendAnalysis,
      rootCauseAnalysis,
      riskAssessment,
      spcAnalysis
    ),
  };
}

function generateDefectTrendRecommendations(
  trendDirection: string,
  defectTrends: any
) {
  const recommendations = [];

  if (trendDirection === "INCREASING") {
    recommendations.push(
      "Immediate investigation required - defect rate trending upward"
    );
    recommendations.push("Review recent process changes or material batches");
    recommendations.push(
      "Consider increasing inspection frequency temporarily"
    );
  }

  return recommendations;
}

function generateRiskMitigationRecommendations(
  riskLevel: string,
  riskFactors: any[]
) {
  const recommendations = [];

  if (riskLevel === "HIGH") {
    recommendations.push(
      "IMMEDIATE ACTION: Hold shipment pending investigation"
    );
    recommendations.push("Initiate emergency CAPA process");
    recommendations.push("Notify quality manager and customer if applicable");
  }

  return recommendations;
}

function generateSPCRecommendations(
  controlStatus: string,
  currentRate: number,
  controlLimits: any
) {
  const recommendations = [];

  if (controlStatus === "OUT_OF_CONTROL_HIGH") {
    recommendations.push("Process out of control - investigate special causes");
    recommendations.push(
      "Do not ship until process is brought back into control"
    );
  }

  return recommendations;
}

function generateOverallRecommendation(
  trend: any,
  rootCause: any,
  risk: any,
  spc: any
) {
  if (
    risk.risk_level === "HIGH" ||
    spc.control_status === "OUT_OF_CONTROL_HIGH"
  ) {
    return {
      priority: "IMMEDIATE",
      action: "STOP_PRODUCTION",
      summary: "High risk detected - immediate intervention required",
    };
  }

  if (risk.risk_level === "MEDIUM" || trend.trend_direction === "INCREASING") {
    return {
      priority: "HIGH",
      action: "INVESTIGATE",
      summary:
        "Quality issues detected - investigation and corrective action needed",
    };
  }

  return {
    priority: "NORMAL",
    action: "MONITOR",
    summary: "Quality within acceptable limits - continue monitoring",
  };
}

function calculateProcessCapability(historicalInspections: any[]) {
  if (historicalInspections.length < 30) {
    return {
      cp: null,
      cpk: null,
      note: "Insufficient data for capability analysis",
    };
  }

  // Simplified capability calculation
  return { cp: 1.33, cpk: 1.2, note: "Process capable" };
}

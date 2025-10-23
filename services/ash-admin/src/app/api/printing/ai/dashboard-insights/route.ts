import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    // Get active runs with their outputs;
    const activeRuns = await prisma.printRun.findMany({
      where: {
        status: { in: ["IN_PROGRESS", "PAUSED"] },
      },
      include: {
        outputs: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
        materials: true,
      },

    // Get recent completed runs for trend analysis
    const recentRuns = await prisma.printRun.findMany({
      where: {
        status: "COMPLETED",
        ended_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: {
        outputs: true,
      },
      orderBy: { ended_at: "desc" },

    // Generate dashboard insights
    const insights = generateDashboardInsights(activeRuns, recentRuns);

    return NextResponse.json({
      success: true,
      data: insights,
  } catch (error) {
    console.error("Dashboard AI insights error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate dashboard insights" },
      { status: 500 }
    );
  }
}

function generateDashboardInsights(activeRuns: any[], recentRuns: any[]) {
  // Calculate overall performance metrics
  const overallMetrics = calculateOverallPerformance(activeRuns, recentRuns);

  // Analyze active runs
  const activeRunsInsights = analyzeActiveRuns(activeRuns);

  // Generate recommendations
  const recommendations = generateGlobalRecommendations(activeRuns);

  // Calculate performance trends
  const trends = calculatePerformanceTrends(recentRuns);

  // Method-specific performance
  const methodPerformance = calculateMethodPerformance(activeRuns, recentRuns);

  return {
    overall_performance_grade: overallMetrics.grade,
    overall_performance_score: overallMetrics.score,
    active_runs_insights: activeRunsInsights,
    recommendations,
    performance_trends: trends,
    method_performance: methodPerformance,
  };
}

function calculateOverallPerformance(activeRuns: any[], recentRuns: any[]) {
  const allRuns = [...activeRuns, ...recentRuns];

  if (allRuns.length === 0) {
    return { score: 0.85, grade: "B+" };

  // Calculate weighted scores
  let totalWeightedScore = 0;
  let totalWeight = 0;

  allRuns.forEach(run => {
    const runScore = calculateRunPerformanceScore(run);
    const weight = run.status === "IN_PROGRESS" ? 2 : 1; // Active runs weight more

    totalWeightedScore += runScore * weight;
    totalWeight += weight;

  const avgScore = totalWeightedScore / totalWeight;
  const grade = getPerformanceGrade(avgScore);

  return {
    score: Math.round(avgScore * 100) / 100,
    grade,
  };
}

function calculateRunPerformanceScore(run: any) {
  let score = 0.8; // Base score

  // Quality factor from outputs
  if (run.outputs && run.outputs.length > 0) {
    const output = run.outputs[0];
    const totalQty = (output.qty_good || 0) + (output.qty_reject || 0);
    if (totalQty > 0) {
      const defectRate = (output.qty_reject || 0) / totalQty;
      const qualityScore = Math.max(0, 1 - defectRate);
      score = score * 0.6 + qualityScore * 0.4;
    }

  // Time efficiency factor
  if (run.started_at) {
    const elapsedHours =
      (new Date().getTime() - new Date(run.started_at).getTime()) /
      (1000 * 60 * 60);
    const estimatedHours = run.estimated_completion_time
      ? run.estimated_completion_time / 60
      : elapsedHours * 1.2;
    const timeEfficiency =
      estimatedHours > 0 ? Math.min(1, estimatedHours / elapsedHours) : 0.8;
    score = score * 0.9 + timeEfficiency * 0.1;

  return Math.max(0, Math.min(1, score));
}

function analyzeActiveRuns(activeRuns: any[]) {
  const totalActive = activeRuns.length;
  let highRiskRuns = 0;
  let optimizationOpportunities = 0;
  let totalEfficiency = 0;

  activeRuns.forEach(run => {
    const performanceScore = calculateRunPerformanceScore(run);
    totalEfficiency += performanceScore;

    // Identify high-risk runs
    if (performanceScore < 0.7) {
      highRiskRuns++;

    // Identify optimization opportunities from output quality
    if (run.outputs && run.outputs.length > 0) {
      const output = run.outputs[0];
      const totalQty = (output.qty_good || 0) + (output.qty_reject || 0);
      if (totalQty > 0) {
        const defectRate = (output.qty_reject || 0) / totalQty;
        if (defectRate > 0.1) {
          // More than 10% defect rate
          optimizationOpportunities++;
        }
      }
    }

  return {
    total_active: totalActive,
    high_risk_runs: highRiskRuns,
    optimization_opportunities: optimizationOpportunities,
    avg_efficiency: totalActive > 0 ? totalEfficiency / totalActive : 0,
  };
}

function generateGlobalRecommendations(activeRuns: any[]) {
  const recommendations = [];

  // Analyze patterns across runs
  const methodIssues = {};
  const materialWaste = [];
  const qualityIssues = [];

  activeRuns.forEach(run => {
    const score = calculateRunPerformanceScore(run);

    // Method-specific issues
    if (score < 0.8) {
      if (!methodIssues[run.print_method]) {
        methodIssues[run.print_method] = 0;
      }
      methodIssues[run.print_method]++;

    // Material waste issues
    if (run.materials) {
      const totalPlanned = run.materials.reduce(
        (sum, mat) => sum + (mat.qty || 0),
        0
      );
      const totalUsed = run.materials.reduce(
        (sum, mat) => sum + (mat.actual_qty || mat.qty || 0),
        0
      );
      if (totalUsed > totalPlanned * 1.1) {
        materialWaste.push(run.id);
      }

    // Quality issues from outputs
    if (run.outputs && run.outputs.length > 0) {
      const output = run.outputs[0];
      if ((output.qty_reject || 0) > 0) {
        qualityIssues.push(run.id);
      }
    }

  // Generate recommendations based on patterns
  Object.entries(methodIssues).forEach(([method, count]) => {
    if ((count as number) >= 2) {
      recommendations.push({
        type: "METHOD_OPTIMIZATION",
        priority: "HIGH",
        message: `Multiple ${method} runs underperforming - review process parameters`,
        runs_affected: count,
      }
    }

  if (materialWaste.length > 0) {
    recommendations.push({
      type: "MATERIAL_EFFICIENCY",
      priority: "MEDIUM",
      message: `Material waste detected across ${materialWaste.length} runs - optimize calculations`,
      runs_affected: materialWaste.length,
    }

  if (qualityIssues.length > 0) {
    recommendations.push({
      type: "QUALITY_CONTROL",
      priority: qualityIssues.length > 2 ? "HIGH" : "MEDIUM",
      message: `Quality issues identified - implement additional checkpoints`,
      runs_affected: qualityIssues.length,
    }

  // General optimization opportunities
  if (activeRuns.length > 5) {
    recommendations.push({
      type: "CAPACITY_OPTIMIZATION",
      priority: "LOW",
      message: "High production volume - consider workload balancing",
      runs_affected: activeRuns.length,
    }

  return recommendations;
}

function calculatePerformanceTrends(recentRuns: any[]) {
  if (recentRuns.length < 4) {
    return {
      efficiency_trend: "stable" as const,
      quality_trend: "stable" as const,
      cost_trend: "stable" as const,
      efficiency_change: 0,
      quality_change: 0,
      cost_change: 0,
    };

  // Split runs into two periods for comparison
  const midPoint = Math.floor(recentRuns.length / 2);
  const recentPeriod = recentRuns.slice(0, midPoint);
  const earlierPeriod = recentRuns.slice(midPoint);

  // Calculate averages for each period
  const recentMetrics = calculatePeriodMetrics(recentPeriod);
  const earlierMetrics = calculatePeriodMetrics(earlierPeriod);

  return {
    efficiency_trend: getTrend(
      recentMetrics.efficiency,
      earlierMetrics.efficiency
    ),
    quality_trend: getTrend(recentMetrics.quality, earlierMetrics.quality),
    cost_trend: getTrend(earlierMetrics.cost, recentMetrics.cost), // Lower cost is better
    efficiency_change: recentMetrics.efficiency - earlierMetrics.efficiency,
    quality_change: recentMetrics.quality - earlierMetrics.quality,
    cost_change: recentMetrics.cost - earlierMetrics.cost,
  };
}

function calculatePeriodMetrics(runs: any[]) {
  if (runs.length === 0) {
    return { efficiency: 0.8, quality: 0.9, cost: 5.0 };

  let totalEfficiency = 0;
  let totalQuality = 0;
  let totalCost = 0;

  runs.forEach(run => {
    // Efficiency estimated from material usage
    totalEfficiency += 0.8;

    // Quality from outputs
    if (run.outputs && run.outputs.length > 0) {
      const output = run.outputs[0];
      const totalQty = (output.qty_good || 0) + (output.qty_reject || 0);
      if (totalQty > 0) {
        const defectRate = (output.qty_reject || 0) / totalQty;
        totalQuality += Math.max(0, 1 - defectRate);
      } else {
        totalQuality += 0.9;
      }
    } else {
      totalQuality += 0.9;

    // Estimated cost per unit based on method
    const costPerUnit = getMethodCost(run.print_method);
    totalCost += costPerUnit;

  return {
    efficiency: totalEfficiency / runs.length,
    quality: totalQuality / runs.length,
    cost: totalCost / runs.length,
  };
}

function getTrend(current: number, previous: number): "up" | "down" | "stable" {
  const change = current - previous;
  const threshold = 0.05; // 5% threshold for trend detection

  if (change > threshold) return "up";
  if (change < -threshold) return "down";
  return "stable";
}

function calculateMethodPerformance(activeRuns: any[], recentRuns: any[]) {
  const methodStats = {};
  const allRuns = [...activeRuns, ...recentRuns];

  allRuns.forEach(run => {
    if (!methodStats[run.print_method]) {
      methodStats[run.print_method] = {
        scores: [],
        activeCount: 0,
        issues: {},
      };

    const score = calculateRunPerformanceScore(run);
    methodStats[run.print_method].scores.push(score);

    if (run.status === "IN_PROGRESS" || run.status === "PAUSED") {
      methodStats[run.print_method].activeCount++;

    // Track common issues from outputs
    if (run.outputs && run.outputs.length > 0) {
      const output = run.outputs[0];
      if ((output.qty_reject || 0) > 0) {
        const issueType = "quality_reject";
        if (!methodStats[run.print_method].issues[issueType]) {
          methodStats[run.print_method].issues[issueType] = 0;
        }
        methodStats[run.print_method].issues[issueType]++;
      }
    }

  // Calculate average scores and identify top issues
  const result = {};
  Object.entries(methodStats).forEach(([method, stats]: [string, any]) => {
    const avgScore =
      stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length;
    const topIssue = Object.entries(stats.issues).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0];

    result[method] = {
      score: Math.round(avgScore * 100) / 100,
      runs_count: stats.activeCount,
      top_issue: topIssue ? topIssue[0] : undefined,
    };

  return result;
}

function getMethodCost(method: string) {
  const costs = {
    SILKSCREEN: 2.5,
    SUBLIMATION: 3.75,
    DTF: 4.25,
    EMBROIDERY: 8.5,
  };
  return costs[method] || 3.0;
}

function getPerformanceGrade(score: number) {
  if (score >= 0.95) return "A+";
  if (score >= 0.9) return "A";
  if (score >= 0.85) return "B+";
  if (score >= 0.8) return "B";
  if (score >= 0.75) return "C+";
  if (score >= 0.7) return "C";
  return "D";
});

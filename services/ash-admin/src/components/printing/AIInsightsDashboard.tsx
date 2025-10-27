"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  BarChart3,
  Activity,
} from "lucide-react";

interface DashboardAIData {
  overall_performance_grade: string;
  overall_performance_score: number;
  active_runs_insights: {
    total_active: number;
    high_risk_runs: number;
    optimization_opportunities: number;
    avg_efficiency: number;
  };
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
    runs_affected: number;
  }>;
  performance_trends: {
    efficiency_trend: "up" | "down" | "stable";
    quality_trend: "up" | "down" | "stable";
    cost_trend: "up" | "down" | "stable";
    efficiency_change: number;
    quality_change: number;
    cost_change: number;
  };
  method_performance: {
    [key: string]: {
      score: number;
      runs_count: number;
      top_issue?: string;
    };
  };
}

export default function AIInsightsDashboard() {
  const [aiData, setAiData] = useState<DashboardAIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIInsights();
    const interval = setInterval(fetchAIInsights, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAIInsights = async () => {
    try {
      const response = await fetch("/api/printing/ai/dashboard-insights");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAiData(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600";
    if (grade.startsWith("B")) return "text-blue-600";
    if (grade.startsWith("C")) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: string, _change: number) => {
    if (trend === "up")
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down")
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getPriorityColor = (priority: string) => {
    if (!priority) return "outline";
    switch (priority.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Ashley AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="text-muted-foreground">Loading AI insights...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Ashley AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8" />
            <p>Unable to load AI insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Ashley AI Performance Overview
            </div>
            <Badge
              className={`${getGradeColor(aiData.overall_performance_grade)} font-bold`}
            >
              Grade: {aiData.overall_performance_grade}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(aiData.overall_performance_score * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
              <Progress
                value={aiData.overall_performance_score * 100}
                className="mt-1"
              />
            </div>

            <div>
              <div className="text-2xl font-bold text-green-600">
                {aiData.active_runs_insights.total_active}
              </div>
              <div className="text-xs text-muted-foreground">Active Runs</div>
              <div className="mt-1 text-xs text-blue-600">
                {Math.round(aiData.active_runs_insights.avg_efficiency * 100)}%
                avg efficiency
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-orange-600">
                {aiData.active_runs_insights.high_risk_runs}
              </div>
              <div className="text-xs text-muted-foreground">High Risk</div>
              <div className="mt-1 text-xs text-green-600">
                {aiData.active_runs_insights.optimization_opportunities}{" "}
                optimizable
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-purple-600">
                {aiData.recommendations.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Active Recommendations
              </div>
              <div className="mt-1 text-xs text-red-600">
                {
                  aiData.recommendations.filter(
                    r => r.priority === "HIGH" || r.priority === "CRITICAL"
                  ).length
                }{" "}
                urgent
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="text-sm font-medium">Efficiency</div>
                <div className="text-xs text-muted-foreground">
                  {aiData.performance_trends.efficiency_change > 0 ? "+" : ""}
                  {Math.round(
                    aiData.performance_trends.efficiency_change * 100
                  )}
                  %
                </div>
              </div>
              {getTrendIcon(
                aiData.performance_trends.efficiency_trend,
                aiData.performance_trends.efficiency_change
              )}
            </div>

            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="text-sm font-medium">Quality</div>
                <div className="text-xs text-muted-foreground">
                  {aiData.performance_trends.quality_change > 0 ? "+" : ""}
                  {Math.round(aiData.performance_trends.quality_change * 100)}%
                </div>
              </div>
              {getTrendIcon(
                aiData.performance_trends.quality_trend,
                aiData.performance_trends.quality_change
              )}
            </div>

            <div className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="text-sm font-medium">Cost</div>
                <div className="text-xs text-muted-foreground">
                  {aiData.performance_trends.cost_change > 0 ? "+" : ""}
                  {Math.round(aiData.performance_trends.cost_change * 100)}%
                </div>
              </div>
              {getTrendIcon(
                aiData.performance_trends.cost_trend,
                aiData.performance_trends.cost_change
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Method Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(aiData.method_performance).map(([method, data]) => (
              <div
                key={method}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <div className="font-medium">{method}</div>
                  <div className="text-xs text-muted-foreground">
                    {data.runs_count} active runs
                    {data.top_issue && ` • Top issue: ${data.top_issue}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">
                    {Math.round(data.score * 100)}%
                  </div>
                  <Progress value={data.score * 100} className="mt-1 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Active Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiData.recommendations.slice(0, 5).map((rec, index) => (
              <Alert key={index}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {rec.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({rec.runs_affected} runs affected)
                      </span>
                    </div>
                    <AlertDescription>{rec.message}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}

            {aiData.recommendations.length === 0 && (
              <div className="py-4 text-center text-muted-foreground">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                No immediate recommendations. All systems are running optimally.
              </div>
            )}

            {aiData.recommendations.length > 5 && (
              <div className="text-center text-sm text-muted-foreground">
                +{aiData.recommendations.length - 5} more recommendations
                available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

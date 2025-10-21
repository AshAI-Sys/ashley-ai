"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  Lightbulb,
  Activity,
  Gauge,
} from "lucide-react";

interface AIOptimizationProps {
  runId: string;
  printMethod: string;
  quantity: number;
  materials?: any[];
  machineId?: string;
  orderData?: any;
}

interface OptimizationData {
  analysis_id: string;
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
    impact: string;
    action?: string;
  }>;
  confidence_score: number;
  estimated_completion_time: number;
  cost_prediction: number;
  quality_prediction: number;
  material_efficiency: number;
  factors: any;
}

interface MonitoringData {
  run_id: string;
  status: string;
  insights: {
    material_utilization: any;
    quality_trend: any;
    efficiency_score: any;
    cost_tracking: any;
    time_prediction: any;
    risk_factors: any[];
  };
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
    action: string;
  }>;
  performance_score: {
    overall_score: number;
    component_scores: any;
    grade: string;
  };
}

export default function AshleyAIOptimization({
  runId,
  printMethod,
  quantity,
  materials = [],
  machineId,
  orderData,
}: AIOptimizationProps) {
  const [optimizationData, setOptimizationData] =
    useState<OptimizationData | null>(null);
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("optimization");
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Get initial optimization
  const getOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/printing/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          print_method: printMethod,
          order_id: runId,
          quantity,
          materials,
          machine_id: machineId,
          quality_requirements: orderData?.quality_requirements,
          rush_order: orderData?.rush_order,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setOptimizationData(result.data);
      }
    } catch (error) {
      console.error("Error getting optimization:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get real-time monitoring
  const getMonitoring = async () => {
    try {
      const response = await fetch(
        `/api/printing/ai/monitor?run_id=${runId}&method=${printMethod}`
      );
      const result = await response.json();

      if (result.success) {
        setMonitoringData(result.data);
      }
    } catch (error) {
      console.error("Error getting monitoring data:", error);
    }
  };

  useEffect(() => {
    getOptimization();
  }, [runId, printMethod, quantity]);

  useEffect(() => {
    if (runId) {
      getMonitoring();
    }
  }, [runId]);

  // Auto-refresh monitoring data
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && runId) {
      interval = setInterval(getMonitoring, 30000); // Every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, runId]);

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

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600";
    if (grade.startsWith("B")) return "text-blue-600";
    if (grade.startsWith("C")) return "text-yellow-600";
    return "text-red-600";
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading && !optimizationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-spin" />
            Ashley AI Analyzing...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="text-muted-foreground">
              Generating intelligent optimization recommendations...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Ashley AI Optimization
            </div>
            <div className="flex items-center gap-2">
              {monitoringData && (
                <Badge
                  className={`${getGradeColor(monitoringData.performance_score.grade)} font-bold`}
                >
                  Grade: {monitoringData.performance_score.grade}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-50 text-green-700" : ""}
              >
                <Activity className="mr-1 h-4 w-4" />
                {autoRefresh ? "Live" : "Manual"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="monitoring">Real-time</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>

            {/* Optimization Tab */}
            <TabsContent value="optimization" className="space-y-4">
              {optimizationData && (
                <>
                  {/* Confidence Score */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          AI Confidence
                        </span>
                        <span className="text-sm font-bold">
                          {Math.round(optimizationData.confidence_score * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={optimizationData.confidence_score * 100}
                      />
                    </CardContent>
                  </Card>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="mb-1 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Estimated Time
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          {formatTime(
                            optimizationData.estimated_completion_time
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="mb-1 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Cost Prediction
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          {formatCurrency(optimizationData.cost_prediction)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="mb-1 flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Quality Score
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          {Math.round(
                            optimizationData.quality_prediction * 100
                          )}
                          %
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="mb-1 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-orange-600" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Material Efficiency
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          {Math.round(
                            optimizationData.material_efficiency * 100
                          )}
                          %
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        AI Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {optimizationData.recommendations.map((rec, index) => (
                          <Alert key={index}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <Badge
                                    variant={getPriorityColor(rec.priority)}
                                  >
                                    {rec.priority}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {rec.type}
                                  </span>
                                </div>
                                <AlertDescription>
                                  {rec.message}
                                </AlertDescription>
                                {rec.action && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    Action: {rec.action}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Real-time Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-4">
              {monitoringData && (
                <>
                  {/* Performance Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Performance Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 text-center">
                        <div
                          className={`text-4xl font-bold ${getGradeColor(monitoringData.performance_score.grade)}`}
                        >
                          {monitoringData.performance_score.grade}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(
                            monitoringData.performance_score.overall_score * 100
                          )}
                          % Overall
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(
                          monitoringData.performance_score.component_scores
                        ).map(([key, score]) => (
                          <div key={key}>
                            <div className="mb-1 flex justify-between">
                              <span className="text-sm capitalize">{key}</span>
                              <span className="text-sm font-medium">
                                {Math.round((score as number) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(score as number) * 100}
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Factors */}
                  {monitoringData.insights.risk_factors.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Risk Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {monitoringData.insights.risk_factors.map(
                            (risk, index) => (
                              <Alert
                                key={index}
                                className={
                                  risk.level === "HIGH"
                                    ? "border-red-200 bg-red-50"
                                    : "border-yellow-200 bg-yellow-50"
                                }
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <Badge
                                        variant={
                                          risk.level === "HIGH"
                                            ? "destructive"
                                            : "secondary"
                                        }
                                      >
                                        {risk.level}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {risk.type}
                                      </span>
                                    </div>
                                    <AlertDescription>
                                      {risk.description}
                                    </AlertDescription>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {risk.recommendation}
                                    </div>
                                  </div>
                                </div>
                              </Alert>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Real-time Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Live Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {monitoringData.recommendations.map((rec, index) => (
                          <Alert key={index}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <Badge
                                    variant={getPriorityColor(rec.priority)}
                                  >
                                    {rec.priority}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {rec.type}
                                  </span>
                                </div>
                                <AlertDescription>
                                  {rec.message}
                                </AlertDescription>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Action: {rec.action}
                                </div>
                              </div>
                            </div>
                          </Alert>
                        ))}

                        {monitoringData.recommendations.length === 0 && (
                          <div className="py-4 text-center text-muted-foreground">
                            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                            No immediate recommendations. Process is running
                            optimally.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-4">
              {monitoringData && (
                <>
                  {/* Efficiency Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Efficiency Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex justify-between">
                            <span className="text-sm font-medium">
                              Overall Efficiency
                            </span>
                            <span className="text-sm font-bold">
                              {Math.round(
                                monitoringData.insights.efficiency_score.score *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              monitoringData.insights.efficiency_score.score *
                              100
                            }
                          />
                        </div>

                        {Object.entries(
                          monitoringData.insights.efficiency_score.factors
                        ).map(([key, value]) => (
                          <div key={key}>
                            <div className="mb-1 flex justify-between">
                              <span className="text-sm capitalize">
                                {key} Efficiency
                              </span>
                              <span className="text-sm">
                                {Math.round((value as number) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(value as number) * 100}
                              className="h-1.5"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Material Utilization */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Material Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(
                              monitoringData.insights.material_utilization
                                .utilization_rate * 100
                            )}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Utilization Rate
                          </div>
                        </div>

                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {
                              monitoringData.insights.material_utilization
                                .waste_percentage
                            }
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Waste Rate
                          </div>
                        </div>

                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(
                              monitoringData.insights.material_utilization
                                .total_cost
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Material Cost
                          </div>
                        </div>

                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(
                              monitoringData.insights.material_utilization
                                .cost_efficiency * 100
                            )}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cost Efficiency
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quality Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quality Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold">
                            {Math.round(
                              monitoringData.insights.quality_trend.score * 100
                            )}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Quality Score
                          </div>
                        </div>

                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {monitoringData.insights.quality_trend.defect_rate}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Defect Rate
                          </div>
                        </div>

                        <div>
                          <div className="text-2xl font-bold">
                            <Badge variant="outline" className="capitalize">
                              {monitoringData.insights.quality_trend.trend}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Trend
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-4">
              {monitoringData && (
                <>
                  {/* Time Prediction */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Completion Prediction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-lg font-bold">
                            {formatTime(
                              monitoringData.insights.time_prediction
                                .remaining_minutes
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Remaining Time
                          </div>
                        </div>

                        <div>
                          <div className="text-lg font-bold">
                            {new Date(
                              monitoringData.insights.time_prediction.estimated_completion
                            ).toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Estimated Completion
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-1 flex justify-between">
                          <span className="text-sm">Prediction Confidence</span>
                          <span className="text-sm font-medium">
                            {Math.round(
                              monitoringData.insights.time_prediction
                                .confidence * 100
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            monitoringData.insights.time_prediction.confidence *
                            100
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Cost Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Material Cost</span>
                          <span className="font-medium">
                            {formatCurrency(
                              monitoringData.insights.cost_tracking
                                .material_cost
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm">Labor Cost</span>
                          <span className="font-medium">
                            {formatCurrency(
                              monitoringData.insights.cost_tracking.labor_cost
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm">Overhead</span>
                          <span className="font-medium">
                            {formatCurrency(
                              monitoringData.insights.cost_tracking
                                .overhead_cost
                            )}
                          </span>
                        </div>

                        <hr />

                        <div className="flex justify-between font-bold">
                          <span>Total Cost</span>
                          <span>
                            {formatCurrency(
                              monitoringData.insights.cost_tracking.total_cost
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm">Estimated Revenue</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(
                              monitoringData.insights.cost_tracking
                                .estimated_revenue
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm">Profit Margin</span>
                          <span
                            className={`font-medium ${
                              monitoringData.insights.cost_tracking
                                .profit_margin > 0.2
                                ? "text-green-600"
                                : monitoringData.insights.cost_tracking
                                      .profit_margin > 0.1
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {Math.round(
                              monitoringData.insights.cost_tracking
                                .profit_margin * 100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

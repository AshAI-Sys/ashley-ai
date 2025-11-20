"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Zap,
  Eye,
  Activity,
  BarChart3,
  RefreshCw,
  Bell,
  Settings,
} from "lucide-react";
import { formatDate as formatDateUtil } from "@/lib/utils/date";

interface AshleyInsight {
  id: string;
  type: "efficiency" | "quality" | "bottleneck" | "fatigue" | "optimization";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  recommendation: string;
  confidence_score: number;
  impact_score: number;
  created_at: string;
  expires_at?: string;
  acknowledged: boolean;
  auto_action?: string;
}

interface PerformanceMetric {
  metric_name: string;
  current_value: number;
  target_value: number;
  trend: "up" | "down" | "stable";
  prediction: number;
  risk_level: "low" | "medium" | "high";
}

interface AshleyAIMonitorProps {
  scope?: "line" | "operator" | "operation" | "global";
  scopeId?: string;
  realTime?: boolean;
  showPredictions?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

export default function AshleyAIMonitor({
  scope = "global",
  scopeId,
  realTime = true,
  showPredictions = true,
  autoRefresh = true,
  className = "",
}: AshleyAIMonitorProps) {
  const [insights, setInsights] = useState<AshleyInsight[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAshleyData();

    if (autoRefresh && realTime) {
      intervalRef.current = setInterval(() => {
        fetchAshleyData();
      }, 60000); // Update every minute for real-time monitoring
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [scope, scopeId, autoRefresh, realTime]);

  const fetchAshleyData = async () => {
    try {
      let endpoint = "/api/sewing/ashley-ai";
      const params = new URLSearchParams();

      if (scope && scope !== "global") params.append("scope", scope);
      if (scopeId) params.append("scope_id", scopeId);

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const [insightsResponse, metricsResponse] = await Promise.all([
        fetch(`${endpoint}/insights`),
        fetch(`${endpoint}/metrics`),
      ]);

      if (insightsResponse.ok && metricsResponse.ok) {
        const [insightsData, metricsData] = await Promise.all([
          insightsResponse.json(),
          metricsResponse.json(),
        ]);

        setInsights(insightsData.insights);
        setMetrics(metricsData.metrics);

        // Count unacknowledged high/critical insights for notifications
        const unacknowledged = insightsData.insights.filter(
          (insight: AshleyInsight) =>
            !insight.acknowledged &&
            (insight.priority === "high" || insight.priority === "critical")
        ).length;
        setNotifications(unacknowledged);
      } else {
        // Mock data for demo
        const mockInsights: AshleyInsight[] = [
          {
            id: "1",
            type: "efficiency",
            priority: "high",
            title: "Efficiency Drop Detected",
            description:
              "Line efficiency has decreased by 12% in the last hour across multiple operators.",
            recommendation:
              "Consider implementing a 15-minute break rotation and check for equipment issues.",
            confidence_score: 0.89,
            impact_score: 0.75,
            created_at: new Date().toISOString(),
            acknowledged: false,
          },
          {
            id: "2",
            type: "bottleneck",
            priority: "medium",
            title: "Bottleneck Identified",
            description:
              'The "Set sleeves" operation is causing a 20% delay in overall production flow.',
            recommendation:
              "Allocate additional operator to parallel processing or provide skill training.",
            confidence_score: 0.94,
            impact_score: 0.68,
            created_at: new Date(Date.now() - 1800000).toISOString(),
            acknowledged: false,
          },
          {
            id: "3",
            type: "fatigue",
            priority: "medium",
            title: "Operator Fatigue Pattern",
            description:
              "Maria Santos (EMP001) showing signs of fatigue after 2.5 hours of continuous work.",
            recommendation:
              "Recommend a 10-minute break to maintain current 96% efficiency level.",
            confidence_score: 0.72,
            impact_score: 0.55,
            created_at: new Date(Date.now() - 900000).toISOString(),
            acknowledged: false,
          },
          {
            id: "4",
            type: "quality",
            priority: "low",
            title: "Quality Trend Analysis",
            description:
              "Defect rate has decreased by 15% over the past week with current operator assignments.",
            recommendation:
              "Maintain current operator-operation pairings for optimal quality outcomes.",
            confidence_score: 0.85,
            impact_score: 0.45,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            acknowledged: true,
          },
        ];

        const mockMetrics: PerformanceMetric[] = [
          {
            metric_name: "Line Efficiency",
            current_value: 88,
            target_value: 85,
            trend: "down",
            prediction: 85,
            risk_level: "medium",
          },
          {
            metric_name: "Defect Rate",
            current_value: 1.2,
            target_value: 2.0,
            trend: "stable",
            prediction: 1.3,
            risk_level: "low",
          },
          {
            metric_name: "Throughput",
            current_value: 45,
            target_value: 50,
            trend: "up",
            prediction: 48,
            risk_level: "medium",
          },
        ];

        setInsights(mockInsights);
        setMetrics(mockMetrics);
        setNotifications(2); // 2 unacknowledged high/medium priority insights
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch Ashley AI data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeInsight = async (insightId: string) => {
    try {
      const response = await fetch(
        `/api/sewing/ashley-ai/insights/${insightId}/acknowledge`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setInsights(prev =>
          prev.map(insight =>
            insight.id === insightId
              ? { ...insight, acknowledged: true }
              : insight
          )
        );
        setNotifications(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to acknowledge insight:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "efficiency":
        return <TrendingUp className="h-4 w-4" />;
      case "quality":
        return <Target className="h-4 w-4" />;
      case "bottleneck":
        return <AlertTriangle className="h-4 w-4" />;
      case "fatigue":
        return <Users className="h-4 w-4" />;
      case "optimization":
        return <Zap className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Brain className="mr-2 h-6 w-6 animate-pulse text-purple-600" />
            <span>Ashley AI is analyzing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Ashley AI Monitor</CardTitle>
                <CardDescription>
                  Intelligent production optimization and real-time insights
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {notifications > 0 && (
                <Badge className="border-red-200 bg-red-100 text-red-800">
                  <Bell className="mr-1 h-3 w-3" />
                  {notifications} alerts
                </Badge>
              )}
              <Badge variant="outline" className="text-purple-600">
                {realTime ? "Live" : "Snapshot"}
              </Badge>
              <Button size="sm" variant="outline" onClick={fetchAshleyData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Metrics */}
      {showPredictions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Predictions
            </CardTitle>
            <CardDescription>
              AI-powered forecasting and trend analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {metrics.map((metric, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{metric.metric_name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Current:
                      </span>
                      <span className="font-bold">{metric.current_value}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Target:
                      </span>
                      <span className="font-medium">
                        {metric.target_value}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Predicted:
                      </span>
                      <span
                        className={`font-medium ${getRiskColor(metric.risk_level)}`}
                      >
                        {metric.prediction}%
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getRiskColor(metric.risk_level)} border-current`}
                    >
                      {metric.risk_level} risk
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Active Insights
          </CardTitle>
          <CardDescription>
            Real-time recommendations and optimization suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map(insight => (
              <div
                key={insight.id}
                className={`rounded-lg border p-4 ${
                  insight.acknowledged ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      {getTypeIcon(insight.type)}
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge className={getPriorityColor(insight.priority)}>
                        {getPriorityIcon(insight.priority)}
                        <span className="ml-1">{insight.priority}</span>
                      </Badge>
                    </div>

                    <p className="mb-2 text-sm text-muted-foreground">
                      {insight.description}
                    </p>

                    <Alert className="mt-3">
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Recommendation:</strong>{" "}
                        {insight.recommendation}
                      </AlertDescription>
                    </Alert>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Confidence: {Math.round(insight.confidence_score * 100)}
                        %
                      </span>
                      <span>
                        Impact: {Math.round(insight.impact_score * 100)}%
                      </span>
                      <span>
                        {insight.created_at ? formatDateUtil(insight.created_at, "datetime") : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!insight.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledgeInsight(insight.id)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Acknowledge
                      </Button>
                    )}
                    {insight.acknowledged && (
                      <Badge className="bg-green-100 text-green-800">
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {insights.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <Brain className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No active insights at the moment</p>
                <p className="text-sm">
                  Ashley AI is continuously monitoring for optimization
                  opportunities
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Status */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-sm">Ashley AI is actively monitoring</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {lastUpdated && (
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
              {realTime && autoRefresh && <span>Auto-refresh: 1 min</span>}
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export types
export type { AshleyInsight, PerformanceMetric, AshleyAIMonitorProps };

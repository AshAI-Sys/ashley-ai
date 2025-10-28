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
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Clock, Target,
  Zap,
  BarChart3,
  Activity,
  DollarSign,
  Award,
} from "lucide-react";

interface EfficiencyData {
  current_efficiency: number;
  target_efficiency: number;
  pieces_completed: number;
  pieces_target: number;
  time_worked_minutes: number;
  time_target_minutes: number;
  earned_pay: number;
  projected_pay: number;
  trend: "up" | "down" | "stable";
  trend_percentage: number;
}

interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  color: string;
}

interface EfficiencyTrackerProps {
  runId?: string;
  operatorId?: string;
  realTime?: boolean;
  compact?: boolean;
  className?: string;
}

export default function EfficiencyTracker({
  runId,
  operatorId,
  realTime = false,
  compact = false,
  className = "",
}: EfficiencyTrackerProps) {
  const [efficiencyData, setEfficiencyData] = useState<EfficiencyData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchEfficiencyData();

    if (realTime) {
      // Update every 30 seconds for real-time tracking
      intervalRef.current = setInterval(() => {
        fetchEfficiencyData();
      }, 30000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runId, operatorId, realTime]);

  const fetchEfficiencyData = async () => {
    try {
      let endpoint = "/api/sewing/efficiency";
      const params = new URLSearchParams();

      if (runId) params.append("run_id", runId);
      if (operatorId) params.append("operator_id", operatorId);

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await fetch(endpoint);

      if (response.ok) {
        const data = await response.json();
        setEfficiencyData(data.efficiency);
      } else {
        // Mock data for demo
        const mockData: EfficiencyData = {
          current_efficiency: 94,
          target_efficiency: 85,
          pieces_completed: 15,
          pieces_target: 20,
          time_worked_minutes: 25,
          time_target_minutes: 30,
          earned_pay: 33.75,
          projected_pay: 45.0,
          trend: Math.random() > 0.5 ? "up" : "down",
          trend_percentage: Math.round(Math.random() * 10 + 2),
        };
        setEfficiencyData(mockData);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch efficiency data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (efficiency: number, target: number) => {
    if (efficiency >= target + 10) return "text-green-600";
    if (efficiency >= target) return "text-blue-600";
    if (efficiency >= target - 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getEfficiencyBadgeColor = (efficiency: number, target: number) => {
    if (efficiency >= target + 10)
      return "bg-green-100 text-green-800 border-green-200";
    if (efficiency >= target)
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (efficiency >= target - 10)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const ____getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 110) return "bg-green-500";
    if (percentage >= 100) return "bg-blue-500";
    if (percentage >= 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const performanceMetrics: PerformanceMetric[] = efficiencyData
    ? [
        {
          label: "Efficiency",
          value: efficiencyData.current_efficiency,
          target: efficiencyData.target_efficiency,
          unit: "%",
          trend: efficiencyData.trend,
          color: getEfficiencyColor(
            efficiencyData.current_efficiency,
            efficiencyData.target_efficiency
          ),
        },
        {
          label: "Progress",
          value: efficiencyData.pieces_completed,
          target: efficiencyData.pieces_target,
          unit: "pcs",
          trend:
            efficiencyData.pieces_completed >=
            efficiencyData.pieces_target * 0.8
              ? "up"
              : "down",
          color:
            efficiencyData.pieces_completed >= efficiencyData.pieces_target
              ? "text-green-600"
              : "text-blue-600",
        },
        {
          label: "Time Efficiency",
          value: Math.round(
            (efficiencyData.time_target_minutes /
              Math.max(efficiencyData.time_worked_minutes, 1)) *
              100
          ),
          target: 100,
          unit: "%",
          trend:
            efficiencyData.time_worked_minutes <=
            efficiencyData.time_target_minutes
              ? "up"
              : "down",
          color:
            efficiencyData.time_worked_minutes <=
            efficiencyData.time_target_minutes
              ? "text-green-600"
              : "text-red-600",
        },
      ]
    : [];

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Activity className="mr-2 h-6 w-6 animate-pulse" />
            <span>Loading efficiency data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!efficiencyData) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="mx-auto mb-2 h-8 w-8" />
            <p>No efficiency data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Current Efficiency</p>
                <p className="text-sm text-muted-foreground">
                  Target: {efficiencyData.target_efficiency}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${getEfficiencyColor(efficiencyData.current_efficiency, efficiencyData.target_efficiency)}`}
              >
                {efficiencyData.current_efficiency}%
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(efficiencyData.trend)}
                <span className="text-sm text-muted-foreground">
                  {efficiencyData.trend_percentage}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Efficiency Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Real-Time Efficiency
              </CardTitle>
              <CardDescription>
                Live performance tracking and optimization insights
              </CardDescription>
            </div>
            <Badge
              className={getEfficiencyBadgeColor(
                efficiencyData.current_efficiency,
                efficiencyData.target_efficiency
              )}
            >
              {efficiencyData.current_efficiency >=
              efficiencyData.target_efficiency
                ? "Above Target"
                : "Below Target"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Efficiency Display */}
          <div className="text-center">
            <div
              className={`mb-2 text-4xl font-bold ${getEfficiencyColor(efficiencyData.current_efficiency, efficiencyData.target_efficiency)}`}
            >
              {efficiencyData.current_efficiency}%
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              {getTrendIcon(efficiencyData.trend)}
              <span>
                {efficiencyData.trend === "up"
                  ? "↑"
                  : efficiencyData.trend === "down"
                    ? "↓"
                    : "→"}
                {efficiencyData.trend_percentage}% vs last hour
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Progress vs Target ({efficiencyData.target_efficiency}%)
              </span>
              <span>
                {Math.round(
                  (efficiencyData.current_efficiency /
                    efficiencyData.target_efficiency) *
                    100
                )}
                %
              </span>
            </div>
            <Progress
              value={Math.min(
                (efficiencyData.current_efficiency /
                  efficiencyData.target_efficiency) *
                  100,
                100
              )}
              className="h-3"
            />
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className={`text-lg font-bold ${metric.color}`}>
                  {metric.value}
                  {metric.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  Target: {metric.target}
                  {metric.unit}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4" />
                Time Performance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Time Worked:</span>
                  <span className="font-medium">
                    {efficiencyData.time_worked_minutes}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Target Time:</span>
                  <span className="font-medium">
                    {efficiencyData.time_target_minutes}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Efficiency:</span>
                  <span
                    className={`font-medium ${
                      efficiencyData.time_worked_minutes <=
                      efficiencyData.time_target_minutes
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.round(
                      (efficiencyData.time_target_minutes /
                        Math.max(efficiencyData.time_worked_minutes, 1)) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-medium">
                <DollarSign className="h-4 w-4" />
                Earnings Performance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Earnings:</span>
                  <span className="font-medium">
                    ₱{efficiencyData.earned_pay.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Earnings:</span>
                  <span className="font-medium">
                    ₱{efficiencyData.projected_pay.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Earning Rate:</span>
                  <span
                    className={`font-medium ${
                      efficiencyData.earned_pay >=
                      efficiencyData.projected_pay * 0.8
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.round(
                      (efficiencyData.earned_pay /
                        efficiencyData.projected_pay) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Award className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h4 className="mb-1 font-medium text-blue-900">
                  Performance Insight
                </h4>
                <p className="text-sm text-blue-700">
                  {efficiencyData.current_efficiency >=
                  efficiencyData.target_efficiency + 10
                    ? "Excellent performance! You're working above target efficiency. Consider maintaining this pace."
                    : efficiencyData.current_efficiency >=
                        efficiencyData.target_efficiency
                      ? "Good performance! You're meeting target efficiency. Keep up the steady pace."
                      : efficiencyData.current_efficiency >=
                          efficiencyData.target_efficiency - 10
                        ? "Performance is slightly below target. Consider focusing on consistent rhythm."
                        : "Performance needs improvement. Take a moment to review technique and pacing."}
                </p>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-center text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {realTime && (
                <span className="ml-2">• Auto-updating every 30s</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Export types
export type { EfficiencyData, PerformanceMetric, EfficiencyTrackerProps };

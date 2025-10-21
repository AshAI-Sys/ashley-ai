"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  MessageCircle,
  AlertCircle,
  Users,
  Calendar,
  Target,
} from "lucide-react";

interface ApprovalStatsProps {
  stats: {
    total_approvals: number;
    approved: number;
    changes_requested: number;
    pending: number;
    expired: number;
    average_response_time_hours: number;
    approval_rate_percentage: number;
    on_time_rate_percentage: number;
  };
  className?: string;
}

export function ApprovalStats({ stats, className = "" }: ApprovalStatsProps) {
  const statCards = [
    {
      title: "Total Approvals",
      value: stats.total_approvals,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Approved",
      value: stats.approved,
      percentage:
        stats.total_approvals > 0
          ? (stats.approved / stats.total_approvals) * 100
          : 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Changes Requested",
      value: stats.changes_requested,
      percentage:
        stats.total_approvals > 0
          ? (stats.changes_requested / stats.total_approvals) * 100
          : 0,
      icon: MessageCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Pending",
      value: stats.pending,
      percentage:
        stats.total_approvals > 0
          ? (stats.pending / stats.total_approvals) * 100
          : 0,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Expired",
      value: stats.expired,
      percentage:
        stats.total_approvals > 0
          ? (stats.expired / stats.total_approvals) * 100
          : 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const formatResponseTime = (hours: number) => {
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.percentage !== undefined && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {stat.percentage.toFixed(1)}% of total
                      </p>
                    )}
                  </div>
                  <div className={`${stat.bgColor} rounded-lg p-2`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Approval Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-green-600" />
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {stats.approval_rate_percentage.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats.approved} of {stats.total_approvals}
                </span>
              </div>
              <Progress
                value={stats.approval_rate_percentage}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Percentage of designs approved without changes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* On-Time Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              On-Time Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {stats.on_time_rate_percentage.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  before expiry
                </span>
              </div>
              <Progress value={stats.on_time_rate_percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Approvals received before expiry date
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">
                  {formatResponseTime(stats.average_response_time_hours)}
                </span>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Average time from send to response</p>
                <p className="font-medium">
                  Target: &lt;48h •
                  {stats.average_response_time_hours <= 48 ? (
                    <span className="ml-1 text-green-600">✓ On Target</span>
                  ) : (
                    <span className="ml-1 text-red-600">⚠ Over Target</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      {stats.total_approvals > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Performance Summary</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>
                    •{" "}
                    {stats.approval_rate_percentage >= 80
                      ? "Excellent"
                      : stats.approval_rate_percentage >= 60
                        ? "Good"
                        : "Needs improvement"}{" "}
                    approval rate
                  </li>
                  <li>
                    •{" "}
                    {stats.on_time_rate_percentage >= 90
                      ? "Excellent"
                      : stats.on_time_rate_percentage >= 70
                        ? "Good"
                        : "Poor"}{" "}
                    on-time performance
                  </li>
                  <li>
                    • Average response time is{" "}
                    {stats.average_response_time_hours <= 24
                      ? "excellent"
                      : stats.average_response_time_hours <= 48
                        ? "good"
                        : "slow"}
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recommendations</h4>
                <ul className="space-y-1 text-muted-foreground">
                  {stats.expired > 0 && (
                    <li>
                      • Follow up on {stats.expired} expired approval
                      {stats.expired > 1 ? "s" : ""}
                    </li>
                  )}
                  {stats.pending > 0 && (
                    <li>
                      • {stats.pending} approval{stats.pending > 1 ? "s" : ""}{" "}
                      still pending response
                    </li>
                  )}
                  {stats.approval_rate_percentage < 60 && (
                    <li>
                      • Review designs before sending to improve approval rate
                    </li>
                  )}
                  {stats.average_response_time_hours > 48 && (
                    <li>• Consider shorter expiry times or more reminders</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

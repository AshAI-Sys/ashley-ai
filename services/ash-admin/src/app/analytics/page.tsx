"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard-layout";
import {
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Target,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  Settings,
} from "lucide-react";

interface AnalyticsMetrics {
  production_efficiency: number;
  quality_score: number;
  on_time_delivery: number;
  customer_satisfaction: number;
  revenue_growth: number;
  cost_reduction: number;
  orders_completed: number;
  orders_in_progress: number;
  total_production_runs: number;
  avg_cycle_time: number;
}

interface ProductionMetrics {
  cutting_efficiency: number;
  printing_efficiency: number;
  sewing_efficiency: number;
  finishing_efficiency: number;
  qc_pass_rate: number;
  defect_rate: number;
  rework_rate: number;
  throughput: number;
}

interface FinancialMetrics {
  total_revenue: number;
  total_cost: number;
  gross_margin: number;
  operating_margin: number;
  cost_per_unit: number;
  revenue_per_order: number;
  payment_collection_rate: number;
  outstanding_receivables: number;
}

interface OperationalMetrics {
  machine_utilization: number;
  workforce_productivity: number;
  inventory_turnover: number;
  space_utilization: number;
  energy_efficiency: number;
  maintenance_compliance: number;
  safety_incidents: number;
  training_completion: number;
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [productionMetrics, setProductionMetrics] =
    useState<ProductionMetrics | null>(null);
  const [financialMetrics, setFinancialMetrics] =
    useState<FinancialMetrics | null>(null);
  const [operationalMetrics, setOperationalMetrics] =
    useState<OperationalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Mock analytics data since we don't have real analytics APIs yet
      setMetrics({
        production_efficiency: 87.3,
        quality_score: 94.2,
        on_time_delivery: 92.8,
        customer_satisfaction: 96.1,
        revenue_growth: 15.7,
        cost_reduction: 8.3,
        orders_completed: 156,
        orders_in_progress: 23,
        total_production_runs: 289,
        avg_cycle_time: 4.2,
      });

      setProductionMetrics({
        cutting_efficiency: 89.5,
        printing_efficiency: 91.2,
        sewing_efficiency: 85.7,
        finishing_efficiency: 88.9,
        qc_pass_rate: 94.2,
        defect_rate: 2.8,
        rework_rate: 1.5,
        throughput: 1450,
      });

      setFinancialMetrics({
        total_revenue: 2845600,
        total_cost: 1923400,
        gross_margin: 32.4,
        operating_margin: 18.7,
        cost_per_unit: 125.8,
        revenue_per_order: 18250,
        payment_collection_rate: 94.6,
        outstanding_receivables: 156800,
      });

      setOperationalMetrics({
        machine_utilization: 78.9,
        workforce_productivity: 112.5,
        inventory_turnover: 8.2,
        space_utilization: 85.3,
        energy_efficiency: 87.1,
        maintenance_compliance: 96.8,
        safety_incidents: 0,
        training_completion: 89.2,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (
    score: number,
    threshold: { good: number; warning: number }
  ) => {
    if (score >= threshold.good) return "text-green-600";
    if (score >= threshold.warning) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (
    score: number,
    threshold: { good: number; warning: number }
  ) => {
    if (score >= threshold.good) return "bg-green-100 text-green-800";
    if (score >= threshold.warning) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive business intelligence and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <Button
              onClick={fetchAnalytics}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        {metrics && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Production Efficiency
                </CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getScoreColor(metrics.production_efficiency, { good: 85, warning: 75 })}`}
                >
                  {formatPercentage(metrics.production_efficiency)}
                </div>
                <p className="text-xs text-gray-600">
                  {metrics.total_production_runs} runs completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quality Score
                </CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getScoreColor(metrics.quality_score, { good: 90, warning: 80 })}`}
                >
                  {formatPercentage(metrics.quality_score)}
                </div>
                <p className="text-xs text-gray-600">QC performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  On-Time Delivery
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getScoreColor(metrics.on_time_delivery, { good: 90, warning: 80 })}`}
                >
                  {formatPercentage(metrics.on_time_delivery)}
                </div>
                <p className="text-xs text-gray-600">
                  {metrics.orders_completed} orders delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenue Growth
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getScoreColor(metrics.revenue_growth, { good: 10, warning: 5 })}`}
                >
                  +{formatPercentage(metrics.revenue_growth)}
                </div>
                <p className="text-xs text-gray-600">vs. previous period</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="operational">Operational</TabsTrigger>
            <TabsTrigger value="quality">Quality & Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Performance Overview */}
              {metrics && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Performance Overview
                    </CardTitle>
                    <CardDescription>
                      Key business performance indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Customer Satisfaction
                        </span>
                        <Badge
                          className={getScoreBadge(
                            metrics.customer_satisfaction,
                            { good: 90, warning: 80 }
                          )}
                        >
                          {formatPercentage(metrics.customer_satisfaction)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Average Cycle Time
                        </span>
                        <span className="text-sm font-bold">
                          {metrics.avg_cycle_time} days
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Cost Reduction
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          -{formatPercentage(metrics.cost_reduction)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Orders in Progress
                        </span>
                        <span className="text-sm font-bold">
                          {metrics.orders_in_progress}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common analytics tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Custom Filter
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule Report
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Set Alerts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="production" className="space-y-4">
            {productionMetrics && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cutting Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(productionMetrics.cutting_efficiency, { good: 85, warning: 75 })}`}
                    >
                      {formatPercentage(productionMetrics.cutting_efficiency)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Printing Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(productionMetrics.printing_efficiency, { good: 85, warning: 75 })}`}
                    >
                      {formatPercentage(productionMetrics.printing_efficiency)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Sewing Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(productionMetrics.sewing_efficiency, { good: 85, warning: 75 })}`}
                    >
                      {formatPercentage(productionMetrics.sewing_efficiency)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Overall Throughput
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {productionMetrics.throughput}
                    </div>
                    <p className="text-xs text-gray-600">units/day</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            {financialMetrics && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(financialMetrics.total_revenue)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Gross Margin
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(financialMetrics.gross_margin, { good: 30, warning: 20 })}`}
                    >
                      {formatPercentage(financialMetrics.gross_margin)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cost Per Unit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(financialMetrics.cost_per_unit)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Collection Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(financialMetrics.payment_collection_rate, { good: 90, warning: 80 })}`}
                    >
                      {formatPercentage(
                        financialMetrics.payment_collection_rate
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="operational" className="space-y-4">
            {operationalMetrics && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Machine Utilization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(operationalMetrics.machine_utilization, { good: 80, warning: 70 })}`}
                    >
                      {formatPercentage(operationalMetrics.machine_utilization)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Workforce Productivity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(operationalMetrics.workforce_productivity, { good: 100, warning: 90 })}`}
                    >
                      {formatPercentage(
                        operationalMetrics.workforce_productivity
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Safety Incidents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${operationalMetrics.safety_incidents === 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {operationalMetrics.safety_incidents}
                    </div>
                    <p className="text-xs text-gray-600">this period</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Training Completion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(operationalMetrics.training_completion, { good: 85, warning: 75 })}`}
                    >
                      {formatPercentage(operationalMetrics.training_completion)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            {productionMetrics && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      QC Pass Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-3xl font-bold ${getScoreColor(productionMetrics.qc_pass_rate, { good: 90, warning: 80 })}`}
                    >
                      {formatPercentage(productionMetrics.qc_pass_rate)}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Quality control performance
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Defect Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-3xl font-bold ${productionMetrics.defect_rate <= 3 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatPercentage(productionMetrics.defect_rate)}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Production defects
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-orange-600" />
                      Rework Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-3xl font-bold ${productionMetrics.rework_rate <= 2 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatPercentage(productionMetrics.rework_rate)}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Items requiring rework
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

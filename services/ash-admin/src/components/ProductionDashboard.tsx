import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  CheckCircle, Clock,
  Users,
  Package, TrendingUp,
  TrendingDown, Zap,
} from "lucide-react";

interface DashboardData {
  overview: {
    active_orders: Array<{ status: string; _count: { id: number } }>;
    production_stats: Array<{
      status: string;
      _count: { id: number };
      _avg: { actual_hours: number };
    }>;
    machine_utilization: Array<{
      asset_name: string;
      utilization: number;
      status: string;
    }>;
  };
  alerts: {
    upcoming_deadlines: Array<{
      order_number: string;
      client: string;
      brand?: string;
      delivery_date: string;
      days_remaining: number;
    }>;
  };
  quality: {
    metrics: Array<{ status: string; stage: string; _count: { id: number } }>;
    pass_rate: { passed: number; total: number };
  };
}

interface FloorStatus {
  bundles: Array<{
    id: string;
    qr_code: string;
    order_number: string;
    client: string;
    status: string;
    current_stage: string;
    department: string;
    assigned_to?: string;
    progress: {
      cutting: number;
      printing: number;
      sewing: number;
    };
  }>;
  work_orders: Array<{
    id: string;
    type: string;
    status: string;
    asset: string;
    location: string;
    assigned_to?: string;
    priority: string;
  }>;
  employees: Array<{
    name: string;
    department: string;
    position: string;
    status: string;
    current_task?: string;
  }>;
}

export function ProductionDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [floorStatus, setFloorStatus] = useState<FloorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchFloorStatus();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchFloorStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/overview");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    }
  };

  const fetchFloorStatus = async () => {
    try {
      const response = await fetch("/api/dashboard/floor-status");
      if (!response.ok) throw new Error("Failed to fetch floor status");
      const result = await response.json();
      setFloorStatus(result.data);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load floor status"
      );
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    if (!status) return "bg-gray-500";
    const colors: Record<string, string> = {
      completed: "bg-green-500",
      in_progress: "bg-blue-500",
      pending: "bg-yellow-500",
      cancelled: "bg-red-500",
      on_hold: "bg-orange-500",
    };
    return colors[status.toLowerCase()] || "bg-gray-500";
  };

  const ____getPriorityColor = (priority: string): string => {
    if (!priority) return "text-gray-600 bg-gray-50";
    const colors: Record<string, string> = {
      high: "text-red-600 bg-red-50",
      medium: "text-yellow-600 bg-yellow-50",
      low: "text-green-600 bg-green-50",
    };
    return colors[priority.toLowerCase()] || "text-gray-600 bg-gray-50";
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        Loading dashboard...
      </div>
    );
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Production Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Live Updates</span>
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.overview.active_orders.reduce(
                (sum, item) => sum + item._count.id,
                0
              ) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.overview.active_orders.find(
                item => item.status === "in_progress"
              )?._count.id || 0}{" "}
              in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dashboardData?.quality.pass_rate.total ?? 0) > 0
                ? Math.round(
                    ((dashboardData?.quality.pass_rate.passed ?? 0) /
                      (dashboardData?.quality.pass_rate.total ?? 1)) *
                      100
                  )
                : 100}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.quality.pass_rate.passed || 0} /{" "}
              {dashboardData?.quality.pass_rate.total || 0} passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {floorStatus?.employees.filter(emp => emp.status === "working")
                .length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {floorStatus?.employees.filter(emp => emp.status === "available")
                .length || 0}{" "}
              available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData?.alerts.upcoming_deadlines.filter(
                alert => alert.days_remaining <= 2
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Deadlines within 2 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Alerts */}
      {(dashboardData?.alerts.upcoming_deadlines?.length ?? 0) > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Upcoming Deadlines:</strong>{" "}
            {dashboardData?.alerts.upcoming_deadlines
              ?.slice(0, 3)
              .map((alert, index) => (
                <span key={alert.order_number}>
                  {index > 0 && ", "}
                  {alert.order_number} ({alert.days_remaining}d remaining)
                </span>
              ))}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="floor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="floor">Production Floor</TabsTrigger>
          <TabsTrigger value="orders">Order Status</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
          <TabsTrigger value="machines">Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="floor" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Active Bundles */}
            <Card>
              <CardHeader>
                <CardTitle>Production Bundles</CardTitle>
                <CardDescription>
                  Real-time bundle tracking on production floor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {floorStatus?.bundles.slice(0, 10).map(bundle => (
                  <div
                    key={bundle.id}
                    className="flex items-center space-x-4 rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{bundle.qr_code}</span>
                        <Badge className={getStatusColor(bundle.status)}>
                          {bundle.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {bundle.order_number} â€¢ {bundle.client}
                      </div>
                      <div className="text-sm text-blue-600">
                        {bundle.current_stage} â€¢ {bundle.department}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div>Cut: {bundle.progress.cutting}%</div>
                        <div>Print: {bundle.progress.printing}%</div>
                        <div>Sew: {bundle.progress.sewing}%</div>
                      </div>
                      <Progress
                        value={
                          (bundle.progress.cutting +
                            bundle.progress.printing +
                            bundle.progress.sewing) /
                          3
                        }
                        className="mt-1 w-24"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Employee Status */}
            <Card>
              <CardHeader>
                <CardTitle>Workforce Status</CardTitle>
                <CardDescription>Current employee activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(
                  floorStatus?.employees.reduce(
                    (acc, emp) => {
                      if (!acc[emp.department]) acc[emp.department] = [];
                      acc[emp.department]!.push(emp);
                      return acc;
                    },
                    {} as Record<string, typeof floorStatus.employees>
                  ) || {}
                ).map(([department, employees]) => (
                  <div key={department} className="space-y-2">
                    <h4 className="font-medium capitalize">
                      {department} Department
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {employees.slice(0, 5).map((emp, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded bg-gray-50 p-2"
                        >
                          <div>
                            <span className="font-medium">{emp.name}</span>
                            <span className="ml-2 text-sm text-gray-600">
                              ({emp.position})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                emp.status === "working"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {emp.status}
                            </Badge>
                            {emp.current_task && (
                              <span className="text-xs text-blue-600">
                                {emp.current_task}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {dashboardData?.overview.active_orders.map(orderGroup => (
                  <div
                    key={orderGroup.status}
                    className="rounded-lg border p-4 text-center"
                  >
                    <div className="text-2xl font-bold">
                      {orderGroup._count.id}
                    </div>
                    <div className="text-sm capitalize text-gray-600">
                      {orderGroup.status}
                    </div>
                    <div
                      className={`mt-2 h-2 w-full rounded ${getStatusColor(orderGroup.status)}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Control Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Quality by Stage</h4>
                  {Object.entries(
                    dashboardData?.quality.metrics.reduce(
                      (acc, metric) => {
                        if (!acc[metric.stage])
                          acc[metric.stage] = { passed: 0, total: 0 };
                        if (metric.status === "approved")
                          acc[metric.stage]!.passed += metric._count.id;
                        acc[metric.stage]!.total += metric._count.id;
                        return acc;
                      },
                      {} as Record<string, { passed: number; total: number }>
                    ) || {}
                  ).map(([stage, stats]) => (
                    <div
                      key={stage}
                      className="flex items-center justify-between"
                    >
                      <span className="capitalize">{stage}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {stats.passed}/{stats.total}
                        </span>
                        <div className="w-20">
                          <Progress
                            value={
                              stats.total > 0
                                ? (stats.passed / stats.total) * 100
                                : 0
                            }
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {stats.total > 0
                            ? Math.round((stats.passed / stats.total) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="machines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dashboardData?.overview.machine_utilization.map(machine => (
                  <div
                    key={machine.asset_name}
                    className="rounded-lg border p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">{machine.asset_name}</span>
                      <Badge
                        variant={
                          machine.status === "operational"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {machine.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Utilization: {machine.utilization} jobs
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

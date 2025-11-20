"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Settings,
  Wrench,
  AlertTriangle, CheckCircle,
  Clock, Calendar,
  DollarSign, TrendingUp,
  Plus,
  Filter,
  Eye,
  Edit, Trash2,
  Users, Activity,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { formatDate as formatDateUtil } from "@/lib/utils/date";

interface MaintenanceStats {
  overview: {
    total_assets: number;
    active_assets: number;
    asset_utilization: number;
    total_work_orders: number;
    open_work_orders: number;
    completed_this_month: number;
    pending_work_orders: number;
    completion_rate: number;
    overdue_maintenance: number;
    total_schedules: number;
    maintenance_costs_this_month: number;
  };
  distributions: {
    work_orders_by_type: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    work_orders_by_priority: Array<{
      priority: string;
      count: number;
      percentage: number;
    }>;
    assets_by_type: Array<{ type: string; count: number; percentage: number }>;
  };
  upcoming_maintenance: Array<{
    id: string;
    schedule_name: string;
    asset_name: string;
    asset_number: string;
    due_date: string;
    maintenance_type: string;
    priority: string;
    days_until_due: number;
  }>;
  recent_activity: Array<{
    id: string;
    title: string;
    asset_name: string;
    asset_number: string;
    type: string;
    status: string;
    priority: string;
    assignee: string;
    created_at: string;
  }>;
  alerts: {
    overdue_count: number;
    high_priority_open: number;
    unassigned_count: number;
    inactive_assets: number;
  };
}

interface Asset {
  id: string;
  name: string;
  asset_number: string;
  type: string;
  category: string;
  location: string;
  purchase_date: string;
  purchase_cost: number;
  status: string;
  active_work_orders: number;
  total_work_orders: number;
  maintenance_schedules: number;
  overdue_maintenance: number;
  next_maintenance: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  cost: number | null;
  labor_hours: number | null;
  asset: {
    name: string;
    asset_number: string;
  };
  assignee: {
    name: string;
    employee_number: string;
  } | null;
  is_scheduled: boolean;
  days_overdue: number;
  created_at: string;
}

interface MaintenanceSchedule {
  id: string;
  schedule_name: string;
  description: string;
  maintenance_type: string;
  frequency_type: string;
  frequency_value: number;
  next_due_date: string;
  last_completed: string | null;
  estimated_duration: number | null;
  priority: string;
  is_active: boolean;
  asset: {
    name: string;
    asset_number: string;
  };
  work_orders_count: number;
  status_info: {
    is_overdue: boolean;
    is_due_soon: boolean;
    days_until_due: number;
    status: string;
  };
  created_at: string;
}

export default function MaintenancePage() {
  const ____router = useRouter();
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // React Query: Stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
    isFetching: statsFetching,
  } = useQuery({
    queryKey: ["maintenance-stats"],
    queryFn: async () => {
      const response = await fetch("/api/maintenance/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      return data.success ? data.data : null;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // React Query: Assets
  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError,
    refetch: refetchAssets,
    isFetching: assetsFetching,
  } = useQuery({
    queryKey: ["maintenance-assets"],
    queryFn: async () => {
      const response = await fetch("/api/maintenance/assets");
      if (!response.ok) throw new Error("Failed to fetch assets");
      const data = await response.json();
      return data.success ? data.data || [] : [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // React Query: Work Orders
  const {
    data: workOrders = [],
    isLoading: workOrdersLoading,
    error: workOrdersError,
    refetch: refetchWorkOrders,
    isFetching: workOrdersFetching,
  } = useQuery({
    queryKey: ["maintenance-work-orders"],
    queryFn: async () => {
      const response = await fetch("/api/maintenance/work-orders");
      if (!response.ok) throw new Error("Failed to fetch work orders");
      const data = await response.json();
      return data.success ? data.data || [] : [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // React Query: Schedules
  const {
    data: schedules = [],
    isLoading: schedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules,
    isFetching: schedulesFetching,
  } = useQuery({
    queryKey: ["maintenance-schedules"],
    queryFn: async () => {
      const response = await fetch("/api/maintenance/schedules");
      if (!response.ok) throw new Error("Failed to fetch schedules");
      const data = await response.json();
      return data.success ? data.data || [] : [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Combined loading and error states
  const ____loading =
    statsLoading || assetsLoading || workOrdersLoading || schedulesLoading;
  const isFetching =
    statsFetching || assetsFetching || workOrdersFetching || schedulesFetching;
  const error = statsError || assetsError || workOrdersError || schedulesError;

  // Master refresh function
  const handleRefreshAll = () => {
    refetchStats();
    refetchAssets();
    refetchWorkOrders();
    refetchSchedules();
  };

  const getStatusBadge = (status: string) => {
    if (!status)
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;

    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case "maintenance":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
        );
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>;
      case "in_progress":
        return (
          <Badge className="bg-orange-100 text-orange-800">In Progress</Badge>
        );
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case "due_soon":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
        );
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (!priority)
      return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>;

    switch (priority.toLowerCase()) {
      case "critical":
        return <Badge className="bg-red-500 text-white">Critical</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `â‚±${amount.toLocaleString()}`;
  };

  const ____formatDateTime = (dateString: string) => {
    return dateString ? formatDateUtil(dateString, "datetime") : "-";
  };

  const formatDate = (dateString: string) => {
    return dateString ? formatDateUtil(dateString) : "-";
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Maintenance Management
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={() => setShowWorkOrderModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Work Order
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load maintenance data.{" "}
              <button onClick={handleRefreshAll} className="ml-1 underline">
                Retry
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="mb-2 h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Assets
                  </CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.overview.total_assets || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.overview.asset_utilization || 0}% utilization rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Open Work Orders
                  </CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.overview.open_work_orders || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.overview.pending_work_orders || 0} unassigned
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Overdue Maintenance
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.overview.overdue_maintenance || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of {stats?.overview.total_schedules || 0} schedules
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Costs
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      stats?.overview.maintenance_costs_this_month || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.overview.completion_rate || 0}% completion rate
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Alerts */}
        {stats &&
          (stats.alerts.overdue_count > 0 ||
            stats.alerts.high_priority_open > 0) && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center text-red-800">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Maintenance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {stats.alerts.overdue_count > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {stats.alerts.overdue_count}
                      </div>
                      <div className="text-sm text-red-700">Overdue</div>
                    </div>
                  )}
                  {stats.alerts.high_priority_open > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {stats.alerts.high_priority_open}
                      </div>
                      <div className="text-sm text-red-700">
                        Critical Priority
                      </div>
                    </div>
                  )}
                  {stats.alerts.unassigned_count > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.alerts.unassigned_count}
                      </div>
                      <div className="text-sm text-orange-700">Unassigned</div>
                    </div>
                  )}
                  {stats.alerts.inactive_assets > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.alerts.inactive_assets}
                      </div>
                      <div className="text-sm text-yellow-700">
                        Inactive Assets
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Upcoming Maintenance */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Maintenance</CardTitle>
                  <CardDescription>Next 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.upcoming_maintenance.length === 0 ? (
                    <p className="text-muted-foreground">
                      No upcoming maintenance scheduled
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {(stats?.upcoming_maintenance || [])
                        .slice(0, 5)
                        .map((maintenance: any) => (
                          <div
                            key={maintenance.id}
                            className="flex items-center justify-between rounded border p-2"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {maintenance.schedule_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {maintenance.asset_name} (
                                {maintenance.asset_number})
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm">
                                {formatDate(maintenance.due_date)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {maintenance.days_until_due > 0
                                  ? `${maintenance.days_until_due} days`
                                  : "Overdue"}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Work Orders</CardTitle>
                  <CardDescription>
                    Latest maintenance activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.recent_activity.length === 0 ? (
                    <p className="text-muted-foreground">No recent activity</p>
                  ) : (
                    <div className="space-y-2">
                      {(stats?.recent_activity || []).map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between rounded border p-2"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {activity.asset_name} â€¢ {activity.assignee}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(activity.status)}
                            {getPriorityBadge(activity.priority)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Asset Management</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button onClick={() => setShowAssetModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <div><table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Asset
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Work Orders
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Next Maintenance
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(assets || []).slice(0, 10).map((asset: any) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {asset.asset_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{asset.type}</div>
                          {asset.category && (
                            <div className="text-xs text-muted-foreground">
                              {asset.category}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{asset.location}</td>
                        <td className="px-4 py-3">
                          {getStatusBadge(asset.status)}
                          {asset.overdue_maintenance > 0 && (
                            <Badge className="ml-1 bg-red-100 text-red-800">
                              {asset.overdue_maintenance} overdue
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>{asset.active_work_orders} active</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.total_work_orders} total
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {asset.next_maintenance
                            ? formatDate(asset.next_maintenance)
                            : "Not scheduled"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="work-orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Work Orders</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button onClick={() => setShowWorkOrderModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Work Order
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <div><table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Work Order
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Asset
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Assignee
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Due Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(workOrders || []).slice(0, 10).map((wo: any) => (
                      <tr key={wo.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{wo.title}</div>
                            {wo.is_scheduled && (
                              <Badge className="mt-1 bg-blue-100 text-xs text-blue-800">
                                Scheduled
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{wo.asset.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {wo.asset.asset_number}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{wo.type}</td>
                        <td className="px-4 py-3">
                          {getPriorityBadge(wo.priority)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {wo.assignee?.name || "Unassigned"}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(wo.status)}
                          {wo.days_overdue > 0 && (
                            <div className="mt-1 text-xs text-red-600">
                              {wo.days_overdue} days overdue
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {wo.scheduled_date
                            ? formatDate(wo.scheduled_date)
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Maintenance Schedules</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button onClick={() => setShowScheduleModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Schedule
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <div><table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Schedule
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Asset
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Frequency
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Next Due
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(schedules || []).slice(0, 10).map((schedule: any) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {schedule.schedule_name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">{schedule.asset.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.asset.asset_number}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {schedule.maintenance_type}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          Every {schedule.frequency_value}{" "}
                          {schedule.frequency_type.toLowerCase()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {formatDate(schedule.next_due_date)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.status_info.days_until_due > 0
                              ? `${schedule.status_info.days_until_due} days`
                              : "Overdue"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getPriorityBadge(schedule.priority)}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(schedule.status_info.status)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Placeholder Modals */}
        {showWorkOrderModal && (
          <Alert className="fixed bottom-4 right-4 w-96 border-blue-200 bg-blue-50">
            <AlertDescription>
              Work Order creation modal - Under development
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWorkOrderModal(false)}
                className="ml-2"
              >
                Close
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {showAssetModal && (
          <Alert className="fixed bottom-4 right-4 w-96 border-blue-200 bg-blue-50">
            <AlertDescription>
              Asset creation modal - Under development
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssetModal(false)}
                className="ml-2"
              >
                Close
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {showScheduleModal && (
          <Alert className="fixed bottom-4 right-4 w-96 border-blue-200 bg-blue-50">
            <AlertDescription>
              Schedule creation modal - Under development
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScheduleModal(false)}
                className="ml-2"
              >
                Close
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}

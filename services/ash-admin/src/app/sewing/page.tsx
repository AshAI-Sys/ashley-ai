"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Scissors,
  Play,
  Pause,
  Square,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle,
  QrCode,
  Search,
  Filter,
  Plus,
  Eye,
  BarChart3,
  Brain,
  Timer,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface SewingRun {
  id: string;
  operation_name: string;
  status: "CREATED" | "IN_PROGRESS" | "DONE";
  order: {
    order_number: string;
    brand: { name: string; code: string } | null;
  } | null;
  operator: {
    first_name: string;
    last_name: string;
    employee_number: string;
  } | null;
  bundle: {
    id: string;
    size_code: string;
    qty: number;
    qr_code: string;
  } | null;
  qty_good: number;
  qty_reject: number;
  earned_minutes?: number;
  actual_minutes?: number;
  efficiency_pct?: number;
  piece_rate_pay?: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

interface SewingOperation {
  id: string;
  product_type: string;
  name: string;
  standard_minutes: number;
  piece_rate?: number;
  depends_on?: string[];
}

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
}

interface DashboardStats {
  active_runs: number;
  todays_completed: number;
  operators_working: number;
  avg_efficiency: number;
  pending_bundles: number;
  total_pieces_today: number;
}

const statusColors = {
  CREATED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-green-100 text-green-800 border-green-200",
  DONE: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function SewingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    status: "",
    operation: "",
    operator: "",
    search: "",
  });

  // Fetch sewing runs with filters
  const {
    data: sewingRuns = [],
    isLoading: runsLoading,
    error: runsError,
    refetch: refetchRuns,
    isFetching: runsFetching,
  } = useQuery({
    queryKey: [
      "sewing-runs",
      filters.status,
      filters.operation,
      filters.operator,
      filters.search,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.operation && filters.operation !== "all")
        params.append("operation", filters.operation);
      if (filters.operator && filters.operator !== "all")
        params.append("operator", filters.operator);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/sewing/runs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch sewing runs");
      const data = await response.json();
      return Array.isArray(data.data) ? (data.data as SewingRun[]) : [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch sewing operations
  const {
    data: operations = [],
    isLoading: operationsLoading,
    error: operationsError,
    refetch: refetchOperations,
    isFetching: operationsFetching,
  } = useQuery({
    queryKey: ["sewing-operations"],
    queryFn: async () => {
      const response = await fetch("/api/sewing/operations");
      if (!response.ok) throw new Error("Failed to fetch operations");
      const data = await response.json();
      return Array.isArray(data.data) ? (data.data as SewingOperation[]) : [];
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });

  // Fetch operators (employees in sewing department)
  const {
    data: operators = [],
    isLoading: operatorsLoading,
    error: operatorsError,
    refetch: refetchOperators,
    isFetching: operatorsFetching,
  } = useQuery({
    queryKey: ["sewing-operators"],
    queryFn: async () => {
      const response = await fetch("/api/employees?department=SEWING");
      if (!response.ok) throw new Error("Failed to fetch operators");
      const data = await response.json();
      return Array.isArray(data.data) ? (data.data as Employee[]) : [];
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });

  // Fetch dashboard stats
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
    isFetching: statsFetching,
  } = useQuery({
    queryKey: ["sewing-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/sewing/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await response.json();
      return data.data as DashboardStats;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const handleRefreshAll = () => {
    refetchRuns();
    refetchOperations();
    refetchOperators();
    refetchStats();
  };

  const isLoading =
    runsLoading || operationsLoading || operatorsLoading || statsLoading;
  const isFetching =
    runsFetching || operationsFetching || operatorsFetching || statsFetching;

  const handleRunAction = async (
    runId: string,
    action: "start" | "pause" | "complete"
  ) => {
    try {
      const response = await fetch(`/api/sewing/runs/${runId}/${action}`, {
        method: "POST",
      });

      if (response.ok) {
        refetchRuns(); // Refresh data
        refetchStats();
      } else {
        console.error(`Failed to ${action} sewing run`);
      }
    } catch (error) {
      console.error(`Error ${action}ing sewing run:`, error);
    }
  };

  const getEfficiencyColor = (efficiency?: number) => {
    if (!efficiency) return "text-gray-500";
    if (efficiency >= 95) return "text-green-600";
    if (efficiency >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  // Error Alert Component
  const ErrorAlert = ({
    error,
    onRetry,
  }: {
    error: Error;
    onRetry: () => void;
  }) => (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Error</AlertTitle>
      <AlertDescription className="text-red-700">
        {error.message}
        <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );

  // Skeleton Loaders
  const StatCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );

  const SewingRunCardSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-2 w-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sewing Operations</h1>
            <p className="text-muted-foreground">
              Production tracking with real-time efficiency monitoring
            </p>
          </div>
          <div className="flex gap-2">
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
            <Link href="/sewing/operations">
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Operations
              </Button>
            </Link>
            <Link href="/sewing/runs/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New Run
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Alerts */}
        {statsError && (
          <ErrorAlert error={statsError as Error} onRetry={refetchStats} />
        )}
        {runsError && (
          <ErrorAlert error={runsError as Error} onRetry={refetchRuns} />
        )}
        {operationsError && (
          <ErrorAlert
            error={operationsError as Error}
            onRetry={refetchOperations}
          />
        )}
        {operatorsError && (
          <ErrorAlert
            error={operatorsError as Error}
            onRetry={refetchOperators}
          />
        )}

        {/* Dashboard Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : dashboardStats ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Runs
                </CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardStats.active_runs}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardStats.todays_completed}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Operators</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardStats.operators_working}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Efficiency
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getEfficiencyColor(dashboardStats.avg_efficiency)}`}
                >
                  {dashboardStats.avg_efficiency}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Bundles
                </CardTitle>
                <QrCode className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardStats.pending_bundles}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Output
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {dashboardStats.total_pieces_today}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="runs">Active Runs</TabsTrigger>
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="ashley-ai">Ashley AI</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest sewing operations and milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">Bundle #B-001 completed</p>
                        <p className="text-sm text-muted-foreground">
                          20 pieces • 95% efficiency
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        5 min ago
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                      <Play className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">
                          New run started: Attach collar
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Operator: Carlos Rodriguez
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        12 min ago
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="font-medium">Low efficiency detected</p>
                        <p className="text-sm text-muted-foreground">
                          Bundle #B-005 • 72% efficiency
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        1 hour ago
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers Today</CardTitle>
                  <CardDescription>
                    Operators with highest efficiency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                      <div>
                        <p className="font-medium">Maria Santos</p>
                        <p className="text-sm text-muted-foreground">
                          EMP001 • Join shoulders
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">98%</Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                      <div>
                        <p className="font-medium">Ana Cruz</p>
                        <p className="text-sm text-muted-foreground">
                          EMP003 • Set sleeves
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">96%</Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                      <div>
                        <p className="font-medium">Juan Dela Cruz</p>
                        <p className="text-sm text-muted-foreground">
                          EMP004 • Side seams
                        </p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        94%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="runs" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search runs..."
                      value={filters.search}
                      onChange={e =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      className="pl-9"
                    />
                  </div>

                  <Select
                    value={filters.status}
                    onValueChange={value =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="CREATED">Created</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.operation}
                    onValueChange={value =>
                      setFilters({ ...filters, operation: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All operations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All operations</SelectItem>
                      {(Array.isArray(operations) ? operations : []).map(op => (
                        <SelectItem key={op.id} value={op.name}>
                          {op.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.operator}
                    onValueChange={value =>
                      setFilters({ ...filters, operator: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All operators" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All operators</SelectItem>
                      {(Array.isArray(operators) ? operators : []).map(op => (
                        <SelectItem key={op.id} value={op.id}>
                          {op.first_name} {op.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Sewing Runs List */}
            <div className="space-y-4">
              {runsLoading
                ? [...Array(3)].map((_, i) => <SewingRunCardSkeleton key={i} />)
                : (Array.isArray(sewingRuns) ? sewingRuns : []).map(run => (
                    <Card
                      key={run.id}
                      className="transition-shadow hover:shadow-md"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2 text-blue-800">
                              <Scissors className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {run.order?.order_number || "N/A"}
                                </h3>
                                <Badge variant="outline">
                                  {run.order?.brand?.code || "N/A"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {run.operation_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[run.status]}>
                              {run.status.replace("_", " ")}
                            </Badge>
                            {run.efficiency_pct && (
                              <Badge
                                variant="outline"
                                className={getEfficiencyColor(
                                  run.efficiency_pct
                                )}
                              >
                                {run.efficiency_pct}% eff
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              Progress: {run.qty_good} / {run.bundle?.qty || 0}
                            </span>
                            <span>
                              {run.bundle?.qty
                                ? Math.round(
                                    (run.qty_good / run.bundle.qty) * 100
                                  )
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                              style={{
                                width: `${run.bundle?.qty ? (run.qty_good / run.bundle.qty) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          {run.qty_reject > 0 && (
                            <p className="text-sm text-red-600">
                              {run.qty_reject} rejected
                            </p>
                          )}
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <span className="font-medium">Operator:</span>
                            <br />
                            {run.operator?.first_name || "N/A"}{" "}
                            {run.operator?.last_name || ""}
                          </div>
                          <div>
                            <span className="font-medium">Bundle:</span>
                            <br />
                            {run.bundle?.size_code || "N/A"} •{" "}
                            {run.bundle?.qty || 0} pcs
                          </div>
                          <div>
                            <span className="font-medium">Pay:</span>
                            <br />
                            {run.piece_rate_pay
                              ? `₱${run.piece_rate_pay.toFixed(2)}`
                              : "Pending"}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span>
                            <br />
                            {run.actual_minutes
                              ? `${run.actual_minutes} min`
                              : "Running"}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t pt-2">
                          {run.status === "CREATED" && (
                            <Button
                              size="sm"
                              onClick={() => handleRunAction(run.id, "start")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Play className="mr-1 h-4 w-4" />
                              Start
                            </Button>
                          )}

                          {run.status === "IN_PROGRESS" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRunAction(run.id, "pause")}
                              >
                                <Pause className="mr-1 h-4 w-4" />
                                Pause
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleRunAction(run.id, "complete")
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Square className="mr-1 h-4 w-4" />
                                Complete
                              </Button>
                            </>
                          )}

                          <Link href={`/sewing/runs/${run.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-1 h-4 w-4" />
                              Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

              {!runsLoading && sewingRuns.length === 0 && (
                <Card>
                  <CardContent className="flex h-32 items-center justify-center">
                    <div className="text-center">
                      <Scissors className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {filters.status ||
                        filters.operation ||
                        filters.operator ||
                        filters.search
                          ? "No sewing runs match your filters"
                          : "No sewing runs found"}
                      </p>
                      <Link href="/sewing/runs/new">
                        <Button className="mt-2" variant="outline">
                          Create First Run
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="operators" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(Array.isArray(operators) ? operators : []).map(operator => (
                <Card key={operator.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {operator.first_name} {operator.last_name}
                        </CardTitle>
                        <CardDescription>
                          {operator.employee_number} • {operator.position}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Today's efficiency:</span>
                        <span className="font-medium text-green-600">96%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completed pieces:</span>
                        <span className="font-medium">45</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Current operation:</span>
                        <span className="font-medium">Join shoulders</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ashley-ai" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <CardTitle>AI Performance Insights</CardTitle>
                  </div>
                  <CardDescription>
                    Real-time efficiency analysis and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border bg-green-50 p-3">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="mt-0.5 h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">
                            Efficiency Trending Up
                          </p>
                          <p className="text-sm text-green-700">
                            Overall line efficiency increased 3% in the last
                            hour. Maria Santos leading with 98% efficiency.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-yellow-50 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-900">
                            Bottleneck Detected
                          </p>
                          <p className="text-sm text-yellow-700">
                            "Set sleeves" operation is 15% slower than standard.
                            Consider operator rotation or additional training.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-blue-50 p-3">
                      <div className="flex items-start gap-2">
                        <Timer className="mt-0.5 h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">
                            Break Recommendation
                          </p>
                          <p className="text-sm text-blue-700">
                            Operator Carlos Rodriguez has been working for 2.5
                            hours. Recommend a 15-minute break to maintain
                            efficiency.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Production Optimization</CardTitle>
                  <CardDescription>
                    Smart recommendations for today's production
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-medium">Operator Rebalancing</h4>
                      <p className="mb-2 text-sm text-muted-foreground">
                        Suggested operator reassignments to optimize flow:
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Move EMP002 to "Hem bottom"</span>
                          <Badge variant="outline" className="text-xs">
                            +8% throughput
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Assign EMP003 to parallel "Set sleeves"</span>
                          <Badge variant="outline" className="text-xs">
                            -15min/bundle
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium">Quality Prediction</h4>
                      <p className="mb-2 text-sm text-muted-foreground">
                        Bundle quality risk assessment:
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Bundle #B-003 (Size L)</span>
                          <Badge className="bg-green-100 text-xs text-green-800">
                            Low Risk
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Bundle #B-005 (Size XL)</span>
                          <Badge className="bg-yellow-100 text-xs text-yellow-800">
                            Medium Risk
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Efficiency</span>
                      <span className="font-medium text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Pieces Completed</span>
                      <span className="font-medium">580</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Earnings</span>
                      <span className="font-medium">₱1,450.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reject Rate</span>
                      <span className="font-medium text-green-600">0.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operation Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(Array.isArray(operations) ? operations : [])
                      .slice(0, 5)
                      .map(operation => (
                        <div
                          key={operation.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{operation.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {operation.standard_minutes}min • ₱
                              {operation.piece_rate?.toFixed(2)}
                            </p>
                          </div>
                          <Badge variant="outline">8 runs</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

"use client";

// Force dynamic rendering (don't pre-render during build)
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Package,
  PackageCheck,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search, Filter,
  Eye,
  Printer,
  Scissors, Tags,
  Box,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FinishingRun {
  id: string;
  order: { order_number: string };
  bundle: { qr_code: string; size_code: string; qty: number };
  operator: { first_name: string; last_name: string };
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "PACKED";
  tasks_completed: number;
  total_tasks: number;
  started_at?: string;
  completed_at?: string;
  materials_used: Array<{
    item_name: string;
    quantity: number;
    uom: string;
  }>;
}

interface Carton {
  id: string;
  carton_no: string;
  order: { order_number: string };
  dimensions: { length: number; width: number; height: number };
  actual_weight: number;
  fill_percent: number;
  status: "OPEN" | "CLOSED" | "SHIPPED";
  units_count: number;
  created_at: string;
}

interface FinishingStats {
  pending_orders: number;
  in_progress: number;
  completed_today: number;
  packed_today: number;
  efficiency_rate: number;
}

export default function FinishingPackingPage() {
  const [activeTab, setActiveTab] = useState<"finishing" | "packing">(
    "finishing"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // React Query: Finishing Runs
  const {
    data: finishingRuns = [],
    isLoading: finishingRunsLoading,
    error: finishingRunsError,
    refetch: refetchFinishingRuns,
    isFetching: finishingRunsFetching,
  } = useQuery({
    queryKey: ["finishing-runs"],
    queryFn: async () => {
      const response = await fetch("/api/finishing/runs");
      if (!response.ok) throw new Error("Failed to fetch finishing runs");
      const data = await response.json();
      return Array.isArray(data.runs)
        ? data.runs
        : Array.isArray(data)
          ? data
          : [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
    enabled: activeTab === "finishing",
  });

  // React Query: Packing Cartons
  const {
    data: cartons = [],
    isLoading: cartonsLoading,
    error: cartonsError,
    refetch: refetchCartons,
    isFetching: cartonsFetching,
  } = useQuery({
    queryKey: ["packing-cartons"],
    queryFn: async () => {
      const response = await fetch("/api/packing/cartons");
      if (!response.ok) throw new Error("Failed to fetch packing cartons");
      const data = await response.json();
      return Array.isArray(data.cartons)
        ? data.cartons
        : Array.isArray(data)
          ? data
          : [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
    enabled: activeTab === "packing",
  });

  // React Query: Stats (always fetch)
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
    isFetching: statsFetching,
  } = useQuery({
    queryKey: ["finishing-packing-stats"],
    queryFn: async () => {
      const response = await fetch("/api/finishing-packing/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      return data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Combined loading and error states
  const ____isLoading =
    activeTab === "finishing" ? finishingRunsLoading : cartonsLoading;
  const isFetching =
    statsFetching ||
    (activeTab === "finishing" ? finishingRunsFetching : cartonsFetching);
  const error =
    statsError ||
    (activeTab === "finishing" ? finishingRunsError : cartonsError);

  // Master refresh function
  const handleRefreshAll = () => {
    refetchStats();
    if (activeTab === "finishing") {
      refetchFinishingRuns();
    } else {
      refetchCartons();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "PACKED":
        return <Badge className="bg-purple-100 text-purple-800">Packed</Badge>;
      case "OPEN":
        return <Badge className="bg-orange-100 text-orange-800">Open</Badge>;
      case "CLOSED":
        return <Badge className="bg-green-100 text-green-800">Closed</Badge>;
      case "SHIPPED":
        return <Badge className="bg-gray-100 text-gray-800">Shipped</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredFinishingRuns = finishingRuns.filter((run: any) =>
      (searchTerm === "" ||
        run.order?.order_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        run.bundle?.qr_code
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || run.status === filterStatus)
  );

  const filteredCartons = cartons.filter((carton: any) =>
      (searchTerm === "" ||
        carton.order?.order_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        carton.carton_no?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || carton.status === filterStatus)
  );

  // Skeleton Loaders
  const StatCardSkeleton = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="ml-5 w-0 flex-1">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TableRowSkeleton = () => (
    <tr>
      <td className="px-6 py-4">
        <Skeleton className="h-10 w-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-10 w-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-10 w-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-10 w-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-10 w-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-10 w-20" />
      </td>
    </tr>
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              Finishing & Packing
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Stage 7 - Final production steps and cartonization
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
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
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print Labels
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Start {activeTab === "finishing" ? "Finishing" : "Packing"}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load data.{" "}
              <button onClick={handleRefreshAll} className="ml-1 underline">
                Retry
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {statsLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </>
          ) : stats ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">
                          Pending Orders
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.pending_orders}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Scissors className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">
                          In Progress
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.in_progress}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">
                          Completed Today
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.completed_today}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">
                          Packed Today
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.packed_today}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-orange-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">
                          Efficiency
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.efficiency_rate}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("finishing")}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === "finishing"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <Scissors className="mr-2 inline h-4 w-4" />
              Finishing Operations
            </button>
            <button
              onClick={() => setActiveTab("packing")}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === "packing"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <Box className="mr-2 inline h-4 w-4" />
              Packing & Cartonization
            </button>
          </nav>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    className="pl-11 pr-4"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {activeTab === "finishing" ? (
                      <>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="PACKED">Packed</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {activeTab === "finishing" ? (
          <FinishingRunsTable
            runs={filteredFinishingRuns}
            getStatusBadge={getStatusBadge}
            isLoading={finishingRunsLoading}
            TableRowSkeleton={TableRowSkeleton}
          />
        ) : (
          <PackingCartonsTable
            cartons={filteredCartons}
            getStatusBadge={getStatusBadge}
            isLoading={cartonsLoading}
            TableRowSkeleton={TableRowSkeleton}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Separate component for Finishing Runs Table
function FinishingRunsTable({
  runs,
  getStatusBadge,
  isLoading,
  TableRowSkeleton,
}: {
  runs: FinishingRun[];
  getStatusBadge: (status: string) => JSX.Element;
  isLoading: boolean;
  TableRowSkeleton: () => JSX.Element;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finishing Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <div><table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Order / Bundle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Operator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Materials Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </>
              ) : (
                (Array.isArray(runs) ? runs : []).map(run => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {run.order?.order_number || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Bundle: {run.bundle?.qr_code || "N/A"} (
                          {run.bundle?.size_code || "N/A"}) -{" "}
                          {run.bundle?.qty || 0} pcs
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {run.operator?.first_name || "N/A"}{" "}
                        {run.operator?.last_name || ""}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {run.tasks_completed}/{run.total_tasks} tasks
                        </div>
                        <div className="ml-3 h-2 w-16 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{
                              width: `${(run.tasks_completed / run.total_tasks) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(run.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {(Array.isArray(run.materials_used)
                          ? run.materials_used
                          : []
                        ).map((material, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {material.item_name}: {material.quantity}{" "}
                            {material.uom}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {run.status === "COMPLETED" && (
                          <Button size="sm" variant="outline">
                            <Package className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && runs.length === 0 && (
          <div className="py-12 text-center">
            <Scissors className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No finishing operations
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new finishing run.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Separate component for Packing Cartons Table
function PackingCartonsTable({
  cartons,
  getStatusBadge,
  isLoading,
  TableRowSkeleton,
}: {
  cartons: Carton[];
  getStatusBadge: (status: string) => JSX.Element;
  isLoading: boolean;
  TableRowSkeleton: () => JSX.Element;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Packing & Cartonization</CardTitle>
      </CardHeader>
      <CardContent>
        <div><table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Carton / Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Dimensions (LÃ—WÃ—H)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Weight & Fill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </>
              ) : (
                (Array.isArray(cartons) ? cartons : []).map(carton => (
                  <tr key={carton.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {carton.carton_no || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Order: {carton.order?.order_number || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {carton.dimensions?.length || 0}Ã—
                        {carton.dimensions?.width || 0}Ã—
                        {carton.dimensions?.height || 0} cm
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">
                          {carton.actual_weight || 0} kg
                        </div>
                        <div className="mt-1 flex items-center">
                          <div className="mr-2 text-sm text-gray-500">
                            {carton.fill_percent || 0}% fill
                          </div>
                          <div className="h-2 w-16 rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full ${
                                (carton.fill_percent || 0) >= 90
                                  ? "bg-green-600"
                                  : (carton.fill_percent || 0) >= 70
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                              }`}
                              style={{ width: `${carton.fill_percent || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {carton.units_count || 0} units
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(carton.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {carton.status === "OPEN" && (
                          <Button size="sm" variant="outline">
                            <PackageCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {carton.status === "CLOSED" && (
                          <Button size="sm" variant="outline">
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && cartons.length === 0 && (
          <div className="py-12 text-center">
            <Box className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No cartons found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new carton for packing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

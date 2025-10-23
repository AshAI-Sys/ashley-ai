"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface QCInspection {
  id: string;
  order?: { order_number?: string } | null;
  bundle?: { qr_code?: string; size_code?: string; qty?: number } | null;
  checklist?: { name?: string; type?: string } | null;
  inspector?: { first_name?: string; last_name?: string } | null;
  stage: string;
  lot_size: number;
  sample_size: number;
  critical_found: number;
  major_found: number;
  minor_found: number;
  status: "OPEN" | "PASSED" | "FAILED" | "CLOSED";
  result?: "PASSED" | "FAILED" | null;
  inspection_date: string;
  started_at?: string | null;
  completed_at?: string | null;
  _count?: { samples?: number; defects?: number; capa_tasks?: number } | null;
}

interface QCStats {
  total_inspections: number;
  passed: number;
  failed: number;
  pending: number;
  defect_rate: number;
  avg_sample_size: number;
}

export default function QualityControlPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [filterType, setFilterType] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate date range based on period
  const getDateRange = () => {
    const now = new Date();
    const fromDate = new Date();

    switch (selectedPeriod) {
      case "today":
        fromDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        fromDate.setDate(now.getDate() - 7);
        break;
      case "month":
        fromDate.setMonth(now.getMonth() - 1);
        break;
      default:
        fromDate.setDate(now.getDate() - 7);
    }

    return { fromDate, toDate: now };
  };

  // Fetch QC inspections with filters
  const {
    data: inspections = [],
    isLoading: inspectionsLoading,
    error: inspectionsError,
    refetch: refetchInspections,
    isFetching: inspectionsFetching,
  } = useQuery({
    queryKey: ["qc-inspections", selectedPeriod, filterType, filterResult],
    queryFn: async () => {
      const { fromDate, toDate } = getDateRange();
      const params = new URLSearchParams({
        from_date: fromDate.toISOString(),
        to_date: toDate.toISOString(),
        page: "1",
        limit: "50",
      });

      if (filterType !== "all") params.append("inspection_type", filterType);
      if (filterResult !== "all") params.append("result", filterResult);

      const response = await fetch(
        `/api/quality-control/inspections?${params}`
      );
      if (!response.ok) throw new Error("Failed to fetch QC inspections");
      const data = await response.json();
      return Array.isArray(data.inspections)
        ? (data.inspections as QCInspection[])
        : [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Calculate stats from inspections data
  const stats: QCStats = {
    total_inspections: inspections.length,
    passed: inspections.filter(i => i.status === "PASSED").length,
    failed: inspections.filter(i => i.status === "FAILED").length,
    pending: inspections.filter(i => i.status === "OPEN").length,
    defect_rate:
      inspections.length > 0
        ? (inspections.reduce(
            (sum, i) => sum + i.critical_found + i.major_found + i.minor_found,
            0
          ) /
            inspections.reduce((sum, i) => sum + i.sample_size, 0)) *
          100
        : 0,
    avg_sample_size:
      inspections.length > 0
        ? inspections.reduce((sum, i) => sum + i.sample_size, 0) /
          inspections.length
        : 0,
  };

  const handleRefresh = () => {
    refetchInspections();
  };

  const isLoading = inspectionsLoading;
  const isFetching = inspectionsFetching;

  const filteredInspections = inspections.filter(
    inspection =>
      searchTerm === "" ||
      inspection.order?.order_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inspection.inspector?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inspection.inspector?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, result?: string | null) => {
    switch (status) {
      case "PASSED":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Passed
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </span>
        );
      case "CLOSED":
        return result ? (
          getStatusBadge(result)
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            Closed
          </span>
        );
      case "OPEN":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Open
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const getStageBadge = (stage: string) => {
    const colors = {
      PRINTING: "bg-blue-100 text-blue-800",
      SEWING: "bg-purple-100 text-purple-800",
      FINAL: "bg-orange-100 text-orange-800",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}
      >
        {stage}
      </span>
    );
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
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-5">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="ml-5 w-0 flex-1">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  );

  const InspectionRowSkeleton = () => (
    <tr>
      <td className="px-6 py-4">
        <Skeleton className="h-10 w-32" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-16" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-16" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-12" />
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
              Quality Control
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage inspections, defects, and quality metrics
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <button
              onClick={() =>
                (window.location.href = "/quality-control/analytics")
              }
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </button>
            <button
              onClick={() => (window.location.href = "/quality-control/new")}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Inspection
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {inspectionsError && (
          <ErrorAlert
            error={inspectionsError as Error}
            onRetry={refetchInspections}
          />
        )}

        {/* Stats Cards */}
        {inspectionsLoading ? (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : stats ? (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardCheck className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Total Inspections
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_inspections}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Pass Rate
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_inspections > 0
                          ? Math.round(
                              (stats.passed / stats.total_inspections) * 100
                            )
                          : 0}
                        %
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Defect Rate
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.defect_rate.toFixed(2)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Avg Sample Size
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {Math.round(stats.avg_sample_size)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search inspections..."
                    className="rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                >
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>

                <select
                  className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="all">All Stages</option>
                  <option value="PRINTING">Printing QC</option>
                  <option value="SEWING">Sewing QC</option>
                  <option value="FINAL">Final QC</option>
                </select>

                <select
                  className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={filterResult}
                  onChange={e => setFilterResult(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="PASSED">Passed</option>
                  <option value="FAILED">Failed</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Inspections Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">
              Quality Inspections
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Order / Bundle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sample Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Defects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {inspectionsLoading
                  ? [...Array(5)].map((_, i) => (
                      <InspectionRowSkeleton key={i} />
                    ))
                  : filteredInspections.map(inspection => (
                      <tr key={inspection.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {inspection.order?.order_number || "N/A"}
                            </div>
                            {inspection.bundle && (
                              <div className="text-sm text-gray-500">
                                Bundle: {inspection.bundle.qr_code || "N/A"} (
                                {inspection.bundle.size_code || "N/A"})
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {inspection.inspector?.first_name || "N/A"}{" "}
                            {inspection.inspector?.last_name || ""}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {getStageBadge(inspection.stage)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {inspection.sample_size} / {inspection.lot_size}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium text-red-600">
                              {inspection.critical_found || 0}C
                            </span>
                            {" / "}
                            <span className="font-medium text-orange-600">
                              {inspection.major_found || 0}M
                            </span>
                            {" / "}
                            <span className="font-medium text-yellow-600">
                              {inspection.minor_found || 0}m
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {getStatusBadge(inspection.status, inspection.result)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(
                            inspection.inspection_date
                          ).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            {(inspection._count?.capa_tasks ?? 0) > 0 && (
                              <button className="text-orange-600 hover:text-orange-900">
                                <FileText className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {!inspectionsLoading && filteredInspections.length === 0 && (
            <div className="py-12 text-center">
              <ClipboardCheck className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No inspections found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== "all" || filterResult !== "all"
                  ? "Try adjusting your filters or search criteria."
                  : "Get started by creating your first quality inspection."}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

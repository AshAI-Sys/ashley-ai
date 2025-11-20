"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Package,
  RefreshCw,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  FileQuestion,
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { DataTableSkeleton } from "@/components/ui/loading-skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useDebounce } from "@/hooks/useDebounce";
import { exportOrders } from "@/lib/export";
import { api } from "@/lib/api";
import { formatDate as formatDateUtil } from "@/lib/utils/date";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  delivery_date: string;
  created_at: string;
  approval_status?: string;
  client: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
  } | null;
  _count: {
    design_assets: number;
    line_items: number;
    bundles: number;
  };
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 500);

  // React Query for data fetching with auto-refresh
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["orders", debouncedSearch, statusFilter, currentPage],
    queryFn: async () => {
      const result = await api.getOrders({
        page: currentPage,
        limit: 10,
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch orders");
      }
      return result.data;
    },
    staleTime: 30000, // Data considered fresh for 30 seconds
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  });

  const orders = data?.orders || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalCount = data?.pagination?.total || 0;

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status.toUpperCase()) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "DESIGN":
        return "bg-purple-100 text-purple-800";
      case "PRODUCTION":
        return "bg-yellow-100 text-yellow-800";
      case "QC":
        return "bg-orange-100 text-orange-800";
      case "PACKING":
        return "bg-indigo-100 text-indigo-800";
      case "SHIPPED":
        return "bg-cyan-100 text-cyan-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalBadge = (approvalStatus?: string) => {
    if (!approvalStatus) return null;

    switch (approvalStatus) {
      case "APPROVED":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          label: "Approved",
        };
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
          label: "Pending Approval",
        };
      case "REJECTED":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          label: "Rejected",
        };
      case "NO_DESIGNS":
        return {
          color: "bg-gray-100 text-gray-600 border-gray-200",
          icon: FileQuestion,
          label: "No Design",
        };
      default:
        return null;
    }
  };


  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        {/* Page Header - Responsive */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">
              Production Orders
            </h1>
            <p className="text-sm text-muted-foreground lg:text-base">
              Manage your production orders and track their progress
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => exportOrders(orders, "excel")}
              disabled={orders.length === 0}
              className="flex-1 gap-2 sm:flex-none"
              size="sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex-1 gap-2 sm:flex-none"
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isFetching ? "Refreshing..." : "Refresh"}
              </span>
            </Button>
            <Link href="/orders/new" className="flex-1 sm:flex-none">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters - Responsive */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search orders..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-10 pl-11"
                  />
                </div>
              </div>

              <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  className="h-10 min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm sm:flex-none sm:min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending</option>
                  <option value="DESIGN">Design</option>
                  <option value="PRODUCTION">Production</option>
                  <option value="QC">Quality Control</option>
                  <option value="PACKING">Packing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                  value={approvalFilter}
                  onChange={e => {
                    setApprovalFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                  aria-label="Filter by approval status"
                  className="h-10 min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm sm:flex-none sm:min-w-[160px]"
                >
                  <option value="all">All Approvals</option>
                  <option value="APPROVED">✓ Approved</option>
                  <option value="PENDING">⏳ Pending Approval</option>
                  <option value="REJECTED">✗ Rejected</option>
                  <option value="NO_DESIGNS">No Design</option>
                </select>
              </div>
            </div>

            {totalCount > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Showing {orders.length} of {totalCount} orders
                {search && ` • Searching for "${search}"`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {isError && (
          <ErrorAlert
            message={
              error?.message || "Failed to load orders. Please try again."
            }
            retry={() => refetch()}
          />
        )}

        {/* Orders List */}
        {isLoading ? (
          <DataTableSkeleton rows={10} />
        ) : (
          <div className="grid gap-4">
            {orders.filter((order: any) => {
              // Apply approval status filter
              if (approvalFilter !== "all" && order.approval_status !== approvalFilter) {
                return false;
              }
              return true;
            }).map((order: any) => (
              <Card
                key={order.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Header */}
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <h3 className="truncate text-lg font-semibold">
                          {order?.order_number || "Unknown Order"}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getStatusColor(order?.status)}>
                            {order?.status
                              ? order.status.replace("_", " ").toUpperCase()
                              : "UNKNOWN"}
                          </Badge>
                          {(() => {
                            const approvalBadge = getApprovalBadge(order?.approval_status);
                            if (!approvalBadge) return null;
                            const Icon = approvalBadge.icon;
                            return (
                              <Badge className={`${approvalBadge.color} flex items-center gap-1 border`}>
                                <Icon className="h-3 w-3" />
                                {approvalBadge.label}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Details Grid - Optimized for mobile */}
                      <div className="xs:grid-cols-2 grid grid-cols-1 gap-3 text-sm lg:grid-cols-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-muted-foreground">
                            Client
                          </span>
                          <span className="mt-0.5 truncate font-medium">
                            {order?.client?.name || "No Client"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-muted-foreground">
                            Brand
                          </span>
                          <span className="mt-0.5 truncate font-medium">
                            {order?.brand?.name || "No Brand"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-muted-foreground">
                            Amount
                          </span>
                          <span className="mt-0.5 font-medium">
                            ₱{(order?.total_amount || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-muted-foreground">
                            Delivery
                          </span>
                          <span className="mt-0.5 font-medium">
                            {order?.delivery_date ? formatDateUtil(order.delivery_date) : "TBD"}
                          </span>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {order?._count?.line_items || 0} items
                        </span>
                        <span>{order?._count?.design_assets || 0} designs</span>
                        <span>{order?._count?.bundles || 0} bundles</span>
                        <span className="hidden sm:inline">
                          Created {order?.created_at ? formatDateUtil(order.created_at) : "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 gap-2 sm:flex-col">
                      <Link
                        href={`/orders/${order?.id || ""}`}
                        className="flex-1 sm:flex-none"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-full px-3"
                        >
                          <Eye className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                      {/* Edit button temporarily removed - edit page needs to be created */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {orders.filter((order: any) => {
              if (approvalFilter !== "all" && order.approval_status !== approvalFilter) {
                return false;
              }
              return true;
            }).length === 0 && !isLoading && !isError && (
              <EmptyState
                icon={Package}
                title="No orders found"
                description={
                  search
                    ? `No orders match "${search}"`
                    : "Get started by creating your first production order"
                }
                action={{
                  label: "Create Order",
                  href: "/orders/new",
                }}
              />
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || isFetching}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || isFetching}
              onClick={() =>
                setCurrentPage(prev => Math.min(totalPages, prev + 1))
              }
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

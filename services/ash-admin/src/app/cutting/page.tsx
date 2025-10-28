"use client";

// Force dynamic rendering (don't pre-render during build)
export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import {
  Plus,
  Scissors,
  Package,
  BarChart3,
  QrCode,
  Eye,
  Edit, Trash2,
  RefreshCw,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface CutLay {
  id: string;
  markerName: string | null;
  layLengthM: number;
  plies: number;
  status: string;
  created_at: string; // Fixed: API returns snake_case
  grossUsed: number;
  netUsed: number;
  order: {
    orderNumber: string;
    client: {
      name: string;
      company: string | null;
    } | null;
    brand: {
      name: string;
    } | null;
  } | null;
  outputs: Array<{
    id: string;
    sizeCode: string;
    qty: number;
  }>;
  _count: {
    outputs: number;
  };
}

interface Bundle {
  id: string;
  bundleNumber: string;
  orderId: string;
  cutLayId: string;
  sizeCode: string;
  quantity: number;
  status: string;
  qrCode: string;
  created_at: string; // Fixed: API returns snake_case
  order: {
    orderNumber: string;
    client: {
      name: string;
      company: string | null;
    } | null;
  } | null;
  cutLay: {
    markerName: string | null;
    layLengthM: number;
  } | null;
}

export default function CuttingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("lays");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  // Fetch cut lays
  const {
    data: laysData,
    isLoading: laysLoading,
    error: laysError,
    refetch: refetchLays,
    isFetching: laysFetching,
  } = useQuery({
    queryKey: ["cutting-lays", statusFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/cutting/lays?${params}`);
      const data = await response.json();
      if (!data.success)
        throw new Error(data.error || "Failed to fetch cut lays");
      return data.data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch bundles
  const {
    data: bundlesData,
    isLoading: bundlesLoading,
    error: bundlesError,
    refetch: refetchBundles,
    isFetching: bundlesFetching,
  } = useQuery({
    queryKey: ["cutting-bundles", debouncedSearch, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      const response = await fetch(`/api/cutting/bundles?${params}`);
      const data = await response.json();
      if (!data.success)
        throw new Error(data.error || "Failed to fetch bundles");
      return data.data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const handleRefreshAll = () => {
    refetchLays();
    refetchBundles();
  };

  const cutLays = laysData?.cutLays || [];
  const bundles = bundlesData?.bundles || [];
  const totalLays = laysData?.total || 0;
  const totalBundles = bundlesData?.total || 0;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PLANNED: { color: "bg-blue-100 text-blue-800", label: "Planned" },
      IN_PROGRESS: {
        color: "bg-yellow-100 text-yellow-800",
        label: "In Progress",
      },
      COMPLETED: { color: "bg-green-100 text-green-800", label: "Completed" },
      ON_HOLD: { color: "bg-red-100 text-red-800", label: "On Hold" },
      CREATED: { color: "bg-orange-100 text-orange-800", label: "Created" },
      IN_SEWING: { color: "bg-blue-100 text-blue-800", label: "In Sewing" },
      DONE: { color: "bg-green-100 text-green-800", label: "Done" },
      REJECTED: { color: "bg-red-100 text-red-800", label: "Rejected" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Cutting Operations
            </h1>
            <p className="text-gray-600">
              Manage fabric laying, cutting, and bundle generation
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={laysFetching || bundlesFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${laysFetching || bundlesFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={() => router.push("/cutting/create-lay")}>
              <Plus className="mr-2 h-4 w-4" />
              New Lay
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/cutting/scan-bundle")}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Scan Bundle
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {laysLoading || bundlesLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="ml-4 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-12" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Scissors className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Lays
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalLays}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Bundles
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalBundles}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Cutting Efficiency
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {cutLays.length > 0
                          ? (
                              (cutLays.reduce(
                                (sum: number, lay: any) => sum + lay.netUsed / lay.grossUsed,
                                0
                              ) /
                                cutLays.length) *
                              100
                            ).toFixed(1)
                          : "0"}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <QrCode className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Created Bundles
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {bundles.filter((b: any) => b.status === "CREATED").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="lays">Cut Lays</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </TabsList>

          <TabsContent value="lays" className="space-y-4">
            {laysError && (
              <ErrorAlert
                title="Failed to load cut lays"
                message={laysError.message}
                retry={refetchLays}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Cut Lays Management</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-6 flex gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cut Lays Table */}
                {laysLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="rounded-lg border p-4">
                        <div className="flex justify-between">
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cutLays.length === 0 ? (
                  <EmptyState
                    icon={Scissors}
                    title="No cut lays found"
                    description={
                      statusFilter !== "all"
                        ? `No lays with status "${statusFilter}"`
                        : "No cut lays in the system yet"
                    }
                    action={{
                      label: "Create Lay",
                      onClick: () => router.push("/cutting/create-lay"),
                    }}
                  />
                ) : (
                  <div><table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Lay Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Order Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Measurements
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
                        {cutLays.map((lay: any) => {
                          const totalPieces =
                            lay?.outputs?.reduce(
                              (sum: number, output: any) => sum + output.qty,
                              0
                            ) || 0;
                          const efficiency =
                            lay?.grossUsed > 0
                              ? ((lay.netUsed / lay.grossUsed) * 100).toFixed(1)
                              : "0.0";

                          return (
                            <tr key={lay.id} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {lay?.markerName || "No Marker"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {lay?.id?.slice(0, 8) || "N/A"}
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {lay?.order?.orderNumber || "N/A"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {lay?.order?.client?.name || "No Client"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {lay?.order?.brand?.name || "No Brand"}
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  <div>Length: {lay?.layLengthM || 0}m</div>
                                  <div>Plies: {lay?.plies || 0}</div>
                                  <div>Pieces: {totalPieces}</div>
                                  <div className="text-xs text-green-600">
                                    Eff: {efficiency}%
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                {getStatusBadge(lay.status)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <QrCode className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bundles" className="space-y-4">
            {bundlesError && (
              <ErrorAlert
                title="Failed to load bundles"
                message={bundlesError.message}
                retry={refetchBundles}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Bundle Management</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Bundles Table */}
                {bundlesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="rounded-lg border p-4">
                        <div className="flex justify-between">
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : bundles.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No bundles found"
                    description="No bundles have been generated yet"
                    action={{
                      label: "Create Lay First",
                      onClick: () => router.push("/cutting/create-lay"),
                    }}
                  />
                ) : (
                  <div><table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Bundle
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Order
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Size & Qty
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
                        {bundles.map((bundle: any) => (
                          <tr key={bundle.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {bundle?.bundleNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  QR: {bundle?.qrCode || "N/A"}
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {bundle?.order?.orderNumber || "N/A"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {bundle?.order?.client?.name || "No Client"}
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div>Size: {bundle?.sizeCode || "N/A"}</div>
                                <div>Qty: {bundle?.quantity || 0} pcs</div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              {getStatusBadge(bundle?.status)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <QrCode className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cutting Efficiency Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Efficiency Analytics
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cutting efficiency charts and analytics will be displayed
                    here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

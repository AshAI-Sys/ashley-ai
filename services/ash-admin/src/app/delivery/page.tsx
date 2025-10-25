"use client";

// Force dynamic rendering (don't pre-render during build)
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Package,
  User,
  Phone,
  Navigation,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Printer,
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DeliveryShipment {
  id: string;
  shipment_number: string;
  order?: { order_number: string };
  client?: { name: string };
  consignee: {
    name: string;
    address: string;
    phone: string;
  };
  method: "DRIVER" | "LALAMOVE" | "GRAB" | "JNT" | "LBC";
  status:
    | "READY_FOR_PICKUP"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "FAILED"
    | "CANCELLED";
  cartons_count: number;
  total_weight: number;
  cod_amount?: number;
  driver?: {
    name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  courier_service?: string;
  vehicle?: {
    plate_no: string;
    type: string;
  };
  tracking_events: Array<{
    event_type: string;
    location: string;
    timestamp: string;
    notes?: string;
  }>;
  eta: string;
  created_at: string;
  delivered_at?: string;
}

interface DeliveryStats {
  ready_for_pickup: number;
  in_transit: number;
  delivered_today: number;
  failed_deliveries: number;
  on_time_rate: number;
  avg_delivery_time: number;
}

export default function DeliveryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [selectedView, setSelectedView] = useState<"list" | "map">("list");
  const [showNewShipmentDialog, setShowNewShipmentDialog] = useState(false);
  const [showDispatchReportDialog, setShowDispatchReportDialog] =
    useState(false);

  // Fetch delivery stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
    isFetching: statsFetching,
  } = useQuery({
    queryKey: ["delivery-stats"],
    queryFn: async () => {
      const response = await fetch("/api/delivery/stats");
      if (!response.ok) throw new Error("Failed to fetch delivery stats");
      return response.json() as Promise<DeliveryStats>;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch shipments with filters
  const {
    data: shipments = [],
    isLoading: shipmentsLoading,
    error: shipmentsError,
    refetch: refetchShipments,
    isFetching: shipmentsFetching,
  } = useQuery({
    queryKey: ["delivery-shipments", filterStatus, filterMethod],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
      });

      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterMethod !== "all") params.append("method", filterMethod);

      const response = await fetch(`/api/delivery/shipments?${params}`);
      if (!response.ok) throw new Error("Failed to fetch shipments");
      const data = await response.json();
      return data.shipments as DeliveryShipment[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const handleRefreshAll = () => {
    refetchStats();
    refetchShipments();
  };

  const _isLoading = statsLoading || shipmentsLoading;
  const isFetching = statsFetching || shipmentsFetching;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY_FOR_PICKUP":
        return (
          <Badge className="bg-blue-100 text-blue-800">Ready for Pickup</Badge>
        );
      case "IN_TRANSIT":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">In Transit</Badge>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            Out for Delivery
          </Badge>
        );
      case "DELIVERED":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      DRIVER: "bg-purple-100 text-purple-800",
      LALAMOVE: "bg-green-100 text-green-800",
      GRAB: "bg-blue-100 text-blue-800",
      JNT: "bg-red-100 text-red-800",
      LBC: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge
        className={
          colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {method}
      </Badge>
    );
  };

  const filteredShipments = shipments.filter(
    shipment =>
      searchTerm === "" ||
      shipment.shipment_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.order?.order_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.consignee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const ShipmentRowSkeleton = () => (
    <tr>
      <td className="px-6 py-4">
        <Skeleton className="h-10 w-32" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-16 w-48" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-12 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-12 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-10 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-8 w-24" />
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
              Delivery Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Stage 8 - Track shipments and manage deliveries
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
            <Button
              variant="outline"
              onClick={() => setShowDispatchReportDialog(true)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Dispatch Reports
            </Button>
            <Button onClick={() => setShowNewShipmentDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Shipment
            </Button>
          </div>
        </div>

        {/* Error Alerts */}
        {statsError && (
          <ErrorAlert error={statsError as Error} onRetry={refetchStats} />
        )}
        {shipmentsError && (
          <ErrorAlert
            error={shipmentsError as Error}
            onRetry={refetchShipments}
          />
        )}

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : stats ? (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Ready for Pickup
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.ready_for_pickup}
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
                    <Truck className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        In Transit
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.in_transit}
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
                        Delivered Today
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.delivered_today}
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
                    <XCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Failed
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.failed_deliveries}
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
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        On-Time Rate
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.on_time_rate}%
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
                    <Navigation className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Avg Time (hrs)
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.avg_delivery_time}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Empty State for Stats */}
        {!statsLoading && !stats && !statsError && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Statistics Available</AlertTitle>
            <AlertDescription>
              Unable to load delivery statistics. Please check back later.
            </AlertDescription>
          </Alert>
        )}

        {/* View Toggle & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search shipments..."
                    className="pl-10 pr-4"
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
                    <SelectItem value="READY_FOR_PICKUP">
                      Ready for Pickup
                    </SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="OUT_FOR_DELIVERY">
                      Out for Delivery
                    </SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="DRIVER">Driver</SelectItem>
                    <SelectItem value="LALAMOVE">Lalamove</SelectItem>
                    <SelectItem value="GRAB">Grab</SelectItem>
                    <SelectItem value="JNT">J&T</SelectItem>
                    <SelectItem value="LBC">LBC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedView === "list" ? "default" : "outline"}
                  onClick={() => setSelectedView("list")}
                  size="sm"
                >
                  List
                </Button>
                <Button
                  variant={selectedView === "map" ? "default" : "outline"}
                  onClick={() => setSelectedView("map")}
                  size="sm"
                >
                  Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipments List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Delivery Shipments ({filteredShipments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Shipment / Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Consignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Method / Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      ETA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {shipmentsLoading
                    ? [...Array(5)].map((_, i) => (
                        <ShipmentRowSkeleton key={i} />
                      ))
                    : (filteredShipments || []).map(shipment => (
                        <tr key={shipment.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {shipment.shipment_number}
                              </div>
                              <div className="text-sm text-gray-500">
                                Order: {shipment.order?.order_number || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="flex items-center text-sm font-medium text-gray-900">
                                <User className="mr-1 h-4 w-4" />
                                {shipment.consignee.name}
                              </div>
                              <div className="mt-1 flex items-start text-sm text-gray-500">
                                <MapPin className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0" />
                                <span className="break-words">
                                  {shipment.consignee.address}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <Phone className="mr-1 h-4 w-4" />
                                {shipment.consignee.phone}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="space-y-2">
                              {getMethodBadge(shipment.method)}
                              {shipment.driver && (
                                <div className="text-sm text-gray-600">
                                  {shipment.driver.name ||
                                    `${shipment.driver.first_name || ""} ${shipment.driver.last_name || ""}`.trim() ||
                                    "N/A"}
                                  {shipment.vehicle && (
                                    <div className="text-xs text-gray-500">
                                      {shipment.vehicle.plate_no} (
                                      {shipment.vehicle.type})
                                    </div>
                                  )}
                                </div>
                              )}
                              {shipment.courier_service && !shipment.driver && (
                                <div className="text-sm text-gray-600">
                                  {shipment.courier_service}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {getStatusBadge(shipment.status)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {shipment.cartons_count} cartons
                            </div>
                            <div className="text-sm text-gray-500">
                              {shipment.total_weight} kg
                            </div>
                            {shipment.cod_amount && (
                              <div className="text-sm font-medium text-green-600">
                                COD: ₱{shipment.cod_amount.toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(shipment.eta).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(shipment.eta).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {shipment.status !== "DELIVERED" &&
                                shipment.status !== "CANCELLED" && (
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              {shipment.method === "DRIVER" &&
                                shipment.status === "IN_TRANSIT" && (
                                  <Button size="sm" variant="outline">
                                    <MapPin className="h-4 w-4" />
                                  </Button>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {!shipmentsLoading && filteredShipments.length === 0 && (
              <div className="py-12 text-center">
                <Truck className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No shipments found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search criteria."
                    : "Get started by creating a new shipment."}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Shipment Dialog */}
        <Dialog
          open={showNewShipmentDialog}
          onOpenChange={setShowNewShipmentDialog}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Shipment</DialogTitle>
              <DialogDescription>
                Fill in the shipment details to create a new delivery.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Order Number</Label>
                  <Input id="order" placeholder="Select order..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Delivery Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRIVER">Own Driver</SelectItem>
                      <SelectItem value="LALAMOVE">Lalamove</SelectItem>
                      <SelectItem value="GRAB">Grab</SelectItem>
                      <SelectItem value="JNT">J&T Express</SelectItem>
                      <SelectItem value="LBC">LBC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consignee-name">Consignee Name</Label>
                <Input id="consignee-name" placeholder="Recipient name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consignee-address">Delivery Address</Label>
                <Textarea
                  id="consignee-address"
                  placeholder="Complete delivery address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consignee-phone">Contact Number</Label>
                  <Input id="consignee-phone" placeholder="09XX XXX XXXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cod-amount">COD Amount (Optional)</Label>
                  <Input id="cod-amount" type="number" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cartons">Number of Cartons</Label>
                  <Input id="cartons" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Total Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special handling or delivery instructions"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewShipmentDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement create shipment API call
                  alert("Shipment creation will be implemented soon!");
                  setShowNewShipmentDialog(false);
                }}
              >
                Create Shipment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispatch Reports Dialog */}
        <Dialog
          open={showDispatchReportDialog}
          onOpenChange={setShowDispatchReportDialog}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Generate Dispatch Report</DialogTitle>
              <DialogDescription>
                Select report parameters to generate delivery dispatch reports.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Dispatch Report</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                    <SelectItem value="monthly">Monthly Summary</SelectItem>
                    <SelectItem value="driver">
                      By Driver Performance
                    </SelectItem>
                    <SelectItem value="method">By Delivery Method</SelectItem>
                    <SelectItem value="client">By Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Date From</Label>
                  <Input id="date-from" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Date To</Label>
                  <Input id="date-to" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Status Filter (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DELIVERED">Delivered Only</SelectItem>
                    <SelectItem value="FAILED">Failed Only</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel (XLSX)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDispatchReportDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement report generation API call
                  alert("Report generation will be implemented soon!");
                  setShowDispatchReportDialog(false);
                }}
              >
                <Printer className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

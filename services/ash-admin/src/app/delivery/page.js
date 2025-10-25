"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DeliveryPage;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const lucide_react_1 = require("lucide-react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const skeleton_1 = require("@/components/ui/skeleton");
const alert_1 = require("@/components/ui/alert");
const dialog_1 = require("@/components/ui/dialog");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
function DeliveryPage() {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
    const [filterStatus, setFilterStatus] = (0, react_1.useState)("all");
    const [filterMethod, setFilterMethod] = (0, react_1.useState)("all");
    const [selectedView, setSelectedView] = (0, react_1.useState)("list");
    const [showNewShipmentDialog, setShowNewShipmentDialog] = (0, react_1.useState)(false);
    const [showDispatchReportDialog, setShowDispatchReportDialog] = (0, react_1.useState)(false);
    // Fetch delivery stats
    const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats, isFetching: statsFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["delivery-stats"],
        queryFn: async () => {
            const response = await fetch("/api/delivery/stats");
            if (!response.ok)
                throw new Error("Failed to fetch delivery stats");
            return response.json();
        },
        staleTime: 30000,
        refetchInterval: 60000,
    });
    // Fetch shipments with filters
    const { data: shipments = [], isLoading: shipmentsLoading, error: shipmentsError, refetch: refetchShipments, isFetching: shipmentsFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["delivery-shipments", filterStatus, filterMethod],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: "1",
                limit: "50",
            });
            if (filterStatus !== "all")
                params.append("status", filterStatus);
            if (filterMethod !== "all")
                params.append("method", filterMethod);
            const response = await fetch(`/api/delivery/shipments?${params}`);
            if (!response.ok)
                throw new Error("Failed to fetch shipments");
            const data = await response.json();
            return data.shipments;
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
    const getStatusBadge = (status) => {
        switch (status) {
            case "READY_FOR_PICKUP":
                return (<badge_1.Badge className="bg-blue-100 text-blue-800">Ready for Pickup</badge_1.Badge>);
            case "IN_TRANSIT":
                return (<badge_1.Badge className="bg-yellow-100 text-yellow-800">In Transit</badge_1.Badge>);
            case "OUT_FOR_DELIVERY":
                return (<badge_1.Badge className="bg-orange-100 text-orange-800">
            Out for Delivery
          </badge_1.Badge>);
            case "DELIVERED":
                return <badge_1.Badge className="bg-green-100 text-green-800">Delivered</badge_1.Badge>;
            case "FAILED":
                return <badge_1.Badge className="bg-red-100 text-red-800">Failed</badge_1.Badge>;
            case "CANCELLED":
                return <badge_1.Badge className="bg-gray-100 text-gray-800">Cancelled</badge_1.Badge>;
            default:
                return <badge_1.Badge>{status}</badge_1.Badge>;
        }
    };
    const getMethodBadge = (method) => {
        const colors = {
            DRIVER: "bg-purple-100 text-purple-800",
            LALAMOVE: "bg-green-100 text-green-800",
            GRAB: "bg-blue-100 text-blue-800",
            JNT: "bg-red-100 text-red-800",
            LBC: "bg-yellow-100 text-yellow-800",
        };
        return (<badge_1.Badge className={colors[method] || "bg-gray-100 text-gray-800"}>
        {method}
      </badge_1.Badge>);
    };
    const filteredShipments = shipments.filter(shipment => searchTerm === "" ||
        shipment.shipment_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
        shipment.order?.order_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
        shipment.consignee.name.toLowerCase().includes(searchTerm.toLowerCase()));
    // Error Alert Component
    const ErrorAlert = ({ error, onRetry, }) => (<alert_1.Alert className="mb-6 border-red-200 bg-red-50">
      <lucide_react_1.AlertCircle className="h-4 w-4 text-red-600"/>
      <alert_1.AlertTitle className="text-red-800">Error</alert_1.AlertTitle>
      <alert_1.AlertDescription className="text-red-700">
        {error.message}
        <button_1.Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
          <lucide_react_1.RefreshCw className="mr-2 h-4 w-4"/>
          Retry
        </button_1.Button>
      </alert_1.AlertDescription>
    </alert_1.Alert>);
    // Skeleton Loaders
    const StatCardSkeleton = () => (<card_1.Card>
      <card_1.CardContent className="p-6">
        <div className="flex items-center">
          <skeleton_1.Skeleton className="h-6 w-6 rounded"/>
          <div className="ml-5 w-0 flex-1">
            <skeleton_1.Skeleton className="mb-2 h-4 w-24"/>
            <skeleton_1.Skeleton className="h-6 w-12"/>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
    const ShipmentRowSkeleton = () => (<tr>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-10 w-32"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-16 w-48"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-12 w-24"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-6 w-20"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-12 w-24"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-10 w-20"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-8 w-24"/>
      </td>
    </tr>);
    return (<dashboard_layout_1.default>
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
            <button_1.Button variant="outline" onClick={handleRefreshAll} disabled={isFetching}>
              <lucide_react_1.RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}/>
              Refresh
            </button_1.Button>
            <button_1.Button variant="outline" onClick={() => setShowDispatchReportDialog(true)}>
              <lucide_react_1.Printer className="mr-2 h-4 w-4"/>
              Dispatch Reports
            </button_1.Button>
            <button_1.Button onClick={() => setShowNewShipmentDialog(true)}>
              <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
              New Shipment
            </button_1.Button>
          </div>
        </div>

        {/* Error Alerts */}
        {statsError && (<ErrorAlert error={statsError} onRetry={refetchStats}/>)}
        {shipmentsError && (<ErrorAlert error={shipmentsError} onRetry={refetchShipments}/>)}

        {/* Stats Cards */}
        {statsLoading ? (<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (<StatCardSkeleton key={i}/>))}
          </div>) : stats ? (<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.Package className="h-6 w-6 text-blue-400"/>
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
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.Truck className="h-6 w-6 text-yellow-400"/>
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
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.CheckCircle className="h-6 w-6 text-green-400"/>
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
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.XCircle className="h-6 w-6 text-red-400"/>
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
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.Clock className="h-6 w-6 text-orange-400"/>
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
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.Navigation className="h-6 w-6 text-purple-400"/>
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
              </card_1.CardContent>
            </card_1.Card>
          </div>) : null}

        {/* Empty State for Stats */}
        {!statsLoading && !stats && !statsError && (<alert_1.Alert className="mb-6">
            <lucide_react_1.AlertCircle className="h-4 w-4"/>
            <alert_1.AlertTitle>No Statistics Available</alert_1.AlertTitle>
            <alert_1.AlertDescription>
              Unable to load delivery statistics. Please check back later.
            </alert_1.AlertDescription>
          </alert_1.Alert>)}

        {/* View Toggle & Filters */}
        <card_1.Card className="mb-6">
          <card_1.CardContent className="p-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                <div className="relative">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500"/>
                  <input_1.Input type="text" placeholder="Search shipments..." className="pl-10 pr-4" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                </div>

                <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
                  <select_1.SelectTrigger className="w-48">
                    <select_1.SelectValue placeholder="Filter by status"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">All Status</select_1.SelectItem>
                    <select_1.SelectItem value="READY_FOR_PICKUP">
                      Ready for Pickup
                    </select_1.SelectItem>
                    <select_1.SelectItem value="IN_TRANSIT">In Transit</select_1.SelectItem>
                    <select_1.SelectItem value="OUT_FOR_DELIVERY">
                      Out for Delivery
                    </select_1.SelectItem>
                    <select_1.SelectItem value="DELIVERED">Delivered</select_1.SelectItem>
                    <select_1.SelectItem value="FAILED">Failed</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>

                <select_1.Select value={filterMethod} onValueChange={setFilterMethod}>
                  <select_1.SelectTrigger className="w-32">
                    <select_1.SelectValue placeholder="Method"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">All Methods</select_1.SelectItem>
                    <select_1.SelectItem value="DRIVER">Driver</select_1.SelectItem>
                    <select_1.SelectItem value="LALAMOVE">Lalamove</select_1.SelectItem>
                    <select_1.SelectItem value="GRAB">Grab</select_1.SelectItem>
                    <select_1.SelectItem value="JNT">J&T</select_1.SelectItem>
                    <select_1.SelectItem value="LBC">LBC</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="flex items-center space-x-2">
                <button_1.Button variant={selectedView === "list" ? "default" : "outline"} onClick={() => setSelectedView("list")} size="sm">
                  List
                </button_1.Button>
                <button_1.Button variant={selectedView === "map" ? "default" : "outline"} onClick={() => setSelectedView("map")} size="sm">
                  Map
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Shipments List */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>
              Delivery Shipments ({filteredShipments.length})
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
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
            ? [...Array(5)].map((_, i) => (<ShipmentRowSkeleton key={i}/>))
            : (filteredShipments || []).map(shipment => (<tr key={shipment.id} className="hover:bg-gray-50">
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
                                <lucide_react_1.User className="mr-1 h-4 w-4"/>
                                {shipment.consignee.name}
                              </div>
                              <div className="mt-1 flex items-start text-sm text-gray-500">
                                <lucide_react_1.MapPin className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0"/>
                                <span className="break-words">
                                  {shipment.consignee.address}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <lucide_react_1.Phone className="mr-1 h-4 w-4"/>
                                {shipment.consignee.phone}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="space-y-2">
                              {getMethodBadge(shipment.method)}
                              {shipment.driver && (<div className="text-sm text-gray-600">
                                  {shipment.driver.name ||
                        `${shipment.driver.first_name || ""} ${shipment.driver.last_name || ""}`.trim() ||
                        "N/A"}
                                  {shipment.vehicle && (<div className="text-xs text-gray-500">
                                      {shipment.vehicle.plate_no} (
                                      {shipment.vehicle.type})
                                    </div>)}
                                </div>)}
                              {shipment.courier_service && !shipment.driver && (<div className="text-sm text-gray-600">
                                  {shipment.courier_service}
                                </div>)}
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
                            {shipment.cod_amount && (<div className="text-sm font-medium text-green-600">
                                COD: ₱{shipment.cod_amount.toLocaleString()}
                              </div>)}
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
                              <button_1.Button size="sm" variant="outline">
                                <lucide_react_1.Eye className="h-4 w-4"/>
                              </button_1.Button>
                              {shipment.status !== "DELIVERED" &&
                    shipment.status !== "CANCELLED" && (<button_1.Button size="sm" variant="outline">
                                    <lucide_react_1.Edit className="h-4 w-4"/>
                                  </button_1.Button>)}
                              {shipment.method === "DRIVER" &&
                    shipment.status === "IN_TRANSIT" && (<button_1.Button size="sm" variant="outline">
                                    <lucide_react_1.MapPin className="h-4 w-4"/>
                                  </button_1.Button>)}
                            </div>
                          </td>
                        </tr>))}
                </tbody>
              </table>
            </div>

            {!shipmentsLoading && filteredShipments.length === 0 && (<div className="py-12 text-center">
                <lucide_react_1.Truck className="mx-auto h-12 w-12 text-gray-500"/>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No shipments found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                ? "Try adjusting your search criteria."
                : "Get started by creating a new shipment."}
                </p>
                {searchTerm && (<button_1.Button variant="outline" size="sm" className="mt-4" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </button_1.Button>)}
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* New Shipment Dialog */}
        <dialog_1.Dialog open={showNewShipmentDialog} onOpenChange={setShowNewShipmentDialog}>
          <dialog_1.DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Create New Shipment</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Fill in the shipment details to create a new delivery.
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="order">Order Number</label_1.Label>
                  <input_1.Input id="order" placeholder="Select order..."/>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="method">Delivery Method</label_1.Label>
                  <select_1.Select>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Select method"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="DRIVER">Own Driver</select_1.SelectItem>
                      <select_1.SelectItem value="LALAMOVE">Lalamove</select_1.SelectItem>
                      <select_1.SelectItem value="GRAB">Grab</select_1.SelectItem>
                      <select_1.SelectItem value="JNT">J&T Express</select_1.SelectItem>
                      <select_1.SelectItem value="LBC">LBC</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="consignee-name">Consignee Name</label_1.Label>
                <input_1.Input id="consignee-name" placeholder="Recipient name"/>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="consignee-address">Delivery Address</label_1.Label>
                <textarea_1.Textarea id="consignee-address" placeholder="Complete delivery address" rows={3}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="consignee-phone">Contact Number</label_1.Label>
                  <input_1.Input id="consignee-phone" placeholder="09XX XXX XXXX"/>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="cod-amount">COD Amount (Optional)</label_1.Label>
                  <input_1.Input id="cod-amount" type="number" placeholder="0.00"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="cartons">Number of Cartons</label_1.Label>
                  <input_1.Input id="cartons" type="number" placeholder="0"/>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="weight">Total Weight (kg)</label_1.Label>
                  <input_1.Input id="weight" type="number" step="0.1" placeholder="0.0"/>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="notes">Special Instructions (Optional)</label_1.Label>
                <textarea_1.Textarea id="notes" placeholder="Any special handling or delivery instructions" rows={2}/>
              </div>
            </div>
            <dialog_1.DialogFooter>
              <button_1.Button variant="outline" onClick={() => setShowNewShipmentDialog(false)}>
                Cancel
              </button_1.Button>
              <button_1.Button onClick={() => {
            // TODO: Implement create shipment API call
            alert("Shipment creation will be implemented soon!");
            setShowNewShipmentDialog(false);
        }}>
                Create Shipment
              </button_1.Button>
            </dialog_1.DialogFooter>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>

        {/* Dispatch Reports Dialog */}
        <dialog_1.Dialog open={showDispatchReportDialog} onOpenChange={setShowDispatchReportDialog}>
          <dialog_1.DialogContent className="max-w-xl">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Generate Dispatch Report</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Select report parameters to generate delivery dispatch reports.
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="report-type">Report Type</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select report type"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="daily">Daily Dispatch Report</select_1.SelectItem>
                    <select_1.SelectItem value="weekly">Weekly Summary</select_1.SelectItem>
                    <select_1.SelectItem value="monthly">Monthly Summary</select_1.SelectItem>
                    <select_1.SelectItem value="driver">
                      By Driver Performance
                    </select_1.SelectItem>
                    <select_1.SelectItem value="method">By Delivery Method</select_1.SelectItem>
                    <select_1.SelectItem value="client">By Client</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="date-from">Date From</label_1.Label>
                  <input_1.Input id="date-from" type="date"/>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="date-to">Date To</label_1.Label>
                  <input_1.Input id="date-to" type="date"/>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="status-filter">Status Filter (Optional)</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="All statuses"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">All Statuses</select_1.SelectItem>
                    <select_1.SelectItem value="DELIVERED">Delivered Only</select_1.SelectItem>
                    <select_1.SelectItem value="FAILED">Failed Only</select_1.SelectItem>
                    <select_1.SelectItem value="IN_TRANSIT">In Transit</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="format">Export Format</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select format"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="pdf">PDF</select_1.SelectItem>
                    <select_1.SelectItem value="excel">Excel (XLSX)</select_1.SelectItem>
                    <select_1.SelectItem value="csv">CSV</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>
            <dialog_1.DialogFooter>
              <button_1.Button variant="outline" onClick={() => setShowDispatchReportDialog(false)}>
                Cancel
              </button_1.Button>
              <button_1.Button onClick={() => {
            // TODO: Implement report generation API call
            alert("Report generation will be implemented soon!");
            setShowDispatchReportDialog(false);
        }}>
                <lucide_react_1.Printer className="mr-2 h-4 w-4"/>
                Generate Report
              </button_1.Button>
            </dialog_1.DialogFooter>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>
    </dashboard_layout_1.default>);
}

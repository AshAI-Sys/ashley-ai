"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OrdersPage;
const react_1 = __importStar(require("react"));
const react_query_1 = require("@tanstack/react-query");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const loading_skeletons_1 = require("@/components/ui/loading-skeletons");
const empty_state_1 = require("@/components/ui/empty-state");
const error_alert_1 = require("@/components/ui/error-alert");
const useDebounce_1 = require("@/hooks/useDebounce");
const export_1 = require("@/lib/export");
const api_1 = require("@/lib/api");
function OrdersPage() {
    const [search, setSearch] = (0, react_1.useState)("");
    const [statusFilter, setStatusFilter] = (0, react_1.useState)("all");
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    // Debounce search to reduce API calls
    const debouncedSearch = (0, useDebounce_1.useDebounce)(search, 500);
    // React Query for data fetching with auto-refresh
    const { data, isLoading, isError, error, refetch, isFetching } = (0, react_query_1.useQuery)({
        queryKey: ["orders", debouncedSearch, statusFilter, currentPage],
        queryFn: async () => {
            const result = await api_1.api.getOrders({
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
    const getStatusColor = (status) => {
        if (!status)
            return "bg-gray-100 text-gray-800";
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
    return (<dashboard_layout_1.default>
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
            <button_1.Button variant="outline" onClick={() => (0, export_1.exportOrders)(orders, "excel")} disabled={orders.length === 0} className="flex-1 gap-2 sm:flex-none" size="sm">
              <lucide_react_1.Download className="h-4 w-4"/>
              <span className="hidden sm:inline">Export</span>
            </button_1.Button>
            <button_1.Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="flex-1 gap-2 sm:flex-none" size="sm">
              <lucide_react_1.RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}/>
              <span className="hidden sm:inline">
                {isFetching ? "Refreshing..." : "Refresh"}
              </span>
            </button_1.Button>
            <link_1.default href="/orders/new" className="flex-1 sm:flex-none">
              <button_1.Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                New Order
              </button_1.Button>
            </link_1.default>
          </div>
        </div>

        {/* Filters - Responsive */}
        <card_1.Card className="mb-6">
          <card_1.CardContent className="py-4">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                  <input_1.Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="h-10 pl-9"/>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <lucide_react_1.Filter className="h-4 w-4 text-muted-foreground"/>
                <select value={statusFilter} onChange={e => {
            setStatusFilter(e.target.value);
            setCurrentPage(1); // Reset to first page on filter change
        }} className="h-10 min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm sm:flex-none">
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
              </div>
            </div>

            {totalCount > 0 && (<div className="mt-2 text-sm text-muted-foreground">
                Showing {orders.length} of {totalCount} orders
                {search && ` • Searching for "${search}"`}
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Error State */}
        {isError && (<error_alert_1.ErrorAlert message={error?.message || "Failed to load orders. Please try again."} retry={() => refetch()}/>)}

        {/* Orders List */}
        {isLoading ? (<loading_skeletons_1.DataTableSkeleton rows={10}/>) : (<div className="grid gap-4">
            {orders.map(order => (<card_1.Card key={order.id} className="transition-shadow hover:shadow-md">
                <card_1.CardContent className="py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Header */}
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <h3 className="truncate text-lg font-semibold">
                          {order?.order_number || "Unknown Order"}
                        </h3>
                        <badge_1.Badge className={getStatusColor(order?.status)}>
                          {order?.status
                    ? order.status.replace("_", " ").toUpperCase()
                    : "UNKNOWN"}
                        </badge_1.Badge>
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
                            {order?.delivery_date
                    ? new Date(order.delivery_date).toLocaleDateString()
                    : "TBD"}
                          </span>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <lucide_react_1.Package className="h-3 w-3"/>
                          {order?._count?.line_items || 0} items
                        </span>
                        <span>{order?._count?.design_assets || 0} designs</span>
                        <span>{order?._count?.bundles || 0} bundles</span>
                        <span className="hidden sm:inline">
                          Created{" "}
                          {order?.created_at
                    ? new Date(order.created_at).toLocaleDateString()
                    : "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 gap-2 sm:flex-col">
                      <link_1.default href={`/orders/${order?.id || ""}`} className="flex-1 sm:flex-none">
                        <button_1.Button variant="outline" size="sm" className="h-9 w-full px-3">
                          <lucide_react_1.Eye className="h-4 w-4 sm:mr-1"/>
                          <span className="hidden sm:inline">View</span>
                        </button_1.Button>
                      </link_1.default>
                      <link_1.default href={`/orders/${order?.id || ""}/edit`} className="flex-1 sm:flex-none">
                        <button_1.Button variant="outline" size="sm" className="h-9 w-full px-3">
                          <lucide_react_1.Edit className="h-4 w-4 sm:mr-1"/>
                          <span className="hidden sm:inline">Edit</span>
                        </button_1.Button>
                      </link_1.default>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>))}

            {orders.length === 0 && !isLoading && !isError && (<empty_state_1.EmptyState icon={lucide_react_1.Package} title="No orders found" description={search
                    ? `No orders match "${search}"`
                    : "Get started by creating your first production order"} action={{
                    label: "Create Order",
                    href: "/orders/new",
                }}/>)}
          </div>)}

        {/* Pagination */}
        {totalPages > 1 && (<div className="mt-6 flex items-center justify-center gap-2">
            <button_1.Button variant="outline" size="sm" disabled={currentPage === 1 || isFetching} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
              Previous
            </button_1.Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <button_1.Button variant="outline" size="sm" disabled={currentPage === totalPages || isFetching} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
              Next
            </button_1.Button>
          </div>)}
      </div>
    </dashboard_layout_1.default>);
}

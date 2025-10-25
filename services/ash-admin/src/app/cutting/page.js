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
exports.default = CuttingPage;
const react_1 = __importStar(require("react"));
const react_query_1 = require("@tanstack/react-query");
const navigation_1 = require("next/navigation");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const tabs_1 = require("@/components/ui/tabs");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const skeleton_1 = require("@/components/ui/skeleton");
const empty_state_1 = require("@/components/ui/empty-state");
const error_alert_1 = require("@/components/ui/error-alert");
const lucide_react_1 = require("lucide-react");
const useDebounce_1 = require("@/hooks/useDebounce");
function CuttingPage() {
    const router = (0, navigation_1.useRouter)();
    const [activeTab, setActiveTab] = (0, react_1.useState)("lays");
    const [statusFilter, setStatusFilter] = (0, react_1.useState)("all");
    const [search, setSearch] = (0, react_1.useState)("");
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    const debouncedSearch = (0, useDebounce_1.useDebounce)(search, 500);
    // Fetch cut lays
    const { data: laysData, isLoading: laysLoading, error: laysError, refetch: refetchLays, isFetching: laysFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["cutting-lays", statusFilter, currentPage],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "20",
            });
            if (statusFilter !== "all")
                params.append("status", statusFilter);
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
    const { data: bundlesData, isLoading: bundlesLoading, error: bundlesError, refetch: refetchBundles, isFetching: bundlesFetching, } = (0, react_query_1.useQuery)({
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
    const getStatusBadge = (status) => {
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
        const config = statusConfig[status] || {
            color: "bg-gray-100 text-gray-800",
            label: status,
        };
        return <badge_1.Badge className={config.color}>{config.label}</badge_1.Badge>;
    };
    return (<dashboard_layout_1.default>
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
            <button_1.Button variant="outline" onClick={handleRefreshAll} disabled={laysFetching || bundlesFetching}>
              <lucide_react_1.RefreshCw className={`mr-2 h-4 w-4 ${laysFetching || bundlesFetching ? "animate-spin" : ""}`}/>
              Refresh
            </button_1.Button>
            <button_1.Button onClick={() => router.push("/cutting/create-lay")}>
              <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
              New Lay
            </button_1.Button>
            <button_1.Button variant="outline" onClick={() => router.push("/cutting/scan-bundle")}>
              <lucide_react_1.QrCode className="mr-2 h-4 w-4"/>
              Scan Bundle
            </button_1.Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {laysLoading || bundlesLoading ? (<>
              {[...Array(4)].map((_, i) => (<card_1.Card key={i}>
                  <card_1.CardContent className="p-6">
                    <div className="flex items-center">
                      <skeleton_1.Skeleton className="h-8 w-8 rounded"/>
                      <div className="ml-4 space-y-2">
                        <skeleton_1.Skeleton className="h-4 w-24"/>
                        <skeleton_1.Skeleton className="h-8 w-12"/>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>))}
            </>) : (<>
              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <div className="flex items-center">
                    <lucide_react_1.Scissors className="h-8 w-8 text-blue-600"/>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Lays
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalLays}
                      </p>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <div className="flex items-center">
                    <lucide_react_1.Package className="h-8 w-8 text-green-600"/>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Bundles
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalBundles}
                      </p>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <div className="flex items-center">
                    <lucide_react_1.BarChart3 className="h-8 w-8 text-purple-600"/>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Cutting Efficiency
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {cutLays.length > 0
                ? ((cutLays.reduce((sum, lay) => sum + lay.netUsed / lay.grossUsed, 0) /
                    cutLays.length) *
                    100).toFixed(1)
                : "0"}
                        %
                      </p>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <div className="flex items-center">
                    <lucide_react_1.QrCode className="h-8 w-8 text-orange-600"/>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Created Bundles
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {bundles.filter(b => b.status === "CREATED").length}
                      </p>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </>)}
        </div>

        {/* Main Content */}
        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="lays">Cut Lays</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="bundles">Bundles</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="efficiency">Efficiency</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="lays" className="space-y-4">
            {laysError && (<error_alert_1.ErrorAlert title="Failed to load cut lays" message={laysError.message} retry={refetchLays}/>)}

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Cut Lays Management</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                {/* Filters */}
                <div className="mb-6 flex gap-4">
                  <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                    <select_1.SelectTrigger className="w-48">
                      <select_1.SelectValue placeholder="Filter by status"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">All statuses</select_1.SelectItem>
                      <select_1.SelectItem value="PLANNED">Planned</select_1.SelectItem>
                      <select_1.SelectItem value="IN_PROGRESS">In Progress</select_1.SelectItem>
                      <select_1.SelectItem value="COMPLETED">Completed</select_1.SelectItem>
                      <select_1.SelectItem value="ON_HOLD">On Hold</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                {/* Cut Lays Table */}
                {laysLoading ? (<div className="space-y-4">
                    {[...Array(3)].map((_, i) => (<div key={i} className="rounded-lg border p-4">
                        <div className="flex justify-between">
                          <div className="flex-1 space-y-2">
                            <skeleton_1.Skeleton className="h-5 w-32"/>
                            <skeleton_1.Skeleton className="h-4 w-48"/>
                            <skeleton_1.Skeleton className="h-4 w-64"/>
                          </div>
                          <skeleton_1.Skeleton className="h-8 w-24"/>
                        </div>
                      </div>))}
                  </div>) : cutLays.length === 0 ? (<empty_state_1.EmptyState icon={lucide_react_1.Scissors} title="No cut lays found" description={statusFilter !== "all"
                ? `No lays with status "${statusFilter}"`
                : "No cut lays in the system yet"} action={{
                label: "Create Lay",
                onClick: () => router.push("/cutting/create-lay"),
            }}/>) : (<div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
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
                        {cutLays.map(lay => {
                const totalPieces = lay?.outputs?.reduce((sum, output) => sum + output.qty, 0) || 0;
                const efficiency = lay?.grossUsed > 0
                    ? ((lay.netUsed / lay.grossUsed) * 100).toFixed(1)
                    : "0.0";
                return (<tr key={lay.id} className="hover:bg-gray-50">
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
                                  <button_1.Button size="sm" variant="outline">
                                    <lucide_react_1.Eye className="h-4 w-4"/>
                                  </button_1.Button>
                                  <button_1.Button size="sm" variant="outline">
                                    <lucide_react_1.Edit className="h-4 w-4"/>
                                  </button_1.Button>
                                  <button_1.Button size="sm" variant="outline">
                                    <lucide_react_1.QrCode className="h-4 w-4"/>
                                  </button_1.Button>
                                </div>
                              </td>
                            </tr>);
            })}
                      </tbody>
                    </table>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="bundles" className="space-y-4">
            {bundlesError && (<error_alert_1.ErrorAlert title="Failed to load bundles" message={bundlesError.message} retry={refetchBundles}/>)}

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Bundle Management</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                {/* Bundles Table */}
                {bundlesLoading ? (<div className="space-y-4">
                    {[...Array(3)].map((_, i) => (<div key={i} className="rounded-lg border p-4">
                        <div className="flex justify-between">
                          <div className="flex-1 space-y-2">
                            <skeleton_1.Skeleton className="h-5 w-40"/>
                            <skeleton_1.Skeleton className="h-4 w-32"/>
                            <skeleton_1.Skeleton className="h-4 w-24"/>
                          </div>
                          <skeleton_1.Skeleton className="h-8 w-24"/>
                        </div>
                      </div>))}
                  </div>) : bundles.length === 0 ? (<empty_state_1.EmptyState icon={lucide_react_1.Package} title="No bundles found" description="No bundles have been generated yet" action={{
                label: "Create Lay First",
                onClick: () => router.push("/cutting/create-lay"),
            }}/>) : (<div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
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
                        {bundles.map(bundle => (<tr key={bundle.id} className="hover:bg-gray-50">
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
                                <button_1.Button size="sm" variant="outline">
                                  <lucide_react_1.QrCode className="h-4 w-4"/>
                                </button_1.Button>
                                <button_1.Button size="sm" variant="outline">
                                  <lucide_react_1.Eye className="h-4 w-4"/>
                                </button_1.Button>
                              </div>
                            </td>
                          </tr>))}
                      </tbody>
                    </table>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="efficiency" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Cutting Efficiency Analytics</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="py-12 text-center">
                  <lucide_react_1.BarChart3 className="mx-auto h-12 w-12 text-gray-500"/>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Efficiency Analytics
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cutting efficiency charts and analytics will be displayed
                    here.
                  </p>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </dashboard_layout_1.default>);
}

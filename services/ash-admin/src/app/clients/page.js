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
exports.default = ClientsPage;
const react_1 = __importStar(require("react"));
const react_query_1 = require("@tanstack/react-query");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const api_1 = require("@/lib/api");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const skeleton_1 = require("@/components/ui/skeleton");
const empty_state_1 = require("@/components/ui/empty-state");
const error_alert_1 = require("@/components/ui/error-alert");
const useDebounce_1 = require("@/hooks/useDebounce");
const hydration_safe_icon_1 = __importDefault(require("@/components/hydration-safe-icon"));
function ClientsPage() {
    const [search, setSearch] = (0, react_1.useState)("");
    const [statusFilter, setStatusFilter] = (0, react_1.useState)("all");
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    // Debounce search to reduce API calls
    const debouncedSearch = (0, useDebounce_1.useDebounce)(search, 500);
    // React Query for data fetching with auto-refresh
    const { data, isLoading, isError, error, refetch, isFetching } = (0, react_query_1.useQuery)({
        queryKey: ["clients", debouncedSearch, statusFilter, currentPage],
        queryFn: async () => {
            const params = {
                page: currentPage,
                limit: 20,
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(statusFilter !== "all" && { is_active: statusFilter === "active" }),
            };
            const response = await api_1.api.getClients(params);
            if (!response.success) {
                throw new Error(response.error || "Failed to fetch clients");
            }
            return response.data;
        },
        staleTime: 30000, // Data considered fresh for 30 seconds
        refetchInterval: 60000, // Auto-refresh every 60 seconds
        refetchOnWindowFocus: true, // Refresh when user returns to tab
    });
    const clients = data?.clients || [];
    const totalPages = data?.pagination?.pages || 1;
    const totalCount = data?.pagination?.total || 0;
    const formatAddress = (address) => {
        if (!address)
            return "No address";
        try {
            const parsed = JSON.parse(address);
            return (`${parsed.street || ""} ${parsed.city || ""} ${parsed.state || ""}`.trim() ||
                "Address incomplete");
        }
        catch {
            return address;
        }
    };
    const _formatCurrency = (amount) => {
        if (amount === null || amount === undefined)
            return "No limit";
        return `₱${amount.toLocaleString()}`;
    };
    return (<dashboard_layout_1.default>
      <div className="container mx-auto py-6 min-h-screen bg-white">
        {/* Page Header - Responsive */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Clients</h1>
            <p className="text-sm text-gray-600 lg:text-base">
              Manage your clients and their information
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button_1.Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="flex-1 gap-2 sm:flex-none" size="sm">
              <hydration_safe_icon_1.default Icon={lucide_react_1.RefreshCw} className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}/>
              <span className="hidden sm:inline">
                {isFetching ? "Refreshing..." : "Refresh"}
              </span>
            </button_1.Button>
          </div>
        </div>

        {/* Filters - Responsive */}
        <card_1.Card className="mb-6">
          <card_1.CardContent className="py-4">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                  <input_1.Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="h-10 pl-9"/>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <lucide_react_1.Filter className="h-4 w-4 text-muted-foreground"/>
                <select value={statusFilter} onChange={e => {
            setStatusFilter(e.target.value);
            setCurrentPage(1); // Reset to first page on filter change
        }} className="h-10 min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm sm:flex-none">
                  <option value="all">All Clients</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {totalCount > 0 && (<div className="mt-2 text-sm text-muted-foreground">
                Showing {clients.length} of {totalCount} clients
                {search && ` • Searching for "${search}"`}
              </div>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Error State */}
        {isError && (<error_alert_1.ErrorAlert message={error?.message || "Failed to load clients. Please try again."} retry={() => refetch()}/>)}

        {/* Loading State */}
        {isLoading ? (<skeleton_1.SkeletonTable />) : (<div className="grid gap-4">
            {clients.map(client => (<card_1.Card key={client.id} className="transition-shadow hover:shadow-md">
                <card_1.CardContent className="py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Header */}
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-2">
                          <lucide_react_1.Building2 className="h-5 w-5 flex-shrink-0 text-blue-600"/>
                          <h3 className="truncate text-lg font-semibold">
                            {client.name}
                          </h3>
                        </div>
                        <badge_1.Badge className={client.is_active
                    ? "w-fit bg-green-100 text-green-800"
                    : "w-fit bg-red-100 text-red-800"}>
                          {client.is_active ? "Active" : "Inactive"}
                        </badge_1.Badge>
                      </div>

                      {/* Contact Info Grid - Optimized for mobile */}
                      <div className="xs:grid-cols-2 mb-3 grid grid-cols-1 gap-3 text-sm text-muted-foreground lg:grid-cols-3">
                        {client.contact_person && (<div className="flex items-center gap-2">
                            <lucide_react_1.Users className="h-4 w-4 flex-shrink-0"/>
                            <span className="truncate">
                              {client.contact_person}
                            </span>
                          </div>)}
                        {client.email && (<div className="flex items-center gap-2">
                            <lucide_react_1.Mail className="h-4 w-4 flex-shrink-0"/>
                            <span className="truncate">{client.email}</span>
                          </div>)}
                        {client.phone && (<div className="flex items-center gap-2">
                            <lucide_react_1.Phone className="h-4 w-4 flex-shrink-0"/>
                            <span className="truncate">{client.phone}</span>
                          </div>)}
                        <div className="flex items-center gap-2">
                          <lucide_react_1.MapPin className="h-4 w-4 flex-shrink-0"/>
                          <span className="truncate">
                            {formatAddress(client.address)}
                          </span>
                        </div>
                      </div>

                      {/* Stats - Compact for mobile */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Orders:{" "}
                          </span>
                          <span className="font-semibold">
                            {client._count.orders}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Brands:{" "}
                          </span>
                          <span className="font-semibold">
                            {client._count.brands}
                          </span>
                        </div>
                      </div>

                      {/* Timestamps - Hidden on mobile */}
                      <div className="mt-3 hidden gap-4 text-xs text-muted-foreground sm:flex">
                        <span>
                          Created{" "}
                          {new Date(client.created_at).toLocaleDateString()}
                        </span>
                        <span>
                          Updated{" "}
                          {new Date(client.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 gap-2 sm:flex-col">
                      <link_1.default href={`/clients/${client.id}`} className="flex-1 sm:flex-none">
                        <button_1.Button variant="outline" size="sm" className="h-9 w-full px-3">
                          <lucide_react_1.Eye className="h-4 w-4 sm:mr-1"/>
                          <span className="hidden sm:inline">View</span>
                        </button_1.Button>
                      </link_1.default>
                      <link_1.default href={`/clients/${client.id}/edit`} className="flex-1 sm:flex-none">
                        <button_1.Button variant="outline" size="sm" className="h-9 w-full px-3">
                          <lucide_react_1.Edit className="h-4 w-4 sm:mr-1"/>
                          <span className="hidden sm:inline">Edit</span>
                        </button_1.Button>
                      </link_1.default>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>))}

            {clients.length === 0 && !isLoading && !isError && (<empty_state_1.EmptyState icon={lucide_react_1.Building2} title="No clients found" description={search
                    ? `No clients match "${search}"`
                    : "Create clients from the order page"}/>)}
          </div>)}

        {/* Pagination */}
        {totalPages > 1 && (<div className="mt-6 flex items-center justify-center gap-2">
            <button_1.Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
              Previous
            </button_1.Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <button_1.Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>
              Next
            </button_1.Button>
          </div>)}
      </div>
    </dashboard_layout_1.default>);
}

"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FinishingPackingPage;
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
function FinishingPackingPage() {
    const [activeTab, setActiveTab] = (0, react_1.useState)("finishing");
    const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
    const [filterStatus, setFilterStatus] = (0, react_1.useState)("all");
    // React Query: Finishing Runs
    const { data: finishingRuns = [], isLoading: finishingRunsLoading, error: finishingRunsError, refetch: refetchFinishingRuns, isFetching: finishingRunsFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["finishing-runs"],
        queryFn: async () => {
            const response = await fetch("/api/finishing/runs");
            if (!response.ok)
                throw new Error("Failed to fetch finishing runs");
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
    const { data: cartons = [], isLoading: cartonsLoading, error: cartonsError, refetch: refetchCartons, isFetching: cartonsFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["packing-cartons"],
        queryFn: async () => {
            const response = await fetch("/api/packing/cartons");
            if (!response.ok)
                throw new Error("Failed to fetch packing cartons");
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
    const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats, isFetching: statsFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["finishing-packing-stats"],
        queryFn: async () => {
            const response = await fetch("/api/finishing-packing/stats");
            if (!response.ok)
                throw new Error("Failed to fetch stats");
            const data = await response.json();
            return data;
        },
        staleTime: 30000,
        refetchInterval: 60000,
    });
    // Combined loading and error states
    const _isLoading = activeTab === "finishing" ? finishingRunsLoading : cartonsLoading;
    const isFetching = statsFetching ||
        (activeTab === "finishing" ? finishingRunsFetching : cartonsFetching);
    const error = statsError ||
        (activeTab === "finishing" ? finishingRunsError : cartonsError);
    // Master refresh function
    const handleRefreshAll = () => {
        refetchStats();
        if (activeTab === "finishing") {
            refetchFinishingRuns();
        }
        else {
            refetchCartons();
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Pending</badge_1.Badge>;
            case "IN_PROGRESS":
                return <badge_1.Badge className="bg-blue-100 text-blue-800">In Progress</badge_1.Badge>;
            case "COMPLETED":
                return <badge_1.Badge className="bg-green-100 text-green-800">Completed</badge_1.Badge>;
            case "PACKED":
                return <badge_1.Badge className="bg-purple-100 text-purple-800">Packed</badge_1.Badge>;
            case "OPEN":
                return <badge_1.Badge className="bg-orange-100 text-orange-800">Open</badge_1.Badge>;
            case "CLOSED":
                return <badge_1.Badge className="bg-green-100 text-green-800">Closed</badge_1.Badge>;
            case "SHIPPED":
                return <badge_1.Badge className="bg-gray-100 text-gray-800">Shipped</badge_1.Badge>;
            default:
                return <badge_1.Badge>{status}</badge_1.Badge>;
        }
    };
    const filteredFinishingRuns = finishingRuns.filter(run => (searchTerm === "" ||
        run.order?.order_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
        run.bundle?.qr_code
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (filterStatus === "all" || run.status === filterStatus));
    const filteredCartons = cartons.filter(carton => (searchTerm === "" ||
        carton.order?.order_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
        carton.carton_no?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === "all" || carton.status === filterStatus));
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
    const TableRowSkeleton = () => (<tr>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-10 w-full"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-10 w-full"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-10 w-full"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-10 w-full"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-10 w-full"/>
      </td>
      <td className="px-6 py-4">
        <skeleton_1.Skeleton className="h-10 w-20"/>
      </td>
    </tr>);
    return (<dashboard_layout_1.default>
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
            <button_1.Button variant="outline" onClick={handleRefreshAll} disabled={isFetching}>
              <lucide_react_1.RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}/>
              Refresh
            </button_1.Button>
            <button_1.Button variant="outline">
              <lucide_react_1.Printer className="mr-2 h-4 w-4"/>
              Print Labels
            </button_1.Button>
            <button_1.Button>
              <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
              Start {activeTab === "finishing" ? "Finishing" : "Packing"}
            </button_1.Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (<alert_1.Alert variant="destructive" className="mb-6">
            <lucide_react_1.AlertCircle className="h-4 w-4"/>
            <alert_1.AlertDescription>
              Failed to load data.{" "}
              <button onClick={handleRefreshAll} className="ml-1 underline">
                Retry
              </button>
            </alert_1.AlertDescription>
          </alert_1.Alert>)}

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {statsLoading ? (<>
              {[...Array(5)].map((_, i) => (<StatCardSkeleton key={i}/>))}
            </>) : stats ? (<>
              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <lucide_react_1.Clock className="h-6 w-6 text-yellow-400"/>
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
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <lucide_react_1.Scissors className="h-6 w-6 text-blue-400"/>
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
                          Completed Today
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.completed_today}
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
                      <lucide_react_1.Package className="h-6 w-6 text-purple-400"/>
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
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <lucide_react_1.AlertCircle className="h-6 w-6 text-orange-400"/>
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
                </card_1.CardContent>
              </card_1.Card>
            </>) : null}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab("finishing")} className={`border-b-2 px-1 py-2 text-sm font-medium ${activeTab === "finishing"
            ? "border-blue-500 text-blue-600"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
              <lucide_react_1.Scissors className="mr-2 inline h-4 w-4"/>
              Finishing Operations
            </button>
            <button onClick={() => setActiveTab("packing")} className={`border-b-2 px-1 py-2 text-sm font-medium ${activeTab === "packing"
            ? "border-blue-500 text-blue-600"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
              <lucide_react_1.Box className="mr-2 inline h-4 w-4"/>
              Packing & Cartonization
            </button>
          </nav>
        </div>

        {/* Filters */}
        <card_1.Card className="mb-6">
          <card_1.CardContent className="p-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                <div className="relative">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500"/>
                  <input_1.Input type="text" placeholder={`Search ${activeTab}...`} className="pl-10 pr-4" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                </div>

                <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
                  <select_1.SelectTrigger className="w-48">
                    <select_1.SelectValue placeholder="Filter by status"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">All Status</select_1.SelectItem>
                    {activeTab === "finishing" ? (<>
                        <select_1.SelectItem value="PENDING">Pending</select_1.SelectItem>
                        <select_1.SelectItem value="IN_PROGRESS">In Progress</select_1.SelectItem>
                        <select_1.SelectItem value="COMPLETED">Completed</select_1.SelectItem>
                        <select_1.SelectItem value="PACKED">Packed</select_1.SelectItem>
                      </>) : (<>
                        <select_1.SelectItem value="OPEN">Open</select_1.SelectItem>
                        <select_1.SelectItem value="CLOSED">Closed</select_1.SelectItem>
                        <select_1.SelectItem value="SHIPPED">Shipped</select_1.SelectItem>
                      </>)}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Content */}
        {activeTab === "finishing" ? (<FinishingRunsTable runs={filteredFinishingRuns} getStatusBadge={getStatusBadge} isLoading={finishingRunsLoading} TableRowSkeleton={TableRowSkeleton}/>) : (<PackingCartonsTable cartons={filteredCartons} getStatusBadge={getStatusBadge} isLoading={cartonsLoading} TableRowSkeleton={TableRowSkeleton}/>)}
      </div>
    </dashboard_layout_1.default>);
}
// Separate component for Finishing Runs Table
function FinishingRunsTable({ runs, getStatusBadge, isLoading, TableRowSkeleton, }) {
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Finishing Operations</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
              {isLoading ? (<>
                  {[...Array(3)].map((_, i) => (<TableRowSkeleton key={i}/>))}
                </>) : ((Array.isArray(runs) ? runs : []).map(run => (<tr key={run.id} className="hover:bg-gray-50">
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
                          <div className="h-2 rounded-full bg-blue-600" style={{
                width: `${(run.tasks_completed / run.total_tasks) * 100}%`,
            }}></div>
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
                : []).map((material, index) => (<div key={index} className="text-xs text-gray-600">
                            {material.item_name}: {material.quantity}{" "}
                            {material.uom}
                          </div>))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button_1.Button size="sm" variant="outline">
                          <lucide_react_1.Eye className="h-4 w-4"/>
                        </button_1.Button>
                        {run.status === "COMPLETED" && (<button_1.Button size="sm" variant="outline">
                            <lucide_react_1.Package className="h-4 w-4"/>
                          </button_1.Button>)}
                      </div>
                    </td>
                  </tr>)))}
            </tbody>
          </table>
        </div>

        {!isLoading && runs.length === 0 && (<div className="py-12 text-center">
            <lucide_react_1.Scissors className="mx-auto h-12 w-12 text-gray-500"/>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No finishing operations
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new finishing run.
            </p>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
// Separate component for Packing Cartons Table
function PackingCartonsTable({ cartons, getStatusBadge, isLoading, TableRowSkeleton, }) {
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Packing & Cartonization</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Carton / Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Dimensions (L×W×H)
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
              {isLoading ? (<>
                  {[...Array(3)].map((_, i) => (<TableRowSkeleton key={i}/>))}
                </>) : ((Array.isArray(cartons) ? cartons : []).map(carton => (<tr key={carton.id} className="hover:bg-gray-50">
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
                        {carton.dimensions?.length || 0}×
                        {carton.dimensions?.width || 0}×
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
                            <div className={`h-2 rounded-full ${(carton.fill_percent || 0) >= 90
                ? "bg-green-600"
                : (carton.fill_percent || 0) >= 70
                    ? "bg-yellow-600"
                    : "bg-red-600"}`} style={{ width: `${carton.fill_percent || 0}%` }}></div>
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
                        <button_1.Button size="sm" variant="outline">
                          <lucide_react_1.Eye className="h-4 w-4"/>
                        </button_1.Button>
                        {carton.status === "OPEN" && (<button_1.Button size="sm" variant="outline">
                            <lucide_react_1.PackageCheck className="h-4 w-4"/>
                          </button_1.Button>)}
                        {carton.status === "CLOSED" && (<button_1.Button size="sm" variant="outline">
                            <lucide_react_1.Truck className="h-4 w-4"/>
                          </button_1.Button>)}
                      </div>
                    </td>
                  </tr>)))}
            </tbody>
          </table>
        </div>

        {!isLoading && cartons.length === 0 && (<div className="py-12 text-center">
            <lucide_react_1.Box className="mx-auto h-12 w-12 text-gray-500"/>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No cartons found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new carton for packing.
            </p>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}

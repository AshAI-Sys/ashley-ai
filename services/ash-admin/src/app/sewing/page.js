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
exports.default = SewingPage;
const react_1 = __importStar(require("react"));
const react_query_1 = require("@tanstack/react-query");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const skeleton_1 = require("@/components/ui/skeleton");
const alert_1 = require("@/components/ui/alert");
const statusColors = {
    CREATED: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-green-100 text-green-800 border-green-200",
    DONE: "bg-gray-100 text-gray-800 border-gray-200",
};
function SewingPage() {
    const [activeTab, setActiveTab] = (0, react_1.useState)("overview");
    const [filters, setFilters] = (0, react_1.useState)({
        status: "",
        operation: "",
        operator: "",
        search: "",
    });
    // Fetch sewing runs with filters
    const { data: sewingRuns = [], isLoading: runsLoading, error: runsError, refetch: refetchRuns, isFetching: runsFetching, } = (0, react_query_1.useQuery)({
        queryKey: [
            "sewing-runs",
            filters.status,
            filters.operation,
            filters.operator,
            filters.search,
        ],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.status && filters.status !== "all")
                params.append("status", filters.status);
            if (filters.operation && filters.operation !== "all")
                params.append("operation", filters.operation);
            if (filters.operator && filters.operator !== "all")
                params.append("operator", filters.operator);
            if (filters.search)
                params.append("search", filters.search);
            const response = await fetch(`/api/sewing/runs?${params}`);
            if (!response.ok)
                throw new Error("Failed to fetch sewing runs");
            const data = await response.json();
            return Array.isArray(data.data) ? data.data : [];
        },
        staleTime: 30000,
        refetchInterval: 60000,
    });
    // Fetch sewing operations
    const { data: operations = [], isLoading: operationsLoading, error: operationsError, refetch: refetchOperations, isFetching: operationsFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["sewing-operations"],
        queryFn: async () => {
            const response = await fetch("/api/sewing/operations");
            if (!response.ok)
                throw new Error("Failed to fetch operations");
            const data = await response.json();
            return Array.isArray(data.data) ? data.data : [];
        },
        staleTime: 60000,
        refetchInterval: 120000,
    });
    // Fetch operators (employees in sewing department)
    const { data: operators = [], isLoading: operatorsLoading, error: operatorsError, refetch: refetchOperators, isFetching: operatorsFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["sewing-operators"],
        queryFn: async () => {
            const response = await fetch("/api/employees?department=SEWING");
            if (!response.ok)
                throw new Error("Failed to fetch operators");
            const data = await response.json();
            return Array.isArray(data.data) ? data.data : [];
        },
        staleTime: 60000,
        refetchInterval: 120000,
    });
    // Fetch dashboard stats
    const { data: dashboardStats, isLoading: statsLoading, error: statsError, refetch: refetchStats, isFetching: statsFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["sewing-dashboard"],
        queryFn: async () => {
            const response = await fetch("/api/sewing/dashboard");
            if (!response.ok)
                throw new Error("Failed to fetch dashboard stats");
            const data = await response.json();
            return data.data;
        },
        staleTime: 30000,
        refetchInterval: 60000,
    });
    const handleRefreshAll = () => {
        refetchRuns();
        refetchOperations();
        refetchOperators();
        refetchStats();
    };
    const _isLoading = runsLoading || operationsLoading || operatorsLoading || statsLoading;
    const isFetching = runsFetching || operationsFetching || operatorsFetching || statsFetching;
    const handleRunAction = async (runId, action) => {
        try {
            const response = await fetch(`/api/sewing/runs/${runId}/${action}`, {
                method: "POST",
            });
            if (response.ok) {
                refetchRuns(); // Refresh data
                refetchStats();
            }
            else {
                console.error(`Failed to ${action} sewing run`);
            }
        }
        catch (error) {
            console.error(`Error ${action}ing sewing run:`, error);
        }
    };
    const getEfficiencyColor = (efficiency) => {
        if (!efficiency)
            return "text-gray-500";
        if (efficiency >= 95)
            return "text-green-600";
        if (efficiency >= 85)
            return "text-yellow-600";
        return "text-red-600";
    };
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
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <skeleton_1.Skeleton className="h-4 w-20"/>
        <skeleton_1.Skeleton className="h-4 w-4 rounded"/>
      </card_1.CardHeader>
      <card_1.CardContent>
        <skeleton_1.Skeleton className="h-8 w-16"/>
      </card_1.CardContent>
    </card_1.Card>);
    const SewingRunCardSkeleton = () => (<card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <skeleton_1.Skeleton className="h-10 w-10 rounded-lg"/>
            <div className="space-y-2">
              <skeleton_1.Skeleton className="h-5 w-40"/>
              <skeleton_1.Skeleton className="h-4 w-32"/>
            </div>
          </div>
          <div className="flex gap-2">
            <skeleton_1.Skeleton className="h-6 w-20"/>
            <skeleton_1.Skeleton className="h-6 w-16"/>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        <skeleton_1.Skeleton className="h-2 w-full"/>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <skeleton_1.Skeleton className="h-10 w-full"/>
          <skeleton_1.Skeleton className="h-10 w-full"/>
          <skeleton_1.Skeleton className="h-10 w-full"/>
          <skeleton_1.Skeleton className="h-10 w-full"/>
        </div>
        <div className="flex gap-2 pt-2">
          <skeleton_1.Skeleton className="h-9 w-20"/>
          <skeleton_1.Skeleton className="h-9 w-28"/>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
    return (<dashboard_layout_1.default>
      <div className="container mx-auto space-y-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sewing Operations</h1>
            <p className="text-muted-foreground">
              Production tracking with real-time efficiency monitoring
            </p>
          </div>
          <div className="flex gap-2">
            <button_1.Button variant="outline" onClick={handleRefreshAll} disabled={isFetching}>
              <lucide_react_1.RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}/>
              Refresh
            </button_1.Button>
            <link_1.default href="/sewing/operations">
              <button_1.Button variant="outline">
                <lucide_react_1.BarChart3 className="mr-2 h-4 w-4"/>
                Operations
              </button_1.Button>
            </link_1.default>
            <link_1.default href="/sewing/runs/new">
              <button_1.Button className="bg-blue-600 hover:bg-blue-700">
                <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                New Run
              </button_1.Button>
            </link_1.default>
          </div>
        </div>

        {/* Error Alerts */}
        {statsError && (<ErrorAlert error={statsError} onRetry={refetchStats}/>)}
        {runsError && (<ErrorAlert error={runsError} onRetry={refetchRuns}/>)}
        {operationsError && (<ErrorAlert error={operationsError} onRetry={refetchOperations}/>)}
        {operatorsError && (<ErrorAlert error={operatorsError} onRetry={refetchOperators}/>)}

        {/* Dashboard Cards */}
        {statsLoading ? (<div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {[...Array(6)].map((_, i) => (<StatCardSkeleton key={i}/>))}
          </div>) : dashboardStats ? (<div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Active Runs
                </card_1.CardTitle>
                <lucide_react_1.Play className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardStats.active_runs}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Completed</card_1.CardTitle>
                <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardStats.todays_completed}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Operators</card_1.CardTitle>
                <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardStats.operators_working}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Avg Efficiency
                </card_1.CardTitle>
                <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className={`text-2xl font-bold ${getEfficiencyColor(dashboardStats.avg_efficiency)}`}>
                  {dashboardStats.avg_efficiency}%
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Pending Bundles
                </card_1.CardTitle>
                <lucide_react_1.QrCode className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardStats.pending_bundles}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Today's Output
                </card_1.CardTitle>
                <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground"/>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {dashboardStats.total_pieces_today}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>) : null}

        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <tabs_1.TabsList className="grid w-full grid-cols-5">
            <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="runs">Active Runs</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="operators">Operators</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="ashley-ai">Ashley AI</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Recent Activity</card_1.CardTitle>
                  <card_1.CardDescription>
                    Latest sewing operations and milestones
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                      <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>
                      <div className="flex-1">
                        <p className="font-medium">Bundle #B-001 completed</p>
                        <p className="text-sm text-muted-foreground">
                          20 pieces • 95% efficiency
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        5 min ago
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                      <lucide_react_1.Play className="h-5 w-5 text-blue-600"/>
                      <div className="flex-1">
                        <p className="font-medium">
                          New run started: Attach collar
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Operator: Carlos Rodriguez
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        12 min ago
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
                      <lucide_react_1.AlertCircle className="h-5 w-5 text-yellow-600"/>
                      <div className="flex-1">
                        <p className="font-medium">Low efficiency detected</p>
                        <p className="text-sm text-muted-foreground">
                          Bundle #B-005 • 72% efficiency
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        1 hour ago
                      </span>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Top Performers */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Top Performers Today</card_1.CardTitle>
                  <card_1.CardDescription>
                    Operators with highest efficiency
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                      <div>
                        <p className="font-medium">Maria Santos</p>
                        <p className="text-sm text-muted-foreground">
                          EMP001 • Join shoulders
                        </p>
                      </div>
                      <badge_1.Badge className="bg-green-100 text-green-800">98%</badge_1.Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                      <div>
                        <p className="font-medium">Ana Cruz</p>
                        <p className="text-sm text-muted-foreground">
                          EMP003 • Set sleeves
                        </p>
                      </div>
                      <badge_1.Badge className="bg-blue-100 text-blue-800">96%</badge_1.Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                      <div>
                        <p className="font-medium">Juan Dela Cruz</p>
                        <p className="text-sm text-muted-foreground">
                          EMP004 • Side seams
                        </p>
                      </div>
                      <badge_1.Badge className="bg-purple-100 text-purple-800">
                        94%
                      </badge_1.Badge>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="runs" className="space-y-4">
            {/* Filters */}
            <card_1.Card>
              <card_1.CardContent className="py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="relative">
                    <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                    <input_1.Input placeholder="Search runs..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="pl-9"/>
                  </div>

                  <select_1.Select value={filters.status} onValueChange={value => setFilters({ ...filters, status: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="All statuses"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">All statuses</select_1.SelectItem>
                      <select_1.SelectItem value="CREATED">Created</select_1.SelectItem>
                      <select_1.SelectItem value="IN_PROGRESS">In Progress</select_1.SelectItem>
                      <select_1.SelectItem value="DONE">Completed</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>

                  <select_1.Select value={filters.operation} onValueChange={value => setFilters({ ...filters, operation: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="All operations"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">All operations</select_1.SelectItem>
                      {(Array.isArray(operations) ? operations : []).map(op => (<select_1.SelectItem key={op.id} value={op.name}>
                          {op.name}
                        </select_1.SelectItem>))}
                    </select_1.SelectContent>
                  </select_1.Select>

                  <select_1.Select value={filters.operator} onValueChange={value => setFilters({ ...filters, operator: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="All operators"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">All operators</select_1.SelectItem>
                      {(Array.isArray(operators) ? operators : []).map(op => (<select_1.SelectItem key={op.id} value={op.id}>
                          {op.first_name} {op.last_name}
                        </select_1.SelectItem>))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Sewing Runs List */}
            <div className="space-y-4">
              {runsLoading
            ? [...Array(3)].map((_, i) => <SewingRunCardSkeleton key={i}/>)
            : (Array.isArray(sewingRuns) ? sewingRuns : []).map(run => (<card_1.Card key={run.id} className="transition-shadow hover:shadow-md">
                      <card_1.CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2 text-blue-800">
                              <lucide_react_1.Scissors className="h-5 w-5"/>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {run.order?.order_number || "N/A"}
                                </h3>
                                <badge_1.Badge variant="outline">
                                  {run.order?.brand?.code || "N/A"}
                                </badge_1.Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {run.operation_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <badge_1.Badge className={statusColors[run.status]}>
                              {run.status.replace("_", " ")}
                            </badge_1.Badge>
                            {run.efficiency_pct && (<badge_1.Badge variant="outline" className={getEfficiencyColor(run.efficiency_pct)}>
                                {run.efficiency_pct}% eff
                              </badge_1.Badge>)}
                          </div>
                        </div>
                      </card_1.CardHeader>

                      <card_1.CardContent className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              Progress: {run.qty_good} / {run.bundle?.qty || 0}
                            </span>
                            <span>
                              {run.bundle?.qty
                    ? Math.round((run.qty_good / run.bundle.qty) * 100)
                    : 0}
                              %
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div className="h-2 rounded-full bg-blue-600 transition-all duration-300" style={{
                    width: `${run.bundle?.qty ? (run.qty_good / run.bundle.qty) * 100 : 0}%`,
                }}/>
                          </div>
                          {run.qty_reject > 0 && (<p className="text-sm text-red-600">
                              {run.qty_reject} rejected
                            </p>)}
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <span className="font-medium">Operator:</span>
                            <br />
                            {run.operator?.first_name || "N/A"}{" "}
                            {run.operator?.last_name || ""}
                          </div>
                          <div>
                            <span className="font-medium">Bundle:</span>
                            <br />
                            {run.bundle?.size_code || "N/A"} •{" "}
                            {run.bundle?.qty || 0} pcs
                          </div>
                          <div>
                            <span className="font-medium">Pay:</span>
                            <br />
                            {run.piece_rate_pay
                    ? `₱${run.piece_rate_pay.toFixed(2)}`
                    : "Pending"}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span>
                            <br />
                            {run.actual_minutes
                    ? `${run.actual_minutes} min`
                    : "Running"}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t pt-2">
                          {run.status === "CREATED" && (<button_1.Button size="sm" onClick={() => handleRunAction(run.id, "start")} className="bg-green-600 hover:bg-green-700">
                              <lucide_react_1.Play className="mr-1 h-4 w-4"/>
                              Start
                            </button_1.Button>)}

                          {run.status === "IN_PROGRESS" && (<>
                              <button_1.Button size="sm" variant="outline" onClick={() => handleRunAction(run.id, "pause")}>
                                <lucide_react_1.Pause className="mr-1 h-4 w-4"/>
                                Pause
                              </button_1.Button>
                              <button_1.Button size="sm" onClick={() => handleRunAction(run.id, "complete")} className="bg-blue-600 hover:bg-blue-700">
                                <lucide_react_1.Square className="mr-1 h-4 w-4"/>
                                Complete
                              </button_1.Button>
                            </>)}

                          <link_1.default href={`/sewing/runs/${run.id}`}>
                            <button_1.Button size="sm" variant="outline">
                              <lucide_react_1.Eye className="mr-1 h-4 w-4"/>
                              Details
                            </button_1.Button>
                          </link_1.default>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>))}

              {!runsLoading && sewingRuns.length === 0 && (<card_1.Card>
                  <card_1.CardContent className="flex h-32 items-center justify-center">
                    <div className="text-center">
                      <lucide_react_1.Scissors className="mx-auto mb-2 h-8 w-8 text-muted-foreground"/>
                      <p className="text-muted-foreground">
                        {filters.status ||
                filters.operation ||
                filters.operator ||
                filters.search
                ? "No sewing runs match your filters"
                : "No sewing runs found"}
                      </p>
                      <link_1.default href="/sewing/runs/new">
                        <button_1.Button className="mt-2" variant="outline">
                          Create First Run
                        </button_1.Button>
                      </link_1.default>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>)}
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="operators" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(Array.isArray(operators) ? operators : []).map(operator => (<card_1.Card key={operator.id}>
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <card_1.CardTitle className="text-lg">
                          {operator.first_name} {operator.last_name}
                        </card_1.CardTitle>
                        <card_1.CardDescription>
                          {operator.employee_number} • {operator.position}
                        </card_1.CardDescription>
                      </div>
                      <badge_1.Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </badge_1.Badge>
                    </div>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Today's efficiency:</span>
                        <span className="font-medium text-green-600">96%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completed pieces:</span>
                        <span className="font-medium">45</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Current operation:</span>
                        <span className="font-medium">Join shoulders</span>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>))}
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="ashley-ai" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <card_1.Card>
                <card_1.CardHeader>
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Brain className="h-5 w-5 text-purple-600"/>
                    <card_1.CardTitle>AI Performance Insights</card_1.CardTitle>
                  </div>
                  <card_1.CardDescription>
                    Real-time efficiency analysis and recommendations
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border bg-green-50 p-3">
                      <div className="flex items-start gap-2">
                        <lucide_react_1.TrendingUp className="mt-0.5 h-4 w-4 text-green-600"/>
                        <div>
                          <p className="font-medium text-green-900">
                            Efficiency Trending Up
                          </p>
                          <p className="text-sm text-green-700">
                            Overall line efficiency increased 3% in the last
                            hour. Maria Santos leading with 98% efficiency.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-yellow-50 p-3">
                      <div className="flex items-start gap-2">
                        <lucide_react_1.AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600"/>
                        <div>
                          <p className="font-medium text-yellow-900">
                            Bottleneck Detected
                          </p>
                          <p className="text-sm text-yellow-700">
                            "Set sleeves" operation is 15% slower than standard.
                            Consider operator rotation or additional training.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-blue-50 p-3">
                      <div className="flex items-start gap-2">
                        <lucide_react_1.Timer className="mt-0.5 h-4 w-4 text-blue-600"/>
                        <div>
                          <p className="font-medium text-blue-900">
                            Break Recommendation
                          </p>
                          <p className="text-sm text-blue-700">
                            Operator Carlos Rodriguez has been working for 2.5
                            hours. Recommend a 15-minute break to maintain
                            efficiency.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Production Optimization</card_1.CardTitle>
                  <card_1.CardDescription>
                    Smart recommendations for today's production
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-medium">Operator Rebalancing</h4>
                      <p className="mb-2 text-sm text-muted-foreground">
                        Suggested operator reassignments to optimize flow:
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Move EMP002 to "Hem bottom"</span>
                          <badge_1.Badge variant="outline" className="text-xs">
                            +8% throughput
                          </badge_1.Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Assign EMP003 to parallel "Set sleeves"</span>
                          <badge_1.Badge variant="outline" className="text-xs">
                            -15min/bundle
                          </badge_1.Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium">Quality Prediction</h4>
                      <p className="mb-2 text-sm text-muted-foreground">
                        Bundle quality risk assessment:
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Bundle #B-003 (Size L)</span>
                          <badge_1.Badge className="bg-green-100 text-xs text-green-800">
                            Low Risk
                          </badge_1.Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Bundle #B-005 (Size XL)</span>
                          <badge_1.Badge className="bg-yellow-100 text-xs text-yellow-800">
                            Medium Risk
                          </badge_1.Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Today's Performance</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Efficiency</span>
                      <span className="font-medium text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Pieces Completed</span>
                      <span className="font-medium">580</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Earnings</span>
                      <span className="font-medium">₱1,450.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reject Rate</span>
                      <span className="font-medium text-green-600">0.8%</span>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Operation Breakdown</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    {(Array.isArray(operations) ? operations : [])
            .slice(0, 5)
            .map(operation => (<div key={operation.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{operation.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {operation.standard_minutes}min • ₱
                              {operation.piece_rate?.toFixed(2)}
                            </p>
                          </div>
                          <badge_1.Badge variant="outline">8 runs</badge_1.Badge>
                        </div>))}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </dashboard_layout_1.default>);
}

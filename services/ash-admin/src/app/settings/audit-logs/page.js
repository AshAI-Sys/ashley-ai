"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuditLogsPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function AuditLogsPage() {
    const router = (0, navigation_1.useRouter)();
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [filteredLogs, setFilteredLogs] = (0, react_1.useState)([]);
    const [expandedLog, setExpandedLog] = (0, react_1.useState)(null);
    const [filters, setFilters] = (0, react_1.useState)({
        search: "",
        category: "all",
        status: "all",
        dateFrom: "",
        dateTo: "",
    });
    (0, react_1.useEffect)(() => {
        fetchAuditLogs();
    }, []);
    (0, react_1.useEffect)(() => {
        applyFilters();
    }, [logs, filters]);
    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/settings/audit-logs");
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || []);
            }
        }
        catch (error) {
            console.error("Failed to fetch audit logs:", error);
            react_hot_toast_1.default.error("Failed to load audit logs");
        }
        finally {
            setLoading(false);
        }
    };
    const applyFilters = () => {
        let filtered = [...logs];
        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(log => log.action.toLowerCase().includes(searchLower) ||
                log.user_email.toLowerCase().includes(searchLower) ||
                log.user_name.toLowerCase().includes(searchLower) ||
                log.resource_type.toLowerCase().includes(searchLower));
        }
        // Category filter
        if (filters.category !== "all") {
            filtered = filtered.filter(log => log.category === filters.category);
        }
        // Status filter
        if (filters.status !== "all") {
            filtered = filtered.filter(log => log.status === filters.status);
        }
        // Date range filter
        if (filters.dateFrom) {
            filtered = filtered.filter(log => new Date(log.created_at) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            filtered = filtered.filter(log => new Date(log.created_at) <= new Date(filters.dateTo));
        }
        setFilteredLogs(filtered);
    };
    const exportLogs = async () => {
        try {
            const response = await fetch("/api/settings/audit-logs/export", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(filters),
            });
            if (!response.ok) {
                throw new Error("Failed to export logs");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            react_hot_toast_1.default.success("Audit logs exported successfully!");
        }
        catch (error) {
            react_hot_toast_1.default.error("Failed to export logs");
        }
    };
    const _getCategoryIcon = (category) => {
        switch (category) {
            case "authentication":
                return <lucide_react_1.Lock className="h-5 w-5"/>;
            case "security":
                return <lucide_react_1.Shield className="h-5 w-5"/>;
            case "account":
                return <lucide_react_1.User className="h-5 w-5"/>;
            case "settings":
                return <lucide_react_1.Settings className="h-5 w-5"/>;
            default:
                return <lucide_react_1.FileText className="h-5 w-5"/>;
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "success":
                return (<lucide_react_1.CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400"/>);
            case "failure":
                return <lucide_react_1.XCircle className="h-5 w-5 text-red-600 dark:text-red-400"/>;
            case "warning":
                return (<lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>);
            default:
                return <lucide_react_1.Info className="h-5 w-5 text-blue-600 dark:text-blue-400"/>;
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    if (loading) {
        return (<div className="space-y-6 p-6">
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-500">
            Loading audit logs...
          </p>
        </div>
      </div>);
    }
    return (<div className="space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center gap-4">
        <button_1.Button variant="ghost" onClick={() => router.push("/settings")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white">
          <lucide_react_1.ArrowLeft className="h-5 w-5"/>
          <span>Back to Settings</span>
        </button_1.Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Audit Logs
          </h2>
          <p className="mt-1 text-gray-500 dark:text-gray-500">
            View security events and account changes
          </p>
        </div>
        <button_1.Button onClick={exportLogs}>
          <lucide_react_1.Download className="mr-2 h-4 w-4"/>
          Export CSV
        </button_1.Button>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <lucide_react_1.Filter className="h-5 w-5"/>
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label_1.Label htmlFor="search">Search</label_1.Label>
            <input_1.Input id="search" type="text" placeholder="Search logs..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="dark:bg-gray-700 dark:text-white"/>
          </div>

          <div>
            <label_1.Label htmlFor="category">Category</label_1.Label>
            <select id="category" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <option value="all">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="security">Security</option>
              <option value="account">Account</option>
              <option value="settings">Settings</option>
              <option value="data">Data</option>
            </select>
          </div>

          <div>
            <label_1.Label htmlFor="status">Status</label_1.Label>
            <select id="status" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div>
            <label_1.Label htmlFor="dateFrom">From Date</label_1.Label>
            <input_1.Input id="dateFrom" type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} className="dark:bg-gray-700 dark:text-white"/>
          </div>

          <div>
            <label_1.Label htmlFor="dateTo">To Date</label_1.Label>
            <input_1.Input id="dateTo" type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} className="dark:bg-gray-700 dark:text-white"/>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-2 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-500">
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
          <button_1.Button variant="outline" size="sm" onClick={() => setFilters({
            search: "",
            category: "all",
            status: "all",
            dateFrom: "",
            dateTo: "",
        })}>
            Clear Filters
          </button_1.Button>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (<div className="rounded-lg bg-gray-50 py-12 text-center dark:bg-gray-800">
            <lucide_react_1.FileText className="mx-auto mb-4 h-16 w-16 text-gray-500"/>
            <p className="text-gray-500 dark:text-gray-500">
              No audit logs found
            </p>
          </div>) : (filteredLogs.map(log => (<div key={log.id} className="overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800">
              <button onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} className="w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start gap-4">
                  <div className="mt-1 shrink-0">
                    {getStatusIcon(log.status)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {log.action}
                          </span>
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-600">
                            {log.category}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <lucide_react_1.User className="h-4 w-4"/>
                            {log.user_name} ({log.user_email})
                          </div>
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Clock className="h-4 w-4"/>
                            {formatDate(log.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {expandedLog === log.id ? (<lucide_react_1.ChevronUp className="h-5 w-5 text-gray-500"/>) : (<lucide_react_1.ChevronDown className="h-5 w-5 text-gray-500"/>)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {expandedLog === log.id && (<div className="border-t bg-gray-50 px-4 pb-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
                    <div>
                      <div className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-600">
                        Resource
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {log.resource_type}{" "}
                        {log.resource_id && `(${log.resource_id})`}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-600">
                        IP Address
                      </div>
                      <div className="font-mono text-sm text-gray-900 dark:text-white">
                        {log.ip_address}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-600">
                        User Agent
                      </div>
                      <div className="break-all text-sm text-gray-900 dark:text-white">
                        {log.user_agent}
                      </div>
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (<div className="md:col-span-2">
                        <div className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-600">
                          Additional Details
                        </div>
                        <pre className="overflow-x-auto rounded border bg-white p-3 text-xs dark:border-gray-700 dark:bg-gray-800">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>)}
                  </div>
                </div>)}
            </div>)))}
      </div>
    </div>);
}

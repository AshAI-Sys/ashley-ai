"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import PermissionGate from "@/components/PermissionGate";
import {
  Shield,
  Search,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  Clock,
  MapPin,
  Monitor,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  description: string;
  performer_user_id?: string;
  performer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  target_user_id?: string;
  target_user_email?: string;
  metadata?: any;
  ip_address: string;
  user_agent: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  workspace_id: string;
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({
    total: 0,
    today: 0,
    this_week: 0,
    severity_counts: { low: 0, medium: 0, high: 0, critical: 0 },
    action_counts: { user_actions: 0, security_events: 0, admin_actions: 0 },
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const actions = [
    "USER_CREATED",
    "USER_UPDATED",
    "USER_DELETED",
    "USER_ROLE_CHANGED",
    "USER_LOGIN",
    "USER_LOGOUT",
    "USER_PASSWORD_CHANGED",
    "USER_ACTIVATED",
    "USER_DEACTIVATED",
    "PERMISSION_GRANTED",
    "PERMISSION_REVOKED",
    "DEPARTMENT_CHANGED",
    "ONBOARDING_CREATED",
    "ONBOARDING_UPDATED",
    "ONBOARDING_COMPLETED",
    "SYSTEM_SETTING_CHANGED",
    "BULK_USER_UPDATE",
    "SECURITY_ALERT",
  ];

  useEffect(() => {
    fetchAuditLogs();
  }, [search, actionFilter, severityFilter, dateFrom, dateTo, page]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(search && { search }),
        ...(actionFilter !== "all" && { action: actionFilter }),
        ...(severityFilter !== "all" && { severity: severityFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      });

      const token = localStorage.getItem("ash_token");
      const response = await fetch(`/api/admin/audit?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data.audit_logs);
        setTotalPages(data.data.pagination.totalPages);
        setSummary(data.data.summary);
      } else {
        console.error("Failed to fetch audit logs");
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <div className="h-2 w-2 rounded-full bg-gray-400" />;
      case "medium":
        return <div className="h-2 w-2 rounded-full bg-blue-400" />;
      case "high":
        return <div className="h-2 w-2 rounded-full bg-orange-400" />;
      case "critical":
        return <div className="h-2 w-2 rounded-full bg-red-400" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-400" />;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.startsWith("USER_")) return <User className="h-4 w-4" />;
    if (action === "SECURITY_ALERT")
      return <AlertTriangle className="h-4 w-4" />;
    if (["SYSTEM_SETTING_CHANGED", "BULK_USER_UPDATE"].includes(action))
      return <Shield className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const exportAuditLogs = () => {
    const csvContent = [
      [
        "Timestamp",
        "Action",
        "Description",
        "Performer",
        "Target User",
        "Severity",
        "IP Address",
      ].join(","),
      ...auditLogs.map(log =>
        [
          log.timestamp,
          log.action,
          `"${log.description}"`,
          log.performer
            ? `"${log.performer.first_name} ${log.performer.last_name}"`
            : "System",
          log.target_user_email || "",
          log.severity,
          log.ip_address,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <PermissionGate
      roles={["admin"]}
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Shield className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You need Administrator privileges to access Audit Logs.
            </p>
          </div>
        </div>
      }
    >
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
          {/* Header */}
          <header className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center text-2xl font-bold text-gray-900">
                  <Shield className="mr-3 h-8 w-8 text-purple-600" />
                  Audit Logs
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  System security and user activity monitoring
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={fetchAuditLogs}
                  className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </button>
                <button
                  onClick={exportAuditLogs}
                  className="flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </header>

          {/* Summary Cards */}
          <div className="px-6 py-6">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.total}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Events
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.today}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Today
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.this_week}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This Week
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-red-500 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.severity_counts.high +
                        summary.severity_counts.critical}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      High Priority
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search audit logs..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Action Filter */}
                <select
                  value={actionFilter}
                  onChange={e => setActionFilter(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Actions</option>
                  {actions.map(action => (
                    <option key={action} value={action}>
                      {action.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>

                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={e => setSeverityFilter(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>

                {/* Date From */}
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />

                {/* Date To */}
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="rounded-lg bg-white shadow">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading audit logs...
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Action
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Performer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Target
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Severity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {auditLogs.map(log => {
                          const timestamp = formatTimestamp(log.timestamp);
                          return (
                            <tr
                              key={log.id}
                              className="hover:bg-gray-50 dark:bg-gray-800"
                            >
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {timestamp.relative}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {timestamp.date} {timestamp.time}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex items-center">
                                  {getActionIcon(log.action)}
                                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                    {log.action.replace(/_/g, " ")}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="max-w-md text-sm text-gray-900">
                                  {log.description}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {log.performer
                                    ? `${log.performer.first_name} ${log.performer.last_name}`
                                    : "System"}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {log.performer?.email || "Automated"}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {log.target_user_email || "-"}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex items-center">
                                  {getSeverityIcon(log.severity)}
                                  <span
                                    className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getSeverityColor(log.severity)}`}
                                  >
                                    {log.severity.toUpperCase()}
                                  </span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                <button
                                  onClick={() => setSelectedLog(log)}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Page {page} of {totalPages}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="flex items-center rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                          </button>
                          <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="flex items-center rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Audit Log Detail Modal */}
          {selectedLog && (
            <AuditLogDetailModal
              log={selectedLog}
              onClose={() => setSelectedLog(null)}
            />
          )}
        </div>
      </DashboardLayout>
    </PermissionGate>
  );
}

// Audit Log Detail Modal Component
function AuditLogDetailModal({
  log,
  onClose,
}: {
  log: AuditLog;
  onClose: () => void;
}) {
  const timestamp = new Date(log.timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-screen w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Audit Log Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Timestamp
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {timestamp.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Action
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {log.action.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {log.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Performer
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {log.performer
                  ? `${log.performer.first_name} ${log.performer.last_name} (${log.performer.email})`
                  : "System"}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Target User
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {log.target_user_email || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block flex items-center text-sm font-medium text-gray-700">
                <MapPin className="mr-1 h-4 w-4" />
                IP Address
              </label>
              <p className="font-mono text-sm text-gray-900">
                {log.ip_address}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Severity
              </label>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  log.severity === "low"
                    ? "bg-gray-100 text-gray-800"
                    : log.severity === "medium"
                      ? "bg-blue-100 text-blue-800"
                      : log.severity === "high"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                }`}
              >
                {log.severity.toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block flex items-center text-sm font-medium text-gray-700">
              <Monitor className="mr-1 h-4 w-4" />
              User Agent
            </label>
            <p className="break-all rounded bg-gray-50 p-2 text-xs text-gray-600">
              {log.user_agent}
            </p>
          </div>

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Metadata
              </label>
              <pre className="overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-600">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

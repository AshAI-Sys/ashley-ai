"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  Lock,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface AuditLog {
  id: string;
  user_email: string;
  user_name: string;
  action: string;
  category: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  status: "success" | "failure" | "warning";
  details: any;
  created_at: string;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
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
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        log =>
          log.action.toLowerCase().includes(searchLower) ||
          log.user_email.toLowerCase().includes(searchLower) ||
          log.user_name.toLowerCase().includes(searchLower) ||
          log.resource_type.toLowerCase().includes(searchLower)
      );
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
      filtered = filtered.filter(
        log => new Date(log.created_at) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        log => new Date(log.created_at) <= new Date(filters.dateTo)
      );
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

      toast.success("Audit logs exported successfully!");
    } catch (error) {
      toast.error("Failed to export logs");
    }
  };

  const ____getCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <Lock className="h-5 w-5" />;
      case "security":
        return <Shield className="h-5 w-5" />;
      case "account":
        return <User className="h-5 w-5" />;
      case "settings":
        return <Settings className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
      case "failure":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "warning":
        return (
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        );
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const formatDate = (dateString: string) => {
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
    return (
      <div className="space-y-6 p-6">
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-500">
            Loading audit logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Settings</span>
        </Button>
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
        <Button onClick={exportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search logs..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={filters.category}
              onChange={e =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="security">Security</option>
              <option value="account">Account</option>
              <option value="settings">Settings</option>
              <option value="data">Data</option>
            </select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div>
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={e =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-2 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-500">
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFilters({
                search: "",
                category: "all",
                status: "all",
                dateFrom: "",
                dateTo: "",
              })
            }
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="rounded-lg bg-gray-50 py-12 text-center dark:bg-gray-800">
            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-500" />
            <p className="text-gray-500 dark:text-gray-500">
              No audit logs found
            </p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <button
                onClick={() =>
                  setExpandedLog(expandedLog === log.id ? null : log.id)
                }
                className="w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              >
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
                            <User className="h-4 w-4" />
                            {log.user_name} ({log.user_email})
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(log.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {expandedLog === log.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {expandedLog === log.id && (
                <div className="border-t bg-gray-50 px-4 pb-4 dark:border-gray-700 dark:bg-gray-900">
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

                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="md:col-span-2">
                        <div className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-600">
                          Additional Details
                        </div>
                        <pre className="overflow-x-auto rounded border bg-white p-3 text-xs dark:border-gray-700 dark:bg-gray-800">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

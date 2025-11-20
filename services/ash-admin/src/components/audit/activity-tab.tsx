"use client";

import { useEffect, useState } from "react";
import { Clock, User, FileText, AlertCircle, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatDate as formatDateUtil } from "@/lib/utils/date";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resource_id: string;
  user_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface ActivityTabProps {
  resourceType: string; // "order", "client", "invoice", etc.
  resourceId: string;
  workspaceId: string;
}

export function ActivityTab({ resourceType, resourceId, workspaceId }: ActivityTabProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityLogs();
  }, [resourceType, resourceId]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/audit?resource=${resourceType}&search=${resourceId}&limit=50`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }

      const data = await response.json();

      if (data.success && data.data.audit_logs) {
        setLogs(data.data.audit_logs);
      }
    } catch (err: any) {
      console.error("Error fetching activity logs:", err);
      setError(err.message || "Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("CREATE")) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (action.includes("UPDATE")) {
      return <Edit className="w-5 h-5 text-blue-600" />;
    }
    if (action.includes("DELETE")) {
      return <Trash2 className="w-5 h-5 text-red-600" />;
    }
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-50 border-green-200";
    if (action.includes("UPDATE")) return "bg-blue-50 border-blue-200";
    if (action.includes("DELETE")) return "bg-red-50 border-red-200";
    return "bg-gray-50 border-gray-200";
  };

  const renderChanges = (log: AuditLog) => {
    if (!log.old_values && !log.new_values) {
      return null;
    }

    const changes: { field: string; old: any; new: any }[] = [];

    if (log.old_values && log.new_values) {
      // Compare old and new values
      const allKeys = new Set([
        ...Object.keys(log.old_values || {}),
        ...Object.keys(log.new_values || {}),
      ]);

      allKeys.forEach((key) => {
        const oldValue = log.old_values?.[key];
        const newValue = log.new_values?.[key];

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({ field: key, old: oldValue, new: newValue });
        }
      });
    }

    if (changes.length === 0 && log.new_values) {
      // For CREATE actions, show new values
      return (
        <div className="mt-2 space-y-1">
          <div className="text-xs font-semibold text-gray-700">Created with:</div>
          {Object.entries(log.new_values).map(([key, value]) => (
            <div key={key} className="text-xs text-gray-600 ml-4">
              <span className="font-medium">{formatFieldName(key)}:</span>{" "}
              <span className="text-green-700">{formatValue(value)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (changes.length === 0) {
      return null;
    }

    return (
      <div className="mt-2 space-y-2">
        <div className="text-xs font-semibold text-gray-700">Changes:</div>
        {changes.map((change, idx) => (
          <div key={idx} className="text-xs bg-white rounded p-2 border border-gray-200">
            <div className="font-medium text-gray-700 mb-1">{formatFieldName(change.field)}</div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-gray-500 text-xs">From:</div>
                <div className="text-red-700 line-through">{formatValue(change.old)}</div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex-1">
                <div className="text-gray-500 text-xs">To:</div>
                <div className="text-green-700 font-medium">{formatValue(change.new)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const formatFieldName = (field: string): string => {
    return field
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span>Loading activity...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mb-2 text-gray-400" />
        <p className="font-medium">No activity yet</p>
        <p className="text-sm">All changes will be tracked here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
        <span className="text-sm text-gray-500">{logs.length} events</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Activity items */}
        <div className="space-y-6">
          {logs.map((log, index) => (
            <div key={log.id} className="relative flex gap-4">
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200">
                  {getActionIcon(log.action)}
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 border rounded-lg p-4 ${getActionColor(log.action)}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {log.action.replace(/_/g, " ")}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      <span>
                        {log.user?.first_name && log.user?.last_name
                          ? `${log.user.first_name} ${log.user.last_name}`
                          : log.user?.email || "System"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {log.created_at ? formatDateUtil(log.created_at, "datetime") : "-"}
                  </span>
                </div>

                {/* Changes */}
                {renderChanges(log)}

                {/* Metadata */}
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>IP: {log.ip_address}</span>
                    <span className="text-gray-400">•</span>
                    <span className="truncate max-w-xs" title={log.user_agent}>
                      {log.user_agent.split(" ")[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

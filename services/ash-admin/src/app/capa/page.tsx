"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Eye,
  Edit,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Filter,
  FileText,
  Target,
} from "lucide-react";

interface CAPATask {
  id: string;
  capa_number: string;
  title: string;
  type: "CORRECTIVE" | "PREVENTIVE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "PENDING_VERIFICATION" | "CLOSED";
  source_type: string;
  inspection_id?: string;
  defect_id?: string;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
  due_date?: string;
  completed_at?: string;
  effectiveness?: "EFFECTIVE" | "PARTIALLY_EFFECTIVE" | "INEFFECTIVE";
  created_at: string;
  assignee?: { first_name: string; last_name: string; employee_number: string };
  creator: { first_name: string; last_name: string };
  inspection?: {
    order: { order_number: string };
    inspection_type: string;
    result: string;
  };
  defect?: {
    defect_code: { code: string; name: string };
    severity: string;
  };
}

interface CAPAAnalytics {
  status_distribution: Array<{ status: string; _count: { id: number } }>;
  priority_distribution: Array<{ priority: string; _count: { id: number } }>;
  effectiveness_distribution: Array<{
    effectiveness: string;
    _count: { id: number };
  }>;
  overdue_count: number;
  average_completion_days: number;
  total_tasks: number;
}

export default function CAPAPage() {
  const [capaTasks, setCapaTasks] = useState<CAPATask[]>([]);
  const [analytics, setAnalytics] = useState<CAPAAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
    loadAnalytics();
  }, [selectedStatus, selectedPriority, selectedType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        sort_by: "created_at",
        sort_order: "desc",
      });

      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedPriority !== "all")
        params.append("priority", selectedPriority);
      if (selectedType !== "all") params.append("type", selectedType);

      const response = await fetch(`/api/capa?${params}`);
      const data = await response.json();

      if (data.capa_tasks) {
        setCapaTasks(data.capa_tasks);
      }
    } catch (error) {
      console.error("Error loading CAPA data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/capa/analytics/summary");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading CAPA analytics:", error);
    }
  };

  const filteredTasks = capaTasks.filter(
    task =>
      searchTerm === "" ||
      task.capa_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignee &&
        `${task.assignee.first_name} ${task.assignee.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Open
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </span>
        );
      case "PENDING_VERIFICATION":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Pending Verification
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      LOW: "bg-green-100 text-green-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}
      >
        {priority}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          type === "CORRECTIVE"
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800"
        }`}
      >
        {type}
      </span>
    );
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading CAPA data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              CAPA Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Corrective and Preventive Action tracking and management
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
            <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </button>
            <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New CAPA
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Total CAPAs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.total_tasks}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Overdue
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.overdue_count}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Effectiveness Rate
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.effectiveness_distribution.length > 0
                          ? Math.round(
                              ((analytics.effectiveness_distribution.find(
                                e => e.effectiveness === "EFFECTIVE"
                              )?._count.id || 0) /
                                analytics.effectiveness_distribution.reduce(
                                  (sum, e) => sum + e._count.id,
                                  0
                                )) *
                                100
                            )
                          : 0}
                        %
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Avg Completion
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.average_completion_days} days
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search CAPA tasks..."
                    className="rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PENDING_VERIFICATION">
                    Pending Verification
                  </option>
                  <option value="CLOSED">Closed</option>
                </select>

                <select
                  className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={selectedPriority}
                  onChange={e => setSelectedPriority(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>

                <select
                  className="rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="CORRECTIVE">Corrective</option>
                  <option value="PREVENTIVE">Preventive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CAPA Tasks Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">CAPA Tasks</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    CAPA Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type / Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {(filteredTasks || []).map(task => (
                  <tr
                    key={task.id}
                    className={`hover:bg-gray-50 ${isOverdue(task.due_date) ? "bg-red-50" : ""}`}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {task.capa_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-sm font-medium text-gray-900">
                        {task.title}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="space-y-1">
                        {getTypeBadge(task.type)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {task.assignee
                          ? `${task.assignee.first_name} ${task.assignee.last_name}`
                          : "Unassigned"}
                      </div>
                      {task.assignee && (
                        <div className="text-sm text-gray-500">
                          {task.assignee.employee_number}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {task.due_date ? (
                        <div
                          className={`text-sm ${isOverdue(task.due_date) ? "font-medium text-red-600" : "text-gray-900"}`}
                        >
                          {new Date(task.due_date).toLocaleDateString()}
                          {isOverdue(task.due_date) && (
                            <div className="text-xs text-red-500">Overdue</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          No due date
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {task.source_type.replace("_", " ")}
                      </div>
                      {task.inspection && (
                        <div className="text-sm text-gray-500">
                          Order: {task.inspection.order.order_number}
                        </div>
                      )}
                      {task.defect && (
                        <div className="text-sm text-gray-500">
                          {task.defect.defect_code.code}:{" "}
                          {task.defect.defect_code.name}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No CAPA tasks found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first CAPA task.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

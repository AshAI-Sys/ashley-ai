"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import PermissionGate from "@/components/PermissionGate";
import {
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  FileText,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Plus,
  Filter,
  Search,
} from "lucide-react";

interface OnboardingProcess {
  id: string;
  employee_id: string;
  employee: {
    first_name: string;
    last_name: string;
    email: string;
    position: string;
  };
  status: "pending" | "in_progress" | "completed" | "on_hold";
  current_step: string;
  progress_percentage: number;
  template_type: string;
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  expected_completion_date: string;
  completion_date?: string;
  steps_completed: string[];
  next_action?: string;
  assigned_hr: string;
}

export default function OnboardingManagementPage() {
  const [onboardingProcesses, setOnboardingProcesses] = useState<
    OnboardingProcess[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOnboardingProcesses();
  }, [statusFilter, priorityFilter, search, page]);

  const fetchOnboardingProcesses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
        ...(search && { search }),
      });

      const token = localStorage.getItem("ash_token");
      const response = await fetch(`/api/admin/onboarding?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOnboardingProcesses(data.data.onboarding_processes);
        setTotalPages(data.data.pagination.totalPages);
        setSummary(data.data.summary);
      } else {
        console.error("Failed to fetch onboarding processes");
      }
    } catch (error) {
      console.error("Error fetching onboarding processes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOnboarding = async (onboardingData: any) => {
    try {
      const token = localStorage.getItem("ash_token");
      const response = await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onboardingData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchOnboardingProcesses();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating onboarding process:", error);
      alert("Failed to create onboarding process");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on_hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Play className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "on_hold":
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (process: OnboardingProcess) => {
    return (
      process.status !== "completed" &&
      new Date(process.expected_completion_date) < new Date()
    );
  };

  return (
    <PermissionGate
      permissions={["admin:read", "hr:read"]}
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <UserPlus className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You need HR or Admin privileges to access Employee Onboarding.
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
                  <UserPlus className="mr-3 h-8 w-8 text-green-600 dark:text-green-400" />
                  Employee Onboarding
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage new employee onboarding processes
                </p>
              </div>
              <PermissionGate permissions={["admin:create", "hr:create"]}>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Onboarding
                </button>
              </PermissionGate>
            </div>
          </header>

          {/* Summary Cards */}
          <div className="px-6 py-6">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm">
                <div className="flex items-center">
                  <Users className="mr-3 h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.total}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Processes
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-4 shadow-sm">
                <div className="flex items-center">
                  <Clock className="mr-3 h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.pending}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pending
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm">
                <div className="flex items-center">
                  <Play className="mr-3 h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.in_progress}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      In Progress
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow-sm">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.completed}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Completed
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-red-500 bg-white p-4 shadow-sm">
                <div className="flex items-center">
                  <AlertCircle className="mr-3 h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.overdue}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Overdue
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="min-w-64 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Onboarding Processes Table */}
            <div className="rounded-lg bg-white shadow">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Loading onboarding processes...
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Next Action
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {onboardingProcesses.map(process => (
                          <tr
                            key={process.id}
                            className="hover:bg-gray-50 dark:bg-gray-800"
                          >
                            <td className="whitespace-nowrap px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {process.employee.first_name}{" "}
                                  {process.employee.last_name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {process.employee.email}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {process.employee.position}
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                {getStatusIcon(process.status)}
                                <span
                                  className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(process.status)}`}
                                >
                                  {process.status
                                    .replace("_", " ")
                                    .toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                <div className="mr-2 h-2 w-16 rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-green-600"
                                    style={{
                                      width: `${process.progress_percentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {process.progress_percentage}%
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPriorityColor(process.priority)}`}
                              >
                                {process.priority.toUpperCase()}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div
                                className={`text-sm ${isOverdue(process) ? "font-medium text-red-600" : "text-gray-900"}`}
                              >
                                {formatDate(process.expected_completion_date)}
                                {isOverdue(process) && (
                                  <div className="text-xs text-red-500">
                                    Overdue
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-48 text-sm text-gray-900">
                                {process.next_action || "No action required"}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/admin/onboarding/${process.id}`
                                    )
                                  }
                                  className="text-green-600 hover:text-green-900"
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <PermissionGate
                                  permissions={["admin:update", "hr:update"]}
                                >
                                  <button
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-100"
                                    title="Edit process"
                                  >
                                    <Settings className="h-4 w-4" />
                                  </button>
                                </PermissionGate>
                              </div>
                            </td>
                          </tr>
                        ))}
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
                            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Create Onboarding Modal */}
          {showCreateModal && (
            <CreateOnboardingModal
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateOnboarding}
            />
          )}
        </div>
      </DashboardLayout>
    </PermissionGate>
  );
}

// Create Onboarding Modal Component
function CreateOnboardingModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    employee_id: "",
    template_type: "basic",
    priority: "normal",
    expected_completion_date: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">
          Create New Onboarding Process
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Employee ID
            </label>
            <input
              type="text"
              required
              value={formData.employee_id}
              onChange={e =>
                setFormData({ ...formData, employee_id: e.target.value })
              }
              placeholder="e.g., EMP-001"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Template Type
            </label>
            <select
              value={formData.template_type}
              onChange={e =>
                setFormData({ ...formData, template_type: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="basic">Basic (3 days)</option>
              <option value="production">Production (7 days)</option>
              <option value="office">Office (5 days)</option>
              <option value="management">Management (10 days)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={e =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Expected Completion Date (Optional)
            </label>
            <input
              type="date"
              value={formData.expected_completion_date}
              onChange={e =>
                setFormData({
                  ...formData,
                  expected_completion_date: e.target.value,
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Create Process
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

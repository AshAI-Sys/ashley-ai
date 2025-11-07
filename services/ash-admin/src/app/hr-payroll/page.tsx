"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard-layout";
import {
  DashboardStatsSkeleton,
  DataTableSkeleton,
} from "@/components/ui/loading-skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { ProfilePictureUpload } from "@/components/profile-picture-upload";
import { useDebounce } from "@/hooks/useDebounce";
import { exportEmployees } from "@/lib/export";
import {
  Users,
  Clock,
  DollarSign,
  Calendar,
  UserCheck,
  AlertCircle,
  TrendingUp,
  FileText,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  X,
  Timer,
  UserX,
  Download,
  Filter,
  RefreshCw,
  Search,
  User,
  Camera,
} from "lucide-react";

interface HRMetrics {
  total_employees: number;
  active_employees: number;
  present_today: number;
  absent_today: number;
  overtime_requests: number;
  pending_leaves: number;
  upcoming_payroll: string;
  total_payroll_cost: number;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  position: string;
  department: string;
  is_active: boolean;
  hire_date: string;
  salary_type: string;
  base_salary: number;
  piece_rate: number;
  profile_picture: string | null;
}

interface AttendanceLog {
  id: string;
  employee: { name: string; role: string };
  date: string;
  time_in: string | null;
  time_out: string | null;
  break_minutes: number | null;
  overtime_minutes: number | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface PayrollRun {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  total_amount: number;
  employee_count: number;
  created_at: string;
}

export default function HRPayrollPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [newEmployee, setNewEmployee] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    employee_number: "",
    position: "",
    department: "",
    salary_type: "DAILY",
    base_salary: "",
    piece_rate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch metrics
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
    isFetching: metricsFetching,
  } = useQuery({
    queryKey: ["hr-metrics"],
    queryFn: async () => {
      const response = await fetch("/api/hr/stats");
      const data = await response.json();
      if (!data.success) throw new Error("Failed to load HR metrics");
      return data.data as HRMetrics;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch employees
  const {
    data: employeesData,
    isLoading: employeesLoading,
    error: employeesError,
    refetch: refetchEmployees,
    isFetching: employeesFetching,
  } = useQuery({
    queryKey: ["employees", debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/hr/employees?${params}`);
      const data = await response.json();
      if (!data.success) throw new Error("Failed to load employees");
      return (data.data || []) as Employee[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch attendance
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
    isFetching: attendanceFetching,
  } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const response = await fetch("/api/hr/attendance");
      const data = await response.json();
      if (!data.success) throw new Error("Failed to load attendance");
      return (data.data || []) as AttendanceLog[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch payroll
  const {
    data: payrollData,
    isLoading: payrollLoading,
    error: payrollError,
    refetch: refetchPayroll,
    isFetching: payrollFetching,
  } = useQuery({
    queryKey: ["payroll"],
    queryFn: async () => {
      const response = await fetch("/api/hr/payroll");
      const data = await response.json();
      if (!data.success) throw new Error("Failed to load payroll");
      return (data.data || []) as PayrollRun[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const metrics = metricsData || {
    total_employees: 0,
    active_employees: 0,
    present_today: 0,
    absent_today: 0,
    overtime_requests: 0,
    pending_leaves: 0,
    upcoming_payroll: new Date().toISOString(),
    total_payroll_cost: 0,
  };

  const employees = employeesData || [];
  const attendanceLogs = attendanceData || [];
  const payrollRuns = payrollData || [];

  const getStatusBadge = (status: string | boolean) => {
    // Handle boolean status (for is_active)
    if (typeof status === "boolean") {
      return status ? (
        <Badge className="bg-green-100 text-green-800">Active</Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      );
    }

    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case "PRESENT":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case "ABSENT":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `â‚±${amount.toLocaleString()}`;
  };

  const handleAddEmployee = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/hr/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEmployee,
          base_salary: newEmployee.base_salary
            ? parseFloat(newEmployee.base_salary)
            : null,
          piece_rate: newEmployee.piece_rate
            ? parseFloat(newEmployee.piece_rate)
            : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddEmployeeModal(false);
        setNewEmployee({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          employee_number: "",
          position: "",
          department: "",
          salary_type: "DAILY",
          base_salary: "",
          piece_rate: "",
        });
        refetchEmployees();
        alert("Employee added successfully!");
      } else {
        alert(data.error || "Failed to add employee");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRefreshAll = () => {
    refetchMetrics();
    refetchEmployees();
    refetchAttendance();
    refetchPayroll();
  };

  const isFetching =
    metricsFetching ||
    employeesFetching ||
    attendanceFetching ||
    payrollFetching;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header - Responsive */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              HR & Payroll
            </h1>
            <p className="text-sm text-gray-600 lg:text-base">
              Manage employees, attendance, and payroll operations
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isFetching}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              <span className="ml-2 hidden sm:inline">
                {isFetching ? "Refreshing..." : "Refresh"}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => exportEmployees(employees, "excel")}
              disabled={employees.length === 0}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Export</span>
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => setShowAddEmployeeModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Employee
            </Button>
          </div>
        </div>

        {/* HR Metrics */}
        {metricsLoading ? (
          <DashboardStatsSkeleton />
        ) : metricsError ? (
          <ErrorAlert
            message="Failed to load HR metrics"
            retry={refetchMetrics}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">
                      Total Employees
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.total_employees}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <UserCheck className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    {metrics.active_employees} active
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">
                      Attendance Today
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.present_today}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 p-3">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <UserX className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">
                    {metrics.absent_today} absent
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">
                      Pending Approvals
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.overtime_requests + metrics.pending_leaves}
                    </p>
                  </div>
                  <div className="rounded-full bg-yellow-100 p-3">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <Timer className="mr-1 h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">
                    {metrics.overtime_requests} OT, {metrics.pending_leaves}{" "}
                    leaves
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">
                      Monthly Payroll
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(metrics.total_payroll_cost)}
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Next run: {formatDate(metrics.upcoming_payroll)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Management</CardTitle>
                    <CardDescription>
                      Manage employee information and assignments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="mb-6 flex gap-4">
                  <div className="max-w-sm flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-11"
                      />
                    </div>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INACTIVE">Inactive Only</option>
                  </select>
                </div>

                {employeesError && (
                  <ErrorAlert
                    message="Failed to load employees"
                    retry={refetchEmployees}
                  />
                )}

                {employeesLoading ? (
                  <DataTableSkeleton rows={5} />
                ) : employees.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No employees found"
                    description={
                      searchQuery
                        ? `No employees match "${searchQuery}"`
                        : "Get started by adding your first employee"
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {employees.map(employee => (
                      <div
                        key={employee.id}
                        className="rounded-lg border p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Profile Picture */}
                          <div className="flex-shrink-0">
                            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                              {employee.profile_picture ? (
                                <Image
                                  src={employee.profile_picture}
                                  alt={`${employee.first_name} ${employee.last_name}`}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <User className="h-8 w-8 text-gray-500" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="font-semibold">
                                {employee.first_name} {employee.last_name}
                              </h3>
                              {getStatusBadge(employee.is_active)}
                              <Badge className="bg-gray-100 text-gray-800">
                                {employee.employee_number}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                              <div>
                                <span className="text-gray-600">Position:</span>
                                <br />
                                <span className="font-medium">
                                  {employee.position}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Department:
                                </span>
                                <br />
                                <span className="font-medium">
                                  {employee.department}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Salary Type:
                                </span>
                                <br />
                                <span className="font-medium">
                                  {employee.salary_type}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Base Salary:
                                </span>
                                <br />
                                <span className="font-medium">
                                  {formatCurrency(employee.base_salary || 0)}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 flex gap-4 text-xs text-gray-500">
                              <span>
                                Hired: {formatDate(employee.hire_date)}
                              </span>
                              {employee.piece_rate && (
                                <span>Piece Rate: â‚±{employee.piece_rate}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowProfilePictureModal(true);
                              }}
                            >
                              <Camera className="mr-1 h-4 w-4" />
                              Photo
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Attendance Logs</CardTitle>
                    <CardDescription>
                      Monitor employee clock in/out and time tracking
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Clock className="mr-2 h-4 w-4" />
                      Manual Entry
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {attendanceError && (
                  <ErrorAlert
                    message="Failed to load attendance logs"
                    retry={refetchAttendance}
                  />
                )}

                {attendanceLoading ? (
                  <DataTableSkeleton rows={5} />
                ) : attendanceLogs.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No attendance logs"
                    description="Attendance records will appear here once employees clock in"
                  />
                ) : (
                  <div className="space-y-4">
                    {attendanceLogs.map(log => (
                      <div
                        key={log.id}
                        className="rounded-lg border p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="font-semibold">
                                {log?.employee?.name || "Unknown Employee"}
                              </h3>
                              <Badge
                                className={
                                  log?.time_in && !log?.time_out
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }
                              >
                                {log?.time_in && !log?.time_out
                                  ? "Present"
                                  : log?.time_out
                                    ? "Completed"
                                    : "Not Clocked In"}
                              </Badge>
                              {getStatusBadge(log?.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                              <div>
                                <span className="text-gray-600">Date:</span>
                                <br />
                                <span className="font-medium">
                                  {log?.date ? formatDate(log.date) : "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Time In:</span>
                                <br />
                                <span className="font-medium">
                                  {log?.time_in
                                    ? formatDateTime(log.time_in)
                                    : "Not clocked in"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Time Out:</span>
                                <br />
                                <span className="font-medium">
                                  {log?.time_out
                                    ? formatDateTime(log.time_out)
                                    : "Not clocked out"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Overtime:</span>
                                <br />
                                <span className="font-medium">
                                  {log?.overtime_minutes || 0} mins
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {log.status === "PENDING" && (
                              <>
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                                  Approve
                                </Button>
                                <Button variant="outline" size="sm">
                                  <XCircle className="mr-1 h-4 w-4 text-red-600" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payroll Management</CardTitle>
                    <CardDescription>
                      Manage payroll runs and employee compensation
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Payroll Run
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {payrollError && (
                  <ErrorAlert
                    message="Failed to load payroll runs"
                    retry={refetchPayroll}
                  />
                )}

                {payrollLoading ? (
                  <DataTableSkeleton rows={3} />
                ) : payrollRuns.length === 0 ? (
                  <EmptyState
                    icon={DollarSign}
                    title="No payroll runs"
                    description="Create your first payroll run to process employee compensation"
                  />
                ) : (
                  <div className="space-y-4">
                    {payrollRuns.map(payroll => (
                      <div
                        key={payroll.id}
                        className="rounded-lg border p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="font-semibold">
                                Payroll {formatDate(payroll.period_start)} -{" "}
                                {formatDate(payroll.period_end)}
                              </h3>
                              {getStatusBadge(payroll.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-3">
                              <div>
                                <span className="text-gray-600">
                                  Total Amount:
                                </span>
                                <br />
                                <span className="font-medium text-green-600">
                                  {formatCurrency(payroll.total_amount)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Employees:
                                </span>
                                <br />
                                <span className="font-medium">
                                  {payroll.employee_count}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Created:</span>
                                <br />
                                <span className="font-medium">
                                  {formatDate(payroll.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 h-4 w-4" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="mr-1 h-4 w-4" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>HR Reports</CardTitle>
                <CardDescription>
                  Generate HR and payroll reports for compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Button
                    variant="outline"
                    className="flex h-20 flex-col gap-2"
                  >
                    <Users className="h-6 w-6" />
                    <span>Employee Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex h-20 flex-col gap-2"
                  >
                    <Clock className="h-6 w-6" />
                    <span>Attendance Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex h-20 flex-col gap-2"
                  >
                    <DollarSign className="h-6 w-6" />
                    <span>Payroll Summary</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex h-20 flex-col gap-2"
                  >
                    <FileText className="h-6 w-6" />
                    <span>Government Forms</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex h-20 flex-col gap-2"
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span>Labor Analytics</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex h-20 flex-col gap-2"
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Leave Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
            <div className="sticky top-0 border-b bg-white p-6">
              <h2 className="text-xl font-semibold">Add New Employee</h2>
              <p className="mt-1 text-sm text-gray-600">
                Create employee account with login credentials
              </p>
            </div>

            <div className="space-y-4 p-6">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    First Name *
                  </label>
                  <Input
                    value={newEmployee.first_name}
                    onChange={e =>
                      setNewEmployee({
                        ...newEmployee,
                        first_name: e.target.value,
                      })
                    }
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Last Name *
                  </label>
                  <Input
                    value={newEmployee.last_name}
                    onChange={e =>
                      setNewEmployee({
                        ...newEmployee,
                        last_name: e.target.value,
                      })
                    }
                    placeholder="Dela Cruz"
                  />
                </div>
              </div>

              {/* Login Credentials */}
              <div className="border-t pt-4">
                <h3 className="mb-3 font-medium">Login Credentials</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={newEmployee.email}
                      onChange={e =>
                        setNewEmployee({
                          ...newEmployee,
                          email: e.target.value,
                        })
                      }
                      placeholder="juan.delacruz@ashley.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Password *
                    </label>
                    <Input
                      type="password"
                      value={newEmployee.password}
                      onChange={e =>
                        setNewEmployee({
                          ...newEmployee,
                          password: e.target.value,
                        })
                      }
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="border-t pt-4">
                <h3 className="mb-3 font-medium">Work Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Employee Number
                    </label>
                    <Input
                      value={newEmployee.employee_number}
                      onChange={e =>
                        setNewEmployee({
                          ...newEmployee,
                          employee_number: e.target.value,
                        })
                      }
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Position *
                    </label>
                    <Input
                      value={newEmployee.position}
                      onChange={e =>
                        setNewEmployee({
                          ...newEmployee,
                          position: e.target.value,
                        })
                      }
                      placeholder="e.g., Sewing Operator"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Department *
                    </label>
                    <select
                      value={newEmployee.department}
                      onChange={e =>
                        setNewEmployee({
                          ...newEmployee,
                          department: e.target.value,
                        })
                      }
                      className="w-full rounded-md border px-3 py-2"
                    >
                      <option value="">Select Department</option>
                      <option value="Cutting">Cutting</option>
                      <option value="Printing">Printing</option>
                      <option value="Sewing">Sewing</option>
                      <option value="Quality Control">Quality Control</option>
                      <option value="Finishing">Finishing</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Salary Type
                    </label>
                    <select
                      value={newEmployee.salary_type}
                      onChange={e =>
                        setNewEmployee({
                          ...newEmployee,
                          salary_type: e.target.value,
                        })
                      }
                      className="w-full rounded-md border px-3 py-2"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="HOURLY">Hourly</option>
                      <option value="PIECE">Piece Rate</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="border-t pt-4">
                <h3 className="mb-3 font-medium">Salary Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Base Salary (â‚±)
                    </label>
                    <Input
                      type="number"
                      value={newEmployee.base_salary}
                      onChange={e =>
                        setNewEmployee({
                          ...newEmployee,
                          base_salary: e.target.value,
                        })
                      }
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Piece Rate (â‚±)
                    </label>
                    <Input
                      type="number"
                      value={newEmployee.piece_rate}
                      onChange={e =>
                        setNewEmployee({
                          ...newEmployee,
                          piece_rate: e.target.value,
                        })
                      }
                      placeholder="5.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white p-6">
              <Button
                variant="outline"
                onClick={() => setShowAddEmployeeModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleAddEmployee} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Employee"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Upload Modal */}
      {showProfilePictureModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Update Profile Picture
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProfilePictureModal(false);
                  setSelectedEmployee(null);
                }}
                className="text-gray-500 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-center">
              <ProfilePictureUpload
                currentPicture={selectedEmployee.profile_picture}
                employeeId={selectedEmployee.id}
                employeeName={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}
                size="lg"
                onUploadSuccess={(_url) => {
                  // Refetch employees to show updated picture
                  refetchEmployees();
                }}
                onDeleteSuccess={() => {
                  // Refetch employees to show removed picture
                  refetchEmployees();
                }}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowProfilePictureModal(false);
                  setSelectedEmployee(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HRPayrollPage;
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const image_1 = __importDefault(require("next/image"));
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const tabs_1 = require("@/components/ui/tabs");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const loading_skeletons_1 = require("@/components/ui/loading-skeletons");
const empty_state_1 = require("@/components/ui/empty-state");
const error_alert_1 = require("@/components/ui/error-alert");
const profile_picture_upload_1 = require("@/components/profile-picture-upload");
const useDebounce_1 = require("@/hooks/useDebounce");
const export_1 = require("@/lib/export");
const lucide_react_1 = require("lucide-react");
function HRPayrollPage() {
    const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
    const [statusFilter, setStatusFilter] = (0, react_1.useState)("all");
    const [showAddEmployeeModal, setShowAddEmployeeModal] = (0, react_1.useState)(false);
    const [showProfilePictureModal, setShowProfilePictureModal] = (0, react_1.useState)(false);
    const [selectedEmployee, setSelectedEmployee] = (0, react_1.useState)(null);
    const [newEmployee, setNewEmployee] = (0, react_1.useState)({
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
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const debouncedSearch = (0, useDebounce_1.useDebounce)(searchQuery, 500);
    // Fetch metrics
    const { data: metricsData, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics, isFetching: metricsFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["hr-metrics"],
        queryFn: async () => {
            const response = await fetch("/api/hr/stats");
            const data = await response.json();
            if (!data.success)
                throw new Error("Failed to load HR metrics");
            return data.data;
        },
        staleTime: 30000,
        refetchInterval: 60000,
    });
    // Fetch employees
    const { data: employeesData, isLoading: employeesLoading, error: employeesError, refetch: refetchEmployees, isFetching: employeesFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["employees", debouncedSearch, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearch)
                params.append("search", debouncedSearch);
            if (statusFilter !== "all")
                params.append("status", statusFilter);
            const response = await fetch(`/api/hr/employees?${params}`);
            const data = await response.json();
            if (!data.success)
                throw new Error("Failed to load employees");
            return (data.data || []);
        },
        staleTime: 30000,
        refetchInterval: 60000,
    });
    // Fetch attendance
    const { data: attendanceData, isLoading: attendanceLoading, error: attendanceError, refetch: refetchAttendance, isFetching: attendanceFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["attendance"],
        queryFn: async () => {
            const response = await fetch("/api/hr/attendance");
            const data = await response.json();
            if (!data.success)
                throw new Error("Failed to load attendance");
            return (data.data || []);
        },
        staleTime: 30000,
        refetchInterval: 60000,
    });
    // Fetch payroll
    const { data: payrollData, isLoading: payrollLoading, error: payrollError, refetch: refetchPayroll, isFetching: payrollFetching, } = (0, react_query_1.useQuery)({
        queryKey: ["payroll"],
        queryFn: async () => {
            const response = await fetch("/api/hr/payroll");
            const data = await response.json();
            if (!data.success)
                throw new Error("Failed to load payroll");
            return (data.data || []);
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
    const getStatusBadge = (status) => {
        // Handle boolean status (for is_active)
        if (typeof status === "boolean") {
            return status ? (<badge_1.Badge className="bg-green-100 text-green-800">Active</badge_1.Badge>) : (<badge_1.Badge className="bg-gray-100 text-gray-800">Inactive</badge_1.Badge>);
        }
        switch (status?.toUpperCase()) {
            case "ACTIVE":
                return <badge_1.Badge className="bg-green-100 text-green-800">Active</badge_1.Badge>;
            case "INACTIVE":
                return <badge_1.Badge className="bg-gray-100 text-gray-800">Inactive</badge_1.Badge>;
            case "PRESENT":
                return <badge_1.Badge className="bg-green-100 text-green-800">Present</badge_1.Badge>;
            case "ABSENT":
                return <badge_1.Badge className="bg-red-100 text-red-800">Absent</badge_1.Badge>;
            case "APPROVED":
                return <badge_1.Badge className="bg-green-100 text-green-800">Approved</badge_1.Badge>;
            case "PENDING":
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Pending</badge_1.Badge>;
            case "COMPLETED":
                return <badge_1.Badge className="bg-blue-100 text-blue-800">Completed</badge_1.Badge>;
            default:
                return <badge_1.Badge className="bg-gray-100 text-gray-800">{status}</badge_1.Badge>;
        }
    };
    const formatCurrency = (amount) => {
        return `₱${amount.toLocaleString()}`;
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
            }
            else {
                alert(data.error || "Failed to add employee");
            }
        }
        catch (error) {
            console.error("Error adding employee:", error);
            alert("Failed to add employee");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    const handleRefreshAll = () => {
        refetchMetrics();
        refetchEmployees();
        refetchAttendance();
        refetchPayroll();
    };
    const isFetching = metricsFetching ||
        employeesFetching ||
        attendanceFetching ||
        payrollFetching;
    return (<dashboard_layout_1.default>
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
            <button_1.Button variant="outline" onClick={handleRefreshAll} disabled={isFetching} size="sm" className="flex-1 sm:flex-none">
              <lucide_react_1.RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}/>
              <span className="ml-2 hidden sm:inline">
                {isFetching ? "Refreshing..." : "Refresh"}
              </span>
            </button_1.Button>
            <button_1.Button variant="outline" onClick={() => (0, export_1.exportEmployees)(employees, "excel")} disabled={employees.length === 0} size="sm" className="flex-1 sm:flex-none">
              <lucide_react_1.Download className="h-4 w-4"/>
              <span className="ml-2 hidden sm:inline">Export</span>
            </button_1.Button>
            <button_1.Button size="sm" className="flex-1 sm:flex-none" onClick={() => setShowAddEmployeeModal(true)}>
              <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
              New Employee
            </button_1.Button>
          </div>
        </div>

        {/* HR Metrics */}
        {metricsLoading ? (<loading_skeletons_1.DashboardStatsSkeleton />) : metricsError ? (<error_alert_1.ErrorAlert message="Failed to load HR metrics" retry={refetchMetrics}/>) : (<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <card_1.Card>
              <card_1.CardContent className="p-6">
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
                    <lucide_react_1.Users className="h-6 w-6 text-blue-600"/>
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <lucide_react_1.UserCheck className="mr-1 h-4 w-4 text-green-500"/>
                  <span className="text-sm text-green-600">
                    {metrics.active_employees} active
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
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
                    <lucide_react_1.Clock className="h-6 w-6 text-green-600"/>
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <lucide_react_1.UserX className="mr-1 h-4 w-4 text-red-500"/>
                  <span className="text-sm text-red-600">
                    {metrics.absent_today} absent
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
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
                    <lucide_react_1.AlertCircle className="h-6 w-6 text-yellow-600"/>
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <lucide_react_1.Timer className="mr-1 h-4 w-4 text-yellow-500"/>
                  <span className="text-sm text-yellow-600">
                    {metrics.overtime_requests} OT, {metrics.pending_leaves}{" "}
                    leaves
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardContent className="p-6">
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
                    <lucide_react_1.DollarSign className="h-6 w-6 text-purple-600"/>
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <lucide_react_1.Calendar className="mr-1 h-4 w-4 text-gray-500"/>
                  <span className="text-sm text-gray-600">
                    Next run: {formatDate(metrics.upcoming_payroll)}
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>)}

        {/* Main Content Tabs */}
        <tabs_1.Tabs defaultValue="employees" className="space-y-4">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="employees">Employees</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="attendance">Attendance</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="payroll">Payroll</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="reports">Reports</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          {/* Employees Tab */}
          <tabs_1.TabsContent value="employees" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <card_1.CardTitle>Employee Management</card_1.CardTitle>
                    <card_1.CardDescription>
                      Manage employee information and assignments
                    </card_1.CardDescription>
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                {/* Search and Filter */}
                <div className="mb-6 flex gap-4">
                  <div className="max-w-sm flex-1">
                    <div className="relative">
                      <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-gray-500"/>
                      <input_1.Input placeholder="Search employees..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9"/>
                    </div>
                  </div>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-md border border-gray-200 px-3 py-2 text-sm">
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INACTIVE">Inactive Only</option>
                  </select>
                </div>

                {employeesError && (<error_alert_1.ErrorAlert message="Failed to load employees" retry={refetchEmployees}/>)}

                {employeesLoading ? (<loading_skeletons_1.DataTableSkeleton rows={5}/>) : employees.length === 0 ? (<empty_state_1.EmptyState icon={lucide_react_1.Users} title="No employees found" description={searchQuery
                ? `No employees match "${searchQuery}"`
                : "Get started by adding your first employee"}/>) : (<div className="space-y-4">
                    {employees.map(employee => (<div key={employee.id} className="rounded-lg border p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                          {/* Profile Picture */}
                          <div className="flex-shrink-0">
                            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                              {employee.profile_picture ? (<image_1.default src={employee.profile_picture} alt={`${employee.first_name} ${employee.last_name}`} fill className="object-cover"/>) : (<div className="flex h-full w-full items-center justify-center">
                                  <lucide_react_1.User className="h-8 w-8 text-gray-500"/>
                                </div>)}
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="font-semibold">
                                {employee.first_name} {employee.last_name}
                              </h3>
                              {getStatusBadge(employee.is_active)}
                              <badge_1.Badge className="bg-gray-100 text-gray-800">
                                {employee.employee_number}
                              </badge_1.Badge>
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
                              {employee.piece_rate && (<span>Piece Rate: ₱{employee.piece_rate}</span>)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button_1.Button variant="outline" size="sm" onClick={() => {
                    setSelectedEmployee(employee);
                    setShowProfilePictureModal(true);
                }}>
                              <lucide_react_1.Camera className="mr-1 h-4 w-4"/>
                              Photo
                            </button_1.Button>
                            <button_1.Button variant="outline" size="sm">
                              <lucide_react_1.Eye className="mr-1 h-4 w-4"/>
                              View
                            </button_1.Button>
                            <button_1.Button variant="outline" size="sm">
                              <lucide_react_1.Edit className="mr-1 h-4 w-4"/>
                              Edit
                            </button_1.Button>
                          </div>
                        </div>
                      </div>))}
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Attendance Tab */}
          <tabs_1.TabsContent value="attendance" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <card_1.CardTitle>Attendance Logs</card_1.CardTitle>
                    <card_1.CardDescription>
                      Monitor employee clock in/out and time tracking
                    </card_1.CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Filter className="mr-2 h-4 w-4"/>
                      Filter
                    </button_1.Button>
                    <button_1.Button size="sm">
                      <lucide_react_1.Clock className="mr-2 h-4 w-4"/>
                      Manual Entry
                    </button_1.Button>
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                {attendanceError && (<error_alert_1.ErrorAlert message="Failed to load attendance logs" retry={refetchAttendance}/>)}

                {attendanceLoading ? (<loading_skeletons_1.DataTableSkeleton rows={5}/>) : attendanceLogs.length === 0 ? (<empty_state_1.EmptyState icon={lucide_react_1.Clock} title="No attendance logs" description="Attendance records will appear here once employees clock in"/>) : (<div className="space-y-4">
                    {attendanceLogs.map(log => (<div key={log.id} className="rounded-lg border p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="font-semibold">
                                {log?.employee?.name || "Unknown Employee"}
                              </h3>
                              <badge_1.Badge className={log?.time_in && !log?.time_out
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"}>
                                {log?.time_in && !log?.time_out
                    ? "Present"
                    : log?.time_out
                        ? "Completed"
                        : "Not Clocked In"}
                              </badge_1.Badge>
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
                            {log.status === "PENDING" && (<>
                                <button_1.Button variant="outline" size="sm">
                                  <lucide_react_1.CheckCircle className="mr-1 h-4 w-4 text-green-600"/>
                                  Approve
                                </button_1.Button>
                                <button_1.Button variant="outline" size="sm">
                                  <lucide_react_1.XCircle className="mr-1 h-4 w-4 text-red-600"/>
                                  Reject
                                </button_1.Button>
                              </>)}
                          </div>
                        </div>
                      </div>))}
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Payroll Tab */}
          <tabs_1.TabsContent value="payroll" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <card_1.CardTitle>Payroll Management</card_1.CardTitle>
                    <card_1.CardDescription>
                      Manage payroll runs and employee compensation
                    </card_1.CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Filter className="mr-2 h-4 w-4"/>
                      Filter
                    </button_1.Button>
                    <button_1.Button size="sm">
                      <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                      New Payroll Run
                    </button_1.Button>
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                {payrollError && (<error_alert_1.ErrorAlert message="Failed to load payroll runs" retry={refetchPayroll}/>)}

                {payrollLoading ? (<loading_skeletons_1.DataTableSkeleton rows={3}/>) : payrollRuns.length === 0 ? (<empty_state_1.EmptyState icon={lucide_react_1.DollarSign} title="No payroll runs" description="Create your first payroll run to process employee compensation"/>) : (<div className="space-y-4">
                    {payrollRuns.map(payroll => (<div key={payroll.id} className="rounded-lg border p-4 hover:bg-gray-50">
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
                            <button_1.Button variant="outline" size="sm">
                              <lucide_react_1.Eye className="mr-1 h-4 w-4"/>
                              View Details
                            </button_1.Button>
                            <button_1.Button variant="outline" size="sm">
                              <lucide_react_1.Download className="mr-1 h-4 w-4"/>
                              Export
                            </button_1.Button>
                          </div>
                        </div>
                      </div>))}
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Reports Tab */}
          <tabs_1.TabsContent value="reports" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>HR Reports</card_1.CardTitle>
                <card_1.CardDescription>
                  Generate HR and payroll reports for compliance
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <button_1.Button variant="outline" className="flex h-20 flex-col gap-2">
                    <lucide_react_1.Users className="h-6 w-6"/>
                    <span>Employee Report</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="flex h-20 flex-col gap-2">
                    <lucide_react_1.Clock className="h-6 w-6"/>
                    <span>Attendance Report</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="flex h-20 flex-col gap-2">
                    <lucide_react_1.DollarSign className="h-6 w-6"/>
                    <span>Payroll Summary</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="flex h-20 flex-col gap-2">
                    <lucide_react_1.FileText className="h-6 w-6"/>
                    <span>Government Forms</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="flex h-20 flex-col gap-2">
                    <lucide_react_1.TrendingUp className="h-6 w-6"/>
                    <span>Labor Analytics</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="flex h-20 flex-col gap-2">
                    <lucide_react_1.Calendar className="h-6 w-6"/>
                    <span>Leave Reports</span>
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
                  <input_1.Input value={newEmployee.first_name} onChange={e => setNewEmployee({
                ...newEmployee,
                first_name: e.target.value,
            })} placeholder="Juan"/>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Last Name *
                  </label>
                  <input_1.Input value={newEmployee.last_name} onChange={e => setNewEmployee({
                ...newEmployee,
                last_name: e.target.value,
            })} placeholder="Dela Cruz"/>
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
                    <input_1.Input type="email" value={newEmployee.email} onChange={e => setNewEmployee({
                ...newEmployee,
                email: e.target.value,
            })} placeholder="juan.delacruz@ashley.com"/>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Password *
                    </label>
                    <input_1.Input type="password" value={newEmployee.password} onChange={e => setNewEmployee({
                ...newEmployee,
                password: e.target.value,
            })} placeholder="••••••••"/>
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
                    <input_1.Input value={newEmployee.employee_number} onChange={e => setNewEmployee({
                ...newEmployee,
                employee_number: e.target.value,
            })} placeholder="Auto-generated if empty"/>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Position *
                    </label>
                    <input_1.Input value={newEmployee.position} onChange={e => setNewEmployee({
                ...newEmployee,
                position: e.target.value,
            })} placeholder="e.g., Sewing Operator"/>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Department *
                    </label>
                    <select value={newEmployee.department} onChange={e => setNewEmployee({
                ...newEmployee,
                department: e.target.value,
            })} className="w-full rounded-md border px-3 py-2">
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
                    <select value={newEmployee.salary_type} onChange={e => setNewEmployee({
                ...newEmployee,
                salary_type: e.target.value,
            })} className="w-full rounded-md border px-3 py-2">
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
                      Base Salary (₱)
                    </label>
                    <input_1.Input type="number" value={newEmployee.base_salary} onChange={e => setNewEmployee({
                ...newEmployee,
                base_salary: e.target.value,
            })} placeholder="500"/>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Piece Rate (₱)
                    </label>
                    <input_1.Input type="number" value={newEmployee.piece_rate} onChange={e => setNewEmployee({
                ...newEmployee,
                piece_rate: e.target.value,
            })} placeholder="5.00"/>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white p-6">
              <button_1.Button variant="outline" onClick={() => setShowAddEmployeeModal(false)} disabled={isSubmitting}>
                Cancel
              </button_1.Button>
              <button_1.Button onClick={handleAddEmployee} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Employee"}
              </button_1.Button>
            </div>
          </div>
        </div>)}

      {/* Profile Picture Upload Modal */}
      {showProfilePictureModal && selectedEmployee && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
              <button onClick={() => {
                setShowProfilePictureModal(false);
                setSelectedEmployee(null);
            }} className="text-gray-500 hover:text-gray-600">
                <lucide_react_1.X className="h-5 w-5"/>
              </button>
            </div>

            <div className="flex justify-center">
              <profile_picture_upload_1.ProfilePictureUpload currentPicture={selectedEmployee.profile_picture} employeeId={selectedEmployee.id} employeeName={`${selectedEmployee.first_name} ${selectedEmployee.last_name}`} size="lg" onUploadSuccess={url => {
                // Refetch employees to show updated picture
                refetchEmployees();
            }} onDeleteSuccess={() => {
                // Refetch employees to show removed picture
                refetchEmployees();
            }}/>
            </div>

            <div className="mt-6 flex justify-end">
              <button_1.Button variant="outline" onClick={() => {
                setShowProfilePictureModal(false);
                setSelectedEmployee(null);
            }}>
                Close
              </button_1.Button>
            </div>
          </div>
        </div>)}
    </dashboard_layout_1.default>);
}

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
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
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import DashboardLayout from "@/components/dashboard-layout";
import {
  DashboardStatsSkeleton,
  DataTableSkeleton,
} from "@/components/ui/loading-skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  UserPlus,
  Filter,
  Calendar as CalendarIcon,
  RefreshCw,
  Users,
  TrendingUp,
  Timer,
  X,
  Search,
} from "lucide-react";
import { format } from "date-fns";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  position: string;
  department: string;
}

interface AttendanceLog {
  id: string;
  employee_id: string;
  employee?: {
    first_name: string;
    last_name: string;
    position: string;
    employee_number: string;
  };
  date: string;
  time_in: string | null;
  time_out: string | null;
  break_minutes: number;
  overtime_minutes: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface AttendanceStats {
  total_present: number;
  pending_approvals: number;
  average_hours: number;
  late_arrivals: number;
  early_departures: number;
}

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";
type EntryType = "IN" | "OUT";

export default function AttendancePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total_present: 0,
    pending_approvals: 0,
    average_hours: 0,
    late_arrivals: 0,
    early_departures: 0,
  });

  // Filter states
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    employee_id: "",
    type: "IN" as EntryType,
    timestamp: new Date().toISOString().slice(0, 16),
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch employees
  const {
    data: employeesData,
    isLoading: employeesLoading,
    error: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/hr/employees");
      const data = await response.json();
      if (!data.success) throw new Error("Failed to load employees");
      return (data.data || []) as Employee[];
    },
    staleTime: 60000,
  });

  // Fetch attendance logs
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ["attendance", selectedEmployee, dateFrom, dateTo, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedEmployee) params.append("employee_id", selectedEmployee);
      if (dateFrom) params.append("date_from", format(dateFrom, "yyyy-MM-dd"));
      if (dateTo) params.append("date_to", format(dateTo, "yyyy-MM-dd"));
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const response = await fetch(`/api/hr/attendance?${params}`);
      const data = await response.json();
      if (!data.success) throw new Error("Failed to load attendance");
      return (data.data || []) as AttendanceLog[];
    },
    staleTime: 30000,
  });

  // Update local state when data changes
  useEffect(() => {
    if (employeesData) setEmployees(employeesData);
  }, [employeesData]);

  useEffect(() => {
    if (attendanceData) {
      setLogs(attendanceData);
      calculateStats(attendanceData);
    }
  }, [attendanceData]);

  // Calculate stats from attendance data
  const calculateStats = (data: AttendanceLog[]) => {
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = data.filter((log) => log.date.startsWith(today));

    const present = todayLogs.filter((log) => log.time_in).length;
    const pending = data.filter((log) => log.status === "PENDING").length;

    // Calculate average hours
    const completedLogs = data.filter((log) => log.time_in && log.time_out);
    const totalHours = completedLogs.reduce((sum, log) => {
      if (!log.time_in || !log.time_out) return sum;
      const hoursWorked = calculateHoursWorked(
        log.time_in,
        log.time_out,
        log.break_minutes
      );
      return sum + hoursWorked;
    }, 0);
    const avgHours =
      completedLogs.length > 0 ? totalHours / completedLogs.length : 0;

    // Calculate late arrivals (after 9 AM)
    const lateArrivals = todayLogs.filter((log) => {
      if (!log.time_in) return false;
      const timeIn = new Date(log.time_in);
      const hour = timeIn.getHours();
      return hour >= 9;
    }).length;

    // Calculate early departures (before 5 PM)
    const earlyDepartures = todayLogs.filter((log) => {
      if (!log.time_out) return false;
      const timeOut = new Date(log.time_out);
      const hour = timeOut.getHours();
      return hour < 17;
    }).length;

    setStats({
      total_present: present,
      pending_approvals: pending,
      average_hours: avgHours,
      late_arrivals: lateArrivals,
      early_departures: earlyDepartures,
    });
  };

  // Calculate hours worked
  const calculateHoursWorked = (
    timeIn: string,
    timeOut: string,
    breakMinutes: number
  ): number => {
    const start = new Date(timeIn);
    const end = new Date(timeOut);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = diffMs / (1000 * 60);
    const workMinutes = diffMins - breakMinutes;
    return workMinutes / 60;
  };

  // Format time to 12-hour format
  const formatTime = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle approve
  const handleApprove = async (logId: string) => {
    try {
      const response = await fetch("/api/hr/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: logId,
          status: "APPROVED",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Attendance log approved",
          variant: "success",
        });
        refetchAttendance();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to approve",
          variant: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve attendance log",
        variant: "error",
      });
    }
  };

  // Handle reject
  const handleReject = async (logId: string) => {
    try {
      const response = await fetch("/api/hr/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: logId,
          status: "REJECTED",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Attendance log rejected",
          variant: "success",
        });
        refetchAttendance();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reject",
          variant: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject attendance log",
        variant: "error",
      });
    }
  };

  // Handle manual entry
  const handleManualEntry = async () => {
    // Validation
    if (!manualEntry.employee_id) {
      toast({
        title: "Validation Error",
        description: "Please select an employee",
        variant: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/hr/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: manualEntry.employee_id,
          type: manualEntry.type,
          timestamp: new Date(manualEntry.timestamp).toISOString(),
          notes: manualEntry.notes || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Time ${manualEntry.type === "IN" ? "in" : "out"} recorded successfully`,
          variant: "success",
        });
        setShowManualEntryModal(false);
        setManualEntry({
          employee_id: "",
          type: "IN",
          timestamp: new Date().toISOString().slice(0, 16),
          notes: "",
        });
        refetchAttendance();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to record attendance",
          variant: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter today only
  const handleTodayFilter = () => {
    const today = new Date();
    setDateFrom(today);
    setDateTo(today);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedEmployee("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setStatusFilter("ALL");
    setSearchQuery("");
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast({
        title: "No Data",
        description: "No attendance logs to export",
        variant: "warning",
      });
      return;
    }

    const headers = [
      "Employee Name",
      "Employee Number",
      "Position",
      "Date",
      "Time In",
      "Time Out",
      "Hours Worked",
      "Break (mins)",
      "Overtime (mins)",
      "Status",
      "Notes",
    ];

    const rows = logs.map((log) => {
      const hoursWorked =
        log.time_in && log.time_out
          ? calculateHoursWorked(
              log.time_in,
              log.time_out,
              log.break_minutes
            ).toFixed(1)
          : "0.0";

      return [
        `${log.employee?.first_name || ""} ${log.employee?.last_name || ""}`,
        log.employee?.employee_number || "",
        log.employee?.position || "",
        formatDate(log.date),
        formatTime(log.time_in),
        formatTime(log.time_out),
        hoursWorked,
        log.break_minutes.toString(),
        log.overtime_minutes.toString(),
        log.status,
        log.notes || "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `attendance_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Attendance data exported successfully",
      variant: "success",
    });
  };

  // Filter logs by search query
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const employeeName =
      `${log.employee?.first_name || ""} ${log.employee?.last_name || ""}`.toLowerCase();
    const employeeNumber = log.employee?.employee_number?.toLowerCase() || "";
    const position = log.employee?.position?.toLowerCase() || "";
    return (
      employeeName.includes(query) ||
      employeeNumber.includes(query) ||
      position.includes(query)
    );
  });

  // Status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const isLoading = employeesLoading || attendanceLoading;
  const hasError = employeesError || attendanceError;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              Attendance Tracking
            </h1>
            <p className="text-sm text-gray-600 lg:text-base">
              Monitor employee check-ins, check-outs, and time management
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => refetchAttendance()}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        {isLoading && <DashboardStatsSkeleton />}
        {!isLoading && !hasError && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Present Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total_present}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 p-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
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
                      {stats.pending_approvals}
                    </p>
                  </div>
                  <div className="rounded-full bg-yellow-100 p-3">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Avg Hours</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.average_hours.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Late Arrivals</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.late_arrivals}
                    </p>
                  </div>
                  <div className="rounded-full bg-orange-100 p-3">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">
                      Early Departures
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.early_departures}
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3">
                    <Timer className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Employee Filter */}
              <div>
                <Label>Employee</Label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <Label>Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-1 w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div>
                <Label>Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-1 w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status Filter */}
              <div>
                <Label>Status</Label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as FilterStatus)
                  }
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Quick Filter */}
              <div>
                <Label>Quick Filter</Label>
                <Button
                  variant="outline"
                  className="mt-1 w-full"
                  onClick={handleTodayFilter}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Today Only
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
              <Label>Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                <Input
                  placeholder="Search by employee name, number, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Logs</CardTitle>
                <CardDescription>
                  {filteredLogs.length} record{filteredLogs.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasError && (
              <ErrorAlert
                message="Failed to load attendance data"
                retry={refetchAttendance}
              />
            )}

            {isLoading ? (
              <DataTableSkeleton rows={5} />
            ) : filteredLogs.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No attendance logs found"
                description={
                  searchQuery || selectedEmployee || dateFrom
                    ? "No records match your filters"
                    : "Attendance records will appear here once employees clock in"
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Time In
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Time Out
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Hours
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Break
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        OT
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredLogs.map((log) => {
                      const hoursWorked =
                        log.time_in && log.time_out
                          ? calculateHoursWorked(
                              log.time_in,
                              log.time_out,
                              log.break_minutes
                            ).toFixed(1)
                          : "0.0";

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">
                                {log.employee?.first_name}{" "}
                                {log.employee?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.employee?.employee_number}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {log.employee?.position}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatDate(log.date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatTime(log.time_in)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatTime(log.time_out)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {hoursWorked}h
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {log.break_minutes}m
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {log.overtime_minutes}m
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(log.status)}
                          </td>
                          <td className="px-4 py-3">
                            {log.status === "PENDING" && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApprove(log.id)}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(log.id)}
                                >
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowManualEntryModal(true)}
          className="fixed bottom-8 right-8 rounded-full bg-blue-600 p-4 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
          aria-label="Manual Time Entry"
        >
          <UserPlus className="h-6 w-6" />
        </button>

        {/* Manual Entry Modal */}
        <Dialog
          open={showManualEntryModal}
          onOpenChange={setShowManualEntryModal}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manual Time Entry</DialogTitle>
              <DialogDescription>
                Record time in/out for an employee manually
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Employee Select */}
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <select
                  id="employee"
                  value={manualEntry.employee_id}
                  onChange={(e) =>
                    setManualEntry({
                      ...manualEntry,
                      employee_id: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Select */}
              <div>
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  value={manualEntry.type}
                  onChange={(e) =>
                    setManualEntry({
                      ...manualEntry,
                      type: e.target.value as EntryType,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="IN">Time In</option>
                  <option value="OUT">Time Out</option>
                </select>
              </div>

              {/* Timestamp */}
              <div>
                <Label htmlFor="timestamp">Timestamp *</Label>
                <Input
                  id="timestamp"
                  type="datetime-local"
                  value={manualEntry.timestamp}
                  onChange={(e) =>
                    setManualEntry({
                      ...manualEntry,
                      timestamp: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  value={manualEntry.notes}
                  onChange={(e) =>
                    setManualEntry({ ...manualEntry, notes: e.target.value })
                  }
                  placeholder="e.g., Adjusted for overtime"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowManualEntryModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleManualEntry} disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Record Entry"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import DashboardLayout from "@/components/dashboard-layout";
import { DashboardStatsSkeleton, DataTableSkeleton } from "@/components/ui/loading-skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Users,
  Calculator,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  Filter,
  Calendar as CalendarIcon,
  X,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

interface PayrollPeriod {
  id: string;
  period_start: string;
  period_end: string;
  status: "draft" | "processing" | "completed";
  total_amount: number;
  employee_count: number;
  created_at: string;
  processed_at: string | null;
}

interface PayrollEarning {
  id: string;
  employee: {
    first_name: string;
    last_name: string;
    position: string;
    department: string;
  };
  regular_hours: number;
  overtime_hours: number;
  piece_count: number;
  gross_pay: number;
  deductions: number;
  net_pay: number;
}

interface PayrollStats {
  total_payroll_this_month: number;
  total_employees_paid: number;
  pending_periods_count: number;
  average_per_employee: number;
}

export default function PayrollPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create period form state
  const [periodStart, setPeriodStart] = useState<Date | undefined>(undefined);
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>(undefined);
  const [cutoffType, setCutoffType] = useState<string>("1-15");
  const [includeOvertime, setIncludeOvertime] = useState(true);
  const [includeLeaves, setIncludeLeaves] = useState(true);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Fetch payroll periods
  const {
    data: periodsData,
    isLoading: periodsLoading,
    error: periodsError,
    refetch: refetchPeriods,
    isFetching: periodsFetching,
  } = useQuery({
    queryKey: ["payroll-periods", statusFilter, yearFilter, monthFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (yearFilter !== "all") params.append("year", yearFilter);
      if (monthFilter !== "all") params.append("month", monthFilter);

      const response = await fetch(`/api/hr/payroll?${params}`);
      const data = await response.json();
      if (!data.success) throw new Error("Failed to load payroll periods");
      return (data.data || []) as PayrollPeriod[];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Fetch period details when selected
  const {
    data: periodDetails,
    isLoading: detailsLoading,
    refetch: refetchDetails,
  } = useQuery({
    queryKey: ["payroll-details", selectedPeriod?.id],
    queryFn: async () => {
      if (!selectedPeriod) return null;
      const response = await fetch(`/api/hr/payroll/${selectedPeriod.id}`);
      const data = await response.json();
      if (!data.success) throw new Error("Failed to load period details");
      return data.data as { period: PayrollPeriod; earnings: PayrollEarning[] };
    },
    enabled: !!selectedPeriod && showDetailsModal,
  });

  const periods = periodsData || [];

  // Calculate stats
  const stats: PayrollStats = {
    total_payroll_this_month: periods
      .filter(p => {
        const startDate = new Date(p.period_start);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + (p.total_amount || 0), 0),
    total_employees_paid: periods
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + p.employee_count, 0),
    pending_periods_count: periods.filter(p => p.status === "draft" || p.status === "processing").length,
    average_per_employee: 0,
  };

  if (stats.total_employees_paid > 0) {
    const totalPaid = periods
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + (p.total_amount || 0), 0);
    stats.average_per_employee = totalPaid / stats.total_employees_paid;
  }

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge className="bg-blue-100 text-blue-800">Draft</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleCreatePeriod = async () => {
    if (!periodStart || !periodEnd) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (periodEnd <= periodStart) {
      toast.error("End date must be after start date");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/hr/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          cutoff_type: cutoffType,
          include_overtime: includeOvertime,
          include_leaves: includeLeaves,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payroll period created successfully!");
        setShowCreateModal(false);
        setPeriodStart(undefined);
        setPeriodEnd(undefined);
        setCutoffType("1-15");
        setIncludeOvertime(true);
        setIncludeLeaves(true);
        refetchPeriods();
      } else {
        toast.error(data.error || "Failed to create payroll period");
      }
    } catch (error) {
      console.error("Error creating payroll period:", error);
      toast.error("Failed to create payroll period");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompletePeriod = async () => {
    if (!selectedPeriod) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/hr/payroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPeriod.id,
          status: "completed",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payroll period marked as completed!");
        setShowCompleteConfirm(false);
        setSelectedPeriod(null);
        refetchPeriods();
      } else {
        toast.error(data.error || "Failed to complete payroll period");
      }
    } catch (error) {
      console.error("Error completing payroll period:", error);
      toast.error("Failed to complete payroll period");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (period: PayrollPeriod) => {
    setSelectedPeriod(period);
    setShowDetailsModal(true);
  };

  const handleExportPeriod = async (period: PayrollPeriod) => {
    try {
      const response = await fetch(`/api/hr/payroll/${period.id}`);
      const data = await response.json();

      if (!data.success) {
        toast.error("Failed to load payroll data");
        return;
      }

      // Create CSV content
      const earnings = data.data.earnings as PayrollEarning[];
      const csvRows = [
        ["Employee Name", "Position", "Department", "Regular Hours", "Overtime Hours", "Piece Count", "Gross Pay", "Deductions", "Net Pay"],
        ...earnings.map((e: PayrollEarning) => [
          `${e.employee.first_name} ${e.employee.last_name}`,
          e.employee.position,
          e.employee.department,
          e.regular_hours.toString(),
          e.overtime_hours.toString(),
          e.piece_count.toString(),
          e.gross_pay.toFixed(2),
          e.deductions.toFixed(2),
          e.net_pay.toFixed(2),
        ]),
        [],
        ["Total", "", "", "", "", "", "", "", earnings.reduce((sum, e) => sum + e.net_pay, 0).toFixed(2)],
      ];

      const csvContent = csvRows.map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll_${formatPeriod(period.period_start, period.period_end).replace(/ /g, "_")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Payroll exported successfully!");
    } catch (error) {
      console.error("Error exporting payroll:", error);
      toast.error("Failed to export payroll");
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Payroll Management</h1>
            <p className="text-sm text-gray-600 lg:text-base">
              Manage payroll periods and employee compensation
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => refetchPeriods()}
              disabled={periodsFetching}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${periodsFetching ? "animate-spin" : ""}`} />
              <span className="ml-2 hidden sm:inline">
                {periodsFetching ? "Refreshing..." : "Refresh"}
              </span>
            </Button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Payroll Period
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        {periodsLoading ? (
          <DashboardStatsSkeleton />
        ) : periodsError ? (
          <ErrorAlert message="Failed to load payroll statistics" retry={refetchPeriods} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Total Payroll This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.total_payroll_this_month)}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 p-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Current month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Total Employees Paid</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_employees_paid}</p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600">All time</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Pending Payroll</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending_periods_count}</p>
                  </div>
                  <div className="rounded-full bg-yellow-100 p-3">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">Needs processing</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Avg Per Employee</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.average_per_employee)}
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3">
                    <Calculator className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <Users className="mr-1 h-4 w-4 text-purple-500" />
                  <span className="text-sm text-purple-600">Based on completed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Periods List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payroll Periods</CardTitle>
                <CardDescription>View and manage all payroll periods</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {periodsError && <ErrorAlert message="Failed to load payroll periods" retry={refetchPeriods} />}

            {periodsLoading ? (
              <DataTableSkeleton rows={5} />
            ) : periods.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title="No payroll periods found"
                description="Create your first payroll period to process employee compensation"
              />
            ) : (
              <div className="space-y-4">
                {periods.map(period => (
                  <div key={period.id} className="rounded-lg border p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="font-semibold">{formatPeriod(period.period_start, period.period_end)}</h3>
                          {getStatusBadge(period.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                          <div>
                            <span className="text-gray-600">Total Amount:</span>
                            <br />
                            <span className="font-medium text-green-600">
                              {formatCurrency(period.total_amount || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Employees:</span>
                            <br />
                            <span className="font-medium">{period.employee_count}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <br />
                            <span className="font-medium">{formatDate(period.created_at)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Processed:</span>
                            <br />
                            <span className="font-medium">
                              {period.processed_at ? formatDate(period.processed_at) : "Not yet"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(period)}>
                          <Eye className="mr-1 h-4 w-4" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                        {period.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPeriod(period);
                              setShowCompleteConfirm(true);
                            }}
                          >
                            <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                            <span className="hidden sm:inline">Complete</span>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleExportPeriod(period)}>
                          <Download className="mr-1 h-4 w-4" />
                          <span className="hidden sm:inline">Export</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Payroll Period Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Payroll Period</DialogTitle>
            <DialogDescription>
              Set the period dates and options for payroll calculation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Period Start Date *</label>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setShowStartCalendar(!showStartCalendar)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodStart ? format(periodStart, "PPP") : "Pick a date"}
                  </Button>
                  {showStartCalendar && (
                    <div className="absolute z-50 mt-2 rounded-md border bg-white p-3 shadow-lg">
                      <Calendar
                        mode="single"
                        selected={periodStart}
                        onSelect={date => {
                          setPeriodStart(date);
                          setShowStartCalendar(false);
                        }}
                        initialFocus
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Period End Date *</label>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setShowEndCalendar(!showEndCalendar)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodEnd ? format(periodEnd, "PPP") : "Pick a date"}
                  </Button>
                  {showEndCalendar && (
                    <div className="absolute z-50 mt-2 rounded-md border bg-white p-3 shadow-lg">
                      <Calendar
                        mode="single"
                        selected={periodEnd}
                        onSelect={date => {
                          setPeriodEnd(date);
                          setShowEndCalendar(false);
                        }}
                        initialFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Cutoff Type</label>
              <Select value={cutoffType} onValueChange={setCutoffType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-15">1st - 15th</SelectItem>
                  <SelectItem value="16-EOM">16th - End of Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overtime"
                  checked={includeOvertime}
                  onCheckedChange={(checked) => setIncludeOvertime(checked as boolean)}
                />
                <label
                  htmlFor="overtime"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include overtime in calculations
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leaves"
                  checked={includeLeaves}
                  onCheckedChange={(checked) => setIncludeLeaves(checked as boolean)}
                />
                <label
                  htmlFor="leaves"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include leaves in calculations
                </label>
              </div>
            </div>

            {periodStart && periodEnd && periodEnd <= periodStart && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                End date must be after start date
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleCreatePeriod} disabled={isProcessing || !periodStart || !periodEnd}>
              {isProcessing ? "Creating..." : "Create Payroll Period"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payroll Period Details
              {selectedPeriod && ` - ${formatPeriod(selectedPeriod.period_start, selectedPeriod.period_end)}`}
            </DialogTitle>
            <DialogDescription>
              {selectedPeriod && (
                <div className="mt-2 flex items-center gap-3">
                  {getStatusBadge(selectedPeriod.status)}
                  <span className="text-sm">
                    Total: {formatCurrency(selectedPeriod.total_amount || 0)} • {selectedPeriod.employee_count}{" "}
                    employees
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {detailsLoading ? (
              <DataTableSkeleton rows={5} />
            ) : periodDetails?.earnings && periodDetails.earnings.length > 0 ? (
              <>
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium">Employee</th>
                        <th className="px-4 py-2 text-left font-medium">Position</th>
                        <th className="px-4 py-2 text-right font-medium">Regular Hrs</th>
                        <th className="px-4 py-2 text-right font-medium">OT Hrs</th>
                        <th className="px-4 py-2 text-right font-medium">Pieces</th>
                        <th className="px-4 py-2 text-right font-medium">Gross Pay</th>
                        <th className="px-4 py-2 text-right font-medium">Deductions</th>
                        <th className="px-4 py-2 text-right font-medium">Net Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periodDetails.earnings.map((earning: PayrollEarning) => (
                        <tr key={earning.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {earning.employee.first_name} {earning.employee.last_name}
                          </td>
                          <td className="px-4 py-2">{earning.employee.position}</td>
                          <td className="px-4 py-2 text-right">{earning.regular_hours.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">{earning.overtime_hours.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">{earning.piece_count}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(earning.gross_pay)}</td>
                          <td className="px-4 py-2 text-right text-red-600">{formatCurrency(earning.deductions)}</td>
                          <td className="px-4 py-2 text-right font-semibold text-green-600">
                            {formatCurrency(earning.net_pay)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 bg-gray-100 font-bold">
                        <td colSpan={5} className="px-4 py-3 text-right">
                          TOTAL:
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(periodDetails.earnings.reduce((sum, e) => sum + e.gross_pay, 0))}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          {formatCurrency(periodDetails.earnings.reduce((sum, e) => sum + e.deductions, 0))}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600">
                          {formatCurrency(periodDetails.earnings.reduce((sum, e) => sum + e.net_pay, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => selectedPeriod && handleExportPeriod(selectedPeriod)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState
                icon={Users}
                title="No earnings data"
                description="No employee earnings found for this period"
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Confirmation Modal */}
      <Dialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payroll Period?</DialogTitle>
            <DialogDescription>
              {selectedPeriod && (
                <>
                  Are you sure you want to mark the payroll period{" "}
                  <strong>{formatPeriod(selectedPeriod.period_start, selectedPeriod.period_end)}</strong> as
                  completed?
                  <br />
                  <br />
                  Total Amount: <strong>{formatCurrency(selectedPeriod.total_amount || 0)}</strong>
                  <br />
                  Employees: <strong>{selectedPeriod.employee_count}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteConfirm(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleCompletePeriod} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Yes, Complete Payroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

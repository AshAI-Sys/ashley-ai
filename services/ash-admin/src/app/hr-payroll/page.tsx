'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/dashboard-layout'
import { SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorAlert } from '@/components/ui/error-alert'
import { useDebounce } from '@/hooks/useDebounce'
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
  Timer,
  UserX,
  Download,
  Filter,
  RefreshCw,
  Search
} from 'lucide-react'

interface HRMetrics {
  total_employees: number
  active_employees: number
  present_today: number
  absent_today: number
  overtime_requests: number
  pending_leaves: number
  upcoming_payroll: string
  total_payroll_cost: number
}

interface Employee {
  id: string
  first_name: string
  last_name: string
  employee_number: string
  position: string
  department: string
  is_active: boolean
  hire_date: string
  salary_type: string
  base_salary: number
  piece_rate: number
}

interface AttendanceLog {
  id: string
  employee: { name: string, role: string }
  date: string
  time_in: string | null
  time_out: string | null
  break_minutes: number | null
  overtime_minutes: number | null
  status: string
  notes: string | null
  created_at: string
}

interface PayrollRun {
  id: string
  period_start: string
  period_end: string
  status: string
  total_amount: number
  employee_count: number
  created_at: string
}

export default function HRPayrollPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    employee_number: '',
    position: '',
    department: '',
    salary_type: 'DAILY',
    base_salary: '',
    piece_rate: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)

  // Fetch metrics
  const { data: metricsData, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics, isFetching: metricsFetching } = useQuery({
    queryKey: ['hr-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/hr/stats')
      const data = await response.json()
      if (!data.success) throw new Error('Failed to load HR metrics')
      return data.data as HRMetrics
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Fetch employees
  const { data: employeesData, isLoading: employeesLoading, error: employeesError, refetch: refetchEmployees, isFetching: employeesFetching } = useQuery({
    queryKey: ['employees', debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/hr/employees?${params}`)
      const data = await response.json()
      if (!data.success) throw new Error('Failed to load employees')
      return (data.data || []) as Employee[]
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Fetch attendance
  const { data: attendanceData, isLoading: attendanceLoading, error: attendanceError, refetch: refetchAttendance, isFetching: attendanceFetching } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const response = await fetch('/api/hr/attendance')
      const data = await response.json()
      if (!data.success) throw new Error('Failed to load attendance')
      return (data.data || []) as AttendanceLog[]
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Fetch payroll
  const { data: payrollData, isLoading: payrollLoading, error: payrollError, refetch: refetchPayroll, isFetching: payrollFetching } = useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      const response = await fetch('/api/hr/payroll')
      const data = await response.json()
      if (!data.success) throw new Error('Failed to load payroll')
      return (data.data || []) as PayrollRun[]
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  const metrics = metricsData || {
    total_employees: 0,
    active_employees: 0,
    present_today: 0,
    absent_today: 0,
    overtime_requests: 0,
    pending_leaves: 0,
    upcoming_payroll: new Date().toISOString(),
    total_payroll_cost: 0
  }

  const employees = employeesData || []
  const attendanceLogs = attendanceData || []
  const payrollRuns = payrollData || []

  const getStatusBadge = (status: string | boolean) => {
    // Handle boolean status (for is_active)
    if (typeof status === 'boolean') {
      return status ?
        <Badge className="bg-green-100 text-green-800">Active</Badge> :
        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    }

    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'INACTIVE':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'PRESENT':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>
      case 'ABSENT':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`
  }

  const handleAddEmployee = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEmployee,
          base_salary: newEmployee.base_salary ? parseFloat(newEmployee.base_salary) : null,
          piece_rate: newEmployee.piece_rate ? parseFloat(newEmployee.piece_rate) : null
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowAddEmployeeModal(false)
        setNewEmployee({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          employee_number: '',
          position: '',
          department: '',
          salary_type: 'DAILY',
          base_salary: '',
          piece_rate: ''
        })
        refetchEmployees()
        alert('Employee added successfully!')
      } else {
        alert(data.error || 'Failed to add employee')
      }
    } catch (error) {
      console.error('Error adding employee:', error)
      alert('Failed to add employee')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleRefreshAll = () => {
    refetchMetrics()
    refetchEmployees()
    refetchAttendance()
    refetchPayroll()
  }

  const isFetching = metricsFetching || employeesFetching || attendanceFetching || payrollFetching

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR & Payroll</h1>
            <p className="text-gray-600">Manage employees, attendance, and payroll operations</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Reports
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Employee
            </Button>
          </div>
        </div>

        {/* HR Metrics */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : metricsError ? (
          <ErrorAlert message="Failed to load HR metrics" retry={refetchMetrics} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.total_employees}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{metrics.active_employees} active</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Attendance Today</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.present_today}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <UserX className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">{metrics.absent_today} absent</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.overtime_requests + metrics.pending_leaves}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Timer className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">{metrics.overtime_requests} OT, {metrics.pending_leaves} leaves</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monthly Payroll</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.total_payroll_cost)}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">Next run: {formatDate(metrics.upcoming_payroll)}</span>
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Employee Management</CardTitle>
                    <CardDescription>Manage employee information and assignments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm" onClick={() => setShowAddEmployeeModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Employee
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 max-w-sm">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>

                {employeesError && (
                  <ErrorAlert message="Failed to load employees" retry={refetchEmployees} />
                )}

                {employeesLoading ? (
                  <SkeletonTable />
                ) : employees.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No employees found"
                    description={searchQuery ? `No employees match "${searchQuery}"` : "Get started by adding your first employee"}
                  />
                ) : (
                  <div className="space-y-4">
                    {employees.map((employee) => (
                      <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
                              {getStatusBadge(employee.is_active)}
                              <Badge className="bg-gray-100 text-gray-800">{employee.employee_number}</Badge>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Position:</span><br />
                                <span className="font-medium">{employee.position}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Department:</span><br />
                                <span className="font-medium">{employee.department}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Salary Type:</span><br />
                                <span className="font-medium">{employee.salary_type}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Base Salary:</span><br />
                                <span className="font-medium">{formatCurrency(employee.base_salary || 0)}</span>
                              </div>
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span>Hired: {formatDate(employee.hire_date)}</span>
                              {employee.piece_rate && <span>Piece Rate: ₱{employee.piece_rate}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Attendance Logs</CardTitle>
                    <CardDescription>Monitor employee clock in/out and time tracking</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Clock className="w-4 h-4 mr-2" />
                      Manual Entry
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {attendanceError && (
                  <ErrorAlert message="Failed to load attendance logs" retry={refetchAttendance} />
                )}

                {attendanceLoading ? (
                  <SkeletonTable />
                ) : attendanceLogs.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No attendance logs"
                    description="Attendance records will appear here once employees clock in"
                  />
                ) : (
                  <div className="space-y-4">
                    {attendanceLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{log.employee.name}</h3>
                              <Badge className={log.time_in && !log.time_out ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                {log.time_in && !log.time_out ? 'Present' : log.time_out ? 'Completed' : 'Not Clocked In'}
                              </Badge>
                              {getStatusBadge(log.status)}
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Date:</span><br />
                                <span className="font-medium">{formatDate(log.date)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Time In:</span><br />
                                <span className="font-medium">{log.time_in ? formatDateTime(log.time_in) : 'Not clocked in'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Time Out:</span><br />
                                <span className="font-medium">{log.time_out ? formatDateTime(log.time_out) : 'Not clocked out'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Overtime:</span><br />
                                <span className="font-medium">{log.overtime_minutes || 0} mins</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {log.status === 'PENDING' && (
                              <>
                                <Button variant="outline" size="sm">
                                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                  Approve
                                </Button>
                                <Button variant="outline" size="sm">
                                  <XCircle className="w-4 h-4 mr-1 text-red-600" />
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payroll Management</CardTitle>
                    <CardDescription>Manage payroll runs and employee compensation</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Payroll Run
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {payrollError && (
                  <ErrorAlert message="Failed to load payroll runs" retry={refetchPayroll} />
                )}

                {payrollLoading ? (
                  <SkeletonTable />
                ) : payrollRuns.length === 0 ? (
                  <EmptyState
                    icon={DollarSign}
                    title="No payroll runs"
                    description="Create your first payroll run to process employee compensation"
                  />
                ) : (
                  <div className="space-y-4">
                    {payrollRuns.map((payroll) => (
                      <div key={payroll.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">
                                Payroll {formatDate(payroll.period_start)} - {formatDate(payroll.period_end)}
                              </h3>
                              {getStatusBadge(payroll.status)}
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Total Amount:</span><br />
                                <span className="font-medium text-green-600">{formatCurrency(payroll.total_amount)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Employees:</span><br />
                                <span className="font-medium">{payroll.employee_count}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Created:</span><br />
                                <span className="font-medium">{formatDate(payroll.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
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
                <CardDescription>Generate HR and payroll reports for compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Users className="w-6 h-6" />
                    <span>Employee Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Clock className="w-6 h-6" />
                    <span>Attendance Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <DollarSign className="w-6 h-6" />
                    <span>Payroll Summary</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <FileText className="w-6 h-6" />
                    <span>Government Forms</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <TrendingUp className="w-6 h-6" />
                    <span>Labor Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Calendar className="w-6 h-6" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Add New Employee</h2>
              <p className="text-sm text-gray-600 mt-1">Create employee account with login credentials</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <Input
                    value={newEmployee.first_name}
                    onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <Input
                    value={newEmployee.last_name}
                    onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                    placeholder="Dela Cruz"
                  />
                </div>
              </div>

              {/* Login Credentials */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Login Credentials</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      placeholder="juan.delacruz@ashley.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password *</label>
                    <Input
                      type="password"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Work Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Employee Number</label>
                    <Input
                      value={newEmployee.employee_number}
                      onChange={(e) => setNewEmployee({...newEmployee, employee_number: e.target.value})}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Position *</label>
                    <Input
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                      placeholder="e.g., Sewing Operator"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department *</label>
                    <select
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
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
                    <label className="block text-sm font-medium mb-1">Salary Type</label>
                    <select
                      value={newEmployee.salary_type}
                      onChange={(e) => setNewEmployee({...newEmployee, salary_type: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
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
                <h3 className="font-medium mb-3">Salary Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Salary (₱)</label>
                    <Input
                      type="number"
                      value={newEmployee.base_salary}
                      onChange={(e) => setNewEmployee({...newEmployee, base_salary: e.target.value})}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Piece Rate (₱)</label>
                    <Input
                      type="number"
                      value={newEmployee.piece_rate}
                      onChange={(e) => setNewEmployee({...newEmployee, piece_rate: e.target.value})}
                      placeholder="5.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
              <Button
                variant="outline"
                onClick={() => setShowAddEmployeeModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddEmployee}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Employee'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
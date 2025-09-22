'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/dashboard-layout'
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
  Filter
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
  name: string
  employee_number: string
  position: string
  department: string
  status: string
  hire_date: string
  salary_type: string
  base_salary: number
  piece_rate: number
  attendance_status?: string
  last_checkin?: string
  total_productions: number
  qc_inspections_count: number
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
  const [metrics, setMetrics] = useState<HRMetrics | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([])
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHRData()
  }, [])

  const fetchHRData = async () => {
    try {
      setLoading(true)

      // Fetch real data from APIs
      const [metricsRes, employeesRes, attendanceRes, payrollRes] = await Promise.all([
        fetch('/api/hr/stats'),
        fetch('/api/hr/employees'),
        fetch('/api/hr/attendance'),
        fetch('/api/hr/payroll')
      ])

      const metricsData = await metricsRes.json()
      const employeesData = await employeesRes.json()
      const attendanceData = await attendanceRes.json()
      const payrollData = await payrollRes.json()

      if (metricsData.success) {
        setMetrics(metricsData.data)
      }

      if (employeesData.success) {
        setEmployees(employeesData.data || [])
      } else {
        setEmployees([])
      }

      if (attendanceData.success) {
        setAttendanceLogs(attendanceData.data || [])
      } else {
        setAttendanceLogs([])
      }

      if (payrollData.success) {
        setPayrollRuns(payrollData.data || [])
      } else {
        setPayrollRuns([])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching HR data:', error)
      setLoading(false)

      // Fallback to mock data if API fails
      setMetrics({
        total_employees: 0,
        active_employees: 0,
        present_today: 0,
        absent_today: 0,
        overtime_requests: 0,
        pending_leaves: 0,
        upcoming_payroll: new Date().toISOString().split('T')[0],
        total_payroll_cost: 0
      })
      setEmployees([])
      setAttendanceLogs([])
      setPayrollRuns([])
    }
  }




  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading HR data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.total_employees || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{metrics?.active_employees || 0} active</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Attendance Today</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.present_today || 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <UserX className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">{metrics?.absent_today || 0} absent</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{(metrics?.overtime_requests || 0) + (metrics?.pending_leaves || 0)}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <Timer className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-yellow-600">{metrics?.overtime_requests || 0} OT, {metrics?.pending_leaves || 0} leaves</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Payroll</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.total_payroll_cost || 0)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">Next run: {formatDate(metrics?.upcoming_payroll || '')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Employee
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(employees || []).map((employee) => (
                    <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{employee.name}</h3>
                            {getStatusBadge(employee.status)}
                            {employee.attendance_status && getStatusBadge(employee.attendance_status)}
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
                            {employee.last_checkin && (
                              <span>Last check-in: {formatDateTime(employee.last_checkin)}</span>
                            )}
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
                <div className="space-y-4">
                  {(attendanceLogs || []).map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{log.employee.name}</h3>
                            <Badge className={log.time_in && !log.time_out ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {log.time_in && !log.time_out ? 'Present' : log.time_out ? 'Completed' : 'Clock In'}
                            </Badge>
                            {getStatusBadge(log.status)}
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Employee:</span><br />
                              <span className="font-medium">{log.employee.role}</span>
                            </div>
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
                <div className="space-y-4">
                  {(payrollRuns || []).map((payroll) => (
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
    </DashboardLayout>
  )
}
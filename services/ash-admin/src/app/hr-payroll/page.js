'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HRPayrollPage;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const tabs_1 = require("@/components/ui/tabs");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
const lucide_react_1 = require("lucide-react");
function HRPayrollPage() {
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [employees, setEmployees] = (0, react_1.useState)([]);
    const [attendanceLogs, setAttendanceLogs] = (0, react_1.useState)([]);
    const [payrollRuns, setPayrollRuns] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        fetchHRData();
    }, []);
    const fetchHRData = async () => {
        try {
            setLoading(true);
            // Mock data for now - would be real API calls
            setTimeout(() => {
                setMetrics({
                    total_employees: 156,
                    active_employees: 148,
                    present_today: 142,
                    absent_today: 6,
                    overtime_requests: 12,
                    pending_leaves: 8,
                    upcoming_payroll: '2025-01-31',
                    total_payroll_cost: 2340000
                });
                setEmployees([
                    {
                        id: '1',
                        name: 'Maria Santos',
                        role: 'Sewing Operator',
                        department: 'Production',
                        status: 'ACTIVE',
                        hire_date: '2023-03-15',
                        pay_type: 'PIECE',
                        base_rate: 850,
                        attendance_status: 'PRESENT',
                        last_checkin: '2025-01-15T08:15:00'
                    },
                    {
                        id: '2',
                        name: 'Juan Dela Cruz',
                        role: 'Quality Inspector',
                        department: 'Quality Control',
                        status: 'ACTIVE',
                        hire_date: '2022-11-20',
                        pay_type: 'DAILY',
                        base_rate: 650,
                        attendance_status: 'PRESENT',
                        last_checkin: '2025-01-15T07:45:00'
                    },
                    {
                        id: '3',
                        name: 'Ana Rodriguez',
                        role: 'Print Operator',
                        department: 'Printing',
                        status: 'ACTIVE',
                        hire_date: '2024-01-10',
                        pay_type: 'HOURLY',
                        base_rate: 85,
                        attendance_status: 'ABSENT',
                        last_checkin: null
                    }
                ]);
                setAttendanceLogs([
                    {
                        id: '1',
                        employee: { name: 'Maria Santos', role: 'Sewing Operator' },
                        type: 'IN',
                        timestamp: '2025-01-15T08:15:00',
                        source: 'KIOSK',
                        status: 'APPROVED'
                    },
                    {
                        id: '2',
                        employee: { name: 'Juan Dela Cruz', role: 'Quality Inspector' },
                        type: 'IN',
                        timestamp: '2025-01-15T07:45:00',
                        source: 'MOBILE',
                        status: 'APPROVED'
                    },
                    {
                        id: '3',
                        employee: { name: 'Pedro Garcia', role: 'Cutting Operator' },
                        type: 'OUT',
                        timestamp: '2025-01-15T17:30:00',
                        source: 'KIOSK',
                        status: 'PENDING'
                    }
                ]);
                setPayrollRuns([
                    {
                        id: '1',
                        period_start: '2025-01-01',
                        period_end: '2025-01-15',
                        status: 'COMPLETED',
                        total_amount: 1850000,
                        employee_count: 148,
                        created_at: '2025-01-16'
                    },
                    {
                        id: '2',
                        period_start: '2024-12-16',
                        period_end: '2024-12-31',
                        status: 'COMPLETED',
                        total_amount: 2120000,
                        employee_count: 151,
                        created_at: '2025-01-02'
                    }
                ]);
                setLoading(false);
            }, 1000);
        }
        catch (error) {
            console.error('Error fetching HR data:', error);
            setLoading(false);
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <badge_1.Badge className="bg-green-100 text-green-800">Active</badge_1.Badge>;
            case 'INACTIVE':
                return <badge_1.Badge className="bg-gray-100 text-gray-800">Inactive</badge_1.Badge>;
            case 'PRESENT':
                return <badge_1.Badge className="bg-green-100 text-green-800">Present</badge_1.Badge>;
            case 'ABSENT':
                return <badge_1.Badge className="bg-red-100 text-red-800">Absent</badge_1.Badge>;
            case 'APPROVED':
                return <badge_1.Badge className="bg-green-100 text-green-800">Approved</badge_1.Badge>;
            case 'PENDING':
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">Pending</badge_1.Badge>;
            case 'COMPLETED':
                return <badge_1.Badge className="bg-blue-100 text-blue-800">Completed</badge_1.Badge>;
            default:
                return <badge_1.Badge className="bg-gray-100 text-gray-800">{status}</badge_1.Badge>;
        }
    };
    const formatCurrency = (amount) => {
        return `₱${amount.toLocaleString()}`;
    };
    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    if (loading) {
        return (<dashboard_layout_1.default>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-gray-600">Loading HR data...</p>
          </div>
        </div>
      </dashboard_layout_1.default>);
    }
    return (<dashboard_layout_1.default>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR & Payroll</h1>
            <p className="text-gray-600">Manage employees, attendance, and payroll operations</p>
          </div>
          <div className="flex gap-2">
            <button_1.Button variant="outline">
              <lucide_react_1.Download className="w-4 h-4 mr-2"/>
              Export Reports
            </button_1.Button>
            <button_1.Button>
              <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
              New Employee
            </button_1.Button>
          </div>
        </div>

        {/* HR Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.total_employees || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <lucide_react_1.Users className="w-6 h-6 text-blue-600"/>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <lucide_react_1.UserCheck className="w-4 h-4 text-green-500 mr-1"/>
                <span className="text-sm text-green-600">{metrics?.active_employees || 0} active</span>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Attendance Today</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.present_today || 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <lucide_react_1.Clock className="w-6 h-6 text-green-600"/>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <lucide_react_1.UserX className="w-4 h-4 text-red-500 mr-1"/>
                <span className="text-sm text-red-600">{metrics?.absent_today || 0} absent</span>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{(metrics?.overtime_requests || 0) + (metrics?.pending_leaves || 0)}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <lucide_react_1.AlertCircle className="w-6 h-6 text-yellow-600"/>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <lucide_react_1.Timer className="w-4 h-4 text-yellow-500 mr-1"/>
                <span className="text-sm text-yellow-600">{metrics?.overtime_requests || 0} OT, {metrics?.pending_leaves || 0} leaves</span>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Monthly Payroll</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics?.total_payroll_cost || 0)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <lucide_react_1.DollarSign className="w-6 h-6 text-purple-600"/>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <lucide_react_1.Calendar className="w-4 h-4 text-gray-500 mr-1"/>
                <span className="text-sm text-gray-600">Next run: {formatDate(metrics?.upcoming_payroll || '')}</span>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

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
                <div className="flex justify-between items-center">
                  <div>
                    <card_1.CardTitle>Employee Management</card_1.CardTitle>
                    <card_1.CardDescription>Manage employee information and assignments</card_1.CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Filter className="w-4 h-4 mr-2"/>
                      Filter
                    </button_1.Button>
                    <button_1.Button size="sm">
                      <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                      Add Employee
                    </button_1.Button>
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {employees.map((employee) => (<div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{employee.name}</h3>
                            {getStatusBadge(employee.status)}
                            {employee.attendance_status && getStatusBadge(employee.attendance_status)}
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Role:</span><br />
                              <span className="font-medium">{employee.role}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Department:</span><br />
                              <span className="font-medium">{employee.department}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Pay Type:</span><br />
                              <span className="font-medium">{employee.pay_type}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Base Rate:</span><br />
                              <span className="font-medium">{formatCurrency(employee.base_rate)}</span>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Hired: {formatDate(employee.hire_date)}</span>
                            {employee.last_checkin && (<span>Last check-in: {formatDateTime(employee.last_checkin)}</span>)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                            View
                          </button_1.Button>
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Edit className="w-4 h-4 mr-1"/>
                            Edit
                          </button_1.Button>
                        </div>
                      </div>
                    </div>))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Attendance Tab */}
          <tabs_1.TabsContent value="attendance" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <card_1.CardTitle>Attendance Logs</card_1.CardTitle>
                    <card_1.CardDescription>Monitor employee clock in/out and time tracking</card_1.CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Filter className="w-4 h-4 mr-2"/>
                      Filter
                    </button_1.Button>
                    <button_1.Button size="sm">
                      <lucide_react_1.Clock className="w-4 h-4 mr-2"/>
                      Manual Entry
                    </button_1.Button>
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {attendanceLogs.map((log) => (<div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{log.employee.name}</h3>
                            <badge_1.Badge className={log.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {log.type === 'IN' ? 'Clock In' : 'Clock Out'}
                            </badge_1.Badge>
                            {getStatusBadge(log.status)}
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Employee:</span><br />
                              <span className="font-medium">{log.employee.role}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Time:</span><br />
                              <span className="font-medium">{formatDateTime(log.timestamp)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Source:</span><br />
                              <span className="font-medium">{log.source}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {log.status === 'PENDING' && (<>
                              <button_1.Button variant="outline" size="sm">
                                <lucide_react_1.CheckCircle className="w-4 h-4 mr-1 text-green-600"/>
                                Approve
                              </button_1.Button>
                              <button_1.Button variant="outline" size="sm">
                                <lucide_react_1.XCircle className="w-4 h-4 mr-1 text-red-600"/>
                                Reject
                              </button_1.Button>
                            </>)}
                        </div>
                      </div>
                    </div>))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Payroll Tab */}
          <tabs_1.TabsContent value="payroll" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <card_1.CardTitle>Payroll Management</card_1.CardTitle>
                    <card_1.CardDescription>Manage payroll runs and employee compensation</card_1.CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <button_1.Button variant="outline" size="sm">
                      <lucide_react_1.Filter className="w-4 h-4 mr-2"/>
                      Filter
                    </button_1.Button>
                    <button_1.Button size="sm">
                      <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                      New Payroll Run
                    </button_1.Button>
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {payrollRuns.map((payroll) => (<div key={payroll.id} className="border rounded-lg p-4 hover:bg-gray-50">
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
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                            View Details
                          </button_1.Button>
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Download className="w-4 h-4 mr-1"/>
                            Export
                          </button_1.Button>
                        </div>
                      </div>
                    </div>))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Reports Tab */}
          <tabs_1.TabsContent value="reports" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>HR Reports</card_1.CardTitle>
                <card_1.CardDescription>Generate HR and payroll reports for compliance</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.Users className="w-6 h-6"/>
                    <span>Employee Report</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.Clock className="w-6 h-6"/>
                    <span>Attendance Report</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.DollarSign className="w-6 h-6"/>
                    <span>Payroll Summary</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.FileText className="w-6 h-6"/>
                    <span>Government Forms</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.TrendingUp className="w-6 h-6"/>
                    <span>Labor Analytics</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-20 flex flex-col gap-2">
                    <lucide_react_1.Calendar className="w-6 h-6"/>
                    <span>Leave Reports</span>
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </dashboard_layout_1.default>);
}

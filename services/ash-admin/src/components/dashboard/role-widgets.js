"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RoleWidgets;
const lucide_react_1 = require("lucide-react");
// Admin Dashboard Widgets
function AdminWidgets() {
    return (<>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            System Overview
          </h3>
          <lucide_react_1.BarChart3 className="h-5 w-5 text-blue-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Orders</span>
            <span className="font-medium">1,234</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Active Employees</span>
            <span className="font-medium">156</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">System Efficiency</span>
            <span className="font-medium text-green-600">94%</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            Department Status
          </h3>
          <lucide_react_1.Package className="h-5 w-5 text-green-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cutting</span>
            <span className="font-medium text-green-600">Online</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Printing</span>
            <span className="font-medium text-green-600">Online</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sewing</span>
            <span className="font-medium text-amber-600">Maintenance</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            Financial Summary
          </h3>
          <lucide_react_1.DollarSign className="h-5 w-5 text-blue-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Monthly Revenue</span>
            <span className="font-medium">₱2.4M</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pending Invoices</span>
            <span className="font-medium">₱450K</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Profit Margin</span>
            <span className="font-medium text-green-600">18%</span>
          </div>
        </div>
      </div>
    </>);
}
// Manager Dashboard Widgets
function ManagerWidgets({ user }) {
    return (<>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            Department: {user.department}
          </h3>
          <lucide_react_1.Package className="h-5 w-5 text-blue-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Active Orders</span>
            <span className="font-medium">42</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Team Members</span>
            <span className="font-medium">12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Efficiency</span>
            <span className="font-medium text-green-600">91%</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            Team Performance
          </h3>
          <lucide_react_1.Users className="h-5 w-5 text-green-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">On Target</span>
            <span className="font-medium text-green-600">8/12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Overtime Hours</span>
            <span className="font-medium">24h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Attendance</span>
            <span className="font-medium text-green-600">96%</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            Quality Metrics
          </h3>
          <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pass Rate</span>
            <span className="font-medium text-green-600">98.5%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Rework</span>
            <span className="font-medium">1.2%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Customer Satisfaction</span>
            <span className="font-medium text-green-600">4.8/5</span>
          </div>
        </div>
      </div>
    </>);
}
// Supervisor Dashboard Widgets
function SupervisorWidgets({ user }) {
    const getDepartmentIcon = (dept) => {
        switch (dept) {
            case "Cutting":
                return <lucide_react_1.Scissors className="h-5 w-5 text-blue-600"/>;
            case "Printing":
                return <lucide_react_1.Printer className="h-5 w-5 text-purple-600"/>;
            case "Sewing":
                return <lucide_react_1.PocketKnife className="h-5 w-5 text-green-600"/>;
            case "Quality":
                return <lucide_react_1.CheckCircle className="h-5 w-5 text-yellow-600"/>;
            case "Delivery":
                return <lucide_react_1.Truck className="h-5 w-5 text-red-600"/>;
            case "Maintenance":
                return <lucide_react_1.Wrench className="h-5 w-5 text-gray-600"/>;
            default:
                return <lucide_react_1.Package className="h-5 w-5 text-blue-600"/>;
        }
    };
    return (<>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            My Department
          </h3>
          {getDepartmentIcon(user.department)}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Today's Tasks</span>
            <span className="font-medium">8/12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Team Members</span>
            <span className="font-medium">6</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Production Rate</span>
            <span className="font-medium text-green-600">92%</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            Active Work Orders
          </h3>
          <lucide_react_1.Clock className="h-5 w-5 text-amber-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">In Progress</span>
            <span className="font-medium">5</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Completed Today</span>
            <span className="font-medium text-green-600">12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pending</span>
            <span className="font-medium text-amber-600">3</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            Alerts & Issues
          </h3>
          <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Critical</span>
            <span className="font-medium text-red-600">1</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Medium</span>
            <span className="font-medium text-amber-600">2</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Low</span>
            <span className="font-medium">0</span>
          </div>
        </div>
      </div>
    </>);
}
// Operator Dashboard Widgets
function OperatorWidgets({ user }) {
    return (<>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">My Tasks</h3>
          <lucide_react_1.Package className="h-5 w-5 text-blue-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Assigned Today</span>
            <span className="font-medium">6</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Completed</span>
            <span className="font-medium text-green-600">4</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">In Progress</span>
            <span className="font-medium text-amber-600">2</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">Performance</h3>
          <lucide_react_1.BarChart3 className="h-5 w-5 text-green-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Efficiency</span>
            <span className="font-medium text-green-600">98%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quality Score</span>
            <span className="font-medium text-green-600">99.2%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Hours Today</span>
            <span className="font-medium">7.5h</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            Department: {user.department}
          </h3>
          <lucide_react_1.Clock className="h-5 w-5 text-blue-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shift</span>
            <span className="font-medium">Day Shift</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Break Time</span>
            <span className="font-medium">30 min</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Overtime</span>
            <span className="font-medium">0h</span>
          </div>
        </div>
      </div>
    </>);
}
// Employee Dashboard Widgets
function EmployeeWidgets({ user }) {
    return (<>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            My Information
          </h3>
          <lucide_react_1.Users className="h-5 w-5 text-blue-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Position</span>
            <span className="font-medium">{user.position}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Department</span>
            <span className="font-medium">{user.department}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shift</span>
            <span className="font-medium">Day Shift</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">Attendance</h3>
          <lucide_react_1.Clock className="h-5 w-5 text-green-600"/>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Time In</span>
            <span className="font-medium">8:00 AM</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Hours Today</span>
            <span className="font-medium">7.5h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">This Month</span>
            <span className="font-medium">158h</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            Announcements
          </h3>
          <lucide_react_1.AlertTriangle className="h-5 w-5 text-amber-600"/>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Company meeting tomorrow at 2 PM
          </div>
          <div className="text-sm text-gray-600">
            New safety protocols effective Monday
          </div>
          <div className="text-sm text-gray-600">
            Payroll will be processed Friday
          </div>
        </div>
      </div>
    </>);
}
function RoleWidgets({ user }) {
    switch (user.role) {
        case "admin":
            return <AdminWidgets />;
        case "manager":
            return <ManagerWidgets user={user}/>;
        case "designer":
            return <SupervisorWidgets user={user}/>;
        case "sewing_operator":
        case "cutting_operator":
        case "printing_operator":
        case "finishing_operator":
            return <OperatorWidgets user={user}/>;
        case "qc_inspector":
        case "warehouse_staff":
        case "finance_staff":
        case "hr_staff":
        case "maintenance_tech":
            return <EmployeeWidgets user={user}/>;
        default:
            return <EmployeeWidgets user={user}/>;
    }
}

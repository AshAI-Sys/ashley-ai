'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmployeeDashboard;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
function EmployeeDashboard() {
    const [employee, setEmployee] = (0, react_1.useState)(null);
    const [tasks, setTasks] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        // Get employee data from token/session
        const employeeData = localStorage.getItem('employee-data');
        if (employeeData) {
            const emp = JSON.parse(employeeData);
            setEmployee(emp);
            loadEmployeeTasks(emp.id, emp.role, emp.position);
        }
        else {
            router.push('/employee/login');
        }
    }, [router]);
    const loadEmployeeTasks = async (employeeId, role, position) => {
        try {
            // Mock data based on role and position
            const mockTasks = generateRoleBasedTasks(role, position);
            setTasks(mockTasks);
        }
        catch (error) {
            console.error('Error loading tasks:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const generateRoleBasedTasks = (role, position) => {
        const baseTasks = {
            assigned_tasks: 0,
            completed_tasks: 0,
            pending_tasks: 0,
            current_task: ''
        };
        // Role-specific task generation
        switch (position) {
            case 'Cutting Operator':
                return {
                    assigned_tasks: 5,
                    completed_tasks: 3,
                    pending_tasks: 2,
                    current_task: 'Cut fabric for Order #ORD-2024-001 - Batch 1'
                };
            case 'Printing Operator':
                return {
                    assigned_tasks: 4,
                    completed_tasks: 2,
                    pending_tasks: 2,
                    current_task: 'Print design for Order #ORD-2024-002 - Silkscreen method'
                };
            case 'Sewing Operator':
                return {
                    assigned_tasks: 8,
                    completed_tasks: 5,
                    pending_tasks: 3,
                    current_task: 'Sew sleeves for Bundle #BND-001 - 50 pieces'
                };
            case 'QC Inspector':
                return {
                    assigned_tasks: 6,
                    completed_tasks: 4,
                    pending_tasks: 2,
                    current_task: 'Quality inspection for Order #ORD-2024-001 - AQL 2.5'
                };
            case 'Packing Operator':
                return {
                    assigned_tasks: 3,
                    completed_tasks: 1,
                    pending_tasks: 2,
                    current_task: 'Pack finished goods for Shipment #SHP-001'
                };
            default:
                return {
                    assigned_tasks: 4,
                    completed_tasks: 2,
                    pending_tasks: 2,
                    current_task: 'Complete assigned production tasks'
                };
        }
    };
    const getRoleIcon = (position) => {
        switch (position) {
            case 'Cutting Operator': return <lucide_react_1.Scissors className="w-6 h-6"/>;
            case 'Printing Operator': return <lucide_react_1.Package className="w-6 h-6"/>;
            case 'Sewing Operator': return <lucide_react_1.Shirt className="w-6 h-6"/>;
            case 'QC Inspector': return <lucide_react_1.Eye className="w-6 h-6"/>;
            case 'Packing Operator': return <lucide_react_1.Package className="w-6 h-6"/>;
            default: return <lucide_react_1.User className="w-6 h-6"/>;
        }
    };
    const getRoleActions = (role, position) => {
        const actions = [];
        // Common actions for all employees
        actions.push({ name: 'Clock In/Out', href: '/employee/attendance', icon: lucide_react_1.Clock, color: 'bg-blue-500' }, { name: 'View Profile', href: '/employee/profile', icon: lucide_react_1.User, color: 'bg-gray-500' });
        // Position-specific actions
        switch (position) {
            case 'Cutting Operator':
                actions.push({ name: 'Cutting Tasks', href: '/employee/cutting', icon: lucide_react_1.Scissors, color: 'bg-orange-500' }, { name: 'Scan Bundles', href: '/employee/bundles', icon: lucide_react_1.Package, color: 'bg-purple-500' });
                break;
            case 'Printing Operator':
                actions.push({ name: 'Print Jobs', href: '/employee/printing', icon: lucide_react_1.Package, color: 'bg-cyan-500' });
                break;
            case 'Sewing Operator':
                actions.push({ name: 'Sewing Tasks', href: '/employee/sewing', icon: lucide_react_1.Shirt, color: 'bg-green-500' });
                break;
            case 'QC Inspector':
                actions.push({ name: 'Quality Inspections', href: '/employee/quality', icon: lucide_react_1.Eye, color: 'bg-red-500' }, { name: 'Report Defects', href: '/employee/defects', icon: lucide_react_1.AlertCircle, color: 'bg-yellow-500' });
                break;
            case 'Packing Operator':
                actions.push({ name: 'Packing Tasks', href: '/employee/packing', icon: lucide_react_1.Package, color: 'bg-indigo-500' });
                break;
        }
        return actions;
    };
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>);
    }
    if (!employee) {
        return null;
    }
    const actions = getRoleActions(employee.role, employee.position);
    return (<div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg mr-4">
                {getRoleIcon(employee.position)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {employee.first_name}!
                </h1>
                <p className="text-gray-600">
                  {employee.position} • {employee.department} • #{employee.employee_number}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-semibold text-gray-900 capitalize">{employee.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Task */}
        {tasks?.current_task && (<div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <lucide_react_1.AlertCircle className="h-5 w-5 text-blue-400"/>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Current Task:</span> {tasks.current_task}
                </p>
              </div>
            </div>
          </div>)}

        {/* Task Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <lucide_react_1.Package className="h-6 w-6 text-blue-400"/>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Assigned Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {tasks?.assigned_tasks || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <lucide_react_1.CheckCircle className="h-6 w-6 text-green-400"/>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {tasks?.completed_tasks || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <lucide_react_1.Clock className="h-6 w-6 text-yellow-400"/>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {tasks?.pending_tasks || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {actions.map((action) => (<button key={action.name} onClick={() => router.push(action.href)} className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400 hover:shadow-md transition-all">
                  <div>
                    <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                      <action.icon className="h-6 w-6"/>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      {action.name}
                    </h3>
                  </div>
                </button>))}
            </div>
          </div>
        </div>

        {/* Role-specific information */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Your Role & Responsibilities
            </h3>
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Position:</strong> {employee.position}
              </p>
              <p className="mb-2">
                <strong>Department:</strong> {employee.department}
              </p>
              <p>
                As a <strong>{employee.position}</strong>, you have access to {Object.keys(employee.permissions || {}).length} system modules
                based on your role and responsibilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
}

'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RoleSpecificDashboard;
const auth_context_1 = require("../../lib/auth-context");
const AdminDashboard_1 = __importDefault(require("./AdminDashboard"));
const ManagerDashboard_1 = __importDefault(require("./ManagerDashboard"));
const DesignerDashboard_1 = __importDefault(require("./DesignerDashboard"));
const CuttingOperatorDashboard_1 = __importDefault(require("./CuttingOperatorDashboard"));
const PrintingOperatorDashboard_1 = __importDefault(require("./PrintingOperatorDashboard"));
const SewingOperatorDashboard_1 = __importDefault(require("./SewingOperatorDashboard"));
const QCInspectorDashboard_1 = __importDefault(require("./QCInspectorDashboard"));
const WarehouseDashboard_1 = __importDefault(require("./WarehouseDashboard"));
const HRDashboard_1 = __importDefault(require("./HRDashboard"));
const FinanceDashboard_1 = __importDefault(require("./FinanceDashboard"));
const CSRDashboard_1 = __importDefault(require("./CSRDashboard"));
const DeliveryCoordinatorDashboard_1 = __importDefault(require("./DeliveryCoordinatorDashboard"));
function RoleSpecificDashboard() {
    const { user } = (0, auth_context_1.useAuth)();
    if (!user) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>);
    }
    // Map roles to their specific dashboards
    const roleDashboardMap = {
        'admin': <AdminDashboard_1.default />,
        'manager': <ManagerDashboard_1.default />,
        'designer': <DesignerDashboard_1.default />,
        'cutting_supervisor': <CuttingOperatorDashboard_1.default />,
        'cutting_operator': <CuttingOperatorDashboard_1.default />,
        'printing_supervisor': <PrintingOperatorDashboard_1.default />,
        'sewing_supervisor': <SewingOperatorDashboard_1.default />,
        'sewing_operator': <SewingOperatorDashboard_1.default />,
        'qc_inspector': <QCInspectorDashboard_1.default />,
        'warehouse_staff': <WarehouseDashboard_1.default />,
        'delivery_coordinator': <DeliveryCoordinatorDashboard_1.default />,
        'hr_staff': <HRDashboard_1.default />,
        'finance_staff': <FinanceDashboard_1.default />,
        'csr': <CSRDashboard_1.default />
    };
    const DashboardComponent = roleDashboardMap[user.role] || AdminDashboard_1.default;
    return (<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.position} Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {user.name} • {user.department}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user.role}
            </span>
            <button onClick={() => {
            localStorage.removeItem('ash_token');
            localStorage.removeItem('ash_user');
            window.location.href = '/login';
        }} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Role-specific content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {DashboardComponent}
      </main>
    </div>);
}

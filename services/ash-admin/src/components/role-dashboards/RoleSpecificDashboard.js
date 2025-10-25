"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RoleSpecificDashboard;
const auth_context_1 = require("../../lib/auth-context");
const react_1 = require("react");
const loading_skeletons_1 = require("@/components/ui/loading-skeletons");
// TEMPORARY: Direct import instead of lazy loading for debugging
const AdminDashboard_1 = __importDefault(require("./AdminDashboard"));
// const AdminDashboard = lazy(() => import("./AdminDashboard"));
const ManagerDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./ManagerDashboard"))));
const DesignerDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./DesignerDashboard"))));
const CuttingOperatorDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./CuttingOperatorDashboard"))));
const PrintingOperatorDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./PrintingOperatorDashboard"))));
const SewingOperatorDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./SewingOperatorDashboard"))));
const QCInspectorDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./QCInspectorDashboard"))));
const WarehouseDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./WarehouseDashboard"))));
const HRDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./HRDashboard"))));
const FinanceDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./FinanceDashboard"))));
const CSRDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./CSRDashboard"))));
const DeliveryCoordinatorDashboard = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require("./DeliveryCoordinatorDashboard"))));
// Professional loading component
const DashboardLoader = () => <loading_skeletons_1.DashboardStatsSkeleton />;
function RoleSpecificDashboard() {
    const { user, isLoading } = (0, auth_context_1.useAuth)();
    // Show loading state while checking auth
    if (isLoading) {
        return (<div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"/>
          <p className="text-base font-medium text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>);
    }
    // If not loading and no user, redirect to login
    if (!user) {
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        return null;
    }
    // Map roles to their specific dashboards
    const roleDashboardMap = {
        SUPER_ADMIN: <AdminDashboard_1.default />,
        ADMIN: <AdminDashboard_1.default />,
        admin: <AdminDashboard_1.default />,
        MANAGER: <ManagerDashboard />,
        manager: <ManagerDashboard />,
        designer: <DesignerDashboard />,
        cutting_supervisor: <CuttingOperatorDashboard />,
        cutting_operator: <CuttingOperatorDashboard />,
        printing_supervisor: <PrintingOperatorDashboard />,
        sewing_supervisor: <SewingOperatorDashboard />,
        sewing_operator: <SewingOperatorDashboard />,
        qc_inspector: <QCInspectorDashboard />,
        warehouse_staff: <WarehouseDashboard />,
        delivery_coordinator: <DeliveryCoordinatorDashboard />,
        hr_staff: <HRDashboard />,
        finance_staff: <FinanceDashboard />,
        csr: <CSRDashboard />,
    };
    const DashboardComponent = roleDashboardMap[user.role] || <AdminDashboard_1.default />;
    return (<div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="border-b border-border bg-card px-6 py-5 shadow-sm">
        <div className="responsive-flex">
          <div className="min-w-0 flex-1">
            <h1 className="responsive-heading truncate text-foreground">
              {user.position || "Dashboard"}
            </h1>
            <p className="mt-1 truncate text-sm font-medium text-muted-foreground sm:text-base">
              Welcome back, {user.name || user.email}
              {user.department && (<span className="hide-mobile"> • {user.department}</span>)}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary shadow-sm">
              {user.role || "user"}
            </span>
          </div>
        </div>
      </header>

      {/* Role-specific content with Suspense for lazy loading */}
      <main className="responsive-container responsive-padding">
        <react_1.Suspense fallback={<DashboardLoader />}>{DashboardComponent}</react_1.Suspense>
      </main>
    </div>);
}

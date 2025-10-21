"use client";

import { useAuth } from "../../lib/auth-context";
import { Suspense, lazy } from "react";
import { DashboardStatsSkeleton } from "@/components/ui/loading-skeletons";

// Lazy load dashboard components for better performance
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const ManagerDashboard = lazy(() => import("./ManagerDashboard"));
const DesignerDashboard = lazy(() => import("./DesignerDashboard"));
const CuttingOperatorDashboard = lazy(
  () => import("./CuttingOperatorDashboard")
);
const PrintingOperatorDashboard = lazy(
  () => import("./PrintingOperatorDashboard")
);
const SewingOperatorDashboard = lazy(() => import("./SewingOperatorDashboard"));
const QCInspectorDashboard = lazy(() => import("./QCInspectorDashboard"));
const WarehouseDashboard = lazy(() => import("./WarehouseDashboard"));
const HRDashboard = lazy(() => import("./HRDashboard"));
const FinanceDashboard = lazy(() => import("./FinanceDashboard"));
const CSRDashboard = lazy(() => import("./CSRDashboard"));
const DeliveryCoordinatorDashboard = lazy(
  () => import("./DeliveryCoordinatorDashboard")
);

// Professional loading component
const DashboardLoader = () => <DashboardStatsSkeleton />;

export default function RoleSpecificDashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-corporate-blue" />
          <p className="text-base font-medium text-gray-700">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Map roles to their specific dashboards
  const roleDashboardMap: Record<string, JSX.Element> = {
    ADMIN: <AdminDashboard />,
    admin: <AdminDashboard />,
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

  const DashboardComponent = roleDashboardMap[user.role] || <AdminDashboard />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Professional Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1
              className="truncate text-2xl font-bold text-gray-900 sm:text-3xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              {user.position || "Dashboard"}
            </h1>
            <p className="mt-1 truncate text-sm font-medium text-gray-600 sm:text-base">
              Welcome back, {user.name || user.email}
              {user.department && (
                <span className="hidden sm:inline"> • {user.department}</span>
              )}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
            <span
              className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm"
              style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}
            >
              {user.role || "user"}
            </span>
          </div>
        </div>
      </header>

      {/* Role-specific content with Suspense for lazy loading */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Suspense fallback={<DashboardLoader />}>{DashboardComponent}</Suspense>
      </main>
    </div>
  );
}

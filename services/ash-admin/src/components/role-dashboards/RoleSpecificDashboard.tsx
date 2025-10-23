"use client";

import { useAuth } from "../../lib/auth-context";
import { Suspense, lazy } from "react";
import { DashboardStatsSkeleton } from "@/components/ui/loading-skeletons";

// TEMPORARY: Direct import instead of lazy loading for debugging
import AdminDashboard from "./AdminDashboard";
// const AdminDashboard = lazy(() => import("./AdminDashboard"));
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
  const { user, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-base font-medium text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // If not loading and no user, redirect to login
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  // Map roles to their specific dashboards
  const roleDashboardMap: Record<string, JSX.Element> = {
    SUPER_ADMIN: <AdminDashboard />,
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
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="border-b border-border bg-card px-6 py-5 shadow-sm">
        <div className="responsive-flex">
          <div className="min-w-0 flex-1">
            <h1 className="responsive-heading truncate text-foreground">
              {user.position || "Dashboard"}
            </h1>
            <p className="mt-1 truncate text-sm font-medium text-muted-foreground sm:text-base">
              Welcome back, {user.name || user.email}
              {user.department && (
                <span className="hide-mobile"> • {user.department}</span>
              )}
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
        <Suspense fallback={<DashboardLoader />}>{DashboardComponent}</Suspense>
      </main>
    </div>
  );
}

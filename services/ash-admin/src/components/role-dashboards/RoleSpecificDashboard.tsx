'use client'

import { useAuth } from '../../lib/auth-context'
import { Suspense, lazy } from 'react'
import { DashboardStatsSkeleton } from '@/components/ui/loading-skeletons'

// Lazy load dashboard components for better performance
const AdminDashboard = lazy(() => import('./AdminDashboard'))
const ManagerDashboard = lazy(() => import('./ManagerDashboard'))
const DesignerDashboard = lazy(() => import('./DesignerDashboard'))
const CuttingOperatorDashboard = lazy(() => import('./CuttingOperatorDashboard'))
const PrintingOperatorDashboard = lazy(() => import('./PrintingOperatorDashboard'))
const SewingOperatorDashboard = lazy(() => import('./SewingOperatorDashboard'))
const QCInspectorDashboard = lazy(() => import('./QCInspectorDashboard'))
const WarehouseDashboard = lazy(() => import('./WarehouseDashboard'))
const HRDashboard = lazy(() => import('./HRDashboard'))
const FinanceDashboard = lazy(() => import('./FinanceDashboard'))
const CSRDashboard = lazy(() => import('./CSRDashboard'))
const DeliveryCoordinatorDashboard = lazy(() => import('./DeliveryCoordinatorDashboard'))

// Professional loading component
const DashboardLoader = () => (
  <DashboardStatsSkeleton />
)

export default function RoleSpecificDashboard() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-corporate-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-base font-medium text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Map roles to their specific dashboards
  const roleDashboardMap: Record<string, JSX.Element> = {
    'ADMIN': <AdminDashboard />,
    'admin': <AdminDashboard />,
    'MANAGER': <ManagerDashboard />,
    'manager': <ManagerDashboard />,
    'designer': <DesignerDashboard />,
    'cutting_supervisor': <CuttingOperatorDashboard />,
    'cutting_operator': <CuttingOperatorDashboard />,
    'printing_supervisor': <PrintingOperatorDashboard />,
    'sewing_supervisor': <SewingOperatorDashboard />,
    'sewing_operator': <SewingOperatorDashboard />,
    'qc_inspector': <QCInspectorDashboard />,
    'warehouse_staff': <WarehouseDashboard />,
    'delivery_coordinator': <DeliveryCoordinatorDashboard />,
    'hr_staff': <HRDashboard />,
    'finance_staff': <FinanceDashboard />,
    'csr': <CSRDashboard />
  }

  const DashboardComponent = roleDashboardMap[user.role] || <AdminDashboard />

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate" style={{ letterSpacing: '-0.02em' }}>
              {user.position || 'Dashboard'}
            </h1>
            <p className="text-sm sm:text-base font-medium text-gray-600 truncate mt-1">
              Welcome back, {user.name || user.email}
              {user.department && <span className="hidden sm:inline"> • {user.department}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              {user.role || 'user'}
            </span>
          </div>
        </div>
      </header>

      {/* Role-specific content with Suspense for lazy loading */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Suspense fallback={<DashboardLoader />}>
          {DashboardComponent}
        </Suspense>
      </main>
    </div>
  )
}
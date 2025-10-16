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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Responsive */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {user.position || 'Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
              Welcome back, {user.name || user.email}
              {user.department && <span className="hidden sm:inline"> • {user.department}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
              {user.role || 'user'}
            </span>
            <button
              onClick={() => {
                localStorage.removeItem('ash_token')
                localStorage.removeItem('ash_user')
                window.location.href = '/login'
              }}
              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Role-specific content with Suspense for lazy loading */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Suspense fallback={<DashboardLoader />}>
          {DashboardComponent}
        </Suspense>
      </main>
    </div>
  )
}
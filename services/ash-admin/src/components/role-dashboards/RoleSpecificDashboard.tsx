'use client'

import { useAuth } from '../../lib/auth-context'
import { Suspense, lazy } from 'react'

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

// Loading component
const DashboardLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading dashboard content...</p>
    </div>
  </div>
)

export default function RoleSpecificDashboard() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.position || 'Dashboard'}</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {user.name || user.email}
              {user.department && ` • ${user.department}`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user.role || 'user'}
            </span>
            <button
              onClick={() => {
                localStorage.removeItem('ash_token')
                localStorage.removeItem('ash_user')
                window.location.href = '/login'
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Role-specific content with Suspense for lazy loading */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Suspense fallback={<DashboardLoader />}>
          {DashboardComponent}
        </Suspense>
      </main>
    </div>
  )
}
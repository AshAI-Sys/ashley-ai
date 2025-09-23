'use client'

import { useAuth } from '../../lib/auth-context'
import { User } from '../../lib/permissions'
import DashboardLayout from '@/components/dashboard-layout'
import RouteGuard from '@/components/route-guard'
import RoleWidgets from '@/components/dashboard/role-widgets'
import RoleActivities from '@/components/dashboard/role-activities'

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // RouteGuard will handle redirect
  }

  // Transform user to permissions User interface
  const permUser: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as any,
    position: user.position || '',
    department: user.department || 'Administration',
    permissions: user.permissions || {}
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'manager': return 'Manager'
      case 'supervisor': return 'Supervisor'
      case 'operator': return 'Operator'
      case 'employee': return 'Employee'
      default: return 'Employee'
    }
  }

  return (
    <RouteGuard>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.name} • {getRoleDisplayName(user.role)} • {user.department}
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Role-specific Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <RoleWidgets user={permUser} />
            </div>

            {/* Role-specific Recent Activities */}
            <RoleActivities user={permUser} />
          </main>
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}
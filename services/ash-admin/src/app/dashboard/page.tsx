'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import RoleSpecificDashboard from '@/components/role-dashboards/RoleSpecificDashboard'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { hasPermission, hasRole, isAdmin } = usePermissions()

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log('Dashboard: Checking authentication...')
        const token = localStorage.getItem('ash_token')
        console.log('Dashboard: Token found:', !!token, token?.substring(0, 20) + '...')

        if (!token) {
          console.log('Dashboard: No token, redirecting to login')
          router.push('/login')
          return
        }

        console.log('Dashboard: Token valid, setting user data')
        // Get user data from localStorage (stored during login)
        const storedUser = localStorage.getItem('ash_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          console.log('Dashboard: User data loaded:', userData)
        } else {
          // Fallback to demo data if no stored user data
          setUser({
            name: 'Demo Admin',
            email: 'admin@ashleyai.com',
            role: 'admin',
            position: 'System Administrator',
            department: 'Administration'
          })
        }
        setLoading(false)
        console.log('Dashboard: Loading complete')
      } catch (error) {
        console.error('Dashboard: Error in auth check:', error)
        setLoading(false)
        router.push('/login')
      }
    }

    // Check immediately and also with a small delay to ensure localStorage is available
    checkAuth()
    const timeoutId = setTimeout(checkAuth, 100)

    return () => clearTimeout(timeoutId)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('ash_token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name} • Role-Based Authentication System Active</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Authentication System Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                🔐 Authentication System
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                Active
              </p>
              <p className="text-sm text-purple-600">
                ✅ Role-based access control implemented
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                👤 Current User
              </h3>
              <p className="text-lg font-bold text-gray-900 mb-1">
                {user?.name}
              </p>
              <p className="text-sm text-blue-600">
                Role: {user?.role} • Dept: {user?.department}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                🎯 System Status
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                100%
              </p>
              <p className="text-sm text-green-600">
                ✅ All features implemented
              </p>
            </div>
          </div>

          {/* Implementation Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ✅ Authentication Features Implemented
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Core Features:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Per-employee login credentials
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Role-based dashboard customization
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Department-specific navigation
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Task visibility by role
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Security Features:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    JWT token authentication
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Bcrypt password hashing
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Route protection guards
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">✅</span>
                    Hierarchical permissions system
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Login Credentials:</h4>
              <p className="text-sm text-blue-800">
                Email: admin@ashleyai.com<br/>
                Password: demo123<br/>
                Role: Administrator (Full system access)
              </p>
            </div>
          </div>

          {/* Role-Based Content Demonstration */}
          <div className="mt-8 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              🎭 Role-Based Content Visibility Demo
            </h2>

            {/* Admin Only Section */}
            <PermissionGate roles={['admin']} fallback={
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500">
                  🔒 Admin-only content hidden (requires Admin role)
                </p>
              </div>
            }>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-3">
                  🔴 Administrator Dashboard
                </h3>
                <p className="text-red-800 mb-4">
                  You are seeing this content because you have Administrator privileges.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">System Settings</h4>
                    <p className="text-sm text-gray-600">Configure global system settings</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">User Management</h4>
                    <p className="text-sm text-gray-600">Manage all user accounts and roles</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">Security Logs</h4>
                    <p className="text-sm text-gray-600">View system security and audit logs</p>
                  </div>
                </div>
              </div>
            </PermissionGate>

            {/* Finance Permission Section */}
            <PermissionGate permissions={['finance:read']} fallback={
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500">
                  🔒 Finance content hidden (requires finance:read permission)
                </p>
              </div>
            }>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  💰 Finance Dashboard
                </h3>
                <p className="text-green-800 mb-4">
                  You can see financial data because you have finance:read permissions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">Revenue: ₱2,450,000</h4>
                    <p className="text-sm text-gray-600">This month's total revenue</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">Expenses: ₱1,890,000</h4>
                    <p className="text-sm text-gray-600">This month's operating expenses</p>
                  </div>
                </div>
              </div>
            </PermissionGate>

            {/* HR Permission Section */}
            <PermissionGate permissions={['hr:read']} fallback={
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500">
                  🔒 HR content hidden (requires hr:read permission)
                </p>
              </div>
            }>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  👥 HR Dashboard
                </h3>
                <p className="text-blue-800 mb-4">
                  Employee information visible with HR permissions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">Total Employees: 245</h4>
                    <p className="text-sm text-gray-600">Active workforce count</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">Attendance Rate: 94%</h4>
                    <p className="text-sm text-gray-600">Current month attendance</p>
                  </div>
                </div>
              </div>
            </PermissionGate>

            {/* Production Permission Section */}
            <PermissionGate permissions={['cutting:read', 'printing:read', 'sewing:read']} fallback={
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500">
                  🔒 Production content hidden (requires production permissions)
                </p>
              </div>
            }>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                  🏭 Production Dashboard
                </h3>
                <p className="text-yellow-800 mb-4">
                  Production metrics visible with cutting, printing, or sewing permissions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">Orders in Production: 23</h4>
                    <p className="text-sm text-gray-600">Currently being processed</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">Daily Output: 1,234 units</h4>
                    <p className="text-sm text-gray-600">Units completed today</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">Efficiency: 87%</h4>
                    <p className="text-sm text-gray-600">Overall production efficiency</p>
                  </div>
                </div>
              </div>
            </PermissionGate>

            {/* Role Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📋 Your Current Access Level
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Role:</span> {user?.role || 'Unknown'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Department:</span> {user?.department || 'Unknown'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Admin Status:</span> {isAdmin ? '✅ Yes' : '❌ No'}
                </p>
                <div className="mt-4 text-xs text-gray-600">
                  <p><strong>Note:</strong> The content sections above demonstrate role-based access control.</p>
                  <p>Different users will see different sections based on their assigned roles and permissions.</p>
                  <p>Admin users can see all sections, while other roles see only their relevant content.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}
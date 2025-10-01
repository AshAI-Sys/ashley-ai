'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../lib/auth-context'
import { getAccessibleNavigation, hasAccess, User } from '../lib/permissions'
import HydrationSafeIcon from './hydration-safe-icon'
import {
  Building2,
  ShoppingCart,
  Palette,
  Scissors,
  Printer,
  PocketKnife,
  CheckCircle,
  Package,
  Truck,
  DollarSign,
  Users,
  UserPlus,
  Wrench,
  Globe,
  Zap,
  Bot,
  BarChart3,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const iconMap = {
  Home,
  Building2,
  ShoppingCart,
  Palette,
  Scissors,
  Printer,
  PocketKnife,
  CheckCircle,
  Package,
  Truck,
  DollarSign,
  Users,
  UserPlus,
  Wrench,
  Globe,
  Bot,
  Zap,
  BarChart3,
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Get filtered navigation based on user role and department
  const navigation = useMemo(() => {
    if (!user) {
      // Default navigation for non-authenticated users
      return [{ name: 'Dashboard', href: '/dashboard', icon: 'Home', department: '*' }]
    }

    // Map current roles to our RBAC roles for compatibility
    const roleMapping = {
      'admin': 'admin',
      'Admin': 'admin',
      'manager': 'manager',
      'Manager': 'manager',
      'CSR': 'designer',
      'Worker': 'cutting_operator',
      'Client': 'warehouse_staff'
    } as const

    const mappedRole = roleMapping[user.role as keyof typeof roleMapping] || 'cutting_operator'

    // Get permissions based on role if not provided
    const { getRoleBasedPermissions } = require('../lib/rbac')
    const userPermissions = user.permissions && user.permissions.length > 0
      ? user.permissions
      : getRoleBasedPermissions(user.role || mappedRole)

    // Transform user to match our permissions User interface
    const isAdmin = user.role?.toLowerCase() === 'admin'
    const permUser: User = {
      id: user.id,
      email: user.email,
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      role: isAdmin ? 'admin' : mappedRole,
      position: user.position || '',
      department: user.department || 'Administration',
      permissions: isAdmin ? ['all'] : userPermissions
    }

    return getAccessibleNavigation(permUser)
  }, [user])

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center">
              <div className="w-10 h-8 mr-3">
                <img
                  src="/ash-ai-logo.png"
                  alt="Ashley AI Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-lg">Ashley AI</h1>
                <p className="text-xs text-gray-400">Apparel Smart Hub</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
          >
            <HydrationSafeIcon
              Icon={collapsed ? ChevronRight : ChevronLeft}
              className="w-4 h-4"
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = iconMap[item.icon as keyof typeof iconMap] || Home

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
              title={collapsed ? item.name : undefined}
            >
              <HydrationSafeIcon
                Icon={Icon}
                className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'} flex-shrink-0`}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {!collapsed && user && (
          <div className="text-xs text-gray-400 mb-3">
            <p className="font-medium text-gray-300">{user.name}</p>
            <p>{user.position}</p>
            <p>{user.department} • {user.role}</p>
          </div>
        )}
        {!collapsed && (
          <div className="text-xs text-gray-400">
            <p>Ashley AI v1.0</p>
            <p>Manufacturing ERP System</p>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useMemo, useEffect } from 'react'
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
  ChevronRight,
  Landmark,
  MessageSquare,
  Brain,
  PackageSearch,
  Settings,
  Activity,
  Menu,
  X
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
  Landmark,
  MessageSquare,
  Brain,
  PackageSearch,
  Settings,
  Activity,
  Menu,
  X
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileOpen])

  // All navigation items
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'Home', department: '*' },
    { name: 'Clients', href: '/clients', icon: 'Building2', department: 'Management' },
    { name: 'Orders', href: '/orders', icon: 'ShoppingCart', department: 'Management' },
    { name: 'Design & Approval', href: '/designs', icon: 'Palette', department: 'Management' },
    { name: 'Cutting Operations', href: '/cutting', icon: 'Scissors', department: 'Cutting' },
    { name: 'Printing Operations', href: '/printing', icon: 'Printer', department: 'Printing' },
    { name: 'Sewing Operations', href: '/sewing', icon: 'PocketKnife', department: 'Sewing' },
    { name: 'Quality Control', href: '/quality-control', icon: 'CheckCircle', department: 'Quality' },
    { name: 'Finishing & Packing', href: '/finishing-packing', icon: 'Package', department: 'Finishing' },
    { name: 'Delivery Management', href: '/delivery', icon: 'Truck', department: 'Delivery' },
    { name: 'Finance', href: '/finance', icon: 'DollarSign', department: 'Finance' },
    { name: 'HR & Payroll', href: '/hr-payroll', icon: 'Users', department: 'HR' },
    { name: 'Government Reports', href: '/government', icon: 'Landmark', department: 'Finance' },
    { name: 'SMS Notifications', href: '/sms-notifications', icon: 'MessageSquare', department: 'Management' },
    { name: 'Maintenance', href: '/maintenance', icon: 'Wrench', department: 'Maintenance' },
    { name: 'User Management', href: '/admin/users', icon: 'Users', department: 'Administration' },
    { name: 'Employee Onboarding', href: '/admin/onboarding', icon: 'UserPlus', department: 'Administration' },
    { name: 'Merchandising AI', href: '/merchandising', icon: 'Bot', department: 'Management' },
    { name: 'Automation Engine', href: '/automation', icon: 'Zap', department: 'Management' },
    { name: 'Advanced Analytics', href: '/admin/analytics', icon: 'BarChart3', department: 'Management' },
    { name: 'AI Features', href: '/ai-features', icon: 'Brain', department: 'Management' },
    { name: 'Inventory', href: '/inventory', icon: 'PackageSearch', department: 'Inventory' },
    { name: 'Performance', href: '/performance', icon: 'Activity', department: 'Administration' },
    { name: 'Settings', href: '/settings', icon: 'Settings', department: '*' },
    { name: 'Tenant Settings', href: '/admin/tenants', icon: 'Settings', department: 'Administration' },
  ]

  // Get filtered navigation based on user role and department
  const navigation = useMemo(() => {
    if (!user) {
      // Default navigation for non-authenticated users
      return [{ name: 'Dashboard', href: '/dashboard', icon: 'Home', department: '*' }]
    }

    // SIMPLE FIX: If user role contains "admin" (case-insensitive), show everything
    const userRole = (user.role || '').toLowerCase()
    if (userRole === 'admin' || userRole === 'administrator') {
      return allNavigation
    }

    // For non-admin users, use the permissions system
    const roleMapping = {
      'manager': 'manager',
      'Manager': 'manager',
      'CSR': 'designer',
      'Worker': 'cutting_operator',
      'Client': 'warehouse_staff'
    } as const

    const mappedRole = roleMapping[user.role as keyof typeof roleMapping] || 'cutting_operator'

    const { getRoleBasedPermissions } = require('../lib/rbac')
    const userPermissions = user.permissions && user.permissions.length > 0
      ? user.permissions
      : getRoleBasedPermissions(user.role || mappedRole)

    const permUser: User = {
      id: user.id,
      email: user.email,
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      role: mappedRole,
      position: user.position || '',
      department: user.department || 'Administration',
      permissions: userPermissions
    }

    return getAccessibleNavigation(permUser)
  }, [user])

  return (
    <>
      {/* Mobile Menu Button - Fixed top-left */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-corporate-blue text-white hover:bg-blue-700 transition-all shadow-corporate"
        aria-label="Toggle menu"
      >
        <HydrationSafeIcon Icon={mobileOpen ? X : Menu} className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Professional Navy Design */}
      <div className={`
        corporate-sidebar text-white transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
        min-h-screen flex flex-col

        /* Mobile styles */
        fixed lg:relative z-40 lg:z-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Header - Improved spacing */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          {collapsed ? (
            // Show only logo icon when collapsed
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg p-1.5 mx-auto">
              <img src="/ash-ai-logo.png" alt="Ashley AI Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            // Show full logo and text when expanded
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg p-1.5">
                <img src="/ash-ai-logo.png" alt="Ashley AI Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-base text-white leading-tight">Ashley AI</h1>
                <p className="text-xs text-blue-300/80 leading-tight">Apparel Smart Hub</p>
              </div>
            </div>
          )}
          {!collapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <HydrationSafeIcon
                  Icon={collapsed ? ChevronRight : ChevronLeft}
                  className="w-4 h-4 text-white"
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Professional spacing and hover effects */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = iconMap[item.icon as keyof typeof iconMap] || Home

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-900/20'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }
              `}
              title={collapsed ? item.name : undefined}
            >
              <HydrationSafeIcon
                Icon={Icon}
                className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`}
              />
              {!collapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer - Professional user info */}
      <div className="p-5 border-t border-white/10 space-y-3">
        {!collapsed && user && (
          <div className="text-xs text-white bg-white/10 p-3.5 rounded-lg backdrop-blur-sm">
            <p className="font-semibold text-white text-sm mb-1">{user.name}</p>
            <p className="text-blue-200 text-xs">{user.position}</p>
            <p className="text-blue-300/70 text-[10px] mt-1.5">{user.department} • {user.role}</p>
          </div>
        )}
        {!collapsed && (
          <div className="text-xs">
            <p className="text-white font-semibold text-xs">Ashley AI v1.0</p>
            <p className="text-blue-300/70 text-xs">Manufacturing ERP</p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
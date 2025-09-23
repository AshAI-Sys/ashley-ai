'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Wrench,
  Globe,
  Zap,
  Bot,
  BarChart3,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Design & Approval', href: '/designs', icon: Palette },
  { name: 'Cutting Operations', href: '/cutting', icon: Scissors },
  { name: 'Printing Operations', href: '/printing', icon: Printer },
  { name: 'Sewing Operations', href: '/sewing', icon: PocketKnife },
  { name: 'Quality Control', href: '/quality-control', icon: CheckCircle },
  { name: 'Finishing & Packing', href: '/finishing-packing', icon: Package },
  { name: 'Delivery Management', href: '/delivery', icon: Truck },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'HR & Payroll', href: '/hr-payroll', icon: Users },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Client Portal', href: '/client-portal', icon: Globe },
  { name: 'Merchandising AI', href: '/merchandising-ai', icon: Bot },
  { name: 'Automation Engine', href: '/automation', icon: Zap },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center">
              <div className="w-10 h-8 mr-3">
                <img
                  src="/ash-ai-logo.svg"
                  alt="Ash-AI Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-lg">Ash-AI</h1>
                <p className="text-xs text-gray-400">Manufacturing ERP</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

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
              <Icon className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'} flex-shrink-0`} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
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
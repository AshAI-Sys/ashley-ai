'use client'

import React from 'react'
import Link from 'next/link'
import {
  Home,
  Package,
  Scissors,
  Printer,
  Shirt,
  Shield,
  Truck,
  DollarSign,
  Users,
  Settings,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Wrench
} from 'lucide-react'

const sidebarItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/orders', icon: ClipboardList, label: 'Orders' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/designs', icon: Package, label: 'Designs' },
  { href: '/cutting', icon: Scissors, label: 'Cutting' },
  { href: '/printing', icon: Printer, label: 'Printing' },
  { href: '/sewing', icon: Shirt, label: 'Sewing' },
  { href: '/quality-control', icon: Shield, label: 'Quality Control' },
  { href: '/finishing-packing', icon: Package, label: 'Finishing & Packing' },
  { href: '/delivery', icon: Truck, label: 'Delivery' },
  { href: '/finance', icon: DollarSign, label: 'Finance' },
  { href: '/hr-payroll', icon: Users, label: 'HR & Payroll' },
  { href: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { href: '/merchandising', icon: TrendingUp, label: 'Merchandising AI' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">ASH AI</h1>
        <p className="text-sm text-gray-600">Manufacturing ERP</p>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

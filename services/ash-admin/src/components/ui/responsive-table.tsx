'use client'

import { ReactNode } from 'react'

interface ResponsiveTableProps {
  children: ReactNode
  className?: string
}

/**
 * ResponsiveTable - Wraps tables for horizontal scroll on mobile
 * Usage: <ResponsiveTable><table>...</table></ResponsiveTable>
 */
export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <div className={`w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 ${className}`}>
      <div className="inline-block min-w-full align-middle">
        {children}
      </div>
    </div>
  )
}

interface MobileCardProps {
  children: ReactNode
  className?: string
}

/**
 * MobileCard - Card view for mobile devices
 * Shows table data as stacked cards on small screens
 */
export function MobileCard({ children, className = '' }: MobileCardProps) {
  return (
    <div className={`
      block lg:hidden
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-lg p-4 mb-3
      shadow-sm hover:shadow-md transition-shadow
      ${className}
    `}>
      {children}
    </div>
  )
}

interface MobileCardRowProps {
  label: string
  value: ReactNode
  className?: string
}

/**
 * MobileCardRow - Single row in a mobile card
 */
export function MobileCardRow({ label, value, className = '' }: MobileCardRowProps) {
  return (
    <div className={`flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-0 ${className}`}>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-4">
        {label}:
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100 text-right flex-1">
        {value}
      </span>
    </div>
  )
}

interface DesktopTableProps {
  children: ReactNode
  className?: string
}

/**
 * DesktopTable - Hidden on mobile, shown on desktop
 */
export function DesktopTable({ children, className = '' }: DesktopTableProps) {
  return (
    <div className={`hidden lg:block ${className}`}>
      <ResponsiveTable>
        {children}
      </ResponsiveTable>
    </div>
  )
}

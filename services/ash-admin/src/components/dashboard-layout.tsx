'use client'

import Sidebar from './sidebar'
import TopNavbar from './top-navbar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-corporate-bg dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-auto pt-16 lg:pt-0 bg-corporate-bg dark:bg-gray-900">
          {/* pt-16 on mobile to account for hamburger menu button */}
          {children}
        </main>
      </div>
    </div>
  )
}
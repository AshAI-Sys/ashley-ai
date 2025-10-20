'use client'

import { useEffect } from 'react'
import Sidebar from './sidebar'
import TopNavbar from './top-navbar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // FORCE LIGHT MODE - Remove any dark mode classes on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    }
  }, [])

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F8FAFC', colorScheme: 'light' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-auto pt-16 lg:pt-0" style={{ backgroundColor: '#F8FAFC' }}>
          {/* pt-16 on mobile to account for hamburger menu button */}
          {children}
        </main>
      </div>
    </div>
  )
}
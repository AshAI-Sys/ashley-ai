'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Settings,
  User,
  Lock,
  Building2,
  Bell,
  Palette,
  Shield,
  Monitor,
  FileText,
  ChevronRight
} from 'lucide-react'

const settingsNav = [
  {
    title: 'General',
    href: '/settings',
    icon: Settings,
    description: 'Profile, timezone, and language'
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: User,
    description: 'Name, email, and avatar'
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
    description: 'Two-factor authentication'
  },
  {
    title: 'Password',
    href: '/settings/password',
    icon: Lock,
    description: 'Change your password'
  },
  {
    title: 'Workspace',
    href: '/settings/workspace',
    icon: Building2,
    description: 'Company info and settings'
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Email, SMS, and push preferences'
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: Palette,
    description: 'Theme and display options'
  },
  {
    title: 'Sessions',
    href: '/settings/sessions',
    icon: Monitor,
    description: 'Manage active sessions'
  },
  {
    title: 'Audit Logs',
    href: '/settings/audit-logs',
    icon: FileText,
    description: 'Security events and changes'
  }
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="space-y-1">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-start gap-3 px-4 py-3 rounded-lg transition-all
                      ${isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.title}</span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

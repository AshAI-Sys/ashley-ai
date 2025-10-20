'use client'

import { useState, useEffect } from 'react'
import { Save, Bell, Mail, Smartphone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

interface NotificationPreference {
  email: boolean
  sms: boolean
  push: boolean
  in_app: boolean
}

interface NotificationSettings {
  orders: NotificationPreference
  production: NotificationPreference
  quality: NotificationPreference
  delivery: NotificationPreference
  finance: NotificationPreference
  hr: NotificationPreference
  maintenance: NotificationPreference
  system: NotificationPreference
}

export default function NotificationPreferencesPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    orders: { email: true, sms: false, push: true, in_app: true },
    production: { email: true, sms: false, push: true, in_app: true },
    quality: { email: true, sms: true, push: true, in_app: true },
    delivery: { email: true, sms: false, push: true, in_app: true },
    finance: { email: true, sms: false, push: false, in_app: true },
    hr: { email: false, sms: false, push: false, in_app: true },
    maintenance: { email: true, sms: false, push: true, in_app: true },
    system: { email: true, sms: false, push: true, in_app: true }
  })

  useEffect(() => {
    fetchNotificationSettings()
  }, [])

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/settings/notifications')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error)
    }
  }

  const handleToggle = (category: keyof NotificationSettings, channel: keyof NotificationPreference) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [channel]: !settings[category][channel]
      }
    })
  }

  const handleSelectAll = (channel: keyof NotificationPreference, value: boolean) => {
    const updatedSettings = { ...settings }
    Object.keys(updatedSettings).forEach((key) => {
      updatedSettings[key as keyof NotificationSettings][channel] = value
    })
    setSettings(updatedSettings)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        throw new Error('Failed to update notification preferences')
      }

      toast.success('Notification preferences updated successfully!')
    } catch (error) {
      toast.error('Failed to update notification preferences')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { key: 'orders' as const, label: 'Orders & Intake', description: 'New orders, status changes, approvals' },
    { key: 'production' as const, label: 'Production', description: 'Cutting, printing, sewing updates' },
    { key: 'quality' as const, label: 'Quality Control', description: 'Inspections, defects, CAPA tasks' },
    { key: 'delivery' as const, label: 'Delivery', description: 'Shipments, tracking, proof of delivery' },
    { key: 'finance' as const, label: 'Finance', description: 'Invoices, payments, expenses' },
    { key: 'hr' as const, label: 'HR & Payroll', description: 'Attendance, payroll, employee updates' },
    { key: 'maintenance' as const, label: 'Maintenance', description: 'Work orders, asset alerts, schedules' },
    { key: 'system' as const, label: 'System', description: 'Account, security, system updates' }
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Choose how you want to be notified about different events
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Channels Header */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Category
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex flex-col items-center gap-1">
                    <Mail className="w-5 h-5" />
                    <span>Email</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll('email', true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      All
                    </button>
                  </div>
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex flex-col items-center gap-1">
                    <MessageSquare className="w-5 h-5" />
                    <span>SMS</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll('sms', true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      All
                    </button>
                  </div>
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone className="w-5 h-5" />
                    <span>Push</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll('push', true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      All
                    </button>
                  </div>
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex flex-col items-center gap-1">
                    <Bell className="w-5 h-5" />
                    <span>In-App</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll('in_app', true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      All
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.key} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {category.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {category.description}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings[category.key].email}
                      onChange={() => handleToggle(category.key, 'email')}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings[category.key].sms}
                      onChange={() => handleToggle(category.key, 'sms')}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings[category.key].push}
                      onChange={() => handleToggle(category.key, 'push')}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={settings[category.key].in_app}
                      onChange={() => handleToggle(category.key, 'in_app')}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const allOn = { ...settings }
                Object.keys(allOn).forEach((key) => {
                  allOn[key as keyof NotificationSettings] = {
                    email: true,
                    sms: true,
                    push: true,
                    in_app: true
                  }
                })
                setSettings(allOn)
              }}
            >
              Enable All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const allOff = { ...settings }
                Object.keys(allOff).forEach((key) => {
                  allOff[key as keyof NotificationSettings] = {
                    email: false,
                    sms: false,
                    push: false,
                    in_app: false
                  }
                })
                setSettings(allOff)
              }}
            >
              Disable All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll('sms', false)}
            >
              Disable All SMS
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll('email', true)}
            >
              Enable All Email
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t dark:border-gray-700">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Palette, Sun, Check, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

type Theme = 'light'
type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red'

export default function AppearanceSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [theme] = useState<Theme>('light')
  const [colorScheme, setColorScheme] = useState<ColorScheme>('blue')
  const [compactMode, setCompactMode] = useState(false)
  const [showAvatars, setShowAvatars] = useState(true)
  const [fontSize, setFontSize] = useState('medium')

  useEffect(() => {
    // FORCE LIGHT MODE
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'

    fetchAppearanceSettings()
  }, [])

  const fetchAppearanceSettings = async () => {
    try {
      const response = await fetch('/api/settings/appearance')
      if (response.ok) {
        const data = await response.json()
        setColorScheme(data.color_scheme || 'blue')
        setCompactMode(data.compact_mode || false)
        setShowAvatars(data.show_avatars !== false)
        setFontSize(data.font_size || 'medium')
      }
    } catch (error) {
      console.error('Failed to fetch appearance settings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/settings/appearance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: 'light',
          color_scheme: colorScheme,
          compact_mode: compactMode,
          show_avatars: showAvatars,
          font_size: fontSize
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update appearance settings')
      }

      toast.success('Appearance settings updated successfully!')
    } catch (error) {
      toast.error('Failed to update appearance settings')
    } finally {
      setLoading(false)
    }
  }

  const colorSchemes = [
    { value: 'blue' as const, label: 'Blue', color: 'bg-blue-600' },
    { value: 'green' as const, label: 'Green', color: 'bg-green-600' },
    { value: 'purple' as const, label: 'Purple', color: 'bg-purple-600' },
    { value: 'orange' as const, label: 'Orange', color: 'bg-orange-600' },
    { value: 'red' as const, label: 'Red', color: 'bg-red-600' }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/settings')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Settings
      </Button>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Appearance Settings</h2>
        <p className="text-gray-500 mt-1">
          Customize how Ashley AI looks and feels
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Theme Mode - Light Only */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Palette className="w-5 h-5" />
            <span>Theme Mode</span>
          </div>

          <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6">
            <div className="flex items-center justify-center mb-3">
              <Sun className="w-12 h-12 text-yellow-500" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 text-lg mb-1">Light Mode</div>
              <div className="text-sm text-gray-600">
                Ashley AI uses a professional light theme for optimal readability
              </div>
            </div>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="space-y-4 pt-6 border-t dark:border-gray-700">
          <Label>Accent Color</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.value}
                type="button"
                onClick={() => setColorScheme(scheme.value)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${colorScheme === scheme.value
                    ? 'border-gray-900 dark:border-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }
                `}
              >
                <div className={`w-12 h-12 ${scheme.color} rounded-full mx-auto mb-2`}></div>
                <div className="text-sm font-medium text-gray-900 dark:text-white text-center">
                  {scheme.label}
                </div>
                {colorScheme === scheme.value && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-gray-900 dark:text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose your preferred accent color for buttons and highlights
          </p>
        </div>

        {/* Display Options */}
        <div className="space-y-4 pt-6 border-t dark:border-gray-700">
          <Label>Display Options</Label>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Compact Mode</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Reduce spacing and padding for a denser layout
                </div>
              </div>
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Show Avatars</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Display user avatars throughout the interface
                </div>
              </div>
              <input
                type="checkbox"
                checked={showAvatars}
                onChange={(e) => setShowAvatars(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-4 pt-6 border-t dark:border-gray-700">
          <Label htmlFor="fontSize">Font Size</Label>
          <select
            id="fontSize"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="small">Small</option>
            <option value="medium">Medium (Default)</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra Large</option>
          </select>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adjust the base font size for better readability
          </p>
        </div>

        {/* Preview */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-3">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">Preview</h4>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              {showAvatars && (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
              )}
              <div>
                <div className={`font-medium text-gray-900 dark:text-white ${fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : fontSize === 'extra-large' ? 'text-xl' : 'text-base'}`}>
                  Ashley AI Manufacturing
                </div>
                <div className={`text-gray-500 dark:text-gray-400 ${fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : fontSize === 'extra-large' ? 'text-lg' : 'text-sm'}`}>
                  admin@ashleyai.com
                </div>
              </div>
            </div>
            <Button type="button" className={`w-full ${compactMode ? 'py-1 text-sm' : ''}`}>
              Sample Button
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t dark:border-gray-700">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Appearance'}
          </Button>
        </div>
      </form>
    </div>
  )
}

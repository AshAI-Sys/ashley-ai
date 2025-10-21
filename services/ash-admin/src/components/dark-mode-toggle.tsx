'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../lib/theme-context'

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="dark-mode-toggle group"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 transition-colors group-hover:text-primary" />
      ) : (
        <Sun className="w-5 h-5 text-gray-300 transition-colors group-hover:text-accent" />
      )}
    </button>
  )
}

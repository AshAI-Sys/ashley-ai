'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // FORCE LIGHT MODE ONLY - Remove any dark mode classes
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
    localStorage.setItem('ash_theme', 'light')
  }, [])

  const setTheme = () => {
    // Light mode only - do nothing
  }

  const toggleTheme = () => {
    // Light mode only - do nothing
  }

  // Always provide the context, even before mounting
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

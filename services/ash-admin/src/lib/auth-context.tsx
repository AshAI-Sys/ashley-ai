'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  position?: string
  department?: string
  permissions?: string[]
  first_name?: string
  last_name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('ash_token')
    if (storedToken) {
      setToken(storedToken)

      // Get stored user data if available
      const storedUser = localStorage.getItem('ash_user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          // Fallback to demo user
          setUser({
            id: 'demo-user-1',
            email: 'admin@ashleyai.com',
            name: 'Demo Admin',
            role: 'admin',
            position: 'System Administrator',
            department: 'Administration',
            permissions: ['*']
          })
        }
      } else {
        // Fallback to demo user if no stored user data
        setUser({
          id: 'demo-user-1',
          email: 'admin@ashleyai.com',
          name: 'Demo Admin',
          role: 'admin',
          position: 'System Administrator',
          department: 'Administration',
          permissions: ['*']
        })
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Demo mode - always succeed for demo credentials
    if (email === 'admin@ashleyai.com' && password === 'demo123') {
      const demoUser = {
        id: 'demo-user-1',
        email: 'admin@ashleyai.com',
        name: 'Demo Admin',
        role: 'admin',
        position: 'System Administrator',
        department: 'Administration',
        permissions: ['all']
      }

      const demoToken = 'demo_token_' + Date.now()

      setUser(demoUser)
      setToken(demoToken)
      localStorage.setItem('ash_token', demoToken)
      return
    }

    throw new Error('Invalid credentials')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ash_token')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


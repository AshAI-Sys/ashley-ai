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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mark component as mounted to avoid hydration mismatches
    setMounted(true)

    // Check for stored token on mount (only in browser)
    if (typeof window !== 'undefined') {
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
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await response.json()
      const { access_token, user: userData } = data

      setUser(userData)
      setToken(access_token)
      localStorage.setItem('ash_token', access_token)
      localStorage.setItem('ash_user', JSON.stringify(userData))
    } catch (error) {
      throw new Error('Invalid credentials')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ash_token')
      localStorage.removeItem('ash_user')
    }
  }

  // Don't render children until after hydration to prevent mismatches
  if (!mounted) {
    return (
      <AuthContext.Provider value={{
        user: null,
        token: null,
        login,
        logout,
        isLoading: true
      }}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AuthContext.Provider>
    )
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


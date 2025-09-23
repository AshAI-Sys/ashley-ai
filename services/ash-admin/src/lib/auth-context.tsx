'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthToken } from '@ash/types'
import { api } from './api'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string, workspaceSlug?: string) => Promise<void>
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
      api.setAuthToken(storedToken)
      
      // Verify token and get user info
      api.getCurrentUser()
        .then(({ user }) => {
          setUser(user)
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem('ash_token')
          setToken(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string, workspaceSlug?: string) => {
    try {
      const response = await api.login(email, password, workspaceSlug)
      
      setUser(response.user)
      setToken(response.access_token)
      
      // Store token
      localStorage.setItem('ash_token', response.access_token)
      api.setAuthToken(response.access_token)
      
      // TODO: Store refresh token securely
      
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ash_token')
    api.setAuthToken(null)
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


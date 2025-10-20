'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/theme-toggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState<'admin' | 'employee'>('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('ash_remember_email')
      const savedPassword = localStorage.getItem('ash_remember_password')
      if (savedEmail) {
        setEmail(savedEmail)
        setRememberMe(true)
      }
      if (savedPassword) {
        setPassword(savedPassword)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    setError('')

    try {
      const apiEndpoint = loginType === 'admin' ? '/api/auth/login' : '/api/auth/employee-login'

      console.log('[LOGIN] Attempting login as', loginType, 'to', apiEndpoint)

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('[LOGIN] Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('[LOGIN] Response data received:', { success: data.success, hasToken: !!data.access_token })

        if (data.success && data.access_token) {
          // Store authentication data
          try {
            if (loginType === 'admin') {
              localStorage.setItem('ash_token', data.access_token)
              localStorage.setItem('ash_user', JSON.stringify(data.user))
              localStorage.setItem('user_type', 'admin')
              console.log('[LOGIN] Admin data stored in localStorage')
            } else {
              localStorage.setItem('access_token', data.access_token)
              localStorage.setItem('employee_data', JSON.stringify(data.employee))
              localStorage.setItem('user_type', 'employee')
              console.log('[LOGIN] Employee data stored in localStorage')
            }

            if (rememberMe) {
              localStorage.setItem('ash_remember_email', email)
              localStorage.setItem('ash_remember_password', password)
              localStorage.setItem('ash_remember_type', loginType)
            } else {
              localStorage.removeItem('ash_remember_email')
              localStorage.removeItem('ash_remember_password')
              localStorage.removeItem('ash_remember_type')
            }
          } catch (storageError) {
            console.error('[LOGIN] localStorage error:', storageError)
            setError('Failed to store login data. Please check browser storage settings.')
            setIsLoading(false)
            return
          }

          // Show redirecting state
          setRedirecting(true)

          // Redirect with multiple fallback methods
          const redirectPath = loginType === 'admin' ? '/dashboard' : '/employee'
          console.log('[LOGIN] Attempting redirect to:', redirectPath)

          // Method 1: Try Next.js router first
          try {
            await router.push(redirectPath)
            console.log('[LOGIN] Router.push called')

            // Wait a bit, then try fallback if still on login page
            setTimeout(() => {
              if (window.location.pathname === '/login') {
                console.log('[LOGIN] Router redirect failed, trying window.location')
                window.location.href = redirectPath
              }
            }, 500)
          } catch (routerError) {
            console.error('[LOGIN] Router error:', routerError)
            // Method 2: Fallback to window.location
            window.location.href = redirectPath
          }
        } else {
          console.error('[LOGIN] Invalid response format:', data)
          setError('Login failed: Invalid response format')
          setIsLoading(false)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('[LOGIN] Login failed:', errorData)
        setError(errorData.error || 'Invalid credentials. Please try again.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('[LOGIN] Exception:', err)
      setError('Login failed. Please check your connection and try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950 flex items-center justify-center p-4 font-sans">
      {/* Redirecting Overlay */}
      {redirecting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Redirecting...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Taking you to your dashboard
            </p>
          </div>
        </div>
      )}

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="bg-white dark:bg-gray-900 p-10 rounded-xl shadow-lg w-full max-w-md border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Sign In
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Access your ASH AI Dashboard
          </p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex flex-col gap-2 mb-6">
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`w-full p-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              loginType === 'admin'
                ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Admin Login
          </button>

          <button
            type="button"
            onClick={() => setLoginType('employee')}
            className={`w-full p-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              loginType === 'employee'
                ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Employee Login
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 mr-2 cursor-pointer accent-blue-600 dark:accent-blue-500"
              />
              Remember my account
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-sm font-medium transition-all ${
              isLoading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : loginType === 'admin'
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
            } text-white`}
          >
            {isLoading ? 'Signing In...' : `Sign In as ${loginType === 'admin' ? 'Admin' : 'Employee'}`}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Create Admin Account
              </a>
            </p>
          </div>
          <div className="text-center">
            <a
              href="/"
              className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 text-sm transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

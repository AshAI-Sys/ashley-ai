'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      // FORCE LIGHT MODE - Remove any dark class from document
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')

      // Set color scheme to light
      document.documentElement.style.colorScheme = 'light'

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
    <div className="min-h-screen flex items-center justify-center p-4 font-sans light" style={{ backgroundColor: '#F8FAFC', colorScheme: 'light' }}>
        {/* Redirecting Overlay */}
      {redirecting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="corporate-card w-full max-w-sm mx-4 p-8 text-center">
            <div className="w-16 h-16 border-4 border-corporate-blue rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse bg-blue-50">
              <svg className="w-8 h-8 text-corporate-blue animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Redirecting...
            </h3>
            <p className="text-sm text-gray-600">
              Taking you to your dashboard
            </p>
          </div>
        </div>
      )}

      <div className="corporate-card p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-corporate-blue rounded-xl flex items-center justify-center mx-auto mb-4 shadow-corporate">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>
            Sign In
          </h1>
          <p className="text-base font-semibold" style={{ color: '#374151' }}>
            Access your Ashley AI Dashboard
          </p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              loginType === 'admin'
                ? 'bg-corporate-blue text-white shadow-corporate'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Admin
          </button>

          <button
            type="button"
            onClick={() => setLoginType('employee')}
            className={`flex-1 p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              loginType === 'employee'
                ? 'bg-corporate-blue text-white shadow-corporate'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Employee
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4 text-red-800 font-semibold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-lg text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-corporate-blue transition-all"
              style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3.5 pr-12 bg-white border-2 border-gray-300 rounded-lg text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-corporate-blue transition-all"
                style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900 transition-colors"
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

          <div className="mb-6 flex items-center justify-between">
            <label className="flex items-center text-sm font-semibold cursor-pointer select-none transition-colors" style={{ color: '#000000' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 mr-2 cursor-pointer accent-corporate-blue rounded"
              />
              Remember my account
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-corporate-blue hover:text-blue-700 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-sm font-semibold transition-all ${
              isLoading
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-corporate-blue text-white hover:bg-blue-700 shadow-corporate hover:shadow-corporate-hover'
            }`}
          >
            {isLoading ? 'Signing In...' : `Sign In as ${loginType === 'admin' ? 'Admin' : 'Employee'}`}
          </button>
        </form>

        <div className="pt-6 border-t border-gray-200 space-y-4">
          <div className="text-center bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <p className="text-sm font-bold mb-2" style={{ color: '#1E40AF' }}>
              🎉 New to Ashley AI?
            </p>
            <p className="text-xs mb-3" style={{ color: '#374151' }}>
              Create your workspace and start managing your manufacturing operations
            </p>
            <Link
              href="/register"
              className="inline-block w-full py-2.5 bg-corporate-blue text-white rounded-lg font-semibold text-sm hover:bg-blue-700 shadow-corporate hover:shadow-corporate-hover transition-all"
            >
              Register Your Company
            </Link>
          </div>
          <div className="text-center">
            <Link
              href="/"
              className="text-sm font-semibold transition-colors inline-flex items-center gap-1"
              style={{ color: '#374151' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

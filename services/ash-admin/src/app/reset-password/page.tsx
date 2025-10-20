'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  // Force light mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    }
  }, [])

  // Check for token
  useEffect(() => {
    if (!token) {
      setError('No reset token provided')
    }
  }, [token])

  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) errors.push('at least 8 characters')
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter')
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter')
    if (!/[0-9]/.test(password)) errors.push('one number')
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Client-side validation
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const passwordErrors = validatePassword(password)
      if (passwordErrors.length > 0) {
        throw new Error(`Password must have: ${passwordErrors.join(', ')}`)
      }

      if (!token) {
        throw new Error('No reset token provided')
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(true)
      setUserEmail(data.user?.email || '')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8FAFC', colorScheme: 'light' }}>
        <div className="corporate-card p-10 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Password Reset Successful!
            </h2>
            <p className="text-gray-700 mb-4">
              Your password has been reset successfully.
            </p>
            {userEmail && (
              <p className="text-sm text-gray-600 mb-6">
                Account: <span className="font-semibold">{userEmail}</span>
              </p>
            )}

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to login page...
              </p>
            </div>

            <button
              onClick={() => router.push('/login?reset=success')}
              className="w-full bg-corporate-blue text-white font-semibold py-3 rounded-lg hover:bg-blue-700 shadow-corporate hover:shadow-corporate-hover transition-all flex items-center justify-center gap-2"
            >
              Go to Login Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8FAFC', colorScheme: 'light' }}>
        <div className="corporate-card p-10 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Invalid Reset Link
            </h2>
            <p className="text-gray-700 mb-6">
              No reset token was provided. Please use the link from your email.
            </p>

            <Link
              href="/forgot-password"
              className="inline-block w-full bg-corporate-blue text-white font-semibold py-3 rounded-lg hover:bg-blue-700 shadow-corporate hover:shadow-corporate-hover transition-all"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8FAFC', colorScheme: 'light' }}>
      <div className="corporate-card p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-corporate-blue rounded-xl flex items-center justify-center mx-auto mb-4 shadow-corporate">
            <Lock className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>
            Reset Password
          </h1>
          <p className="text-base font-semibold" style={{ color: '#374151' }}>
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4 text-red-800 font-semibold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
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
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full px-4 py-3.5 pr-12 bg-white border-2 border-gray-300 rounded-lg text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-corporate-blue transition-all"
                style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
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
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="text-center border-t border-gray-200 pt-6">
          <Link
            href="/login"
            className="text-sm font-semibold transition-colors"
            style={{ color: '#374151' }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resetUrl, setResetUrl] = useState('')

  // Force light mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link')
      }

      setSuccess(true)
      if (data.resetUrl) {
        setResetUrl(data.resetUrl)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.')
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
              Check Your Email
            </h2>
            <p className="text-gray-700 mb-6">
              If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-bold text-blue-900 mb-1">
                    Password Reset Email Sent
                  </p>
                  <p className="text-xs text-blue-800">
                    Please check your inbox and spam folder. The reset link will expire in 1 hour.
                  </p>
                </div>
              </div>
            </div>

            {/* Show reset link for easy access */}
            {resetUrl && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
                <p className="text-sm font-bold text-green-900 mb-3">
                  ✅ Quick Reset Link
                </p>
                <p className="text-xs text-gray-700 mb-3">
                  Click the button below to reset your password instantly:
                </p>
                <a
                  href={resetUrl}
                  className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
                >
                  Reset Password Now
                </a>
                <p className="text-xs text-gray-600 mt-3">
                  Or check your email inbox for the reset link.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-corporate-blue text-white font-semibold py-3 rounded-lg hover:bg-blue-700 shadow-corporate hover:shadow-corporate-hover transition-all"
            >
              Back to Login
            </button>
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
            <Mail className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>
            Forgot Password?
          </h1>
          <p className="text-base font-semibold" style={{ color: '#374151' }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4 text-red-800 font-semibold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" style={{ color: '#000000' }}>
              Email Address
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
                Sending Reset Link...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="text-center border-t border-gray-200 pt-6">
          <Link
            href="/login"
            className="text-sm font-semibold transition-colors inline-flex items-center gap-1"
            style={{ color: '#374151' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  // FORCE LIGHT MODE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage(data.message)
        setUserEmail(data.user?.email || '')

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 3000)
      } else {
        if (data.expired) {
          setStatus('expired')
        } else {
          setStatus('error')
        }
        setMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred during verification')
      console.error('Verification error:', error)
    }
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setResending(true)
    setResendMessage('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResendMessage('✅ Verification email sent! Please check your inbox.')
        setResendEmail('')

        // Show development URL if available
        if (data.verificationUrl) {
          console.log('🔗 Verification URL:', data.verificationUrl)
        }
      } else {
        setResendMessage(`❌ ${data.error || 'Failed to send verification email'}`)
      }
    } catch (error) {
      setResendMessage('❌ An error occurred. Please try again.')
      console.error('Resend error:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" style={{ colorScheme: 'light' }}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Mail className="w-16 h-16 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ashley AI Admin Portal
            </p>
          </div>

          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Verifying your email...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Please wait a moment
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {message}
              </p>
              {userEmail && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Account: <span className="font-medium">{userEmail}</span>
                </p>
              )}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to login page...
                </p>
              </div>
              <button
                onClick={() => router.push('/login?verified=true')}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center justify-center gap-1 mx-auto"
              >
                Go to login now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {message}
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 dark:text-red-300">
                  The verification link may be invalid or has already been used.
                </p>
              </div>

              {/* Resend Form */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Need a new verification link?
                </p>
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                </form>
                {resendMessage && (
                  <p className="mt-3 text-sm text-center">{resendMessage}</p>
                )}
              </div>
            </div>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Link Expired
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {message}
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  Verification links are valid for 24 hours.
                </p>
              </div>

              {/* Resend Form */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Request a new verification link:
                </p>
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Get New Verification Link
                      </>
                    )}
                  </button>
                </form>
                {resendMessage && (
                  <p className="mt-3 text-sm text-center">{resendMessage}</p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help?{' '}
              <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Back to login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

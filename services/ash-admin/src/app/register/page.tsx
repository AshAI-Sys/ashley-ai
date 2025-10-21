'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

export default function RegisterPage() {
  // Force light mode immediately (synchronous, no useEffect delay)
  if (typeof window !== 'undefined') {
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  }

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [verificationUrl, setVerificationUrl] = useState('')
  const [autoVerified, setAutoVerified] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    // Workspace Info
    workspaceName: '',
    workspaceSlug: '',

    // Admin User Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Optional
    companyAddress: '',
    companyPhone: '',
  })

  // Auto-generate slug from workspace name
  const handleWorkspaceNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      workspaceName: name,
      workspaceSlug: name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }))
  }

  // Password validation
  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) errors.push('at least 8 characters')
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter')
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter')
    if (!/[0-9]/.test(password)) errors.push('one number')
    // Special character is now optional
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Client-side validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const passwordErrors = validatePassword(formData.password)
      if (passwordErrors.length > 0) {
        throw new Error(`Password must have: ${passwordErrors.join(', ')}`)
      }

      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Success!
      setSuccess(true)

      // Store verification URL - ALWAYS show it for easy access
      if (data.verificationUrl) {
        setVerificationUrl(data.verificationUrl)
      }

      // Real website - never auto-verified
      setAutoVerified(false)

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 light" style={{ backgroundColor: '#F8FAFC', colorScheme: 'light' }}>
        <div className="corporate-card p-10 w-full max-w-lg">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#000000' }}>
              Account Created Successfully!
            </h2>

            {autoVerified ? (
              <>
                <p className="text-base font-semibold mb-6" style={{ color: '#374151' }}>
                  Your account is ready! You can login immediately.
                </p>

                {/* Auto-Verified Notice (Development) */}
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-bold text-green-900 mb-1">
                        Email Auto-Verified (Development Mode)
                      </p>
                      <p className="text-xs text-green-800 font-medium">
                        Your email has been automatically verified. No verification email needed!
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-base font-semibold mb-6" style={{ color: '#374151' }}>
                  Please check your email to verify your account before logging in.
                </p>

                {/* Email Verification Notice */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        Verification Email Sent
                      </p>
                      <p className="text-xs text-blue-800 font-medium">
                        We've sent a verification link to your email address. Please click the link to activate your account.
                      </p>
                      <p className="text-xs text-blue-700 font-medium mt-2">
                        The link will expire in 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Show Verification Link - Always available for easy access */}
            {verificationUrl && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
                <p className="text-sm font-bold text-green-900 mb-3">
                  ✅ Quick Verification Link
                </p>
                <p className="text-xs font-semibold text-gray-700 mb-3">
                  Click the button below to verify your email instantly:
                </p>
                <a
                  href={verificationUrl}
                  className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center shadow-lg"
                >
                  Verify Email Now
                </a>
                <p className="text-xs font-semibold text-gray-600 mt-3">
                  Or check your email inbox for the verification link.
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-corporate-blue hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-corporate"
            >
              Go to Login Page
            </button>

            {/* Didn't receive email? (Only show if not auto-verified) */}
            {!autoVerified && (
              <p className="text-sm font-semibold text-gray-600 mt-4">
                Didn't receive the email?{' '}
                <a href="/verify-email" className="text-corporate-blue hover:text-blue-700 font-semibold hover:underline">
                  Resend verification link
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 light" style={{ backgroundColor: '#F8FAFC', colorScheme: 'light' }}>
      <div className="corporate-card p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4">
            <img
              src="/ash-ai-logo.png"
              alt="Ashley AI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>
            Create Admin Account
          </h1>
          <p className="text-sm font-semibold" style={{ color: '#374151' }}>
            Set up your workspace and admin account for Ashley AI
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Workspace Information */}
          <div className="mb-6">
            <h3 className="text-base font-bold mb-3 flex items-center" style={{ color: '#000000' }}>
              <svg className="w-5 h-5 mr-2 text-corporate-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              Workspace Information
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#000000' }}>
                  Company/Workspace Name *
                </label>
                <input
                  type="text"
                  value={formData.workspaceName}
                  onChange={(e) => handleWorkspaceNameChange(e.target.value)}
                  placeholder="e.g., Acme Manufacturing"
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-corporate-blue transition-all"
                  style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#000000' }}>
                  Workspace Slug * <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>(auto-generated)</span>
                </label>
                <input
                  type="text"
                  value={formData.workspaceSlug}
                  onChange={(e) => setFormData(prev => ({ ...prev, workspaceSlug: e.target.value }))}
                  placeholder="acme-manufacturing"
                  required
                  pattern="[a-z0-9\-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-corporate-blue transition-all"
                  style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                />
                <p className="text-xs font-semibold mt-1" style={{ color: '#6B7280' }}>
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>
            </div>
          </div>

          {/* Admin User Information */}
          <div className="mb-6">
            <h3 className="text-base font-bold mb-3 flex items-center" style={{ color: '#000000' }}>
              <svg className="w-5 h-5 mr-2 text-corporate-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Admin User Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#000000' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Juan"
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-corporate-blue transition-all"
                  style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#000000' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Dela Cruz"
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-corporate-blue transition-all"
                  style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-1" style={{ color: '#000000' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@yourcompany.com"
                required
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-corporate-blue transition-all"
                style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#000000' }}>
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Min 8 chars"
                    required
                    className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-300 rounded-lg text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-corporate-blue transition-all"
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

              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: '#000000' }}>
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Repeat password"
                    required
                    className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-300 rounded-lg text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-corporate-blue focus:border-corporate-blue transition-all"
                    style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {showConfirmPassword ? (
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
            </div>

            <div className="mt-2 text-xs font-semibold" style={{ color: '#6B7280' }}>
              Password must have: 8+ chars, uppercase, lowercase, number
            </div>
          </div>

          {/* Submit Button */}
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
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Create Admin Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>
            Already have an account?{' '}
            <Link href="/login" className="text-corporate-blue hover:text-blue-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

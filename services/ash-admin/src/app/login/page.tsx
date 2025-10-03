'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState<'admin' | 'employee'>('admin')
  const router = useRouter()

  // Load saved credentials on mount (client-side only)
  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
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
    console.log('Form submitted - preventing default...')
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    setError('')

    console.log('Login attempt:', { email, password, loginType })

    try {
      // Choose API endpoint based on login type
      const apiEndpoint = loginType === 'admin' ? '/api/auth/login' : '/api/auth/employee-login'

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('API Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Login successful:', data)

        if (data.success && data.access_token) {
          // Store tokens differently for admin vs employee
          if (loginType === 'admin') {
            localStorage.setItem('ash_token', data.access_token)
            localStorage.setItem('ash_user', JSON.stringify(data.user))
            localStorage.setItem('user_type', 'admin')
          } else {
            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('employee_data', JSON.stringify(data.employee))
            localStorage.setItem('user_type', 'employee')
          }

          // Save credentials if "Remember Me" is checked
          if (rememberMe) {
            localStorage.setItem('ash_remember_email', email)
            localStorage.setItem('ash_remember_password', password)
            localStorage.setItem('ash_remember_type', loginType)
          } else {
            // Clear saved credentials if unchecked
            localStorage.removeItem('ash_remember_email')
            localStorage.removeItem('ash_remember_password')
            localStorage.removeItem('ash_remember_type')
          }

          console.log('Token stored, redirecting...')

          // Redirect based on login type
          if (loginType === 'admin') {
            window.location.href = '/dashboard'
          } else {
            window.location.href = '/employee'
          }
        } else {
          setError('Login failed: Invalid response format')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log('Login failed:', errorData)
        setError(errorData.error || 'Invalid credentials. Please try again.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 8px'
          }}>
            Sign In
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            Access your ASH AI Dashboard
          </p>
        </div>

        {/* Login Type Toggle */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            style={{
              width: '100%',
              padding: '12px',
              border: loginType === 'admin' ? '2px solid #3b82f6' : '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: loginType === 'admin' ? '#eff6ff' : 'white',
              color: loginType === 'admin' ? '#3b82f6' : '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Admin Login
          </button>

          <button
            type="button"
            onClick={() => setLoginType('employee')}
            style={{
              width: '100%',
              padding: '12px',
              border: loginType === 'employee' ? '2px solid #10b981' : '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: loginType === 'employee' ? '#f0fdf4' : 'white',
              color: loginType === 'employee' ? '#10b981' : '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Employee Login
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }} method="POST" action="#">
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loginType === 'admin' ? 'admin@ashleyai.com' : 'employee@ashley.com'}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={loginType === 'admin' ? 'admin123' : '••••••••'}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  marginRight: '8px',
                  cursor: 'pointer',
                  accentColor: '#3b82f6'
                }}
              />
              Remember my account
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#9ca3af' : (loginType === 'admin' ? '#3b82f6' : '#10b981'),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Signing In...' : `Sign In as ${loginType === 'admin' ? 'Admin' : 'Employee'}`}
          </button>
        </form>
        
        <div style={{ 
          textAlign: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #f3f4f6'
        }}>
          <a 
            href="/"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Back to Home
          </a>
        </div>
        
      </div>
    </div>
  )
}// Demo removed
/* Force fresh deployment */

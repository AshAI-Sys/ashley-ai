'use client'

import { useEffect } from 'react'

/**
 * Fetch Interceptor Initializer Component
 * Patches the global fetch to include Authorization headers for API requests
 */
export function FetchInterceptorInit() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const originalFetch = window.fetch

    // Patch fetch to automatically add auth headers
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      // Check if this is an API request
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const isApiRequest = url.startsWith('/api/') || url.includes('/api/')

      if (isApiRequest) {
        // Get token from localStorage
        const token = localStorage.getItem('ash_token')

        if (token) {
          // Add Authorization header
          const headers = new Headers(init?.headers || {})
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`)
          }

          // Merge headers back into init
          init = {
            ...init,
            headers,
          }
        }
      }

      // Call original fetch
      return originalFetch(input, init)
    }

    console.log('✅ Fetch interceptor initialized - Authorization headers will be added to API requests')
  }, [])

  return null
}

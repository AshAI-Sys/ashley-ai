import { NextRequest, NextResponse } from 'next/server'
import { getCachedAPIResponse, cacheAPIResponse } from './strategies'
import crypto from 'crypto'

/**
 * Cache middleware for API routes
 * Automatically cache GET requests
 */

export interface CacheOptions {
  ttl?: number
  bypassCache?: boolean
  varyBy?: string[] // Headers to include in cache key
  invalidatePatterns?: string[]
}

/**
 * Generate cache key from request
 */
function generateCacheKey(request: NextRequest, varyBy?: string[]): string {
  const url = new URL(request.url)
  const pathname = url.pathname
  const searchParams = url.searchParams.toString()

  let key = `${pathname}?${searchParams}`

  // Include specific headers in cache key
  if (varyBy) {
    const headers = varyBy.map(h => `${h}:${request.headers.get(h)}`).join('|')
    key += `|${headers}`
  }

  // Hash the key to keep it short
  return crypto.createHash('md5').update(key).digest('hex')
}

/**
 * Wrap API handler with caching
 */
export function withCache(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: CacheOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { ttl = 300, bypassCache = false, varyBy } = options

    // Only cache GET requests
    if (request.method !== 'GET') {
      return await handler(request)
    }

    // Check for cache bypass header
    if (bypassCache || request.headers.get('cache-control') === 'no-cache') {
      return await handler(request)
    }

    // Generate cache key
    const cacheKey = generateCacheKey(request, varyBy)

    // Try to get from cache
    const cached = await getCachedAPIResponse(request.nextUrl.pathname, cacheKey)

    if (cached) {
      console.log(`✅ Cache HIT: ${request.nextUrl.pathname}`)

      // Return cached response
      return new NextResponse(JSON.stringify(cached.body), {
        status: cached.status,
        headers: {
          ...cached.headers,
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
        },
      })
    }

    console.log(`❌ Cache MISS: ${request.nextUrl.pathname}`)

    // Execute handler
    const response = await handler(request)

    // Cache successful responses
    if (response.status === 200) {
      try {
        const body = await response.clone().json()

        await cacheAPIResponse(
          request.nextUrl.pathname,
          cacheKey,
          {
            body,
            status: response.status,
            headers: Object.fromEntries(response.headers),
          },
          ttl
        )
      } catch (error) {
        console.error('Failed to cache response:', error)
      }
    }

    // Add cache headers
    response.headers.set('X-Cache', 'MISS')
    response.headers.set('X-Cache-Key', cacheKey)
    response.headers.set('Cache-Control', `public, max-age=${ttl}`)

    return response
  }
}

/**
 * Cache decorator for class methods
 */
export function Cacheable(ttl: number = 300) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`

      // Try cache
      const cached = await getCachedAPIResponse('method', cacheKey)
      if (cached) {
        return cached
      }

      // Execute method
      const result = await originalMethod.apply(this, args)

      // Cache result
      await cacheAPIResponse('method', cacheKey, result, ttl)

      return result
    }

    return descriptor
  }
}

/**
 * Simple in-memory cache for development
 */
const memoryCache = new Map<string, { data: any; expires: number }>()

export function memoize<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl: number = 300
): T {
  return (async (...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    const cached = memoryCache.get(key)

    if (cached && cached.expires > Date.now()) {
      return cached.data
    }

    const result = await fn(...args)

    memoryCache.set(key, {
      data: result,
      expires: Date.now() + ttl * 1000,
    })

    return result
  }) as T
}

/**
 * Cache invalidation middleware
 */
export function withCacheInvalidation(
  handler: (request: NextRequest) => Promise<NextResponse>,
  patterns: string[]
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request)

    // Invalidate cache patterns on successful mutations
    if (
      response.status >= 200 &&
      response.status < 300 &&
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
    ) {
      const { cache } = await import('./cache')

      for (const pattern of patterns) {
        await cache.invalidatePattern(pattern)
        console.log(`🗑️  Invalidated cache pattern: ${pattern}`)
      }
    }

    return response
  }
}

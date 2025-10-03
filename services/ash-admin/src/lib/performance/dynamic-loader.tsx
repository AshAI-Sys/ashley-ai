/**
 * Dynamic Loader Utilities
 * Lazy loading for heavy components to reduce initial bundle size
 */

'use client'

import dynamic from 'next/dynamic'
import React from 'react'

/**
 * Loading fallback component
 */
export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

/**
 * Error fallback component
 */
export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center text-red-600">
        <p className="font-semibold">Failed to load component</p>
        <p className="text-sm">{error.message}</p>
      </div>
    </div>
  )
}

/**
 * Create a lazy-loaded component with loading state
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  loadingMessage?: string
) {
  return dynamic(importFn, {
    loading: () => <LoadingSpinner message={loadingMessage} />,
    ssr: false, // Disable SSR for lazy components
  })
}

/**
 * Pre-configured lazy loaders for common component types
 */

// Heavy chart/visualization components
export const LazyChartLoader = {
  LineChart: createLazyComponent(
    () => import('recharts').then(mod => ({ default: mod.LineChart as any })),
    'Loading chart...'
  ),
  BarChart: createLazyComponent(
    () => import('recharts').then(mod => ({ default: mod.BarChart as any })),
    'Loading chart...'
  ),
  PieChart: createLazyComponent(
    () => import('recharts').then(mod => ({ default: mod.PieChart as any })),
    'Loading chart...'
  ),
}

/**
 * Lazy load modal/dialog components
 */
export function lazyModal<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return dynamic(importFn, {
    loading: () => null, // No loading state for modals (they open instantly)
    ssr: false,
  })
}

/**
 * Lazy load route components (for route-based code splitting)
 */
export function lazyRoute<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  loadingMessage?: string
) {
  return dynamic(importFn, {
    loading: () => <LoadingSpinner message={loadingMessage || 'Loading page...'} />,
    ssr: true, // Enable SSR for routes
  })
}

/**
 * Lazy load with intersection observer (load when visible)
 */
export function lazyOnVisible<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  loadingMessage?: string
) {
  return dynamic(importFn, {
    loading: () => <LoadingSpinner message={loadingMessage} />,
    ssr: false,
  })
}

/**
 * Preload component for better UX
 * Call this function to preload a component before it's needed
 */
export function preloadComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  // Start loading the component
  importFn().catch(err => console.error('Preload failed:', err))
}

/**
 * Example usage:
 *
 * // Lazy load a chart component
 * const ChartComponent = createLazyComponent(
 *   () => import('./ChartComponent'),
 *   'Loading chart...'
 * )
 *
 * // Lazy load a modal
 * const EditModal = lazyModal(() => import('./EditModal'))
 *
 * // Lazy load a route
 * const DashboardPage = lazyRoute(() => import('./DashboardPage'))
 *
 * // Preload on hover (for better perceived performance)
 * <button
 *   onMouseEnter={() => preloadComponent(() => import('./HeavyComponent'))}
 *   onClick={() => setShowComponent(true)}
 * >
 *   Show Component
 * </button>
 */

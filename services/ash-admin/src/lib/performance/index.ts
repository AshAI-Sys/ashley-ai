/**
 * Performance Optimization Utilities
 *
 * Central export point for all performance-related utilities including:
 * - Lazy loading with suspense
 * - Performance monitoring
 * - Web Vitals tracking
 * - Bundle optimization
 */

// Lazy loading utilities
export {
  lazyLoad,
  lazyLoadWithErrorBoundary,
  lazyRoute,
  lazyModal,
  lazyChart,
  preloadComponent,
  LoadingFallbacks,
  LazyLoadOnView,
  useLazyLoadOnView,
} from './lazy-load';

// Performance monitoring
export {
  reportWebVitals,
  measureRenderTime,
  measureAPITime,
  performanceMark,
  getPageLoadMetrics,
  getResourceMetrics,
  logPerformanceSummary,
  getMemoryUsage,
  monitorMemoryLeaks,
  reportBundleSize,
} from './monitoring';

export type { WebVitalsMetric } from './monitoring';

/**
 * Performance best practices summary:
 *
 * 1. Code Splitting
 *    - Use lazyRoute() for page-level components
 *    - Use lazyModal() for modals and dialogs
 *    - Use lazyChart() for heavy chart components
 *
 * 2. Loading States
 *    - Always provide meaningful loading fallbacks
 *    - Use skeleton screens for better UX
 *    - Avoid flash of loading content with minimum delays
 *
 * 3. Monitoring
 *    - Track Web Vitals in production
 *    - Measure component render times in development
 *    - Monitor API response times
 *
 * 4. Optimization
 *    - Enable compression (already in next.config.js)
 *    - Use Next.js Image component for images
 *    - Minimize bundle size with tree shaking
 *    - Use modularized imports (lucide-react already configured)
 *
 * 5. Caching
 *    - API responses cached with React Query
 *    - Static assets cached with PWA
 *    - Browser caching configured in headers
 *
 * @example
 * // Lazy load a route
 * const LazyDashboard = lazyRoute(() => import('./Dashboard'));
 *
 * @example
 * // Lazy load a modal
 * const LazyModal = lazyModal(() => import('./components/Modal'));
 *
 * @example
 * // Track performance
 * const endMeasure = performanceMark.start('data-fetch');
 * // ... do work
 * performanceMark.end('data-fetch');
 *
 * @example
 * // Report Web Vitals
 * export { reportWebVitals } from '@/lib/performance';
 * // In pages/_app.tsx: export { reportWebVitals };
 */

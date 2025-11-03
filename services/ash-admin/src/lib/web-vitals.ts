import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals and sends to analytics
 * Note: FID (First Input Delay) has been deprecated in favor of INP (Interaction to Next Paint)
 */

// Performance thresholds (Google recommended)
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint (replaces FID)
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
};

// Get rating based on threshold
function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric.name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (metric.value <= threshold.good) return 'good';
  if (metric.value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

// Send metric to analytics endpoint
function sendToAnalytics(metric: Metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating || getRating(metric),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: `${metric.value.toFixed(2)}ms`,
      rating: body.rating,
    });
  }

  // Send to API endpoint (non-blocking)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/web-vitals', JSON.stringify(body));
  } else {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch((error) => {
      console.error('Failed to send web vital:', error);
    });
  }
}

/**
 * Initialize Web Vitals tracking
 * Call this in your root layout or _app.tsx
 */
export function initWebVitals() {
  try {
    // Core Web Vitals
    onLCP(sendToAnalytics);  // Largest Contentful Paint
    onCLS(sendToAnalytics);  // Cumulative Layout Shift

    // Additional metrics
    onFCP(sendToAnalytics);  // First Contentful Paint
    onINP(sendToAnalytics);  // Interaction to Next Paint (replaces deprecated FID)
    onTTFB(sendToAnalytics); // Time to First Byte

    console.log('[Web Vitals] Performance monitoring initialized');
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

/**
 * Get performance summary for current page
 */
export function getPerformanceSummary() {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
    tcp: navigation?.connectEnd - navigation?.connectStart,
    ttfb: navigation?.responseStart - navigation?.requestStart,
    download: navigation?.responseEnd - navigation?.responseStart,
    domInteractive: navigation?.domInteractive,
    domComplete: navigation?.domComplete,
    loadComplete: navigation?.loadEventEnd,
    fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
    type: navigation?.type,
  };
}

/**
 * Performance monitoring hook for React components
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);

    // Mark as performance entry
    performance.mark(`${componentName}-end`);
    performance.measure(componentName, {
      start: startTime,
      end: performance.now(),
    });
  };
}

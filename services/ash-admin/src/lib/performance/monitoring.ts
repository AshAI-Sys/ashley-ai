/**
 * Performance Monitoring Utilities
 *
 * Track and report performance metrics including Core Web Vitals,
 * component render times, and API response times
 */

/**
 * Core Web Vitals metrics
 */
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service
    // Example: Google Analytics, Sentry, etc.
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.gtag) {
        // @ts-ignore
        window.gtag('event', metric.name, {
          value: Math.round(metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }
    } catch (error) {
      console.error('Failed to report web vitals:', error);
    }
  }
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string): () => void {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Render Time] ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    // Log slow renders (> 16ms = 1 frame)
    if (renderTime > 16) {
      console.warn(`[Slow Render] ${componentName} took ${renderTime.toFixed(2)}ms`);
    }

    return renderTime;
  };
}

/**
 * Measure API response time
 */
export function measureAPITime(endpoint: string): () => void {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Time] ${endpoint}: ${responseTime.toFixed(2)}ms`);
    }

    // Log slow API calls (> 1000ms)
    if (responseTime > 1000) {
      console.warn(`[Slow API] ${endpoint} took ${responseTime.toFixed(2)}ms`);
    }

    return responseTime;
  };
}

/**
 * Performance mark API for custom measurements
 */
export const performanceMark = {
  start(name: string) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
  },

  end(name: string) {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name)[0];

        if (measure) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
          }
          return measure.duration;
        }

        return 0;
      } catch (error) {
        console.error(`Failed to measure ${name}:`, error);
        return 0;
      }
    }
    return 0;
  },

  clear(name?: string) {
    if (typeof performance !== 'undefined') {
      if (name) {
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);
      } else {
        performance.clearMarks();
        performance.clearMeasures();
      }
    }
  },
};

/**
 * Get page load metrics
 */
export function getPageLoadMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (!navigation) {
    return null;
  }

  return {
    // DNS lookup time
    dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,

    // TCP connection time
    tcpTime: navigation.connectEnd - navigation.connectStart,

    // Time to first byte
    ttfb: navigation.responseStart - navigation.requestStart,

    // Response download time
    downloadTime: navigation.responseEnd - navigation.responseStart,

    // DOM processing time
    domProcessingTime: navigation.domComplete - navigation.domInteractive,

    // Total page load time
    totalTime: navigation.loadEventEnd - navigation.fetchStart,

    // DOM Content Loaded
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,

    // Page fully loaded
    loadComplete: navigation.loadEventEnd - navigation.fetchStart,
  };
}

/**
 * Get resource timing metrics
 */
export function getResourceMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return [];
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  return resources.map(resource => ({
    name: resource.name,
    type: resource.initiatorType,
    duration: resource.duration,
    size: resource.transferSize,
    cached: resource.transferSize === 0,
  }));
}

/**
 * Log performance summary
 */
export function logPerformanceSummary() {
  if (typeof window === 'undefined') return;

  const pageMetrics = getPageLoadMetrics();
  const resourceMetrics = getResourceMetrics();

  if (!pageMetrics) return;

  console.group('📊 Performance Summary');
  console.log('Page Load Metrics:');
  console.table({
    'DNS Lookup': `${pageMetrics.dnsTime.toFixed(2)}ms`,
    'TCP Connection': `${pageMetrics.tcpTime.toFixed(2)}ms`,
    'Time to First Byte': `${pageMetrics.ttfb.toFixed(2)}ms`,
    'Download Time': `${pageMetrics.downloadTime.toFixed(2)}ms`,
    'DOM Processing': `${pageMetrics.domProcessingTime.toFixed(2)}ms`,
    'Total Load Time': `${pageMetrics.totalTime.toFixed(2)}ms`,
  });

  // Group resources by type
  const resourcesByType: Record<string, number> = {};
  const resourceSizeByType: Record<string, number> = {};

  resourceMetrics.forEach(resource => {
    resourcesByType[resource.type] = (resourcesByType[resource.type] || 0) + 1;
    resourceSizeByType[resource.type] = (resourceSizeByType[resource.type] || 0) + (resource.size || 0);
  });

  console.log('\nResource Summary:');
  console.table(
    Object.keys(resourcesByType).map(type => ({
      Type: type,
      Count: resourcesByType[type] || 0,
      'Total Size': `${((resourceSizeByType[type] || 0) / 1024).toFixed(2)} KB`,
    }))
  );

  // Find slowest resources
  const slowestResources = resourceMetrics
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
    .map(r => ({
      Resource: r.name.split('/').pop() || r.name,
      Duration: `${r.duration.toFixed(2)}ms`,
      Type: r.type,
    }));

  if (slowestResources.length > 0) {
    console.log('\nSlowest Resources:');
    console.table(slowestResources);
  }

  console.groupEnd();
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null;
  }

  // Type for Chrome's performance.memory (not in standard TypeScript types)
  interface MemoryInfo {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }

  const memory = (performance as any).memory as MemoryInfo;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    percentageUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

/**
 * Monitor memory leaks
 */
export function monitorMemoryLeaks(intervalMs: number = 5000) {
  if (typeof window === 'undefined') return;

  let previousHeapSize = 0;
  let consecutiveIncreases = 0;

  const interval = setInterval(() => {
    const memory = getMemoryUsage();

    if (!memory) {
      clearInterval(interval);
      return;
    }

    if (memory.usedJSHeapSize > previousHeapSize) {
      consecutiveIncreases++;
    } else {
      consecutiveIncreases = 0;
    }

    // Warn if memory consistently increases
    if (consecutiveIncreases > 5) {
      console.warn(
        '[Memory Leak Warning] Heap size has increased consecutively',
        `Current: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        `Percentage: ${memory.percentageUsed.toFixed(2)}%`
      );
    }

    previousHeapSize = memory.usedJSHeapSize;
  }, intervalMs);

  return () => clearInterval(interval);
}

/**
 * Bundle size reporter
 */
export function reportBundleSize() {
  if (typeof window === 'undefined') return;

  // Get all script tags
  const scripts = Array.from(document.querySelectorAll('script[src]'));

  const scriptSizes = scripts.map(script => ({
    src: script.getAttribute('src'),
    async: script.hasAttribute('async'),
    defer: script.hasAttribute('defer'),
  }));

  console.group('📦 Bundle Information');
  console.log('Scripts loaded:', scriptSizes.length);
  console.table(scriptSizes);
  console.groupEnd();
}

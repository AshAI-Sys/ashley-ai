/**
 * Performance Optimization Utilities
 * Lazy loading, code splitting, and performance monitoring
 */

import { ComponentType, lazy } from "react";

/**
 * Lazy load a component with retry logic
 * Retries up to 3 times if chunk loading fails
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3
): ReturnType<typeof lazy<T>> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (retriesLeft: number) => {
        componentImport()
          .then(resolve)
          .catch(error => {
            if (retriesLeft === 0) {
              reject(error);
              return;
            }

            // Wait 1 second before retrying
            setTimeout(() => {
              console.log(`Retrying import... (${retriesLeft} retries left)`);
              attemptImport(retriesLeft - 1);
            }, 1000);
          });
      };

      attemptImport(retries);
    });
  });
}

/**
 * Preload a dynamic component
 * Useful for prefetching components before user interaction
 */
export function preloadComponent(componentImport: () => Promise<any>) {
  componentImport();
}

/**
 * Debounce function for performance-sensitive operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for rate-limiting operations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Performance measurement utility
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  /**
   * Start measuring a performance metric
   */
  start(label: string) {
    this.marks.set(label, performance.now());
  }

  /**
   * End measuring and return duration in ms
   */
  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    return duration;
  }

  /**
   * Measure and log a performance metric
   */
  measure(label: string, fn: () => void): number {
    this.start(label);
    fn();
    const duration = this.end(label);
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Measure async operations
   */
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    const duration = this.end(label);
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    return result;
  }
}

/**
 * Image optimization helper
 * Generates responsive image srcsets
 */
export function generateImageSrcSet(
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(", ");
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Intersection Observer hook utility for lazy loading
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: "50px",
    threshold: 0.01,
    ...options,
  });
}

/**
 * Web Vitals reporting
 */
export function reportWebVitals(metric: any) {
  // Send to analytics endpoint
  if (process.env.NODE_ENV === "production") {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      label: metric.label,
    });

    // Use sendBeacon for better performance
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/vitals", body);
    } else {
      fetch("/api/analytics/vitals", {
        body,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  }

  // Log in development
  console.log("[Web Vitals]", metric);
}

/**
 * Memoization cache for expensive computations
 */
export class MemoCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    // Simple LRU: delete oldest entry when max size reached
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Bundle size analyzer helper
 */
export function logBundleSize() {
  if (typeof window !== "undefined" && "performance" in window) {
    const resources = performance.getEntriesByType("resource");
    const scripts = resources.filter(r => r.name.includes(".js"));

    const totalSize = scripts.reduce((sum, script: any) => {
      return sum + (script.transferSize || 0);
    }, 0);

    console.log(`[Bundle Analysis]`);
    console.log(`Total Scripts: ${scripts.length}`);
    console.log(`Total Size: ${(totalSize / 1024).toFixed(2)} KB`);

    scripts
      .sort((a: any, b: any) => (b.transferSize || 0) - (a.transferSize || 0))
      .slice(0, 10)
      .forEach((script: any, i) => {
        const size = ((script.transferSize || 0) / 1024).toFixed(2);
        const name = script.name.split("/").pop();
        console.log(`${i + 1}. ${name}: ${size} KB`);
      });
  }
}

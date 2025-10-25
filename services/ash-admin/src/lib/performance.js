"use strict";
/**
 * Performance Optimization Utilities
 * Lazy loading, code splitting, and performance monitoring
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoCache = exports.PerformanceMonitor = void 0;
exports.lazyWithRetry = lazyWithRetry;
exports.preloadComponent = preloadComponent;
exports.debounce = debounce;
exports.throttle = throttle;
exports.generateImageSrcSet = generateImageSrcSet;
exports.prefersReducedMotion = prefersReducedMotion;
exports.createIntersectionObserver = createIntersectionObserver;
exports.reportWebVitals = reportWebVitals;
exports.logBundleSize = logBundleSize;
const react_1 = require("react");
/**
 * Lazy load a component with retry logic
 * Retries up to 3 times if chunk loading fails
 */
function lazyWithRetry(componentImport, retries = 3) {
    return (0, react_1.lazy)(() => {
        return new Promise((resolve, reject) => {
            const attemptImport = (retriesLeft) => {
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
function preloadComponent(componentImport) {
    componentImport();
}
/**
 * Debounce function for performance-sensitive operations
 */
function debounce(func, wait) {
    let timeout = null;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
/**
 * Throttle function for rate-limiting operations
 */
function throttle(func, limit) {
    let inThrottle = false;
    return function executedFunction(...args) {
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
class PerformanceMonitor {
    constructor() {
        this.marks = new Map();
    }
    /**
     * Start measuring a performance metric
     */
    start(label) {
        this.marks.set(label, performance.now());
    }
    /**
     * End measuring and return duration in ms
     */
    end(label) {
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
    measure(label, fn) {
        this.start(label);
        fn();
        const duration = this.end(label);
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
        return duration;
    }
    /**
     * Measure async operations
     */
    async measureAsync(label, fn) {
        this.start(label);
        const result = await fn();
        const duration = this.end(label);
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
        return result;
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
/**
 * Image optimization helper
 * Generates responsive image srcsets
 */
function generateImageSrcSet(baseUrl, sizes = [320, 640, 768, 1024, 1280, 1536]) {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(", ");
}
/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion() {
    if (typeof window === "undefined")
        return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
/**
 * Intersection Observer hook utility for lazy loading
 */
function createIntersectionObserver(callback, options) {
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
function reportWebVitals(metric) {
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
        }
        else {
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
class MemoCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, value) {
        // Simple LRU: delete oldest entry when max size reached
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }
    has(key) {
        return this.cache.has(key);
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
}
exports.MemoCache = MemoCache;
/**
 * Bundle size analyzer helper
 */
function logBundleSize() {
    if (typeof window !== "undefined" && "performance" in window) {
        const resources = performance.getEntriesByType("resource");
        const scripts = resources.filter(r => r.name.includes(".js"));
        const totalSize = scripts.reduce((sum, script) => {
            return sum + (script.transferSize || 0);
        }, 0);
        console.log(`[Bundle Analysis]`);
        console.log(`Total Scripts: ${scripts.length}`);
        console.log(`Total Size: ${(totalSize / 1024).toFixed(2)} KB`);
        scripts
            .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
            .slice(0, 10)
            .forEach((script, i) => {
            const size = ((script.transferSize || 0) / 1024).toFixed(2);
            const name = script.name.split("/").pop();
            console.log(`${i + 1}. ${name}: ${size} KB`);
        });
    }
}

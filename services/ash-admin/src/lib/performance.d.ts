/**
 * Performance Optimization Utilities
 * Lazy loading, code splitting, and performance monitoring
 */
import { ComponentType, lazy } from "react";
/**
 * Lazy load a component with retry logic
 * Retries up to 3 times if chunk loading fails
 */
export declare function lazyWithRetry<T extends ComponentType<any>>(componentImport: () => Promise<{
    default: T;
}>, retries?: number): ReturnType<typeof lazy<T>>;
/**
 * Preload a dynamic component
 * Useful for prefetching components before user interaction
 */
export declare function preloadComponent(componentImport: () => Promise<any>): void;
/**
 * Debounce function for performance-sensitive operations
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function for rate-limiting operations
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Performance measurement utility
 */
export declare class PerformanceMonitor {
    private marks;
    /**
     * Start measuring a performance metric
     */
    start(label: string): void;
    /**
     * End measuring and return duration in ms
     */
    end(label: string): number;
    /**
     * Measure and log a performance metric
     */
    measure(label: string, fn: () => void): number;
    /**
     * Measure async operations
     */
    measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T>;
}
/**
 * Image optimization helper
 * Generates responsive image srcsets
 */
export declare function generateImageSrcSet(baseUrl: string, sizes?: number[]): string;
/**
 * Check if user prefers reduced motion
 */
export declare function prefersReducedMotion(): boolean;
/**
 * Intersection Observer hook utility for lazy loading
 */
export declare function createIntersectionObserver(callback: IntersectionObserverCallback, options?: IntersectionObserverInit): IntersectionObserver | null;
/**
 * Web Vitals reporting
 */
export declare function reportWebVitals(metric: any): void;
/**
 * Memoization cache for expensive computations
 */
export declare class MemoCache<K, V> {
    private cache;
    private maxSize;
    constructor(maxSize?: number);
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    clear(): void;
    size(): number;
}
/**
 * Bundle size analyzer helper
 */
export declare function logBundleSize(): void;

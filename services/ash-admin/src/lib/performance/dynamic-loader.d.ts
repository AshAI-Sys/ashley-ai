/**
 * Dynamic Loader Utilities
 * Lazy loading for heavy components to reduce initial bundle size
 */
import React from "react";
/**
 * Loading fallback component
 */
export declare function LoadingSpinner({ message, }: {
    message?: string;
}): React.JSX.Element;
/**
 * Error fallback component
 */
export declare function ErrorFallback({ error }: {
    error: Error;
}): React.JSX.Element;
/**
 * Create a lazy-loaded component with loading state
 */
export declare function createLazyComponent<T extends React.ComponentType<any>>(importFn: () => Promise<{
    default: T;
}>, loadingMessage?: string): React.ComponentType<any>;
/**
 * Pre-configured lazy loaders for common component types
 */
export declare const LazyChartLoader: {
    LineChart: React.ComponentType<any>;
    BarChart: React.ComponentType<any>;
    PieChart: React.ComponentType<any>;
};
/**
 * Lazy load modal/dialog components
 */
export declare function lazyModal<T extends React.ComponentType<any>>(importFn: () => Promise<{
    default: T;
}>): React.ComponentType<any>;
/**
 * Lazy load route components (for route-based code splitting)
 */
export declare function lazyRoute<T extends React.ComponentType<any>>(importFn: () => Promise<{
    default: T;
}>, loadingMessage?: string): React.ComponentType<any>;
/**
 * Lazy load with intersection observer (load when visible)
 */
export declare function lazyOnVisible<T extends React.ComponentType<any>>(importFn: () => Promise<{
    default: T;
}>, loadingMessage?: string): React.ComponentType<any>;
/**
 * Preload component for better UX
 * Call this function to preload a component before it's needed
 */
export declare function preloadComponent<T extends React.ComponentType<any>>(importFn: () => Promise<{
    default: T;
}>): void;
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

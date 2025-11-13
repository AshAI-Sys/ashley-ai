/**
 * Lazy Loading Utilities
 *
 * Provides utilities for lazy loading components with suspense boundaries
 * and loading states for better performance
 */

import React, { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Loading fallback components for different use cases
 */
export const LoadingFallbacks = {
  // Minimal spinner for small components
  Spinner: () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),

  // Card skeleton for dashboard widgets
  Card: () => (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-3/4 mb-4" />
        <Skeleton className="h-20 w-full mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  ),

  // Table skeleton for data tables
  Table: () => (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  ),

  // Form skeleton
  Form: () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  ),

  // Chart skeleton
  Chart: () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-64 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  ),

  // Dashboard skeleton
  Dashboard: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-20 w-full mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  ),

  // Modal skeleton
  Modal: () => (
    <div className="space-y-4 p-6">
      <Skeleton className="h-6 w-1/2 mb-4" />
      <Skeleton className="h-32 w-full mb-2" />
      <div className="flex gap-2 justify-end">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  ),
};

/**
 * Lazy load options
 */
interface LazyLoadOptions {
  fallback?: React.ReactNode;
  delay?: number;
  preload?: boolean;
}

/**
 * Create a lazy-loaded component with suspense boundary
 *
 * @example
 * const LazyDashboard = lazyLoad(() => import('./Dashboard'), {
 *   fallback: LoadingFallbacks.Dashboard,
 *   delay: 200
 * });
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const {
    fallback = <LoadingFallbacks.Spinner />,
    delay = 0,
    preload = false,
  } = options;

  // Create lazy component
  const LazyComponent = lazy(() => {
    // Add minimum delay to prevent flash of loading state
    if (delay > 0) {
      return Promise.all([
        importFunc(),
        new Promise(resolve => setTimeout(resolve, delay)),
      ]).then(([module]) => module);
    }
    return importFunc();
  });

  // Preload component if requested
  if (preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFunc();
    }, 100);
  }

  // Return component wrapped in Suspense
  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy load with error boundary
 */
interface LazyLoadWithErrorBoundaryOptions extends LazyLoadOptions {
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class LazyLoadErrorBoundary extends React.Component<
  {
    errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
    children: React.ReactNode;
  },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy load error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      const ErrorFallback = this.props.errorFallback || DefaultErrorFallback;
      return (
        <ErrorFallback
          error={this.state.error}
          retry={() => this.setState({ error: null })}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-red-500 mb-4">Failed to load component</p>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Retry
      </button>
    </div>
  );
}

export function lazyLoadWithErrorBoundary<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadWithErrorBoundaryOptions = {}
) {
  const LazyComponent = lazyLoad(importFunc, options);
  const { errorFallback } = options;

  return function LazyLoadedComponentWithErrorBoundary(props: React.ComponentProps<T>) {
    return (
      <LazyLoadErrorBoundary errorFallback={errorFallback}>
        <LazyComponent {...props} />
      </LazyLoadErrorBoundary>
    );
  };
}

/**
 * Preload a lazy component
 * Useful for preloading on hover or based on user intent
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  importFunc();
}

/**
 * Create a lazy-loaded route component
 * Optimized for route-level code splitting
 */
export function lazyRoute<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return lazyLoad(importFunc, {
    fallback: <LoadingFallbacks.Dashboard />,
    delay: 100, // Small delay to prevent flash
  });
}

/**
 * Create a lazy-loaded modal/dialog
 * Modals are loaded on-demand when opened
 */
export function lazyModal<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return lazyLoad(importFunc, {
    fallback: <LoadingFallbacks.Modal />,
    delay: 0, // No delay for modals
  });
}

/**
 * Create a lazy-loaded chart component
 * Charts can be heavy, so lazy load them
 */
export function lazyChart<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return lazyLoad(importFunc, {
    fallback: <LoadingFallbacks.Chart />,
    delay: 100,
  });
}

/**
 * Hook for intersection observer-based lazy loading
 * Load component only when it enters viewport
 */
export function useLazyLoadOnView(callback: () => void, options?: IntersectionObserverInit) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current || hasLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          callback();
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Load 50px before entering viewport
        ...options,
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [callback, hasLoaded, options]);

  return ref;
}

/**
 * Lazy load wrapper component with intersection observer
 */
interface LazyLoadOnViewProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
}

export function LazyLoadOnView({
  children,
  fallback = <LoadingFallbacks.Spinner />,
  rootMargin = '50px',
}: LazyLoadOnViewProps) {
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const ref = useLazyLoadOnView(() => setShouldLoad(true), { rootMargin });

  return <div ref={ref}>{shouldLoad ? children : fallback}</div>;
}

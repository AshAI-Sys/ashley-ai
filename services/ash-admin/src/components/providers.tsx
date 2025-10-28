"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "../lib/auth-context";
import { ThemeProvider } from "../contexts/ThemeContext";

/**
 * Optimized React Query Configuration
 *
 * Performance Strategy:
 * - Longer stale times reduce unnecessary refetches
 * - Cache time keeps inactive data in memory
 * - Smart retry logic prevents failed request storms
 * - Stale-while-revalidate pattern for better UX
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache Configuration
            staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
            gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache when inactive (formerly cacheTime)

            // Refetch Strategy
            refetchOnWindowFocus: false, // Don't refetch on window focus
            refetchOnReconnect: true, // Refetch on network reconnect
            refetchOnMount: true, // Refetch when component mounts if stale

            // Retry Configuration
            retry: 2, // Retry failed requests 2 times
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

            // Network Mode
            networkMode: "online", // Only fetch when online

            // Performance Optimizations
            structuralSharing: true, // Share memory between query data

            // Error Handling
            throwOnError: false, // Handle errors at component level (formerly useErrorBoundary)
          },
          mutations: {
            // Retry Configuration for mutations
            retry: 1, // Retry failed mutations once
            retryDelay: 1000, // 1 second delay before retry

            // Network Mode
            networkMode: "online",

            // Error Handling
            throwOnError: false, // Handle errors at component level (formerly useErrorBoundary)
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

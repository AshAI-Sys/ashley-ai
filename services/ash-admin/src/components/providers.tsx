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
            cacheTime: 10 * 60 * 1000, // 10 minutes - keep in cache when inactive

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
            keepPreviousData: true, // Keep previous data while loading new data (smooth UX)

            // Error Handling
            useErrorBoundary: false, // Handle errors at component level
          },
          mutations: {
            // Retry Configuration for mutations
            retry: 1, // Retry failed mutations once
            retryDelay: 1000, // 1 second delay before retry

            // Network Mode
            networkMode: "online",

            // Error Handling
            useErrorBoundary: false,
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

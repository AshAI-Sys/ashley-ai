"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Providers = Providers;
const react_query_1 = require("@tanstack/react-query");
const react_1 = require("react");
const auth_context_1 = require("../lib/auth-context");
const ThemeContext_1 = require("../contexts/ThemeContext");
/**
 * Optimized React Query Configuration
 *
 * Performance Strategy:
 * - Longer stale times reduce unnecessary refetches
 * - Cache time keeps inactive data in memory
 * - Smart retry logic prevents failed request storms
 * - Stale-while-revalidate pattern for better UX
 */
function Providers({ children }) {
    const [queryClient] = (0, react_1.useState)(() => new react_query_1.QueryClient({
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
    }));
    return (<react_query_1.QueryClientProvider client={queryClient}>
      <ThemeContext_1.ThemeProvider>
        <auth_context_1.AuthProvider>{children}</auth_context_1.AuthProvider>
      </ThemeContext_1.ThemeProvider>
    </react_query_1.QueryClientProvider>);
}

/**
 * Optimized React Query Configuration
 *
 * Performance Strategy:
 * - Longer stale times reduce unnecessary refetches
 * - Cache time keeps inactive data in memory
 * - Smart retry logic prevents failed request storms
 * - Stale-while-revalidate pattern for better UX
 */
export declare function Providers({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element;

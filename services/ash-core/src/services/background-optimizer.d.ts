declare class BackgroundOptimizer {
    private intervals;
    private isRunning;
    start(): void;
    stop(): void;
    private cleanupCache;
    private cleanupMemory;
    private collectPerformanceMetrics;
    private refreshAnalyticsCache;
    optimizeForWorkspace(workspaceId: string): Promise<void>;
    preWarmCache(userId: string, workspaceId: string): Promise<void>;
}
export declare const backgroundOptimizer: BackgroundOptimizer;
export {};

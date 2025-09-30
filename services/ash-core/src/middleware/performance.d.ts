import { Request, Response, NextFunction } from 'express';
interface PerformanceRequest extends Request {
    startTime?: number;
    queryCount?: number;
    cacheHits?: number;
    cacheMisses?: number;
}
export declare const performanceMonitor: (req: PerformanceRequest, res: Response, next: NextFunction) => void;
export declare const queryCounter: (req: PerformanceRequest) => (params: any, next: any) => any;
export declare const trackCacheHit: (req: PerformanceRequest) => void;
export declare const trackCacheMiss: (req: PerformanceRequest) => void;
export declare const memoryMonitor: () => {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    heapUsedPercentage: number;
};
export declare const cpuMonitor: () => {
    user: number;
    system: number;
    timestamp: number;
};
export declare class PerformanceMetrics {
    private static instance;
    private metrics;
    private readonly MAX_METRICS;
    static getInstance(): PerformanceMetrics;
    addMetric(endpoint: string, data: any): void;
    getMetrics(endpoint?: string): any[] | {
        [k: string]: any[];
    };
    getAverageResponseTime(endpoint: string, minutes?: number): number;
    clearMetrics(): void;
}
export declare const getHealthMetrics: () => {
    status: string;
    timestamp: number;
    uptime: number;
    memory: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        heapUsedPercentage: number;
    };
    version: string;
    nodeVersion: string;
    environment: "development" | "production" | "test";
};
export {};

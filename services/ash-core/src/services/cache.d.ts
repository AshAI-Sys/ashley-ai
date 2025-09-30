declare class CacheService {
    private redis;
    private fallbackCache;
    constructor();
    private initializeRedis;
    get<T = any>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    delPattern(pattern: string): Promise<boolean>;
    mget<T = any>(keys: string[]): Promise<(T | null)[]>;
    mset(keyValues: Record<string, any>, ttlSeconds?: number): Promise<boolean>;
    isRedisAvailable(): boolean;
    cleanupMemoryCache(): void;
    private matchPattern;
    getStats(): Promise<any>;
}
export declare const cacheService: CacheService;
export declare const withCache: <T>(key: string, fetchFunction: () => Promise<T>, ttlSeconds?: number) => Promise<T>;
export {};

export declare const withQueryTiming: <T>(queryName: string, queryFn: () => Promise<T>) => Promise<T>;
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export declare const paginateQuery: <T>(queryFn: (skip: number, take: number, orderBy?: any) => Promise<T[]>, countFn: () => Promise<number>, options?: PaginationOptions) => Promise<PaginatedResult<T>>;
export declare const batchOperation: <T, R>(items: T[], operation: (batch: T[]) => Promise<R[]>, batchSize?: number) => Promise<R[]>;
export declare const bulkInsert: <T extends Record<string, any>>(model: any, data: T[], batchSize?: number) => Promise<void>;
export declare const DashboardQueries: {
    getOrderStats(workspaceId: string): Promise<(import("@ash/database").Prisma.PickEnumerable<import("@ash/database").Prisma.OrderGroupByOutputType, "status"[]> & {
        _count: {
            id: number;
        };
        _sum: {
            total_amount: number;
        };
    })[]>;
    getProductionMetrics(workspaceId: string): Promise<any>;
    getUpcomingDeadlines(workspaceId: string, days?: number): Promise<{
        client: {
            name: string;
        };
        brand: {
            name: string;
        };
        id: string;
        order_number: string;
        total_amount: number;
        delivery_date: Date;
    }[]>;
};
export declare const getConnectionPoolStats: () => {
    active: any;
    idle: any;
    total: number;
};
export declare const analyzeQuery: (query: string, params?: any[]) => Promise<{
    analyzed: boolean;
}>;

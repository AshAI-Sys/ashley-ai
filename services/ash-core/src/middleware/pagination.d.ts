import { Request, Response, NextFunction } from 'express';
export interface PaginationQuery {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}
export interface ParsedPagination {
    page: number;
    limit: number;
    skip: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
declare global {
    namespace Express {
        interface Request {
            pagination?: ParsedPagination;
        }
    }
}
export declare const parsePagination: (req: Request, _res: Response, next: NextFunction) => void;
export declare const createPaginatedResponse: <T>(data: T[], total: number, pagination: ParsedPagination) => {
    data: T[];
    meta: PaginationMeta;
};
export declare const createPrismaOrderBy: (pagination: ParsedPagination, allowedSortFields?: string[]) => {
    created_at: string;
} | {
    [x: string]: "asc" | "desc";
    created_at?: undefined;
};
export declare const createSearchFilter: (pagination: ParsedPagination, searchFields: string[]) => {
    OR?: undefined;
} | {
    OR: {
        [x: string]: {
            contains: string;
            mode: any;
        };
    }[];
};
export declare const getOptimizedCount: (model: any, where: any) => Promise<number>;
export interface CursorPagination {
    cursor?: string;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
export declare const parseCursorPagination: (query: any) => CursorPagination;
export declare const createCursorResponse: <T extends {
    id: string;
}>(data: T[], pagination: CursorPagination) => {
    data: T[];
    pagination: {
        hasMore: boolean;
        nextCursor: string;
        limit: number;
    };
};

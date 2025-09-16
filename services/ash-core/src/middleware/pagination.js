"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCursorResponse = exports.parseCursorPagination = exports.getOptimizedCount = exports.createSearchFilter = exports.createPrismaOrderBy = exports.createPaginatedResponse = exports.parsePagination = void 0;
const performance_1 = require("../config/performance");
// Pagination parsing middleware
const parsePagination = (req, _res, next) => {
    const query = req.query;
    // Parse and validate page
    let page = parseInt(query.page || '1');
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    // Parse and validate limit
    let limit = parseInt(query.limit || performance_1.PERFORMANCE_CONFIG.API.DEFAULT_PAGE_SIZE.toString());
    if (isNaN(limit) || limit < 1) {
        limit = performance_1.PERFORMANCE_CONFIG.API.DEFAULT_PAGE_SIZE;
    }
    if (limit > performance_1.PERFORMANCE_CONFIG.API.MAX_PAGE_SIZE) {
        limit = performance_1.PERFORMANCE_CONFIG.API.MAX_PAGE_SIZE;
    }
    // Calculate skip
    const skip = (page - 1) * limit;
    // Parse sort order
    const sortOrder = (query.sortOrder === 'desc') ? 'desc' : 'asc';
    // Parse search term and sanitize
    const search = query.search ? query.search.trim().substring(0, 100) : undefined;
    req.pagination = {
        page,
        limit,
        skip,
        sortBy: query.sortBy,
        sortOrder,
        search
    };
    next();
};
exports.parsePagination = parsePagination;
// Helper function to create paginated response
const createPaginatedResponse = (data, total, pagination) => {
    const pages = Math.ceil(total / pagination.limit);
    return {
        data,
        meta: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages,
            hasNext: pagination.page < pages,
            hasPrev: pagination.page > 1
        }
    };
};
exports.createPaginatedResponse = createPaginatedResponse;
// Optimized database pagination helper
const createPrismaOrderBy = (pagination, allowedSortFields = []) => {
    if (!pagination.sortBy || !allowedSortFields.includes(pagination.sortBy)) {
        return { created_at: 'desc' }; // Default sort
    }
    return { [pagination.sortBy]: pagination.sortOrder };
};
exports.createPrismaOrderBy = createPrismaOrderBy;
// Search filter helper
const createSearchFilter = (pagination, searchFields) => {
    if (!pagination.search || searchFields.length === 0) {
        return {};
    }
    const searchTerm = pagination.search.toLowerCase();
    return {
        OR: searchFields.map(field => ({
            [field]: {
                contains: searchTerm,
                mode: 'insensitive'
            }
        }))
    };
};
exports.createSearchFilter = createSearchFilter;
// Performance-optimized count query
const getOptimizedCount = async (model, where) => {
    // For better performance, you might want to cache counts or use approximate counts
    // This is a simplified implementation
    return model.count({ where });
};
exports.getOptimizedCount = getOptimizedCount;
const parseCursorPagination = (query) => {
    return {
        cursor: query.cursor,
        limit: Math.min(Math.max(1, parseInt(query.limit || '20')), performance_1.PERFORMANCE_CONFIG.API.MAX_PAGE_SIZE),
        sortBy: query.sortBy || 'created_at',
        sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc'
    };
};
exports.parseCursorPagination = parseCursorPagination;
const createCursorResponse = (data, pagination) => {
    const hasMore = data.length === pagination.limit;
    const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;
    return {
        data,
        pagination: {
            hasMore,
            nextCursor,
            limit: pagination.limit
        }
    };
};
exports.createCursorResponse = createCursorResponse;

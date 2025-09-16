import { Request, Response, NextFunction } from 'express'
import { PERFORMANCE_CONFIG } from '../config/performance'

export interface PaginationQuery {
  page?: string
  limit?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface ParsedPagination {
  page: number
  limit: number
  skip: number
  sortBy?: string
  sortOrder: 'asc' | 'desc'
  search?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

// Extend Request to include parsed pagination
declare global {
  namespace Express {
    interface Request {
      pagination?: ParsedPagination
    }
  }
}

// Pagination parsing middleware
export const parsePagination = (req: Request, _res: Response, next: NextFunction) => {
  const query = req.query as PaginationQuery

  // Parse and validate page
  let page = parseInt(query.page || '1')
  if (isNaN(page) || page < 1) {
    page = 1
  }

  // Parse and validate limit
  let limit = parseInt(query.limit || PERFORMANCE_CONFIG.API.DEFAULT_PAGE_SIZE.toString())
  if (isNaN(limit) || limit < 1) {
    limit = PERFORMANCE_CONFIG.API.DEFAULT_PAGE_SIZE
  }
  if (limit > PERFORMANCE_CONFIG.API.MAX_PAGE_SIZE) {
    limit = PERFORMANCE_CONFIG.API.MAX_PAGE_SIZE
  }

  // Calculate skip
  const skip = (page - 1) * limit

  // Parse sort order
  const sortOrder = (query.sortOrder === 'desc') ? 'desc' : 'asc'

  // Parse search term and sanitize
  const search = query.search ? query.search.trim().substring(0, 100) : undefined

  req.pagination = {
    page,
    limit,
    skip,
    sortBy: query.sortBy,
    sortOrder,
    search
  }

  next()
}

// Helper function to create paginated response
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  pagination: ParsedPagination
): {
  data: T[]
  meta: PaginationMeta
} => {
  const pages = Math.ceil(total / pagination.limit)

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
  }
}

// Optimized database pagination helper
export const createPrismaOrderBy = (pagination: ParsedPagination, allowedSortFields: string[] = []) => {
  if (!pagination.sortBy || !allowedSortFields.includes(pagination.sortBy)) {
    return { created_at: 'desc' } // Default sort
  }

  return { [pagination.sortBy]: pagination.sortOrder }
}

// Search filter helper
export const createSearchFilter = (pagination: ParsedPagination, searchFields: string[]) => {
  if (!pagination.search || searchFields.length === 0) {
    return {}
  }

  const searchTerm = pagination.search.toLowerCase()
  
  return {
    OR: searchFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as any
      }
    }))
  }
}

// Performance-optimized count query
export const getOptimizedCount = async (
  model: any,
  where: any
): Promise<number> => {
  // For better performance, you might want to cache counts or use approximate counts
  // This is a simplified implementation
  return model.count({ where })
}

// Cursor-based pagination for high-performance scenarios
export interface CursorPagination {
  cursor?: string
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export const parseCursorPagination = (query: any): CursorPagination => {
  return {
    cursor: query.cursor,
    limit: Math.min(
      Math.max(1, parseInt(query.limit || '20')),
      PERFORMANCE_CONFIG.API.MAX_PAGE_SIZE
    ),
    sortBy: query.sortBy || 'created_at',
    sortOrder: query.sortOrder === 'desc' ? 'desc' : 'asc'
  }
}

export const createCursorResponse = <T extends { id: string }>(
  data: T[],
  pagination: CursorPagination
) => {
  const hasMore = data.length === pagination.limit
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null

  return {
    data,
    pagination: {
      hasMore,
      nextCursor,
      limit: pagination.limit
    }
  }
}
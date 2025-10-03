import { db } from '@ash-ai/database'
import { performanceExtension, queryLoggingExtension, autoPaginationExtension } from './performance/prisma-extensions'

// Extended Prisma client with performance monitoring
export const prisma = db
  .$extends(performanceExtension)
  .$extends(queryLoggingExtension)
  .$extends(autoPaginationExtension)

// Export original client for raw queries
export const prismaRaw = db
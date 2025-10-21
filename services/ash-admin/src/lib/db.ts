import { db } from "@/lib/database";
// import { performanceExtension, queryLoggingExtension, autoPaginationExtension } from './performance/prisma-extensions'

// Export Prisma client directly (extensions temporarily disabled for stability)
export const prisma = db;

// Export original client for raw queries
export const prismaRaw = db;

// ASH AI Database Client
// Import from shared database package for consistency

export { db, prisma, healthCheck, disconnect } from "@ash-ai/database";
export type { DatabaseTransaction } from "@ash-ai/database";
export * from "@prisma/client";

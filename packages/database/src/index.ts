// ASH AI Database Package
// Production-ready database layer with Prisma ORM

export * from "./client";
export * from "./types";
export * from "./utils";

// All Prisma types are re-exported through client.ts

// Legacy exports for backwards compatibility
export { db as prisma } from "./client";
export { healthCheck, disconnect } from "./client";

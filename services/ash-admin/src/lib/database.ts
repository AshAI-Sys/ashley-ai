// ASH AI Database Client
// Re-export prisma client from local db module

export { db, prisma } from "@/lib/db";
export * from "@prisma/client";

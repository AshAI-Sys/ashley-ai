/**
 * Prisma Client Export (Compatibility Layer)
 *
 * This file exists for backward compatibility.
 * It re-exports the Prisma client from the main db module.
 *
 * Prefer importing from @/lib/db instead:
 *   import { db, prisma } from "@/lib/db"
 */

export { db, prisma, prismaRaw } from "./db";
export { prisma as default } from "./db";

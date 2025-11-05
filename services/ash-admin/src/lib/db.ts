import { PrismaClient } from "@prisma/client";
// import { performanceExtension, queryLoggingExtension, autoPaginationExtension} from './performance/prisma-extensions'

// Create single prisma instance (singleton pattern)
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;

// Export Prisma client directly (extensions temporarily disabled for stability)
export const prisma = db;

// Export original client for raw queries
export const prismaRaw = db;

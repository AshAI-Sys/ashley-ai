import { PrismaClient } from "@prisma/client";
export declare const db: any;
export * from "@prisma/client";
export type DatabaseTransaction = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
export declare function healthCheck(): Promise<boolean>;
export declare function disconnect(): Promise<void>;

export declare const db: any;
export * from "@prisma/client";
export type DatabaseTransaction = Parameters<Parameters<typeof db.$transaction>[0]>[0];
export declare function healthCheck(): Promise<boolean>;
export declare function disconnect(): Promise<void>;

// ASH AI Database Package
// Production-ready database layer with Prisma ORM

export * from "./client";
export * from "./types";
export * from "./utils";

// Re-export Prisma types for convenience
export type {
  Workspace,
  User,
  Client,
  Brand,
  Order,
  OrderLineItem,
  DesignAsset,
  DesignVersion,
  DesignApproval,
  Employee,
  AttendanceLog,
  Invoice,
  Payment,
  Asset,
  WorkOrder,
  AuditLog,
  Automation,
  Bundle,
  PrintRun,
  QCInspection,
  QCDefect,
  CAPATask,
  SewingRun,
  PayrollPeriod,
  PayrollEarning,
  // Add more types as needed
} from "@prisma/client";

// Legacy exports for backwards compatibility
export { db as prisma } from "./client";
export { healthCheck, disconnect } from "./client";
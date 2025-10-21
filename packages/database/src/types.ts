// ASH AI Database Types
// TypeScript type definitions for the database layer

export type DatabaseError = {
  code: string;
  message: string;
  meta?: Record<string, unknown>;
};

// Enum types used throughout the application
export const OrderStatus = {
  INTAKE: "INTAKE",
  DESIGN_PENDING: "DESIGN_PENDING",
  DESIGN_APPROVAL: "DESIGN_APPROVAL",
  PRODUCTION_PLANNED: "PRODUCTION_PLANNED",
  IN_PROGRESS: "IN_PROGRESS",
  QC: "QC",
  PACKING: "PACKING",
  READY_FOR_DELIVERY: "READY_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CLOSED: "CLOSED",
  ON_HOLD: "ON_HOLD",
  CANCELLED: "CANCELLED",
} as const;

export const PrintingMethod = {
  SILKSCREEN: "SILKSCREEN",
  SUBLIMATION: "SUBLIMATION",
  DTF: "DTF",
  EMBROIDERY: "EMBROIDERY",
} as const;

export const DesignStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  LOCKED: "LOCKED",
} as const;

export const QCResult = {
  ACCEPT: "ACCEPT",
  REJECT: "REJECT",
  PENDING_REVIEW: "PENDING_REVIEW",
} as const;

export const UserRole = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CSR: "CSR",
  GRAPHIC_ARTIST: "GRAPHIC_ARTIST",
  OPERATOR: "OPERATOR",
  QC_INSPECTOR: "QC_INSPECTOR",
  CLIENT: "CLIENT",
} as const;

export const Currency = {
  PHP: "PHP",
  USD: "USD",
  EUR: "EUR",
} as const;

// Utility types
export type OrderStatusType = keyof typeof OrderStatus;
export type PrintingMethodType = keyof typeof PrintingMethod;
export type DesignStatusType = keyof typeof DesignStatus;
export type QCResultType = keyof typeof QCResult;
export type UserRoleType = keyof typeof UserRole;
export type CurrencyType = keyof typeof Currency;

// Multi-tenancy helper types
export type WithWorkspaceId<T> = T & {
  workspace_id: string;
};

export type WithAuditFields<T> = T & {
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
};

// Common JSON field types
export type AddressData = {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
};

export type ContactInfo = {
  email?: string;
  phone?: string;
  mobile?: string;
};

export type DesignPlacement = {
  area: string; // front/back/sleeve/left_chest/all_over
  width_cm: number;
  height_cm: number;
  offset_x: number;
  offset_y: number;
};

export type SizeCurve = Record<string, number>; // {"S": 50, "M": 120, "L": 200}

export type DesignFiles = {
  mockup_url?: string;
  prod_url?: string;
  separations?: string[];
  dst_url?: string;
};

// Ashley AI analysis types
export type AshleyAnalysis = {
  risk_level: "GREEN" | "AMBER" | "RED";
  issues: Array<{
    type: string;
    message: string;
    details?: Record<string, unknown>;
  }>;
  recommendations: string[];
  confidence: number;
  created_at: Date;
};

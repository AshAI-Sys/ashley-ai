export type DatabaseError = {
    code: string;
    message: string;
    meta?: Record<string, unknown>;
};
export declare const OrderStatus: {
    readonly INTAKE: "INTAKE";
    readonly DESIGN_PENDING: "DESIGN_PENDING";
    readonly DESIGN_APPROVAL: "DESIGN_APPROVAL";
    readonly PRODUCTION_PLANNED: "PRODUCTION_PLANNED";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly QC: "QC";
    readonly PACKING: "PACKING";
    readonly READY_FOR_DELIVERY: "READY_FOR_DELIVERY";
    readonly DELIVERED: "DELIVERED";
    readonly CLOSED: "CLOSED";
    readonly ON_HOLD: "ON_HOLD";
    readonly CANCELLED: "CANCELLED";
};
export declare const PrintingMethod: {
    readonly SILKSCREEN: "SILKSCREEN";
    readonly SUBLIMATION: "SUBLIMATION";
    readonly DTF: "DTF";
    readonly EMBROIDERY: "EMBROIDERY";
};
export declare const DesignStatus: {
    readonly DRAFT: "DRAFT";
    readonly PENDING_APPROVAL: "PENDING_APPROVAL";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
    readonly LOCKED: "LOCKED";
};
export declare const QCResult: {
    readonly ACCEPT: "ACCEPT";
    readonly REJECT: "REJECT";
    readonly PENDING_REVIEW: "PENDING_REVIEW";
};
export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly MANAGER: "MANAGER";
    readonly CSR: "CSR";
    readonly GRAPHIC_ARTIST: "GRAPHIC_ARTIST";
    readonly OPERATOR: "OPERATOR";
    readonly QC_INSPECTOR: "QC_INSPECTOR";
    readonly CLIENT: "CLIENT";
};
export declare const Currency: {
    readonly PHP: "PHP";
    readonly USD: "USD";
    readonly EUR: "EUR";
};
export type OrderStatusType = keyof typeof OrderStatus;
export type PrintingMethodType = keyof typeof PrintingMethod;
export type DesignStatusType = keyof typeof DesignStatus;
export type QCResultType = keyof typeof QCResult;
export type UserRoleType = keyof typeof UserRole;
export type CurrencyType = keyof typeof Currency;
export type WithWorkspaceId<T> = T & {
    workspace_id: string;
};
export type WithAuditFields<T> = T & {
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
};
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
    area: string;
    width_cm: number;
    height_cm: number;
    offset_x: number;
    offset_y: number;
};
export type SizeCurve = Record<string, number>;
export type DesignFiles = {
    mockup_url?: string;
    prod_url?: string;
    separations?: string[];
    dst_url?: string;
};
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

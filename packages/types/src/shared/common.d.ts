export type ID = string;
export type WorkspaceID = string;
export type BrandID = string;
export type UserID = string;
export interface Timestamps {
    created_at: Date;
    updated_at: Date;
}
export interface SoftDelete {
    deleted_at: Date | null;
}
export interface BaseEntity extends Timestamps, SoftDelete {
    id: ID;
    workspace_id: WorkspaceID;
}
export type OrderStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type ProductionStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ShipmentStatus = 'preparing' | 'in_transit' | 'delivered' | 'returned';
export type PrintingMethod = 'silkscreen' | 'sublimation' | 'dtf' | 'embroidery';
export type PhilippineRegion = 'NCR' | 'CAR' | 'Region I' | 'Region II' | 'Region III' | 'Region IV-A' | 'Region IV-B' | 'Region V' | 'Region VI' | 'Region VII' | 'Region VIII' | 'Region IX' | 'Region X' | 'Region XI' | 'Region XII' | 'Region XIII' | 'BARMM';
export type Currency = 'PHP' | 'USD' | 'EUR';
export interface FileUpload {
    id: ID;
    filename: string;
    original_name: string;
    mime_type: string;
    size: number;
    url: string;
    workspace_id: WorkspaceID;
    created_at: Date;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export type JSONBData = Record<string, any>;
export interface QRCodeData {
    type: 'bundle' | 'asset' | 'order' | 'carton';
    id: ID;
    workspace_id: WorkspaceID;
    metadata?: JSONBData;
}

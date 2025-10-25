export interface User {
    id: string;
    workspace_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
}
export interface Workspace {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
}
export interface Client {
    id: string;
    workspace_id: string;
    name: string;
    email?: string;
    is_active: boolean;
}
export interface Order {
    id: string;
    workspace_id: string;
    client_id: string;
    order_number: string;
    status: string;
    total_amount: number;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
}
export interface AuthToken {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
}
export interface LoginResponse {
    token: string;
    user: User;
    workspace: Workspace;
}
export type Role = "Admin" | "Manager" | "CSR" | "Worker" | "Client" | "supervisor" | "operator" | "employee";
export type OrderStatus = "draft" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type Permission = string;

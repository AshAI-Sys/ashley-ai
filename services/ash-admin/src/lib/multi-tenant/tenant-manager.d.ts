export interface TenantConfig {
    workspace_id: string;
    name: string;
    slug: string;
    subscription_tier: "FREE" | "BASIC" | "PROFESSIONAL" | "ENTERPRISE";
    max_users: number;
    max_orders_per_month: number;
    features_enabled: string[];
    storage_quota_gb: number;
    custom_domain?: string;
    branding?: {
        logo_url?: string;
        primary_color?: string;
        secondary_color?: string;
        company_name?: string;
    };
    billing?: {
        plan_id?: string;
        billing_email?: string;
        payment_method?: string;
        next_billing_date?: Date;
    };
}
export interface TenantLimits {
    users: {
        current: number;
        max: number;
        available: number;
    };
    orders: {
        current_month: number;
        max: number;
        available: number;
    };
    storage: {
        used_gb: number;
        max_gb: number;
        available_gb: number;
    };
}
export declare class TenantManager {
    createTenant(config: Omit<TenantConfig, "workspace_id">): Promise<{
        workspace_id: string;
        success: boolean;
    }>;
    getTenantConfig(workspace_id: string): Promise<TenantConfig | null>;
    updateTenantConfig(workspace_id: string, updates: Partial<TenantConfig>): Promise<boolean>;
    checkLimits(workspace_id: string): Promise<TenantLimits>;
    isFeatureEnabled(workspace_id: string, feature: string): Promise<boolean>;
    validateTenantAccess(workspace_id: string, user_id?: string): Promise<{
        valid: boolean;
        reason?: string;
        workspace?: any;
    }>;
    getTenantStats(workspace_id: string): Promise<{
        total_users: number;
        active_users: number;
        total_orders: number;
        active_orders: number;
        total_clients: number;
        total_employees: number;
        storage_used_gb: number;
        created_at: Date;
        days_active: number;
    }>;
    suspendTenant(workspace_id: string, reason?: string): Promise<boolean>;
    activateTenant(workspace_id: string): Promise<boolean>;
    deleteTenant(workspace_id: string, confirmation: string): Promise<boolean>;
    private createDefaultAdmin;
    private initializeDefaults;
}
export declare const tenantManager: TenantManager;

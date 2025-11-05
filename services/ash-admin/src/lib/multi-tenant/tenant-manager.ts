// Multi-Tenant Management System
// Handles workspace creation, isolation, and tenant-specific configurations

import { prisma } from "@/lib/db";
import * as bcrypt from 'bcrypt';

export interface TenantConfig {
  workspace_id: string;
  name: string;
  slug: string;
  subscription_tier: "FREE" | "BASIC" | "PROFESSIONAL" | "ENTERPRISE";
  max_users: number;
  max_orders_per_month: number;
  features_enabled: string[]; // Array of feature flags
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
  users: { current: number; max: number; available: number };
  orders: { current_month: number; max: number; available: number };
  storage: { used_gb: number; max_gb: number; available_gb: number };
}

export class TenantManager {
  // Create new tenant workspace
  async createTenant(
    config: Omit<TenantConfig, "workspace_id">
  ): Promise<{ workspace_id: string; success: boolean }> {
    try {
      // Check if slug is available
      const existing = await prisma.workspace.findUnique({
        where: { slug: config.slug },
      });

      if (existing) {
        throw new Error(`Workspace slug '${config.slug}' is already taken`);
      }

      // Create workspace
      const workspace = await prisma.workspace.create({
        data: {
          name: config.name,
          slug: config.slug,
          is_active: true,
          settings: JSON.stringify({
            subscription_tier: config.subscription_tier,
            max_users: config.max_users,
            max_orders_per_month: config.max_orders_per_month,
            features_enabled: config.features_enabled,
            storage_quota_gb: config.storage_quota_gb,
            custom_domain: config.custom_domain,
            branding: config.branding,
            billing: config.billing,
          }),
        },
      });

      // Create default admin user
      await this.createDefaultAdmin(workspace.id, config.name);

      // Initialize default settings
      await this.initializeDefaults(workspace.id);

      return {
        workspace_id: workspace.id,
        success: true,
      };
    } catch (error: any) {
      console.error("Tenant creation error:", error);
      throw new Error(`Failed to create tenant: ${error.message}`);
    }
  }

  // Get tenant configuration
  async getTenantConfig(workspace_id: string): Promise<TenantConfig | null> {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspace_id },
      });

      if (!workspace) return null;

      const settings = workspace.settings ? JSON.parse(workspace.settings) : {};

      return {
        workspace_id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        subscription_tier: settings.subscription_tier || "FREE",
        max_users: settings.max_users || 5,
        max_orders_per_month: settings.max_orders_per_month || 50,
        features_enabled: settings.features_enabled || [],
        storage_quota_gb: settings.storage_quota_gb || 5,
        custom_domain: settings.custom_domain,
        branding: settings.branding,
        billing: settings.billing,
      };
    } catch (error: any) {
      console.error("Get tenant config error:", error);
      return null;
    }
  }

  // Update tenant configuration
  async updateTenantConfig(
    workspace_id: string,
    updates: Partial<TenantConfig>
  ): Promise<boolean> {
    try {
      const currentConfig = await this.getTenantConfig(workspace_id);
      if (!currentConfig) throw new Error("Workspace not found");

      const updatedSettings = {
        subscription_tier:
          updates.subscription_tier || currentConfig.subscription_tier,
        max_users:
          updates.max_users !== undefined
            ? updates.max_users
            : currentConfig.max_users,
        max_orders_per_month:
          updates.max_orders_per_month !== undefined
            ? updates.max_orders_per_month
            : currentConfig.max_orders_per_month,
        features_enabled:
          updates.features_enabled || currentConfig.features_enabled,
        storage_quota_gb:
          updates.storage_quota_gb !== undefined
            ? updates.storage_quota_gb
            : currentConfig.storage_quota_gb,
        custom_domain: updates.custom_domain || currentConfig.custom_domain,
        branding: { ...currentConfig.branding, ...updates.branding },
        billing: { ...currentConfig.billing, ...updates.billing },
      };

      await prisma.workspace.update({
        where: { id: workspace_id },
        data: {
          name: updates.name || currentConfig.name,
          slug: updates.slug || currentConfig.slug,
          settings: JSON.stringify(updatedSettings),
        },
      });

      return true;
    } catch (error: any) {
      console.error("Update tenant config error:", error);
      return false;
    }
  }

  // Check tenant limits
  async checkLimits(workspace_id: string): Promise<TenantLimits> {
    const config = await this.getTenantConfig(workspace_id);
    if (!config) {
      throw new Error("Workspace not found");
    }

    // Count current users
    const userCount = await prisma.user.count({
      where: { workspace_id, is_active: true },
    });

    // Count orders this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const orderCount = await prisma.order.count({
      where: {
        workspace_id,
        created_at: { gte: startOfMonth },
      },
    });

    // Calculate storage (simplified - would query actual file sizes in production)
    const storageUsedGb = 0.5; // Placeholder

    return {
      users: {
        current: userCount,
        max: config.max_users,
        available: Math.max(config.max_users - userCount, 0),
      },
      orders: {
        current_month: orderCount,
        max: config.max_orders_per_month,
        available: Math.max(config.max_orders_per_month - orderCount, 0),
      },
      storage: {
        used_gb: storageUsedGb,
        max_gb: config.storage_quota_gb,
        available_gb: Math.max(config.storage_quota_gb - storageUsedGb, 0),
      },
    };
  }

  // Check if feature is enabled for tenant
  async isFeatureEnabled(
    workspace_id: string,
    feature: string
  ): Promise<boolean> {
    const config = await this.getTenantConfig(workspace_id);
    if (!config) return false;

    return config.features_enabled.includes(feature);
  }

  // Validate tenant access (middleware helper)
  async validateTenantAccess(
    workspace_id: string,
    user_id?: string
  ): Promise<{
    valid: boolean;
    reason?: string;
    workspace?: any;
  }> {
    try {
      // Check workspace exists and is active
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspace_id },
      });

      if (!workspace) {
        return { valid: false, reason: "Workspace not found" };
      }

      if (!workspace.is_active) {
        return { valid: false, reason: "Workspace is inactive" };
      }

      // If user_id provided, check user belongs to workspace
      if (user_id) {
        const user = await prisma.user.findUnique({
          where: { id: user_id },
        });

        if (!user || user.workspace_id !== workspace_id) {
          return { valid: false, reason: "User does not belong to workspace" };
        }

        if (!user.is_active) {
          return { valid: false, reason: "User account is inactive" };
        }
      }

      return { valid: true, workspace };
    } catch (error: any) {
      console.error("Validate tenant access error:", error);
      return { valid: false, reason: "Validation error" };
    }
  }

  // Get tenant statistics
  async getTenantStats(workspace_id: string): Promise<{
    total_users: number;
    active_users: number;
    total_orders: number;
    active_orders: number;
    total_clients: number;
    total_employees: number;
    storage_used_gb: number;
    created_at: Date;
    days_active: number;
  }> {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspace_id },
      include: {
        users: true,
        orders: true,
        clients: true,
        employees: true,
      },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const daysActive = Math.floor(
      (Date.now() - workspace.created_at.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      total_users: workspace.users.length,
      active_users: workspace.users.filter((u: any) => u.is_active).length,
      total_orders: workspace.orders.length,
      active_orders: workspace.orders.filter((o: any) => o.status === "IN_PRODUCTION")
        .length,
      total_clients: workspace.clients.length,
      total_employees: workspace.employees.length,
      storage_used_gb: 0.5, // Placeholder
      created_at: workspace.created_at,
      days_active: daysActive,
    };
  }

  // Suspend/activate tenant
  async suspendTenant(workspace_id: string, reason?: string): Promise<boolean> {
    try {
      await prisma.workspace.update({
        where: { id: workspace_id },
        data: { is_active: false },
      });

      // Log suspension (would implement audit log in production)
      console.log(
        `Workspace ${workspace_id} suspended. Reason: ${reason || "Not specified"}`
      );

      return true;
    } catch (error: any) {
      console.error("Suspend tenant error:", error);
      return false;
    }
  }

  async activateTenant(workspace_id: string): Promise<boolean> {
    try {
      await prisma.workspace.update({
        where: { id: workspace_id },
        data: { is_active: true },
      });

      return true;
    } catch (error: any) {
      console.error("Activate tenant error:", error);
      return false;
    }
  }

  // Delete tenant (soft delete - requires confirmation)
  async deleteTenant(
    workspace_id: string,
    confirmation: string
  ): Promise<boolean> {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspace_id },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Require exact slug match as confirmation
    if (confirmation !== workspace.slug) {
      throw new Error("Confirmation failed - slug does not match");
    }

    try {
      // In production, would implement soft delete or archive
      // For now, just deactivate
      await this.suspendTenant(workspace_id, "DELETED BY USER");

      return true;
    } catch (error: any) {
      console.error("Delete tenant error:", error);
      return false;
    }
  }

  // Private helper methods

  private async createDefaultAdmin(
    workspace_id: string,
    workspaceName: string
  ): Promise<void> {
    // Create default admin user
    const defaultPassword = "ChangeMe123!"; // Force password change on first login

    await prisma.user.create({
      data: {
        workspace_id,
        email:
          "admin@" + workspaceName.toLowerCase().replace(/\s/g, "") + ".com",
        first_name: "Admin",
        last_name: "User",
        password_hash: await bcrypt.hash(defaultPassword, 10),
        role: "ADMIN",
        is_active: true,
      },
    });
  }

  private async initializeDefaults(workspace_id: string): Promise<void> {
    // Create default defect codes
    const defaultDefectCodes = [
      {
        code: "STAIN",
        description: "Fabric staining",
        severity: "MAJOR",
        category: "FABRIC",
      },
      {
        code: "HOLE",
        description: "Hole or tear",
        severity: "CRITICAL",
        category: "FABRIC",
      },
      {
        code: "SKIP_STITCH",
        description: "Skipped stitches",
        severity: "MAJOR",
        category: "SEWING",
      },
      {
        code: "LOOSE_THREAD",
        description: "Loose threads",
        severity: "MINOR",
        category: "SEWING",
      },
      {
        code: "PRINT_MISALIGN",
        description: "Print misalignment",
        severity: "CRITICAL",
        category: "PRINT",
      },
    ];

    for (const defect of defaultDefectCodes) {
      await prisma.qCDefectCode.create({
        data: {
          ...defect,
          name: defect.description, // Use description as name
          workspace_id,
        },
      });
    }
  }
}

// Export singleton
export const tenantManager = new TenantManager();

// Granular RBAC Permission System
// Role-Based Access Control with fine-grained permissions

export type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'APPROVE' | 'EXPORT';
export type PermissionResource =
  | 'ORDERS'
  | 'CLIENTS'
  | 'PRODUCTION'
  | 'QUALITY'
  | 'FINANCE'
  | 'HR'
  | 'INVENTORY'
  | 'REPORTS'
  | 'USERS'
  | 'SETTINGS'
  | 'AI_FEATURES'
  | 'MAINTENANCE'
  | 'DELIVERIES'
  | 'DESIGN';

export interface Permission {
  id: string;
  name: string;
  resource: PermissionResource;
  action: PermissionAction;
  description: string;
  conditions?: Record<string, any>; // JSON conditions for dynamic permissions
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  is_system_role: boolean;
  workspace_id: string;
}

export interface UserPermissions {
  user_id: string;
  workspace_id: string;
  role: string;
  permissions: Permission[];
  can(resource: PermissionResource, action: PermissionAction): boolean;
}

export class PermissionManager {
  // Predefined system permissions
  private readonly SYSTEM_PERMISSIONS: Omit<Permission, 'id'>[] = [
    // Orders
    { name: 'orders.create', resource: 'ORDERS', action: 'CREATE', description: 'Create new orders' },
    { name: 'orders.read', resource: 'ORDERS', action: 'READ', description: 'View orders' },
    { name: 'orders.update', resource: 'ORDERS', action: 'UPDATE', description: 'Edit orders' },
    { name: 'orders.delete', resource: 'ORDERS', action: 'DELETE', description: 'Delete orders' },
    { name: 'orders.approve', resource: 'ORDERS', action: 'APPROVE', description: 'Approve orders' },

    // Clients
    { name: 'clients.create', resource: 'CLIENTS', action: 'CREATE', description: 'Add new clients' },
    { name: 'clients.read', resource: 'CLIENTS', action: 'READ', description: 'View client information' },
    { name: 'clients.update', resource: 'CLIENTS', action: 'UPDATE', description: 'Edit client details' },
    { name: 'clients.delete', resource: 'CLIENTS', action: 'DELETE', description: 'Remove clients' },

    // Production
    { name: 'production.create', resource: 'PRODUCTION', action: 'CREATE', description: 'Create production runs' },
    { name: 'production.read', resource: 'PRODUCTION', action: 'READ', description: 'View production data' },
    { name: 'production.update', resource: 'PRODUCTION', action: 'UPDATE', description: 'Update production runs' },
    { name: 'production.execute', resource: 'PRODUCTION', action: 'EXECUTE', description: 'Execute production tasks' },

    // Quality Control
    { name: 'quality.create', resource: 'QUALITY', action: 'CREATE', description: 'Create QC inspections' },
    { name: 'quality.read', resource: 'QUALITY', action: 'READ', description: 'View quality data' },
    { name: 'quality.update', resource: 'QUALITY', action: 'UPDATE', description: 'Update QC records' },
    { name: 'quality.approve', resource: 'QUALITY', action: 'APPROVE', description: 'Approve quality checks' },

    // Finance
    { name: 'finance.create', resource: 'FINANCE', action: 'CREATE', description: 'Create financial records' },
    { name: 'finance.read', resource: 'FINANCE', action: 'READ', description: 'View financial data' },
    { name: 'finance.update', resource: 'FINANCE', action: 'UPDATE', description: 'Edit financial records' },
    { name: 'finance.approve', resource: 'FINANCE', action: 'APPROVE', description: 'Approve invoices/payments' },
    { name: 'finance.export', resource: 'FINANCE', action: 'EXPORT', description: 'Export financial reports' },

    // HR & Payroll
    { name: 'hr.create', resource: 'HR', action: 'CREATE', description: 'Add employees' },
    { name: 'hr.read', resource: 'HR', action: 'READ', description: 'View employee data' },
    { name: 'hr.update', resource: 'HR', action: 'UPDATE', description: 'Edit employee records' },
    { name: 'hr.delete', resource: 'HR', action: 'DELETE', description: 'Remove employees' },
    { name: 'hr.approve', resource: 'HR', action: 'APPROVE', description: 'Approve payroll' },

    // Inventory
    { name: 'inventory.create', resource: 'INVENTORY', action: 'CREATE', description: 'Add inventory items' },
    { name: 'inventory.read', resource: 'INVENTORY', action: 'READ', description: 'View inventory' },
    { name: 'inventory.update', resource: 'INVENTORY', action: 'UPDATE', description: 'Update inventory levels' },
    { name: 'inventory.approve', resource: 'INVENTORY', action: 'APPROVE', description: 'Approve purchase orders' },

    // Reports & Analytics
    { name: 'reports.create', resource: 'REPORTS', action: 'CREATE', description: 'Create custom reports' },
    { name: 'reports.read', resource: 'REPORTS', action: 'READ', description: 'View reports' },
    { name: 'reports.export', resource: 'REPORTS', action: 'EXPORT', description: 'Export reports' },
    { name: 'reports.execute', resource: 'REPORTS', action: 'EXECUTE', description: 'Run report queries' },

    // User Management
    { name: 'users.create', resource: 'USERS', action: 'CREATE', description: 'Create new users' },
    { name: 'users.read', resource: 'USERS', action: 'READ', description: 'View user accounts' },
    { name: 'users.update', resource: 'USERS', action: 'UPDATE', description: 'Edit user accounts' },
    { name: 'users.delete', resource: 'USERS', action: 'DELETE', description: 'Delete user accounts' },

    // Settings & Configuration
    { name: 'settings.read', resource: 'SETTINGS', action: 'READ', description: 'View system settings' },
    { name: 'settings.update', resource: 'SETTINGS', action: 'UPDATE', description: 'Modify system settings' },

    // AI Features
    { name: 'ai.execute', resource: 'AI_FEATURES', action: 'EXECUTE', description: 'Use AI features' },
    { name: 'ai.read', resource: 'AI_FEATURES', action: 'READ', description: 'View AI insights' },

    // Maintenance
    { name: 'maintenance.create', resource: 'MAINTENANCE', action: 'CREATE', description: 'Create work orders' },
    { name: 'maintenance.read', resource: 'MAINTENANCE', action: 'READ', description: 'View maintenance records' },
    { name: 'maintenance.update', resource: 'MAINTENANCE', action: 'UPDATE', description: 'Update work orders' },

    // Deliveries
    { name: 'deliveries.create', resource: 'DELIVERIES', action: 'CREATE', description: 'Create shipments' },
    { name: 'deliveries.read', resource: 'DELIVERIES', action: 'READ', description: 'View delivery status' },
    { name: 'deliveries.update', resource: 'DELIVERIES', action: 'UPDATE', description: 'Update deliveries' },

    // Design
    { name: 'design.create', resource: 'DESIGN', action: 'CREATE', description: 'Upload designs' },
    { name: 'design.read', resource: 'DESIGN', action: 'READ', description: 'View designs' },
    { name: 'design.approve', resource: 'DESIGN', action: 'APPROVE', description: 'Approve designs' },
  ];

  // Predefined system roles with permissions
  private readonly SYSTEM_ROLES = {
    SUPER_ADMIN: {
      name: 'Super Administrator',
      description: 'Full system access',
      permissions: '*', // All permissions
    },
    ADMIN: {
      name: 'Administrator',
      description: 'Administrative access',
      permissions: [
        'orders.*', 'clients.*', 'production.read', 'production.update',
        'quality.*', 'finance.*', 'hr.*', 'inventory.*',
        'reports.*', 'users.*', 'settings.*', 'ai.*',
        'maintenance.*', 'deliveries.*', 'design.*',
      ],
    },
    MANAGER: {
      name: 'Manager',
      description: 'Operational management',
      permissions: [
        'orders.*', 'clients.read', 'production.*', 'quality.*',
        'finance.read', 'finance.create', 'hr.read', 'inventory.*',
        'reports.read', 'reports.create', 'ai.read', 'ai.execute',
        'maintenance.read', 'deliveries.*', 'design.read', 'design.approve',
      ],
    },
    SUPERVISOR: {
      name: 'Supervisor',
      description: 'Production supervision',
      permissions: [
        'orders.read', 'production.*', 'quality.*',
        'inventory.read', 'reports.read', 'maintenance.read',
        'deliveries.read',
      ],
    },
    OPERATOR: {
      name: 'Operator',
      description: 'Production floor worker',
      permissions: [
        'orders.read', 'production.read', 'production.execute',
        'quality.read', 'quality.create',
      ],
    },
    FINANCE_MANAGER: {
      name: 'Finance Manager',
      description: 'Financial operations',
      permissions: [
        'orders.read', 'clients.read', 'finance.*',
        'reports.read', 'reports.export',
      ],
    },
    HR_MANAGER: {
      name: 'HR Manager',
      description: 'Human resources',
      permissions: [
        'hr.*', 'reports.read', 'users.read',
      ],
    },
    QC_INSPECTOR: {
      name: 'Quality Inspector',
      description: 'Quality control',
      permissions: [
        'orders.read', 'production.read', 'quality.*',
        'reports.read',
      ],
    },
    SALES: {
      name: 'Sales Representative',
      description: 'Sales and client management',
      permissions: [
        'orders.create', 'orders.read', 'orders.update',
        'clients.*', 'reports.read',
      ],
    },
    VIEWER: {
      name: 'Viewer',
      description: 'Read-only access',
      permissions: [
        '*.read',
      ],
    },
  };

  // Get all system permissions
  getAllPermissions(): Permission[] {
    return this.SYSTEM_PERMISSIONS.map((p, idx) => ({
      id: `perm_${idx + 1}`,
      ...p,
    }));
  }

  // Check if user has permission
  async hasPermission(
    user_id: string,
    resource: PermissionResource,
    action: PermissionAction
  ): Promise<boolean> {
    const userPerms = await this.getUserPermissions(user_id);
    return userPerms.can(resource, action);
  }

  // Get user permissions
  async getUserPermissions(user_id: string): Promise<UserPermissions> {
    const { prisma } = await import('@ash/database');

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get permissions from user's role
    const rolePermissions = this.getRolePermissions(user.role);

    // Parse custom permissions if any
    const customPermissions = user.permissions ? JSON.parse(user.permissions) : [];

    // Combine role and custom permissions
    const allPermissions = [...rolePermissions, ...customPermissions];

    return {
      user_id: user.id,
      workspace_id: user.workspace_id,
      role: user.role,
      permissions: allPermissions,
      can: (resource: PermissionResource, action: PermissionAction) => {
        return this.checkPermission(allPermissions, resource, action);
      },
    };
  }

  // Get permissions for a role
  getRolePermissions(role: string): Permission[] {
    const roleConfig = this.SYSTEM_ROLES[role as keyof typeof this.SYSTEM_ROLES];

    if (!roleConfig) {
      return [];
    }

    const allPerms = this.getAllPermissions();

    // If role has all permissions
    if (roleConfig.permissions === '*') {
      return allPerms;
    }

    // Filter permissions based on role's permission patterns
    return allPerms.filter(perm => {
      return roleConfig.permissions.some(pattern => {
        return this.matchesPermissionPattern(perm.name, pattern);
      });
    });
  }

  // Check if permission name matches pattern (supports wildcards)
  private matchesPermissionPattern(permissionName: string, pattern: string): boolean {
    if (pattern === '*') return true;

    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(permissionName);
  }

  // Check if permissions array includes the required permission
  private checkPermission(
    permissions: Permission[],
    resource: PermissionResource,
    action: PermissionAction
  ): boolean {
    return permissions.some(
      perm => perm.resource === resource && perm.action === action
    );
  }

  // Assign custom permissions to user
  async assignPermissions(
    user_id: string,
    permissionNames: string[]
  ): Promise<boolean> {
    const { prisma } = await import('@ash/database');

    const allPerms = this.getAllPermissions();
    const permissions = allPerms.filter(p => permissionNames.includes(p.name));

    await prisma.user.update({
      where: { id: user_id },
      data: {
        permissions: JSON.stringify(permissions),
      },
    });

    return true;
  }

  // Create custom role
  async createRole(
    workspace_id: string,
    name: string,
    description: string,
    permissionNames: string[]
  ): Promise<Role> {
    const allPerms = this.getAllPermissions();
    const roleId = `role_${Date.now()}`;

    const role: Role = {
      id: roleId,
      name,
      description,
      permissions: allPerms.filter(p => permissionNames.includes(p.name)).map(p => p.id),
      is_system_role: false,
      workspace_id,
    };

    // Store in database (would need a Role table in production)
    // For now, return the role object
    return role;
  }

  // Get available roles
  getAvailableRoles(): Array<{ id: string; name: string; description: string }> {
    return Object.entries(this.SYSTEM_ROLES).map(([id, config]) => ({
      id,
      name: config.name,
      description: config.description,
    }));
  }
}

// Export singleton
export const permissionManager = new PermissionManager();

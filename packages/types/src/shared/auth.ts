import { UserID, WorkspaceID, BrandID } from './common'

// User roles with hierarchy
export type Role = 'Admin' | 'Manager' | 'CSR' | 'Worker' | 'Client'

// Permissions
export type Permission = 
  // Orders
  | 'orders:create' | 'orders:read' | 'orders:update' | 'orders:delete'
  // Production
  | 'production:read' | 'production:update' | 'production:manage'
  // Finance
  | 'finance:read' | 'finance:update' | 'finance:manage'
  // HR
  | 'hr:read' | 'hr:update' | 'hr:manage'
  // Admin
  | 'admin:users' | 'admin:settings' | 'admin:audit'
  // Reports
  | 'reports:view' | 'reports:export'

export interface User {
  id: UserID
  workspace_id: WorkspaceID
  email: string
  username?: string
  first_name: string
  last_name: string
  role: Role
  permissions: Permission[]
  is_active: boolean
  requires_2fa: boolean
  phone_number?: string
  avatar_url?: string
  last_login_at?: Date
  created_at: Date
  updated_at: Date
}

export interface AuthToken {
  user_id: UserID
  workspace_id: WorkspaceID
  role: Role
  permissions: Permission[]
  exp: number
  iat: number
}

export interface LoginRequest {
  email: string
  password: string
  workspace_slug?: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
  workspace: {
    id: WorkspaceID
    name: string
    slug: string
  }
}

export interface MagicLinkRequest {
  email: string
  redirect_url?: string
}

export interface TwoFactorAuth {
  user_id: UserID
  secret: string
  backup_codes: string[]
  is_enabled: boolean
  created_at: Date
}

export interface ClientPortalAuth {
  client_id: string
  brand_id?: BrandID
  magic_token: string
  expires_at: Date
}

// RBAC helpers
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Admin: [
    'orders:create', 'orders:read', 'orders:update', 'orders:delete',
    'production:read', 'production:update', 'production:manage',
    'finance:read', 'finance:update', 'finance:manage',
    'hr:read', 'hr:update', 'hr:manage',
    'admin:users', 'admin:settings', 'admin:audit',
    'reports:view', 'reports:export'
  ],
  Manager: [
    'orders:create', 'orders:read', 'orders:update',
    'production:read', 'production:update', 'production:manage',
    'finance:read', 'finance:update',
    'hr:read', 'hr:update',
    'reports:view', 'reports:export'
  ],
  CSR: [
    'orders:create', 'orders:read', 'orders:update',
    'production:read',
    'reports:view'
  ],
  Worker: [
    'production:read', 'production:update'
  ],
  Client: [
    'orders:read'
  ]
}

export const REQUIRES_2FA: Role[] = ['Admin', 'Manager']
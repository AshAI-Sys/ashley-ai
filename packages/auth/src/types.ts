// ASH AI Authentication Types
// Type definitions for authentication and authorization

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// User roles with hierarchical permissions
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CSR = "CSR",
  GRAPHIC_ARTIST = "GRAPHIC_ARTIST",
  PRODUCTION_OPERATOR = "PRODUCTION_OPERATOR",
  QC_INSPECTOR = "QC_INSPECTOR",
  WAREHOUSE_STAFF = "WAREHOUSE_STAFF",
  CLIENT = "CLIENT",
}

// Permission scopes for RBAC
export type Permission =
  // Orders
  | "orders.create"
  | "orders.edit"
  | "orders.view"
  | "orders.delete"
  | "orders.approve"

  // Routing
  | "routing.apply_template"
  | "routing.customize"
  | "routing.view"

  // Clients
  | "clients.create"
  | "clients.edit"
  | "clients.view"
  | "clients.delete"

  // Design
  | "design.upload"
  | "design.version"
  | "design.approval.send"
  | "design.approval.resolve"
  | "design.lock"
  | "design.view"

  // Production
  | "production.cutting.issue"
  | "production.cutting.log"
  | "production.cutting.bundle"
  | "production.print.run"
  | "production.print.material.log"
  | "production.print.reject"
  | "production.sew.run"
  | "production.sew.bundle.scan"
  | "production.sew.reject"

  // Quality Control
  | "qc.create"
  | "qc.sample"
  | "qc.defect.log"
  | "qc.passfail.set"
  | "qc.plan.set"
  | "qc.capa.create"
  | "qc.override"

  // HR & Payroll
  | "hr.attendance.view"
  | "hr.attendance.edit"
  | "payroll.run"
  | "payroll.approve"
  | "payroll.view"

  // Maintenance
  | "maintenance.wo.create"
  | "maintenance.wo.complete"
  | "maintenance.parts.consume"
  | "maintenance.schedule.manage"
  | "maintenance.assign"

  // Admin
  | "admin.users.manage"
  | "admin.workspace.manage"
  | "admin.settings.manage"
  | "admin.audit.view";

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full access to everything
    "orders.create",
    "orders.edit",
    "orders.view",
    "orders.delete",
    "orders.approve",
    "routing.apply_template",
    "routing.customize",
    "routing.view",
    "clients.create",
    "clients.edit",
    "clients.view",
    "clients.delete",
    "design.upload",
    "design.version",
    "design.approval.send",
    "design.approval.resolve",
    "design.lock",
    "design.view",
    "production.cutting.issue",
    "production.cutting.log",
    "production.cutting.bundle",
    "production.print.run",
    "production.print.material.log",
    "production.print.reject",
    "production.sew.run",
    "production.sew.bundle.scan",
    "production.sew.reject",
    "qc.create",
    "qc.sample",
    "qc.defect.log",
    "qc.passfail.set",
    "qc.plan.set",
    "qc.capa.create",
    "qc.override",
    "hr.attendance.view",
    "hr.attendance.edit",
    "payroll.run",
    "payroll.approve",
    "payroll.view",
    "maintenance.wo.create",
    "maintenance.wo.complete",
    "maintenance.parts.consume",
    "maintenance.schedule.manage",
    "maintenance.assign",
    "admin.users.manage",
    "admin.workspace.manage",
    "admin.settings.manage",
    "admin.audit.view",
  ],

  [UserRole.MANAGER]: [
    "orders.create",
    "orders.edit",
    "orders.view",
    "orders.approve",
    "routing.apply_template",
    "routing.customize",
    "routing.view",
    "clients.view",
    "clients.edit",
    "design.view",
    "design.approval.resolve",
    "design.lock",
    "production.cutting.issue",
    "production.cutting.log",
    "production.cutting.bundle",
    "production.print.run",
    "production.print.material.log",
    "production.print.reject",
    "qc.plan.set",
    "qc.capa.create",
    "qc.override",
    "hr.attendance.view",
    "payroll.view",
    "maintenance.schedule.manage",
    "maintenance.assign",
  ],

  [UserRole.CSR]: [
    "orders.create",
    "orders.edit",
    "orders.view",
    "routing.apply_template",
    "routing.view",
    "clients.create",
    "clients.edit",
    "clients.view",
    "design.view",
    "design.approval.send",
  ],

  [UserRole.GRAPHIC_ARTIST]: [
    "orders.view",
    "design.upload",
    "design.version",
    "design.view",
  ],

  [UserRole.PRODUCTION_OPERATOR]: [
    "orders.view",
    "production.cutting.issue",
    "production.cutting.log",
    "production.cutting.bundle",
    "production.print.run",
    "production.print.material.log",
    "production.print.reject",
    "production.sew.run",
    "production.sew.bundle.scan",
    "production.sew.reject",
  ],

  [UserRole.QC_INSPECTOR]: [
    "orders.view",
    "qc.create",
    "qc.sample",
    "qc.defect.log",
    "qc.passfail.set",
  ],

  [UserRole.WAREHOUSE_STAFF]: ["orders.view", "production.cutting.issue"],

  [UserRole.CLIENT]: ["orders.view", "design.view", "design.approval.resolve"],
};

// Extended NextAuth types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      workspace_id: string;
      workspace_name: string;
      permissions: Permission[];
      requires_2fa: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    workspace_id: string;
    workspace_name: string;
    permissions: Permission[];
    requires_2fa: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    workspace_id: string;
    workspace_name: string;
    permissions: Permission[];
    requires_2fa: boolean;
  }
}

// Authentication context types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  workspace_id: string;
  workspace_name: string;
  permissions: Permission[];
  requires_2fa: boolean;
  avatar_url?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
  workspace_id: string;
}

export interface AuthError {
  type:
    | "CredentialsSignin"
    | "Configuration"
    | "AccessDenied"
    | "Verification"
    | "Default";
  message: string;
}

// Workspace context
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  settings?: Record<string, unknown>;
  is_active: boolean;
}

// Permission check utilities
export interface PermissionContext {
  user: AuthUser;
  resource?: {
    workspace_id: string;
    owner_id?: string;
    brand_id?: string;
  };
}

export type PermissionCheck = (context: PermissionContext) => boolean;

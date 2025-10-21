import { DefaultSession, DefaultUser } from "next-auth";
export declare enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CSR = "CSR",
  GRAPHIC_ARTIST = "GRAPHIC_ARTIST",
  PRODUCTION_OPERATOR = "PRODUCTION_OPERATOR",
  QC_INSPECTOR = "QC_INSPECTOR",
  WAREHOUSE_STAFF = "WAREHOUSE_STAFF",
  CLIENT = "CLIENT",
}
export type Permission =
  | "orders.create"
  | "orders.edit"
  | "orders.view"
  | "orders.delete"
  | "orders.approve"
  | "routing.apply_template"
  | "routing.customize"
  | "routing.view"
  | "clients.create"
  | "clients.edit"
  | "clients.view"
  | "clients.delete"
  | "design.upload"
  | "design.version"
  | "design.approval.send"
  | "design.approval.resolve"
  | "design.lock"
  | "design.view"
  | "production.cutting.issue"
  | "production.cutting.log"
  | "production.cutting.bundle"
  | "production.print.run"
  | "production.print.material.log"
  | "production.print.reject"
  | "production.sew.run"
  | "production.sew.bundle.scan"
  | "production.sew.reject"
  | "qc.create"
  | "qc.sample"
  | "qc.defect.log"
  | "qc.passfail.set"
  | "qc.plan.set"
  | "qc.capa.create"
  | "qc.override"
  | "hr.attendance.view"
  | "hr.attendance.edit"
  | "payroll.run"
  | "payroll.approve"
  | "payroll.view"
  | "maintenance.wo.create"
  | "maintenance.wo.complete"
  | "maintenance.parts.consume"
  | "maintenance.schedule.manage"
  | "maintenance.assign"
  | "admin.users.manage"
  | "admin.workspace.manage"
  | "admin.settings.manage"
  | "admin.audit.view";
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
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
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  settings?: Record<string, unknown>;
  is_active: boolean;
}
export interface PermissionContext {
  user: AuthUser;
  resource?: {
    workspace_id: string;
    owner_id?: string;
    brand_id?: string;
  };
}
export type PermissionCheck = (context: PermissionContext) => boolean;

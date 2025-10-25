import { Role, Permission } from "./rbac";
export type UserRole = Role;
export type { Permission } from "./rbac";
export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    position: string;
    department: string;
    permissions?: Permission[];
}
export declare function hasAccess(user: User, route: string): boolean;
export declare function getAccessibleNavigation(user: User): {
    name: string;
    href: string;
    icon: string;
    department: string;
    permission: string;
}[];
export declare function canCreate(user: User, _context?: string): boolean;
export declare function canEdit(user: User, _context?: string): boolean;
export declare function canDelete(user: User, _context?: string): boolean;
export declare function canApprove(user: User, _context?: string): boolean;
export declare function getRoleInfo(role: UserRole): {
    description: string;
};

export type UserRole = 'admin' | 'manager' | 'supervisor' | 'operator' | 'employee';
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    position: string;
    department: string;
    permissions?: Record<string, any>;
}
export declare const DEPARTMENT_ACCESS: {
    Cutting: string[];
    Printing: string[];
    Sewing: string[];
    Quality: string[];
    Finishing: string[];
    Delivery: string[];
    Finance: string[];
    HR: string[];
    Maintenance: string[];
    Administration: any[];
    Management: any[];
};
export declare const ROLE_PERMISSIONS: {
    admin: {
        description: string;
        departments: string[];
        canAccess: string[];
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canApprove: boolean;
    };
    manager: {
        description: string;
        departments: string[];
        canAccess: string[];
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canApprove: boolean;
    };
    supervisor: {
        description: string;
        departments: any[];
        canAccess: string[];
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canApprove: boolean;
    };
    operator: {
        description: string;
        departments: any[];
        canAccess: string[];
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canApprove: boolean;
    };
    employee: {
        description: string;
        departments: any[];
        canAccess: string[];
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canApprove: boolean;
    };
};
export declare function hasAccess(user: User, route: string): boolean;
export declare function getAccessibleNavigation(user: User): {
    name: string;
    href: string;
    icon: string;
    department: string;
}[];
export declare function canCreate(user: User): boolean;
export declare function canEdit(user: User): boolean;
export declare function canDelete(user: User): boolean;
export declare function canApprove(user: User): boolean;
export declare function getRoleInfo(role: UserRole): {
    description: string;
    departments: any[];
    canAccess: string[];
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
} | {
    description: string;
};

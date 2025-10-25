"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIRES_2FA = exports.ROLE_PERMISSIONS = void 0;
// RBAC helpers
exports.ROLE_PERMISSIONS = {
    Admin: [
        "orders:create",
        "orders:read",
        "orders:update",
        "orders:delete",
        "production:read",
        "production:update",
        "production:manage",
        "finance:read",
        "finance:write",
        "finance:update",
        "finance:manage",
        "hr:read",
        "hr:write",
        "hr:update",
        "hr:manage",
        "admin:users",
        "admin:settings",
        "admin:audit",
        "reports:view",
        "reports:export",
    ],
    Manager: [
        "orders:create",
        "orders:read",
        "orders:update",
        "production:read",
        "production:update",
        "production:manage",
        "finance:read",
        "finance:write",
        "finance:update",
        "hr:read",
        "hr:write",
        "hr:update",
        "reports:view",
        "reports:export",
    ],
    CSR: [
        "orders:create",
        "orders:read",
        "orders:update",
        "production:read",
        "reports:view",
    ],
    Worker: ["production:read", "production:update"],
    Client: ["orders:read"],
};
exports.REQUIRES_2FA = ["Admin", "Manager"];

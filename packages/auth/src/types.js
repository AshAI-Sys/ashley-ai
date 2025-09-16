"use strict";
// ASH AI Authentication Types
// Type definitions for authentication and authorization
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.UserRole = void 0;
// User roles with hierarchical permissions
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["CSR"] = "CSR";
    UserRole["GRAPHIC_ARTIST"] = "GRAPHIC_ARTIST";
    UserRole["PRODUCTION_OPERATOR"] = "PRODUCTION_OPERATOR";
    UserRole["QC_INSPECTOR"] = "QC_INSPECTOR";
    UserRole["WAREHOUSE_STAFF"] = "WAREHOUSE_STAFF";
    UserRole["CLIENT"] = "CLIENT";
})(UserRole || (exports.UserRole = UserRole = {}));
// Role-based permission mapping
exports.ROLE_PERMISSIONS = {
    [UserRole.ADMIN]: [
        // Full access to everything
        "orders.create", "orders.edit", "orders.view", "orders.delete", "orders.approve",
        "routing.apply_template", "routing.customize", "routing.view",
        "clients.create", "clients.edit", "clients.view", "clients.delete",
        "design.upload", "design.version", "design.approval.send", "design.approval.resolve", "design.lock", "design.view",
        "production.cutting.issue", "production.cutting.log", "production.cutting.bundle",
        "production.print.run", "production.print.material.log", "production.print.reject",
        "production.sew.run", "production.sew.bundle.scan", "production.sew.reject",
        "qc.create", "qc.sample", "qc.defect.log", "qc.passfail.set", "qc.plan.set", "qc.capa.create", "qc.override",
        "hr.attendance.view", "hr.attendance.edit", "payroll.run", "payroll.approve", "payroll.view",
        "maintenance.wo.create", "maintenance.wo.complete", "maintenance.parts.consume", "maintenance.schedule.manage", "maintenance.assign",
        "admin.users.manage", "admin.workspace.manage", "admin.settings.manage", "admin.audit.view"
    ],
    [UserRole.MANAGER]: [
        "orders.create", "orders.edit", "orders.view", "orders.approve",
        "routing.apply_template", "routing.customize", "routing.view",
        "clients.view", "clients.edit",
        "design.view", "design.approval.resolve", "design.lock",
        "production.cutting.issue", "production.cutting.log", "production.cutting.bundle",
        "production.print.run", "production.print.material.log", "production.print.reject",
        "qc.plan.set", "qc.capa.create", "qc.override",
        "hr.attendance.view", "payroll.view",
        "maintenance.schedule.manage", "maintenance.assign"
    ],
    [UserRole.CSR]: [
        "orders.create", "orders.edit", "orders.view",
        "routing.apply_template", "routing.view",
        "clients.create", "clients.edit", "clients.view",
        "design.view", "design.approval.send"
    ],
    [UserRole.GRAPHIC_ARTIST]: [
        "orders.view",
        "design.upload", "design.version", "design.view"
    ],
    [UserRole.PRODUCTION_OPERATOR]: [
        "orders.view",
        "production.cutting.issue", "production.cutting.log", "production.cutting.bundle",
        "production.print.run", "production.print.material.log", "production.print.reject",
        "production.sew.run", "production.sew.bundle.scan", "production.sew.reject"
    ],
    [UserRole.QC_INSPECTOR]: [
        "orders.view",
        "qc.create", "qc.sample", "qc.defect.log", "qc.passfail.set"
    ],
    [UserRole.WAREHOUSE_STAFF]: [
        "orders.view",
        "production.cutting.issue"
    ],
    [UserRole.CLIENT]: [
        "orders.view",
        "design.view", "design.approval.resolve"
    ]
};

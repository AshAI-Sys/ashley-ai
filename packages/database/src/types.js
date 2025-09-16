"use strict";
// ASH AI Database Types
// TypeScript type definitions for the database layer
Object.defineProperty(exports, "__esModule", { value: true });
exports.Currency = exports.UserRole = exports.QCResult = exports.DesignStatus = exports.PrintingMethod = exports.OrderStatus = void 0;
// Enum types used throughout the application
exports.OrderStatus = {
    INTAKE: "INTAKE",
    DESIGN_PENDING: "DESIGN_PENDING",
    DESIGN_APPROVAL: "DESIGN_APPROVAL",
    PRODUCTION_PLANNED: "PRODUCTION_PLANNED",
    IN_PROGRESS: "IN_PROGRESS",
    QC: "QC",
    PACKING: "PACKING",
    READY_FOR_DELIVERY: "READY_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
    CLOSED: "CLOSED",
    ON_HOLD: "ON_HOLD",
    CANCELLED: "CANCELLED",
};
exports.PrintingMethod = {
    SILKSCREEN: "SILKSCREEN",
    SUBLIMATION: "SUBLIMATION",
    DTF: "DTF",
    EMBROIDERY: "EMBROIDERY",
};
exports.DesignStatus = {
    DRAFT: "DRAFT",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    LOCKED: "LOCKED",
};
exports.QCResult = {
    ACCEPT: "ACCEPT",
    REJECT: "REJECT",
    PENDING_REVIEW: "PENDING_REVIEW",
};
exports.UserRole = {
    ADMIN: "ADMIN",
    MANAGER: "MANAGER",
    CSR: "CSR",
    GRAPHIC_ARTIST: "GRAPHIC_ARTIST",
    OPERATOR: "OPERATOR",
    QC_INSPECTOR: "QC_INSPECTOR",
    CLIENT: "CLIENT",
};
exports.Currency = {
    PHP: "PHP",
    USD: "USD",
    EUR: "EUR",
};

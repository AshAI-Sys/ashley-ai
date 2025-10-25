"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBadge = void 0;
const React = __importStar(require("react"));
const badge_1 = require("../badge");
const utils_1 = require("../../lib/utils");
const statusConfig = {
    // Order statuses
    INTAKE: { variant: "info", label: "Intake" },
    DESIGN_PENDING: { variant: "warning", label: "Design Pending" },
    DESIGN_APPROVAL: { variant: "warning", label: "Design Approval" },
    PRODUCTION_PLANNED: { variant: "info", label: "Production Planned" },
    IN_PROGRESS: { variant: "info", label: "In Progress" },
    QC: { variant: "warning", label: "Quality Control" },
    PACKING: { variant: "info", label: "Packing" },
    READY_FOR_DELIVERY: { variant: "success", label: "Ready for Delivery" },
    DELIVERED: { variant: "success", label: "Delivered" },
    CLOSED: { variant: "secondary", label: "Closed" },
    ON_HOLD: { variant: "warning", label: "On Hold" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
    // Production statuses
    PLANNED: { variant: "secondary", label: "Planned" },
    READY: { variant: "info", label: "Ready" },
    BLOCKED: { variant: "destructive", label: "Blocked" },
    DONE: { variant: "success", label: "Done" },
    PAUSED: { variant: "warning", label: "Paused" },
    // QC statuses
    PASS: { variant: "success", label: "Pass" },
    FAIL: { variant: "destructive", label: "Fail" },
    WARN: { variant: "warning", label: "Warning" },
    PENDING_REVIEW: { variant: "warning", label: "Pending Review" },
    // Design statuses
    DRAFT: { variant: "secondary", label: "Draft" },
    PENDING_APPROVAL: { variant: "warning", label: "Pending Approval" },
    APPROVED: { variant: "success", label: "Approved" },
    REJECTED: { variant: "destructive", label: "Rejected" },
    LOCKED: { variant: "info", label: "Locked" },
    // Payment statuses
    PENDING: { variant: "warning", label: "Pending" },
    PAID: { variant: "success", label: "Paid" },
    OVERDUE: { variant: "destructive", label: "Overdue" },
    PARTIAL: { variant: "warning", label: "Partial" },
    REFUNDED: { variant: "secondary", label: "Refunded" },
};
const StatusBadge = React.forwardRef(({ status, className, ...props }, _ref) => {
    const config = statusConfig[status] || {
        variant: "outline",
        label: status,
    };
    return (<badge_1.Badge variant={config.variant} className={(0, utils_1.cn)("font-medium", className)} {...props}>
        {config.label || status}
      </badge_1.Badge>);
});
exports.StatusBadge = StatusBadge;
StatusBadge.displayName = "StatusBadge";

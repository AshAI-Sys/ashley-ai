'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalStatus = ApprovalStatus;
const react_1 = __importDefault(require("react"));
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
function ApprovalStatus({ status, size = 'default', showIcon = true }) {
    const getStatusConfig = (status) => {
        switch (status.toUpperCase()) {
            case 'SENT':
                return {
                    label: 'Awaiting Approval',
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: lucide_react_1.Clock
                };
            case 'APPROVED':
                return {
                    label: 'Approved',
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: lucide_react_1.CheckCircle
                };
            case 'CHANGES_REQUESTED':
                return {
                    label: 'Changes Requested',
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: lucide_react_1.MessageCircle
                };
            case 'EXPIRED':
                return {
                    label: 'Expired',
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: lucide_react_1.AlertCircle
                };
            case 'REJECTED':
                return {
                    label: 'Rejected',
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: lucide_react_1.XCircle
                };
            default:
                return {
                    label: status.replace('_', ' '),
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: lucide_react_1.Clock
                };
        }
    };
    const config = getStatusConfig(status);
    const Icon = config.icon;
    return (<badge_1.Badge variant="outline" className={`${config.color} ${size === 'sm' ? 'text-xs px-2 py-1' :
            size === 'lg' ? 'text-sm px-3 py-2' :
                'text-sm px-2.5 py-1.5'}`}>
      {showIcon && <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`}/>}
      {config.label}
    </badge_1.Badge>);
}

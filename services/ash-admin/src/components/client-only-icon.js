"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientOnlyIconWithLoading = void 0;
const dynamic_1 = __importDefault(require("next/dynamic"));
// Client-only wrapper to prevent hydration mismatches with Lucide icons
const ClientOnlyIcon = ({ Icon, ...props }) => {
    return <Icon {...props}/>;
};
// Use dynamic import with no SSR to prevent hydration errors
exports.default = (0, dynamic_1.default)(() => Promise.resolve(ClientOnlyIcon), {
    ssr: false,
    loading: () => <div className="h-4 w-4 animate-pulse rounded bg-gray-300"/>,
});
// For the loading fallback, we need to handle props properly
const ClientOnlyIconWithLoading = ({ Icon, className = "w-4 h-4", ...props }) => {
    const DynamicIcon = (0, dynamic_1.default)(() => Promise.resolve(({ Icon, ...iconProps }) => <Icon {...iconProps}/>), {
        ssr: false,
        loading: () => (<div className={`${className} animate-pulse rounded bg-gray-300`}/>),
    });
    return <DynamicIcon Icon={Icon} className={className} {...props}/>;
};
exports.ClientOnlyIconWithLoading = ClientOnlyIconWithLoading;

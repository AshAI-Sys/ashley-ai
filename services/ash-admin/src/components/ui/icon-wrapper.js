"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconWrapper = IconWrapper;
const react_1 = __importDefault(require("react"));
/**
 * Wrapper for Lucide icons to prevent hydration errors
 * Lucide icons dynamically generate classNames which can cause mismatch between server and client
 */
function IconWrapper({ children, ...props }) {
    return (<span suppressHydrationWarning {...props}>
      {children}
    </span>);
}

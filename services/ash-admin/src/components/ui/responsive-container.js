"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsiveContainer = ResponsiveContainer;
exports.ResponsiveGrid = ResponsiveGrid;
exports.ResponsiveStack = ResponsiveStack;
exports.MobileOnly = MobileOnly;
exports.DesktopOnly = DesktopOnly;
exports.ResponsiveCard = ResponsiveCard;
exports.ResponsiveTable = ResponsiveTable;
exports.ResponsiveButtonGroup = ResponsiveButtonGroup;
const react_1 = __importDefault(require("react"));
const utils_1 = require("@/lib/utils");
function ResponsiveContainer({ children, className, padding = "md", maxWidth = "full", }) {
    const paddingClasses = {
        none: "",
        sm: "p-2 sm:p-4",
        md: "p-4 sm:p-6 lg:p-8",
        lg: "p-6 sm:p-8 lg:p-12",
    };
    const maxWidthClasses = {
        sm: "max-w-screen-sm",
        md: "max-w-screen-md",
        lg: "max-w-screen-lg",
        xl: "max-w-screen-xl",
        "2xl": "max-w-screen-2xl",
        full: "max-w-full",
    };
    return (<div className={(0, utils_1.cn)("mx-auto w-full", paddingClasses[padding], maxWidthClasses[maxWidth], className)}>
      {children}
    </div>);
}
function ResponsiveGrid({ children, className, cols = { mobile: 1, tablet: 2, desktop: 3 }, gap = "md", }) {
    const gapClasses = {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
    };
    const colClasses = [
        `grid-cols-${cols.mobile || 1}`,
        `md:grid-cols-${cols.tablet || 2}`,
        `lg:grid-cols-${cols.desktop || 3}`,
    ].join(" ");
    return (<div className={(0, utils_1.cn)("grid", colClasses, gapClasses[gap], className)}>
      {children}
    </div>);
}
function ResponsiveStack({ children, className, direction = "row", align = "start", justify = "start", gap = "md", }) {
    const gapClasses = {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
    };
    const alignClasses = {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
    };
    const justifyClasses = {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
    };
    const directionClass = direction === "row" ? "md:flex-row" : "md:flex-row-reverse";
    return (<div className={(0, utils_1.cn)("flex flex-col", directionClass, alignClasses[align], justifyClasses[justify], gapClasses[gap], className)}>
      {children}
    </div>);
}
function MobileOnly({ children, className }) {
    return <div className={(0, utils_1.cn)("block md:hidden", className)}>{children}</div>;
}
function DesktopOnly({ children, className }) {
    return <div className={(0, utils_1.cn)("hidden md:block", className)}>{children}</div>;
}
function ResponsiveCard({ children, className, variant = "default", }) {
    const variantClasses = {
        compact: "p-3 sm:p-4",
        default: "p-4 sm:p-6",
        spacious: "p-6 sm:p-8",
    };
    return (<div className={(0, utils_1.cn)("rounded-lg border bg-card text-card-foreground shadow-sm", variantClasses[variant], className)}>
      {children}
    </div>);
}
function ResponsiveTable({ children, className }) {
    return (<div className="w-full overflow-hidden rounded-lg border">
      <div className={(0, utils_1.cn)("overflow-x-auto", className)}>
        <div className="inline-block min-w-full align-middle">{children}</div>
      </div>
    </div>);
}
function ResponsiveButtonGroup({ children, className, fullWidthMobile = true, }) {
    return (<div className={(0, utils_1.cn)("flex flex-col gap-2 sm:flex-row sm:gap-3", fullWidthMobile && "[&>button]:w-full sm:[&>button]:w-auto", className)}>
      {children}
    </div>);
}

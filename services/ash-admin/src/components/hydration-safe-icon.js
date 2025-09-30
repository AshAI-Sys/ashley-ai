'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HydrationSafeIcon;
const react_1 = require("react");
// Hydration-safe icon wrapper to prevent SSR/client mismatches
function HydrationSafeIcon({ Icon, className = 'w-4 h-4', ...props }) {
    const [mounted, setMounted] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setMounted(true);
    }, []);
    // Show placeholder during SSR and before hydration
    if (!mounted) {
        return <div className={`${className} bg-transparent`}/>;
    }
    // Render actual icon after hydration
    return <Icon className={className} {...props}/>;
}

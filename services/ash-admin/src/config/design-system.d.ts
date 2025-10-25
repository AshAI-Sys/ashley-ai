/**
 * Design System Configuration
 * Theme: Minimal Corporate (Soft Neutrals)
 *
 * This file contains the design tokens for the Ashley AI application.
 * Use these tokens consistently across all components.
 */
export declare const designSystem: {
    readonly colors: {
        readonly primary: "#2563EB";
        readonly accent: "#38BDF8";
        readonly background: "#F8FAFC";
        readonly sidebar: "#1E293B";
        readonly text: "#0F172A";
        readonly textMuted: "#64748B";
        readonly border: "#E2E8F0";
        readonly success: "#10B981";
        readonly warning: "#F59E0B";
        readonly error: "#EF4444";
        readonly info: "#3B82F6";
    };
    readonly fonts: {
        readonly primary: "Inter, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif";
        readonly mono: "\"Roboto Mono\", \"Courier New\", monospace";
    };
    readonly spacing: {
        readonly xs: "8px";
        readonly sm: "12px";
        readonly md: "16px";
        readonly lg: "24px";
        readonly xl: "32px";
        readonly xxl: "48px";
    };
    readonly radius: {
        readonly sm: "0.375rem";
        readonly md: "0.5rem";
        readonly lg: "0.75rem";
        readonly xl: "1rem";
        readonly '2xl': "1.5rem";
        readonly full: "9999px";
    };
    readonly shadows: {
        readonly sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
        readonly md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
        readonly lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
        readonly xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
        readonly glow: "0 0 20px rgba(37, 99, 235, 0.3)";
    };
    readonly transitions: {
        readonly fast: "150ms";
        readonly normal: "300ms";
        readonly slow: "500ms";
    };
    readonly breakpoints: {
        readonly sm: "640px";
        readonly md: "768px";
        readonly lg: "1024px";
        readonly xl: "1280px";
        readonly '2xl': "1536px";
    };
    readonly zIndex: {
        readonly dropdown: 1000;
        readonly sticky: 1020;
        readonly fixed: 1030;
        readonly modalBackdrop: 1040;
        readonly modal: 1050;
        readonly popover: 1060;
        readonly tooltip: 1070;
    };
};
export declare const cssVariables: {
    light: {
        '--color-primary': "#2563EB";
        '--color-accent': "#38BDF8";
        '--color-background': "#F8FAFC";
        '--color-sidebar': "#1E293B";
        '--color-text': "#0F172A";
        '--color-text-muted': "#64748B";
        '--color-border': "#E2E8F0";
    };
    dark: {
        '--color-primary': string;
        '--color-accent': string;
        '--color-background': string;
        '--color-sidebar': string;
        '--color-text': string;
        '--color-text-muted': string;
        '--color-border': string;
    };
};
export declare const getColor: (colorName: keyof typeof designSystem.colors) => "#F8FAFC" | "#2563EB" | "#3B82F6" | "#10B981" | "#F59E0B" | "#EF4444" | "#38BDF8" | "#1E293B" | "#0F172A" | "#64748B" | "#E2E8F0";
export declare const getSpacing: (spacingName: keyof typeof designSystem.spacing) => "16px" | "8px" | "12px" | "24px" | "32px" | "48px";
export default designSystem;

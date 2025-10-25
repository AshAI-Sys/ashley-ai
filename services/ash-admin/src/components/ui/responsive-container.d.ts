import React from "react";
/**
 * Responsive Container Component
 * Automatically adjusts layout between mobile and desktop views
 */
interface ResponsiveContainerProps {
    children: React.ReactNode;
    className?: string;
    /**
     * Padding preset: 'none' | 'sm' | 'md' | 'lg'
     * Default: 'md'
     */
    padding?: "none" | "sm" | "md" | "lg";
    /**
     * Max width preset: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
     * Default: 'full'
     */
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}
export declare function ResponsiveContainer({ children, className, padding, maxWidth, }: ResponsiveContainerProps): React.JSX.Element;
/**
 * Responsive Grid Component
 * Auto-adjusts columns based on screen size
 */
interface ResponsiveGridProps {
    children: React.ReactNode;
    className?: string;
    /**
     * Number of columns on different screen sizes
     * Default: { mobile: 1, tablet: 2, desktop: 3 }
     */
    cols?: {
        mobile?: number;
        tablet?: number;
        desktop?: number;
    };
    gap?: "sm" | "md" | "lg";
}
export declare function ResponsiveGrid({ children, className, cols, gap, }: ResponsiveGridProps): React.JSX.Element;
/**
 * Mobile-First Stack Component
 * Stacks vertically on mobile, horizontally on desktop
 */
interface ResponsiveStackProps {
    children: React.ReactNode;
    className?: string;
    /**
     * Direction on desktop: 'row' | 'row-reverse'
     * Mobile is always 'column'
     */
    direction?: "row" | "row-reverse";
    /**
     * Alignment
     */
    align?: "start" | "center" | "end" | "stretch";
    /**
     * Justify content
     */
    justify?: "start" | "center" | "end" | "between" | "around";
    /**
     * Gap between items
     */
    gap?: "sm" | "md" | "lg";
}
export declare function ResponsiveStack({ children, className, direction, align, justify, gap, }: ResponsiveStackProps): React.JSX.Element;
/**
 * Mobile/Desktop Conditional Rendering
 * Shows/hides content based on screen size
 */
interface MobileOnlyProps {
    children: React.ReactNode;
    className?: string;
}
export declare function MobileOnly({ children, className }: MobileOnlyProps): React.JSX.Element;
export declare function DesktopOnly({ children, className }: MobileOnlyProps): React.JSX.Element;
/**
 * Responsive Card Component
 * Optimized padding and layout for mobile and desktop
 */
interface ResponsiveCardProps {
    children: React.ReactNode;
    className?: string;
    /**
     * Card variant: 'default' | 'compact' | 'spacious'
     */
    variant?: "default" | "compact" | "spacious";
}
export declare function ResponsiveCard({ children, className, variant, }: ResponsiveCardProps): React.JSX.Element;
/**
 * Responsive Table Wrapper
 * Makes tables scrollable on mobile
 */
interface ResponsiveTableProps {
    children: React.ReactNode;
    className?: string;
}
export declare function ResponsiveTable({ children, className }: ResponsiveTableProps): React.JSX.Element;
/**
 * Responsive Button Group
 * Stacks buttons vertically on mobile
 */
interface ResponsiveButtonGroupProps {
    children: React.ReactNode;
    className?: string;
    /**
     * Whether buttons should take full width on mobile
     */
    fullWidthMobile?: boolean;
}
export declare function ResponsiveButtonGroup({ children, className, fullWidthMobile, }: ResponsiveButtonGroupProps): React.JSX.Element;
export {};

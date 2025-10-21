import React from "react";
import { cn } from "@/lib/utils";

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

export function ResponsiveContainer({
  children,
  className,
  padding = "md",
  maxWidth = "full",
}: ResponsiveContainerProps) {
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

  return (
    <div
      className={cn(
        "mx-auto w-full",
        paddingClasses[padding],
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

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

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md",
}: ResponsiveGridProps) {
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

  return (
    <div className={cn("grid", colClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
}

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

export function ResponsiveStack({
  children,
  className,
  direction = "row",
  align = "start",
  justify = "start",
  gap = "md",
}: ResponsiveStackProps) {
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

  const directionClass =
    direction === "row" ? "md:flex-row" : "md:flex-row-reverse";

  return (
    <div
      className={cn(
        "flex flex-col",
        directionClass,
        alignClasses[align],
        justifyClasses[justify],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Mobile/Desktop Conditional Rendering
 * Shows/hides content based on screen size
 */
interface MobileOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileOnly({ children, className }: MobileOnlyProps) {
  return <div className={cn("block md:hidden", className)}>{children}</div>;
}

export function DesktopOnly({ children, className }: MobileOnlyProps) {
  return <div className={cn("hidden md:block", className)}>{children}</div>;
}

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

export function ResponsiveCard({
  children,
  className,
  variant = "default",
}: ResponsiveCardProps) {
  const variantClasses = {
    compact: "p-3 sm:p-4",
    default: "p-4 sm:p-6",
    spacious: "p-6 sm:p-8",
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Responsive Table Wrapper
 * Makes tables scrollable on mobile
 */
interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border">
      <div className={cn("overflow-x-auto", className)}>
        <div className="inline-block min-w-full align-middle">{children}</div>
      </div>
    </div>
  );
}

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

export function ResponsiveButtonGroup({
  children,
  className,
  fullWidthMobile = true,
}: ResponsiveButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:gap-3",
        fullWidthMobile && "[&>button]:w-full sm:[&>button]:w-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

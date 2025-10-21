"use client";

import { ReactNode } from "react";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * ResponsiveTable - Wraps tables for horizontal scroll on mobile
 * Usage: <ResponsiveTable><table>...</table></ResponsiveTable>
 */
export function ResponsiveTable({
  children,
  className = "",
}: ResponsiveTableProps) {
  return (
    <div
      className={`-mx-4 w-full overflow-x-auto px-4 sm:mx-0 sm:px-0 ${className}`}
    >
      <div className="inline-block min-w-full align-middle">{children}</div>
    </div>
  );
}

interface MobileCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * MobileCard - Card view for mobile devices
 * Shows table data as stacked cards on small screens
 */
export function MobileCard({ children, className = "" }: MobileCardProps) {
  return (
    <div
      className={`mb-3 block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md lg:hidden dark:border-gray-700 dark:bg-gray-800 ${className} `}
    >
      {children}
    </div>
  );
}

interface MobileCardRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

/**
 * MobileCardRow - Single row in a mobile card
 */
export function MobileCardRow({
  label,
  value,
  className = "",
}: MobileCardRowProps) {
  return (
    <div
      className={`flex items-start justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-700 ${className}`}
    >
      <span className="mr-4 text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}:
      </span>
      <span className="flex-1 text-right text-sm text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  );
}

interface DesktopTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * DesktopTable - Hidden on mobile, shown on desktop
 */
export function DesktopTable({ children, className = "" }: DesktopTableProps) {
  return (
    <div className={`hidden lg:block ${className}`}>
      <ResponsiveTable>{children}</ResponsiveTable>
    </div>
  );
}

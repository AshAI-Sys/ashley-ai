import { ReactNode } from "react";
interface ResponsiveTableProps {
    children: ReactNode;
    className?: string;
} /** * ResponsiveTable - Wraps tables for horizontal scroll on mobile * Usage: <ResponsiveTable><table>...</table></ResponsiveTable> */
export declare function ResponsiveTable({ children, className, }: ResponsiveTableProps): import("react").JSX.Element;
interface MobileCardProps {
    children: ReactNode;
    className?: string;
} /** * MobileCard - Card view for mobile devices * Shows table data as stacked cards on small screens */
export declare function MobileCard({ children, className }: MobileCardProps): import("react").JSX.Element;
interface MobileCardRowProps {
    label: string;
    value: ReactNode;
    className?: string;
} /** * MobileCardRow - Single row in a mobile card */
export declare function MobileCardRow({ label, value, className, }: MobileCardRowProps): import("react").JSX.Element;
interface DesktopTableProps {
    children: ReactNode;
    className?: string;
} /** * DesktopTable - Hidden on mobile, shown on desktop */
export declare function DesktopTable({ children, className }: DesktopTableProps): import("react").JSX.Element;
export {};

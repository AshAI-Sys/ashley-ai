import React from "react";
/**
 * Dashboard Statistics Grid Skeleton
 * Used for: Dashboard pages with metric cards
 */
export declare function DashboardStatsSkeleton(): React.JSX.Element;
/**
 * Data Table Skeleton
 * Used for: Order lists, Client lists, Employee tables
 */
export declare function DataTableSkeleton({ rows }: {
    rows?: number;
}): React.JSX.Element;
/**
 * Form Skeleton
 * Used for: Create/Edit pages
 */
export declare function FormSkeleton({ fields }: {
    fields?: number;
}): React.JSX.Element;
/**
 * Details Page Skeleton
 * Used for: Order details, Client details, etc.
 */
export declare function DetailsPageSkeleton(): React.JSX.Element;
/**
 * Production Dashboard Skeleton
 * Used for: Printing, Sewing, Cutting dashboards
 */
export declare function ProductionDashboardSkeleton(): React.JSX.Element;
/**
 * Chart Skeleton
 * Used for: Analytics pages with charts
 */
export declare function ChartSkeleton({ height }: {
    height?: string;
}): React.JSX.Element;
/**
 * Timeline Skeleton
 * Used for: Activity logs, Order history
 */
export declare function TimelineSkeleton({ items }: {
    items?: number;
}): React.JSX.Element;
/**
 * Mobile Card List Skeleton
 * Used for: Mobile-optimized list views
 */
export declare function MobileCardListSkeleton({ items }: {
    items?: number;
}): React.JSX.Element;
/**
 * Page Loading Component
 * Full-page loading state with brand styling
 */
export declare function PageLoader({ message }: {
    message?: string;
}): React.JSX.Element;

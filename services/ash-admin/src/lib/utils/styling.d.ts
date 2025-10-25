/**
 * Styling Utilities - Centralized functions for consistent UI styling
 * Reduces code duplication across components
 */
export declare const statusColors: {
    readonly draft: "bg-gray-100 text-gray-800 border-gray-200";
    readonly pending: "bg-yellow-100 text-yellow-800 border-yellow-200";
    readonly pending_approval: "bg-yellow-100 text-yellow-800 border-yellow-200";
    readonly confirmed: "bg-blue-100 text-blue-800 border-blue-200";
    readonly in_progress: "bg-purple-100 text-purple-800 border-purple-200";
    readonly in_production: "bg-purple-100 text-purple-800 border-purple-200";
    readonly completed: "bg-green-100 text-green-800 border-green-200";
    readonly cancelled: "bg-red-100 text-red-800 border-red-200";
    readonly failed: "bg-red-100 text-red-800 border-red-200";
    readonly active: "bg-green-100 text-green-800 border-green-200";
    readonly inactive: "bg-gray-100 text-gray-800 border-gray-200";
};
export declare const severityColors: {
    readonly critical: "bg-red-100 text-red-800 border-red-200";
    readonly high: "bg-orange-100 text-orange-800 border-orange-200";
    readonly medium: "bg-yellow-100 text-yellow-800 border-yellow-200";
    readonly low: "bg-blue-100 text-blue-800 border-blue-200";
    readonly info: "bg-blue-100 text-blue-800 border-blue-200";
    readonly minor: "bg-green-100 text-green-800 border-green-200";
};
export declare const priorityColors: {
    readonly urgent: "bg-red-100 text-red-800 border-red-200";
    readonly high: "bg-orange-100 text-orange-800 border-orange-200";
    readonly normal: "bg-blue-100 text-blue-800 border-blue-200";
    readonly low: "bg-gray-100 text-gray-800 border-gray-200";
};
/**
 * Get Tailwind CSS classes for a status badge
 * @param status - The status string (e.g., 'pending', 'completed')
 * @param defaultClass - Default classes if status not found
 * @returns Tailwind CSS class string
 */
export declare function getStatusColor(status: string, defaultClass?: string): string;
/**
 * Get Tailwind CSS classes for a severity badge
 * @param severity - The severity string (e.g., 'critical', 'low')
 * @param defaultClass - Default classes if severity not found
 * @returns Tailwind CSS class string
 */
export declare function getSeverityColor(severity: string, defaultClass?: string): string;
/**
 * Get Tailwind CSS classes for a priority badge
 * @param priority - The priority string (e.g., 'urgent', 'low')
 * @param defaultClass - Default classes if priority not found
 * @returns Tailwind CSS class string
 */
export declare function getPriorityColor(priority: string, defaultClass?: string): string;
/**
 * Format status text for display (capitalize, replace underscores)
 * @param status - The status string
 * @returns Formatted status string
 */
export declare function formatStatus(status: string): string;
/**
 * Get chart colors for data visualization (consistent across all charts)
 */
export declare const chartColors: {
    readonly primary: "#2563EB";
    readonly secondary: "#38BDF8";
    readonly success: "#10B981";
    readonly warning: "#F59E0B";
    readonly danger: "#EF4444";
    readonly purple: "#8B5CF6";
    readonly pink: "#EC4899";
    readonly gray: "#6B7280";
};
/**
 * Get an array of chart colors for multi-series charts
 * @param count - Number of colors needed
 * @returns Array of hex color codes
 */
export declare function getChartColorPalette(count: number): string[];

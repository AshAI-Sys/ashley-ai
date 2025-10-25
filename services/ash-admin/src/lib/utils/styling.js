"use strict";
/**
 * Styling Utilities - Centralized functions for consistent UI styling
 * Reduces code duplication across components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.chartColors = exports.priorityColors = exports.severityColors = exports.statusColors = void 0;
exports.getStatusColor = getStatusColor;
exports.getSeverityColor = getSeverityColor;
exports.getPriorityColor = getPriorityColor;
exports.formatStatus = formatStatus;
exports.getChartColorPalette = getChartColorPalette;
// Status color mapping for orders, tasks, etc.
exports.statusColors = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
    in_production: 'bg-purple-100 text-purple-800 border-purple-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
};
// Severity color mapping for issues, alerts, defects
exports.severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    minor: 'bg-green-100 text-green-800 border-green-200',
};
// Priority color mapping
exports.priorityColors = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    normal: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
};
/**
 * Get Tailwind CSS classes for a status badge
 * @param status - The status string (e.g., 'pending', 'completed')
 * @param defaultClass - Default classes if status not found
 * @returns Tailwind CSS class string
 */
function getStatusColor(status, defaultClass = 'bg-gray-100 text-gray-800 border-gray-200') {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_');
    return exports.statusColors[normalizedStatus] || defaultClass;
}
/**
 * Get Tailwind CSS classes for a severity badge
 * @param severity - The severity string (e.g., 'critical', 'low')
 * @param defaultClass - Default classes if severity not found
 * @returns Tailwind CSS class string
 */
function getSeverityColor(severity, defaultClass = 'bg-gray-100 text-gray-800 border-gray-200') {
    const normalizedSeverity = severity?.toLowerCase();
    return exports.severityColors[normalizedSeverity] || defaultClass;
}
/**
 * Get Tailwind CSS classes for a priority badge
 * @param priority - The priority string (e.g., 'urgent', 'low')
 * @param defaultClass - Default classes if priority not found
 * @returns Tailwind CSS class string
 */
function getPriorityColor(priority, defaultClass = 'bg-gray-100 text-gray-800 border-gray-200') {
    const normalizedPriority = priority?.toLowerCase();
    return exports.priorityColors[normalizedPriority] || defaultClass;
}
/**
 * Format status text for display (capitalize, replace underscores)
 * @param status - The status string
 * @returns Formatted status string
 */
function formatStatus(status) {
    if (!status)
        return '';
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
/**
 * Get chart colors for data visualization (consistent across all charts)
 */
exports.chartColors = {
    primary: '#2563EB', // blue-600
    secondary: '#38BDF8', // sky-400
    success: '#10B981', // green-500
    warning: '#F59E0B', // amber-500
    danger: '#EF4444', // red-500
    purple: '#8B5CF6', // violet-500
    pink: '#EC4899', // pink-500
    gray: '#6B7280', // gray-500
};
/**
 * Get an array of chart colors for multi-series charts
 * @param count - Number of colors needed
 * @returns Array of hex color codes
 */
function getChartColorPalette(count) {
    const colors = Object.values(exports.chartColors);
    const palette = [];
    for (let i = 0; i < count; i++) {
        palette.push(colors[i % colors.length]);
    }
    return palette;
}

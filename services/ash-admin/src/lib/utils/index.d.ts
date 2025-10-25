/**
 * Utility Functions Index
 * Centralized export for all utility functions
 *
 * Usage:
 * import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
 */
export { statusColors, severityColors, priorityColors, getStatusColor, getSeverityColor, getPriorityColor, formatStatus, chartColors, getChartColorPalette, } from './styling';
export { formatDate, formatRelativeTime, getToday, getThisMonth, getDateRange, isPast, isFuture, daysUntil, } from './date';
export { getStatusIcon, getActionIcon, getEntityIcon, getTrendIcon, getIconColorClass, } from './icons';
export { formatCurrency, formatNumber, formatPercentage, truncateText, formatPhoneNumber, formatFileSize, pluralize, formatCount, capitalize, toTitleCase, getInitials, calculatePercentage, formatDuration, } from './format';

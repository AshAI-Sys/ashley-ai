/**
 * Date Utilities - Centralized functions for date formatting and manipulation
 * Reduces code duplication across components
 */
/**
 * Format a date string or Date object to a readable format
 * @param date - Date string or Date object
 * @param format - Format option ('short', 'long', 'time', 'datetime')
 * @returns Formatted date string
 */
export declare function formatDate(date: string | Date | null | undefined, format?: 'short' | 'long' | 'time' | 'datetime'): string;
/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export declare function formatRelativeTime(date: string | Date | null | undefined): string;
/**
 * Get start and end of today
 * @returns Object with startOfDay and endOfDay Date objects
 */
export declare function getToday(): {
    startOfDay: Date;
    endOfDay: Date;
};
/**
 * Get start and end of current month
 * @returns Object with startOfMonth and endOfMonth Date objects
 */
export declare function getThisMonth(): {
    startOfMonth: Date;
    endOfMonth: Date;
};
/**
 * Get start and end of a date range based on time range string
 * @param timeRange - Time range string (e.g., '7d', '30d', '90d', 'today', 'this_month')
 * @returns Object with startDate and endDate Date objects
 */
export declare function getDateRange(timeRange: string): {
    startDate: Date;
    endDate: Date;
};
/**
 * Check if a date is in the past
 * @param date - Date string or Date object
 * @returns True if date is in the past
 */
export declare function isPast(date: string | Date): boolean;
/**
 * Check if a date is in the future
 * @param date - Date string or Date object
 * @returns True if date is in the future
 */
export declare function isFuture(date: string | Date): boolean;
/**
 * Calculate days until a date
 * @param date - Date string or Date object
 * @returns Number of days until the date (negative if past)
 */
export declare function daysUntil(date: string | Date): number;

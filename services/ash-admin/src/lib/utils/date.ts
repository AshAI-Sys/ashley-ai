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
export function formatDate(
  date: string | Date | null | undefined,
  format: 'short' | 'long' | 'time' | 'datetime' = 'short'
): string {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    switch (format) {
      case 'short':
        // Format: MM/DD/YYYY
        return dateObj.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        });

      case 'long':
        // Format: January 15, 2025
        return dateObj.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

      case 'time':
        // Format: 2:30 PM
        return dateObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

      case 'datetime':
        // Format: Jan 15, 2025 2:30 PM
        return dateObj.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

      default:
        return dateObj.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffDay < 30) {
      const weeks = Math.floor(diffDay / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    if (diffDay < 365) {
      const months = Math.floor(diffDay / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }

    const years = Math.floor(diffDay / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Unknown';
  }
}

/**
 * Get start and end of today
 * @returns Object with startOfDay and endOfDay Date objects
 */
export function getToday() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return { startOfDay, endOfDay };
}

/**
 * Get start and end of current month
 * @returns Object with startOfMonth and endOfMonth Date objects
 */
export function getThisMonth() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return { startOfMonth, endOfMonth };
}

/**
 * Get start and end of a date range based on time range string
 * @param timeRange - Time range string (e.g., '7d', '30d', '90d', 'today', 'this_month')
 * @returns Object with startDate and endDate Date objects
 */
export function getDateRange(timeRange: string) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (timeRange) {
    case 'today':
      const today = getToday();
      startDate = today.startOfDay;
      endDate = today.endOfDay;
      break;

    case 'this_week':
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      break;

    case 'this_month':
      const thisMonth = getThisMonth();
      startDate = thisMonth.startOfMonth;
      endDate = thisMonth.endOfMonth;
      break;

    case '7d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;

    case '30d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      break;

    case '90d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90);
      break;

    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;

    default:
      // Default to last 30 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
  }

  return { startDate, endDate };
}

/**
 * Check if a date is in the past
 * @param date - Date string or Date object
 * @returns True if date is in the past
 */
export function isPast(date: string | Date): boolean {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getTime() < Date.now();
  } catch (error) {
    return false;
  }
}

/**
 * Check if a date is in the future
 * @param date - Date string or Date object
 * @returns True if date is in the future
 */
export function isFuture(date: string | Date): boolean {
  if (!date) return false;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getTime() > Date.now();
  } catch (error) {
    return false;
  }
}

/**
 * Calculate days until a date
 * @param date - Date string or Date object
 * @returns Number of days until the date (negative if past)
 */
export function daysUntil(date: string | Date): number {
  if (!date) return 0;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
}

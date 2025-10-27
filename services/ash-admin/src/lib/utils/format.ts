/**
 * Format Utilities - Centralized functions for number, currency, and text formatting
 */

/**
 * Format number as currency
 * @param amount - Number to format
 * @param currency - Currency code (default: 'PHP')
 * @param locale - Locale for formatting (default: 'en-PH')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'PHP',
  locale: string = 'en-PH'
): string {
  if (amount === null || amount === undefined) return '₱0.00';

  try {
    // For PHP, use custom formatting for better display
    if (currency === 'PHP') {
      return `₱${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Format number with commas
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined) return '0';

  try {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } catch (error) {
    return value.toString();
  }
}

/**
 * Format percentage
 * @param value - Number to format as percentage (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined) return '0%';

  try {
    return `${value.toFixed(decimals)}%`;
  } catch (error) {
    return '0%';
  }
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return '';

  if (text.length <= maxLength) return text;

  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format phone number
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format for Philippine numbers (+63)
  if (cleaned.startsWith('63') && cleaned.length === 12) {
    return `+63 ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  }

  // Format for local numbers (10 digits)
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }

  // Return as-is if format unknown
  return phone;
}

/**
 * Convert bytes to human-readable file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Pluralize a word based on count
 * @param count - Number to check
 * @param singular - Singular form of word
 * @param plural - Plural form of word (optional, will add 's' if not provided)
 * @returns Pluralized word
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  if (count === 1) return singular;

  return plural || `${singular}s`;
}

/**
 * Format count with pluralized label
 * @param count - Number to format
 * @param label - Label to pluralize
 * @returns Formatted count string (e.g., "5 items", "1 item")
 */
export function formatCount(count: number, label: string): string {
  return `${formatNumber(count)} ${pluralize(count, label)}`;
}

/**
 * Capitalize first letter of string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return '';

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 * @param text - Text to convert
 * @returns Title cased text
 */
export function toTitleCase(text: string | null | undefined): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Generate initials from name
 * @param name - Full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';

  const parts = name.trim().split(' ').filter(p => p.length > 0);

  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase();
  }

  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

/**
 * Calculate percentage
 * @param part - Part value
 * @param total - Total value
 * @param decimals - Number of decimal places
 * @returns Calculated percentage
 */
export function calculatePercentage(
  part: number,
  total: number,
  decimals: number = 1
): number {
  if (total === 0) return 0;

  return parseFloat(((part / total) * 100).toFixed(decimals));
}

/**
 * Format duration in seconds to readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "2h 30m", "45s")
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds === 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 && hours === 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
}

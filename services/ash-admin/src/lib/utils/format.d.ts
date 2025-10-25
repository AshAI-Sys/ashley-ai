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
export declare function formatCurrency(amount: number | null | undefined, currency?: string, locale?: string): string;
/**
 * Format number with commas
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export declare function formatNumber(value: number | null | undefined, decimals?: number): string;
/**
 * Format percentage
 * @param value - Number to format as percentage (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export declare function formatPercentage(value: number | null | undefined, decimals?: number): string;
/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export declare function truncateText(text: string | null | undefined, maxLength?: number): string;
/**
 * Format phone number
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export declare function formatPhoneNumber(phone: string | null | undefined): string;
/**
 * Convert bytes to human-readable file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export declare function formatFileSize(bytes: number | null | undefined): string;
/**
 * Pluralize a word based on count
 * @param count - Number to check
 * @param singular - Singular form of word
 * @param plural - Plural form of word (optional, will add 's' if not provided)
 * @returns Pluralized word
 */
export declare function pluralize(count: number, singular: string, plural?: string): string;
/**
 * Format count with pluralized label
 * @param count - Number to format
 * @param label - Label to pluralize
 * @returns Formatted count string (e.g., "5 items", "1 item")
 */
export declare function formatCount(count: number, label: string): string;
/**
 * Capitalize first letter of string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export declare function capitalize(text: string | null | undefined): string;
/**
 * Convert string to title case
 * @param text - Text to convert
 * @returns Title cased text
 */
export declare function toTitleCase(text: string | null | undefined): string;
/**
 * Generate initials from name
 * @param name - Full name
 * @returns Initials (up to 2 characters)
 */
export declare function getInitials(name: string | null | undefined): string;
/**
 * Calculate percentage
 * @param part - Part value
 * @param total - Total value
 * @param decimals - Number of decimal places
 * @returns Calculated percentage
 */
export declare function calculatePercentage(part: number, total: number, decimals?: number): number;
/**
 * Format duration in seconds to readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "2h 30m", "45s")
 */
export declare function formatDuration(seconds: number | null | undefined): string;

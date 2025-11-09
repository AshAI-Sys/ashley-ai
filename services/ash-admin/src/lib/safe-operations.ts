/**
 * Safe Operations Utilities
 * Defensive programming helpers to prevent common runtime errors
 */

/**
 * Safely parse JSON string with fallback
 */
export function safeJSONParse<T = any>(
  jsonString: string | null | undefined,
  fallback: T | null = null
): T | null {
  if (!jsonString) return fallback;

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON:", { jsonString, error });
    return fallback;
  }
}

/**
 * Safely stringify JSON with fallback
 */
export function safeJSONStringify(
  data: any,
  fallback: string = "{}"
): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error("Failed to stringify JSON:", { data, error });
    return fallback;
  }
}

/**
 * Safely create Date object with validation
 */
export function safeDate(
  dateInput: string | number | Date | null | undefined
): Date | null {
  if (!dateInput) return null;

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateInput);
      return null;
    }
    return date;
  } catch (error) {
    console.error("Error creating date:", { dateInput, error });
    return null;
  }
}

/**
 * Safely format date with fallback
 */
export function formatDate(
  dateInput: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  locale: string = "en-US",
  fallback: string = "N/A"
): string {
  const date = safeDate(dateInput);
  if (!date) return fallback;

  try {
    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error("Error formatting date:", { dateInput, error });
    return fallback;
  }
}

/**
 * Safely format time with fallback
 */
export function formatTime(
  dateInput: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  },
  locale: string = "en-US",
  fallback: string = "N/A"
): string {
  const date = safeDate(dateInput);
  if (!date) return fallback;

  try {
    return date.toLocaleTimeString(locale, options);
  } catch (error) {
    console.error("Error formatting time:", { dateInput, error });
    return fallback;
  }
}

/**
 * Safely format date and time with fallback
 */
export function formatDateTime(
  dateInput: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  },
  locale: string = "en-US",
  fallback: string = "N/A"
): string {
  const date = safeDate(dateInput);
  if (!date) return fallback;

  try {
    return date.toLocaleString(locale, options);
  } catch (error) {
    console.error("Error formatting datetime:", { dateInput, error });
    return fallback;
  }
}

/**
 * Safely access array with fallback to empty array
 */
export function safeArray<T>(
  arrayLike: T[] | null | undefined,
  fallback: T[] = []
): T[] {
  if (!arrayLike) return fallback;
  if (!Array.isArray(arrayLike)) {
    console.warn("Expected array, got:", typeof arrayLike);
    return fallback;
  }
  return arrayLike;
}

/**
 * Safely access nested object property with dot notation
 */
export function safeGet<T = any>(
  obj: any,
  path: string,
  fallback: T | null = null
): T | null {
  if (!obj || !path) return fallback;

  try {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return fallback;
      }
      result = result[key];
    }

    return result === undefined ? fallback : result;
  } catch (error) {
    console.error("Error accessing nested property:", { obj, path, error });
    return fallback;
  }
}

/**
 * Safely parse number with validation
 */
export function safeNumber(
  input: string | number | null | undefined,
  fallback: number = 0
): number {
  if (input === null || input === undefined) return fallback;

  const num = typeof input === "number" ? input : parseFloat(input);

  if (isNaN(num) || !isFinite(num)) {
    console.warn("Invalid number:", input);
    return fallback;
  }

  return num;
}

/**
 * Safely format currency
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = "PHP",
  locale: string = "en-PH",
  fallback: string = "₱0.00"
): string {
  const num = safeNumber(amount, 0);

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(num);
  } catch (error) {
    console.error("Error formatting currency:", { amount, error });
    return fallback;
  }
}

/**
 * Safely truncate string
 */
export function safeTruncate(
  str: string | null | undefined,
  maxLength: number = 50,
  ellipsis: string = "..."
): string {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Safely check if value exists (not null, undefined, or empty string)
 */
export function exists(value: any): boolean {
  return value !== null && value !== undefined && value !== "";
}

/**
 * Safely check if array has items
 */
export function hasItems<T>(arr: T[] | null | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Calculate time difference in human-readable format
 */
export function getTimeDifference(
  date1: string | Date | null | undefined,
  date2: string | Date | null | undefined = new Date(),
  fallback: string = "Unknown"
): string {
  const d1 = safeDate(date1);
  const d2 = safeDate(date2);

  if (!d1 || !d2) return fallback;

  const diffMs = d2.getTime() - d1.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Retry ${i + 1}/${maxRetries} failed:`, error);

      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("All retries failed");
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

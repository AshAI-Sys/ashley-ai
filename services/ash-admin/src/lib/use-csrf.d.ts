/**
 * Custom hook to handle CSRF tokens for API requests
 * Automatically includes CSRF token in fetch requests
 */
export declare function useCSRFToken(): string;
/**
 * Fetch wrapper that automatically includes CSRF token
 */
export declare function fetchWithCSRF(url: string, options?: RequestInit): Promise<Response>;
/**
 * Example usage in components:
 *
 * import { fetchWithCSRF, useCSRFToken } from '@/lib/use-csrf'
 *
 * // In a component:
 * const csrfToken = useCSRFToken()
 *
 * const handleSubmit = async () => {
 *   const response = await fetchWithCSRF('/api/orders', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *     },
 *     body: JSON.stringify({ ... }),
 *   })
 * }
 */

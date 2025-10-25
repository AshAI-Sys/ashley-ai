"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCSRFToken = useCSRFToken;
exports.fetchWithCSRF = fetchWithCSRF;
const react_1 = require("react");
/**
 * Custom hook to handle CSRF tokens for API requests
 * Automatically includes CSRF token in fetch requests
 */
function useCSRFToken() {
    const [csrfToken, setCSRFToken] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        // Get CSRF token from cookie
        const token = getCookie("csrf-token");
        setCSRFToken(token);
    }, []);
    return csrfToken;
}
/**
 * Get cookie value by name
 */
function getCookie(name) {
    if (typeof document === "undefined")
        return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
    }
    return null;
}
/**
 * Fetch wrapper that automatically includes CSRF token
 */
async function fetchWithCSRF(url, options = {}) {
    const csrfToken = getCookie("csrf-token");
    const headers = new Headers(options.headers);
    if (csrfToken &&
        (options.method === "POST" ||
            options.method === "PUT" ||
            options.method === "DELETE" ||
            options.method === "PATCH")) {
        headers.set("X-CSRF-Token", csrfToken);
    }
    return fetch(url, {
        ...options,
        headers,
        credentials: "include", // Include cookies
    });
}
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

/**
 * API Client with Automatic Token Handling
 * Handles authentication, token refresh, and error handling for all API calls
 */

interface ApiError extends Error {
  status?: number;
  code?: string;
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  retryOnAuthError?: boolean;
}

/**
 * Enhanced fetch wrapper with automatic authentication and error handling
 */
export async function apiFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    skipAuth = false,
    retryOnAuthError = true,
    headers = {},
    ...fetchOptions
  } = options;

  // Get token from localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("ash_token") : null;

  // Build headers
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add auth token if not skipped
  if (!skipAuth && token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    // Make the fetch request
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    // Handle authentication errors
    if (response.status === 401) {
      console.warn("🔒 Authentication failed (401) - Token may be expired");

      // Clear invalid token
      if (typeof window !== "undefined") {
        localStorage.removeItem("ash_token");
        localStorage.removeItem("ash_user");
      }

      // Redirect to login if not already there
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=true";
      }

      const error = new Error("Authentication required") as ApiError;
      error.status = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }

    // Handle forbidden errors
    if (response.status === 403) {
      console.error("🚫 Access forbidden (403) - Insufficient permissions");
      const error = new Error("Access forbidden") as ApiError;
      error.status = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Handle server errors
    if (response.status >= 500) {
      console.error("🔥 Server error:", response.status);
      const error = new Error("Server error occurred") as ApiError;
      error.status = response.status;
      error.code = "SERVER_ERROR";
      throw error;
    }

    // Handle client errors (400-499 excluding 401, 403)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Request failed with status ${response.status}`,
      }));

      const error = new Error(
        errorData.error || `Request failed with status ${response.status}`
      ) as ApiError;
      error.status = response.status;
      error.code = errorData.code || "REQUEST_FAILED";
      throw error;
    }

    // Parse and return response
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return await response.json();
    }

    return (await response.text()) as any;
  } catch (error) {
    // Re-throw API errors
    if ((error as ApiError).status) {
      throw error;
    }

    // Network errors
    if (error instanceof TypeError) {
      console.error("🌐 Network error:", error);
      const networkError = new Error(
        "Network error - Please check your connection"
      ) as ApiError;
      networkError.code = "NETWORK_ERROR";
      throw networkError;
    }

    // Unknown errors
    console.error("❌ Unknown API error:", error);
    throw error;
  }
}

/**
 * Convenience methods for different HTTP methods
 */
export const apiClient = {
  get: <T = any>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: "GET" }),

  post: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(url: string, options?: FetchOptions) =>
    apiFetch<T>(url, { ...options, method: "DELETE" }),
};

/**
 * Check if token is expired (client-side check only)
 */
export function isTokenExpired(): boolean {
  if (typeof window === "undefined") return true;

  const token = localStorage.getItem("ash_token");
  if (!token) return true;

  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return true;

    const payload = JSON.parse(atob(tokenParts[1]));
    const now = Math.floor(Date.now() / 1000);

    return payload.exp && payload.exp < now;
  } catch {
    return true;
  }
}

/**
 * Get current user from token (client-side)
 */
export function getUserFromToken(): any {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("ash_token");
  if (!token) return null;

  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return null;

    return JSON.parse(atob(tokenParts[1]));
  } catch {
    return null;
  }
}

/**
 * Clear authentication and redirect to login
 */
export function clearAuthAndRedirect(reason?: string) {
  if (typeof window === "undefined") return;

  localStorage.removeItem("ash_token");
  localStorage.removeItem("ash_user");

  const loginUrl = reason ? `/login?reason=${encodeURIComponent(reason)}` : "/login";
  window.location.href = loginUrl;
}

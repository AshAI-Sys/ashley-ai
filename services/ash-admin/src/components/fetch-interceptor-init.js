"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchInterceptorInit = FetchInterceptorInit;
const react_1 = require("react");
/**
 * Fetch Interceptor Initializer Component
 * Patches the global fetch to include Authorization headers for API requests
 */
function FetchInterceptorInit() {
    (0, react_1.useEffect)(() => {
        // Only run on client side
        if (typeof window === "undefined")
            return;
        const originalFetch = window.fetch;
        // Patch fetch to automatically add auth headers
        window.fetch = function (input, init) {
            // Check if this is an API request
            const url = typeof input === "string"
                ? input
                : input instanceof URL
                    ? input.href
                    : input.url;
            const isApiRequest = url.startsWith("/api/") || url.includes("/api/");
            if (isApiRequest) {
                // Get token from localStorage
                const token = localStorage.getItem("ash_token");
                if (token) {
                    // Clone init to avoid mutating original
                    const newInit = { ...init };
                    // Add Authorization header
                    const headers = new Headers(init?.headers || {});
                    if (!headers.has("Authorization")) {
                        headers.set("Authorization", `Bearer ${token}`);
                        console.log("🔑 Adding Authorization header to request:", url);
                    }
                    // Assign headers object directly (fetch accepts Headers objects)
                    newInit.headers = headers;
                    init = newInit;
                }
            }
            // Call original fetch
            return originalFetch(input, init);
        };
        console.log("✅ Fetch interceptor initialized - Authorization headers will be added to API requests");
    }, []);
    return null;
}

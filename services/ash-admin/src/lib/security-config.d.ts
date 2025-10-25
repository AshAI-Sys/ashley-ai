/**
 * Security Configuration for Ashley AI
 * Centralized security settings and utilities
 */
export declare const SECURITY_CONFIG: {
    RATE_LIMIT: {
        WINDOW_MS: number;
        MAX_REQUESTS: {
            LOGIN: number;
            REGISTER: number;
            TWO_FA: number;
            OTP: number;
            API_DEFAULT: number;
        };
    };
    CSRF: {
        TOKEN_LENGTH: number;
        TOKEN_EXPIRY_MS: number;
        COOKIE_NAME: string;
        HEADER_NAME: string;
        EXCLUDED_PATHS: string[];
    };
    CSP: {
        directives: {
            defaultSrc: string[];
            scriptSrc: string[];
            styleSrc: string[];
            imgSrc: string[];
            fontSrc: string[];
            connectSrc: string[];
            frameAncestors: string[];
            baseUri: string[];
            formAction: string[];
        };
    };
    HEADERS: {
        "X-DNS-Prefetch-Control": string;
        "Strict-Transport-Security": string;
        "X-Frame-Options": string;
        "X-Content-Type-Options": string;
        "X-XSS-Protection": string;
        "Referrer-Policy": string;
        "Permissions-Policy": string;
    };
    CORS: {
        allowedOrigins: string[];
        allowedMethods: string[];
        allowedHeaders: string[];
        credentials: boolean;
    };
    PASSWORD: {
        MIN_LENGTH: number;
        MAX_LENGTH: number;
        REQUIRE_UPPERCASE: boolean;
        REQUIRE_LOWERCASE: boolean;
        REQUIRE_NUMBER: boolean;
        REQUIRE_SPECIAL: boolean;
        SPECIAL_CHARS: string;
    };
    SESSION: {
        MAX_AGE: number;
        COOKIE_NAME: string;
        SECURE: boolean;
        HTTP_ONLY: boolean;
        SAME_SITE: "strict";
    };
    IP_WHITELIST: string[];
    AUDIT: {
        LOG_SENSITIVE_OPERATIONS: boolean;
        LOG_FAILED_AUTH: boolean;
        LOG_RATE_LIMIT: boolean;
        LOG_CSRF_VIOLATIONS: boolean;
        LOG_IP_BLOCKS: boolean;
    };
};
/**
 * Validate password against security policy
 */
export declare function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
};
/**
 * Generate Content Security Policy header value
 */
export declare function generateCSPHeader(): string;
/**
 * Check if IP is whitelisted for admin access
 */
export declare function isIPWhitelisted(ip: string): boolean;
/**
 * Check if origin is allowed for CORS
 */
export declare function isOriginAllowed(origin: string): boolean;
/**
 * Sanitize user input to prevent XSS
 */
export declare function sanitizeInput(input: string): string;
/**
 * Check if path is excluded from CSRF protection
 */
export declare function isCSRFExcluded(pathname: string): boolean;

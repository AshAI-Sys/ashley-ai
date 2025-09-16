export declare const SECURITY_CONFIG: {
    JWT: {
        SECRET_MIN_LENGTH: number;
        ACCESS_TOKEN_EXPIRES: string;
        REFRESH_TOKEN_EXPIRES: string;
        APPROVAL_TOKEN_EXPIRES: string;
        ISSUER: string;
        AUDIENCE: {
            API: string;
            ADMIN: string;
            CLIENT: string;
        };
    };
    PASSWORD: {
        MIN_LENGTH: number;
        REQUIRE_UPPERCASE: boolean;
        REQUIRE_LOWERCASE: boolean;
        REQUIRE_NUMBERS: boolean;
        REQUIRE_SYMBOLS: boolean;
        MAX_FAILED_ATTEMPTS: number;
        LOCKOUT_DURATION: number;
        SALT_ROUNDS: number;
    };
    RATE_LIMIT: {
        LOGIN_ATTEMPTS: {
            WINDOW_MS: number;
            MAX_ATTEMPTS: number;
        };
        API_REQUESTS: {
            WINDOW_MS: number;
            MAX_REQUESTS: number;
        };
        AI_REQUESTS: {
            WINDOW_MS: number;
            MAX_REQUESTS: number;
        };
    };
    FILE_UPLOAD: {
        MAX_SIZE: number;
        ALLOWED_TYPES: string[];
        SCAN_FOR_MALWARE: boolean;
        QUARANTINE_SUSPICIOUS: boolean;
    };
    VALIDATION: {
        MAX_STRING_LENGTH: number;
        MAX_ARRAY_SIZE: number;
        SANITIZE_HTML: boolean;
        ESCAPE_SQL: boolean;
    };
    SESSION: {
        SECURE_COOKIES: boolean;
        HTTP_ONLY: boolean;
        SAME_SITE: string;
        MAX_AGE: number;
    };
    CORS: {
        DEVELOPMENT_ORIGINS: string[];
        PRODUCTION_ORIGINS: any[];
        CREDENTIALS: boolean;
        METHODS: string[];
        ALLOWED_HEADERS: string[];
    };
    HEADERS: {
        HSTS_MAX_AGE: number;
        CONTENT_TYPE_OPTIONS: string;
        FRAME_OPTIONS: string;
        XSS_PROTECTION: string;
        REFERRER_POLICY: string;
    };
    DATABASE: {
        ENCRYPT_PII: boolean;
        AUDIT_ALL_CHANGES: boolean;
        ROW_LEVEL_SECURITY: boolean;
        CONNECTION_POOL_MAX: number;
        QUERY_TIMEOUT: number;
    };
    AI: {
        INPUT_MAX_LENGTH: number;
        PROMPT_INJECTION_DETECTION: boolean;
        CONTENT_FILTERING: boolean;
        RATE_LIMIT_PER_USER: number;
        LOG_ALL_REQUESTS: boolean;
    };
};
export declare const validateSecurityConfig: () => boolean;
export declare const isProductionMode: () => boolean;
export declare const getSecureCorsOrigins: () => string[];
export declare const shouldEnforceHTTPS: () => boolean;

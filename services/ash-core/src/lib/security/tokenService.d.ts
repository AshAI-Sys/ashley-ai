export interface ApprovalTokenPayload {
    approvalId: string;
    clientId: string;
    designId: string;
    version: number;
    expiresAt: string;
    permissions: string[];
}
export interface TokenValidationResult {
    valid: boolean;
    payload?: ApprovalTokenPayload;
    error?: string;
    expired?: boolean;
}
export declare class TokenService {
    private readonly JWT_SECRET;
    private readonly TOKEN_EXPIRY;
    constructor();
    private generateRandomSecret;
    generateApprovalToken(data: {
        approvalId: string;
        clientId: string;
        designId: string;
        version: number;
        expiresAt: Date;
        permissions?: string[];
    }): string;
    validateApprovalToken(token: string): Promise<TokenValidationResult>;
    generateAccessCode(approvalId: string): string;
    verifyAccessCode(code: string, approvalId: string): boolean;
    generateApprovalLink(token: string, baseUrl?: string): string;
    generateSignedApprovalUrl(data: {
        approvalId: string;
        clientId: string;
        designId: string;
        version: number;
        expiresAt: Date;
    }): string;
    validateSignedUrl(fullUrl: string): boolean;
    checkRateLimit(clientId: string, operation: string): Promise<boolean>;
    logSecurityEvent(event: {
        type: 'token_generated' | 'token_validated' | 'token_expired' | 'invalid_access' | 'rate_limit_exceeded';
        approvalId?: string;
        clientId?: string;
        ipAddress?: string;
        userAgent?: string;
        details?: any;
    }): Promise<void>;
    revokeToken(jti: string, reason?: string): Promise<void>;
    cleanupExpiredData(): Promise<void>;
}
export declare const tokenService: TokenService;

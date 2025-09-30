"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("@ash-ai/database");
const prisma = database_1.db;
class TokenService {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || this.generateRandomSecret();
        this.TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '7d';
    }
    generateRandomSecret() {
        return crypto_1.default.randomBytes(64).toString('hex');
    }
    // Generate secure approval token with multiple layers of security
    generateApprovalToken(data) {
        const payload = {
            approvalId: data.approvalId,
            clientId: data.clientId,
            designId: data.designId,
            version: data.version,
            expiresAt: data.expiresAt.toISOString(),
            permissions: data.permissions || ['view', 'approve', 'request_changes']
        };
        // Create JWT token with additional security claims
        const jwtPayload = {
            ...payload,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(data.expiresAt.getTime() / 1000),
            iss: 'ashley-ai-portal',
            aud: 'client-approval',
            sub: data.clientId,
            jti: crypto_1.default.randomUUID() // Unique token ID for revocation
        };
        return jsonwebtoken_1.default.sign(jwtPayload, this.JWT_SECRET, {
            algorithm: 'HS256'
        });
    }
    // Validate approval token with comprehensive security checks
    async validateApprovalToken(token) {
        try {
            // First, verify JWT structure and signature
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET, {
                    algorithms: ['HS256'],
                    issuer: 'ashley-ai-portal',
                    audience: 'client-approval'
                });
            }
            catch (jwtError) {
                if (jwtError.name === 'TokenExpiredError') {
                    return { valid: false, expired: true, error: 'Token has expired' };
                }
                return { valid: false, error: 'Invalid token signature' };
            }
            // Extract payload
            const payload = {
                approvalId: decoded.approvalId,
                clientId: decoded.clientId,
                designId: decoded.designId,
                version: decoded.version,
                expiresAt: decoded.expiresAt,
                permissions: decoded.permissions || []
            };
            // Check if approval exists and is in valid state
            const approval = await prisma.designApproval.findUnique({
                where: { id: payload.approvalId },
                include: {
                    design_asset: {
                        select: { id: true, workspace_id: true }
                    },
                    client: {
                        select: { id: true }
                    }
                }
            });
            if (!approval) {
                return { valid: false, error: 'Approval not found' };
            }
            // Verify client ID matches
            if (approval.client_id !== payload.clientId) {
                return { valid: false, error: 'Invalid client access' };
            }
            // Verify design ID matches
            if (approval.asset_id !== payload.designId) {
                return { valid: false, error: 'Invalid design reference' };
            }
            // Verify version matches
            if (approval.version !== payload.version) {
                return { valid: false, error: 'Invalid version reference' };
            }
            // Check if approval is still in a state that allows action
            if (!['SENT'].includes(approval.status)) {
                return { valid: false, error: 'Approval already processed' };
            }
            // Check custom expiry (database level)
            if (approval.expires_at && new Date() > approval.expires_at) {
                return { valid: false, expired: true, error: 'Approval has expired' };
            }
            // All checks passed
            return { valid: true, payload };
        }
        catch (error) {
            console.error('Token validation error:', error);
            return { valid: false, error: 'Token validation failed' };
        }
    }
    // Generate secure one-time access code for additional security
    generateAccessCode(approvalId) {
        const code = crypto_1.default.randomInt(100000, 999999).toString();
        const hash = crypto_1.default.createHash('sha256').update(code + approvalId).digest('hex');
        // TODO: Store hash in cache/database for verification
        console.log(`Generated access code ${code} for approval ${approvalId}`);
        return code;
    }
    // Verify access code
    verifyAccessCode(code, approvalId) {
        // TODO: Implement access code verification against stored hash
        const hash = crypto_1.default.createHash('sha256').update(code + approvalId).digest('hex');
        // For now, just validate format
        return /^\d{6}$/.test(code);
    }
    // Generate secure direct approval link
    generateApprovalLink(token, baseUrl) {
        const portalUrl = baseUrl ||
            (process.env.NODE_ENV === 'production'
                ? 'https://portal.ashleyai.com'
                : 'http://localhost:3003');
        return `${portalUrl}/approval/${token}`;
    }
    // Generate signed URL with additional security parameters
    generateSignedApprovalUrl(data) {
        const token = this.generateApprovalToken(data);
        const url = this.generateApprovalLink(token);
        // Add additional security parameters
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = crypto_1.default.randomBytes(16).toString('hex');
        // Create signature for URL integrity
        const urlSignature = crypto_1.default
            .createHmac('sha256', this.JWT_SECRET)
            .update(`${url}:${timestamp}:${nonce}`)
            .digest('hex')
            .substring(0, 16); // Truncate for readability
        return `${url}?t=${timestamp}&n=${nonce}&s=${urlSignature}`;
    }
    // Validate signed URL
    validateSignedUrl(fullUrl) {
        try {
            const urlObj = new URL(fullUrl);
            const timestamp = urlObj.searchParams.get('t');
            const nonce = urlObj.searchParams.get('n');
            const signature = urlObj.searchParams.get('s');
            if (!timestamp || !nonce || !signature) {
                return false;
            }
            // Check timestamp is not too old (24 hours)
            const urlAge = Math.floor(Date.now() / 1000) - parseInt(timestamp);
            if (urlAge > 86400) {
                return false;
            }
            // Reconstruct base URL
            urlObj.searchParams.delete('t');
            urlObj.searchParams.delete('n');
            urlObj.searchParams.delete('s');
            const baseUrl = urlObj.toString();
            // Verify signature
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.JWT_SECRET)
                .update(`${baseUrl}:${timestamp}:${nonce}`)
                .digest('hex')
                .substring(0, 16);
            return signature === expectedSignature;
        }
        catch (error) {
            return false;
        }
    }
    // Rate limiting for token operations
    async checkRateLimit(clientId, operation) {
        const key = `rate_limit:${clientId}:${operation}`;
        const window = 300; // 5 minutes
        const limit = operation === 'submit' ? 10 : 50; // Lower limit for submissions
        // TODO: Implement proper rate limiting with Redis or similar
        // For now, just return true
        console.log(`Rate limit check for ${key}: ${limit} requests per ${window} seconds`);
        return true;
    }
    // Log security events
    async logSecurityEvent(event) {
        try {
            await prisma.auditLog.create({
                data: {
                    workspace_id: 'security', // Special workspace for security logs
                    user_id: event.clientId || 'system',
                    action: `SECURITY_${event.type.toUpperCase()}`,
                    resource: 'approval_token',
                    resource_id: event.approvalId || '',
                    ip_address: event.ipAddress,
                    user_agent: event.userAgent,
                    new_values: JSON.stringify({
                        type: event.type,
                        details: event.details,
                        timestamp: new Date().toISOString()
                    })
                }
            });
        }
        catch (error) {
            console.error('Failed to log security event:', error);
        }
    }
    // Revoke token (add to blacklist)
    async revokeToken(jti, reason = 'manual_revocation') {
        // TODO: Implement token blacklist in Redis or database
        console.log(`Token ${jti} revoked: ${reason}`);
        await this.logSecurityEvent({
            type: 'token_expired',
            details: { jti, reason }
        });
    }
    // Clean up expired tokens and security logs
    async cleanupExpiredData() {
        try {
            // Clean up old audit logs (keep for 90 days)
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 90);
            await prisma.auditLog.deleteMany({
                where: {
                    workspace_id: 'security',
                    created_at: {
                        lt: cutoffDate
                    }
                }
            });
            console.log('Security data cleanup completed');
        }
        catch (error) {
            console.error('Error during security cleanup:', error);
        }
    }
}
exports.TokenService = TokenService;
// Singleton instance
exports.tokenService = new TokenService();

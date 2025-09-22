"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = void 0;
// Temporary stub implementation for tokenService
exports.tokenService = {
    generateApprovalToken(params) {
        // Simple token generation - replace with proper implementation
        const payload = {
            approvalId: params.approvalId,
            clientId: params.clientId,
            designId: params.designId,
            version: params.version,
            expiresAt: params.expiresAt.getTime(),
            permissions: params.permissions
        };
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    },
    generateSignedApprovalUrl(params) {
        // Generate URL with token
        const token = this.generateApprovalToken({
            ...params,
            permissions: ['view', 'approve', 'request_changes']
        });
        return `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3003'}/approval/${params.approvalId}?token=${token}`;
    }
};

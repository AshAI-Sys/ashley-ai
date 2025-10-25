export declare const tokenService: {
    generateApprovalToken(params: {
        approvalId: string;
        clientId: string;
        designId: string;
        version: string;
        expiresAt: Date;
        permissions: string[];
    }): string;
    generateSignedApprovalUrl(params: {
        approvalId: string;
        clientId: string;
        designId: string;
        version: string;
        expiresAt: Date;
    }): string;
};

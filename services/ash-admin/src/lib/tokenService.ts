// Temporary stub implementation for tokenService
export const tokenService = {
  generateApprovalToken(params: {
    approvalId: string
    clientId: string
    designId: string
    version: string
    expiresAt: Date
    permissions: string[]
  }): string {
    // Simple token generation - replace with proper implementation
    const payload = {
      approvalId: params.approvalId,
      clientId: params.clientId,
      designId: params.designId,
      version: params.version,
      expiresAt: params.expiresAt.getTime(),
      permissions: params.permissions
    }
    return Buffer.from(JSON.stringify(payload)).toString('base64')
  },

  generateSignedApprovalUrl(params: {
    approvalId: string
    clientId: string
    designId: string
    version: string
    expiresAt: Date
  }): string {
    // Generate URL with token
    const token = this.generateApprovalToken({
      ...params,
      permissions: ['view', 'approve', 'request_changes']
    })
    return `${process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3003'}/approval/${params.approvalId}?token=${token}`
  }
}
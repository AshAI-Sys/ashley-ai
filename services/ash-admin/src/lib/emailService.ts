// Temporary stub implementation for emailService
export const emailService = {
  async sendEmail(data: {
    to: string
    subject: string
    html: string
  }): Promise<boolean> {
    // Log the email for now - replace with actual email service
    console.log('Email would be sent:', data)
    return true
  }
}
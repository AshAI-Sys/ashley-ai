// Temporary stub implementation for notificationService
export const notificationService = {
  async sendNotification(params: {
    userId: string
    type: string
    title: string
    message: string
    data?: any
  }): Promise<boolean> {
    // Log the notification for now - replace with actual notification service
    console.log('Notification would be sent:', params)
    return true
  }
}
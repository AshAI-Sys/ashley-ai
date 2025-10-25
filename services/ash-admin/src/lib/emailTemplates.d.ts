/**
 * Email Templates for Ashley AI
 * Comprehensive notification templates for all system events
 */
export interface EmailTemplate {
    subject: string;
    html: string;
}
export declare const emailTemplates: {
    /**
     * ORDER NOTIFICATIONS
     */
    orderCreated: (data: {
        clientName: string;
        orderNumber: string;
        orderTotal: string;
        orderDate: string;
        portalLink: string;
    }) => EmailTemplate;
    orderStatusUpdate: (data: {
        clientName: string;
        orderNumber: string;
        status: string;
        message: string;
        portalLink: string;
    }) => EmailTemplate;
    /**
     * DESIGN APPROVAL NOTIFICATIONS
     */
    designApprovalRequest: (data: {
        clientName: string;
        designName: string;
        orderNumber: string;
        approvalLink: string;
        expiryDate: string;
        previewUrl?: string;
    }) => EmailTemplate;
    designApproved: (data: {
        clientName: string;
        designName: string;
        orderNumber: string;
        nextSteps: string;
    }) => EmailTemplate;
    /**
     * INVOICE & PAYMENT NOTIFICATIONS
     */
    invoiceGenerated: (data: {
        clientName: string;
        invoiceNumber: string;
        amount: string;
        dueDate: string;
        downloadLink: string;
        paymentLink?: string;
    }) => EmailTemplate;
    paymentReceived: (data: {
        clientName: string;
        invoiceNumber: string;
        amount: string;
        paymentDate: string;
        paymentMethod: string;
    }) => EmailTemplate;
    /**
     * DELIVERY NOTIFICATIONS
     */
    shipmentDispatched: (data: {
        clientName: string;
        orderNumber: string;
        trackingNumber?: string;
        carrier?: string;
        estimatedDelivery: string;
        trackingLink?: string;
    }) => EmailTemplate;
    orderDelivered: (data: {
        clientName: string;
        orderNumber: string;
        deliveryDate: string;
        receivedBy?: string;
    }) => EmailTemplate;
    /**
     * QUALITY CONTROL NOTIFICATIONS
     */
    qualityIssueDetected: (data: {
        teamEmail: string;
        orderNumber: string;
        inspectionType: string;
        defectCount: number;
        severity: string;
        details: string;
        adminLink: string;
    }) => EmailTemplate;
};

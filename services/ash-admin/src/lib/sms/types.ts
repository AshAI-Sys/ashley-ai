// SMS Service Types

export type SMSProvider = "TWILIO" | "SEMAPHORE" | "MOVIDER";

export interface SMSMessage {
  to: string; // Phone number in E.164 format (+639xxxxxxxxx)
  message: string;
  provider?: SMSProvider;
}

export interface SMSResponse {
  success: boolean;
  message_id?: string;
  status?: string;
  provider: SMSProvider;
  error?: string;
}

export interface SMSTemplate {
  name: string;
  message: string;
  variables?: string[]; // Placeholders like {name}, {code}, {order_number}
}

export interface SMSLog {
  id: string;
  workspace_id: string;
  recipient: string;
  message: string;
  provider: SMSProvider;
  status: "SENT" | "FAILED" | "PENDING" | "DELIVERED";
  message_id?: string;
  error?: string;
  cost?: number;
  sent_at: Date;
  delivered_at?: Date;
}

// Common SMS Templates
export const SMS_TEMPLATES: Record<string, SMSTemplate> = {
  OTP_CODE: {
    name: "OTP Verification Code",
    message:
      "Your Ashley AI verification code is: {code}. Valid for 5 minutes. Do not share this code.",
    variables: ["code"],
  },
  ORDER_CONFIRMATION: {
    name: "Order Confirmation",
    message:
      "Hi {customer_name}! Your order {order_number} has been confirmed. We will notify you once production starts. - Ashley AI",
    variables: ["customer_name", "order_number"],
  },
  DELIVERY_OUT: {
    name: "Delivery Out for Delivery",
    message:
      "Your order {order_number} is out for delivery! Track: {tracking_url} - Ashley AI",
    variables: ["order_number", "tracking_url"],
  },
  DELIVERY_COMPLETED: {
    name: "Delivery Completed",
    message:
      "Your order {order_number} has been delivered! Thank you for choosing Ashley AI.",
    variables: ["order_number"],
  },
  PAYMENT_RECEIVED: {
    name: "Payment Received",
    message:
      "Payment of ₱{amount} for invoice {invoice_number} received. Thank you! - Ashley AI",
    variables: ["amount", "invoice_number"],
  },
  DESIGN_APPROVAL: {
    name: "Design Approval Request",
    message:
      "Hi {customer_name}! Your design for order {order_number} is ready for approval: {approval_url} - Ashley AI",
    variables: ["customer_name", "order_number", "approval_url"],
  },
  QC_ISSUE: {
    name: "QC Issue Alert",
    message:
      "ALERT: QC issue detected in order {order_number}. {defect_summary}. Please review immediately.",
    variables: ["order_number", "defect_summary"],
  },
  PRODUCTION_COMPLETE: {
    name: "Production Complete",
    message:
      "Good news! Production for order {order_number} is complete and ready for delivery. - Ashley AI",
    variables: ["order_number"],
  },
};

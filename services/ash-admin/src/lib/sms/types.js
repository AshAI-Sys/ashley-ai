"use strict";
// SMS Service Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMS_TEMPLATES = void 0;
// Common SMS Templates
exports.SMS_TEMPLATES = {
    OTP_CODE: {
        name: "OTP Verification Code",
        message: "Your Ashley AI verification code is: {code}. Valid for 5 minutes. Do not share this code.",
        variables: ["code"],
    },
    ORDER_CONFIRMATION: {
        name: "Order Confirmation",
        message: "Hi {customer_name}! Your order {order_number} has been confirmed. We will notify you once production starts. - Ashley AI",
        variables: ["customer_name", "order_number"],
    },
    DELIVERY_OUT: {
        name: "Delivery Out for Delivery",
        message: "Your order {order_number} is out for delivery! Track: {tracking_url} - Ashley AI",
        variables: ["order_number", "tracking_url"],
    },
    DELIVERY_COMPLETED: {
        name: "Delivery Completed",
        message: "Your order {order_number} has been delivered! Thank you for choosing Ashley AI.",
        variables: ["order_number"],
    },
    PAYMENT_RECEIVED: {
        name: "Payment Received",
        message: "Payment of ₱{amount} for invoice {invoice_number} received. Thank you! - Ashley AI",
        variables: ["amount", "invoice_number"],
    },
    DESIGN_APPROVAL: {
        name: "Design Approval Request",
        message: "Hi {customer_name}! Your design for order {order_number} is ready for approval: {approval_url} - Ashley AI",
        variables: ["customer_name", "order_number", "approval_url"],
    },
    QC_ISSUE: {
        name: "QC Issue Alert",
        message: "ALERT: QC issue detected in order {order_number}. {defect_summary}. Please review immediately.",
        variables: ["order_number", "defect_summary"],
    },
    PRODUCTION_COMPLETE: {
        name: "Production Complete",
        message: "Good news! Production for order {order_number} is complete and ready for delivery. - Ashley AI",
        variables: ["order_number"],
    },
};

-- Performance Optimization Indexes
-- Created: 2025-10-02
-- Purpose: Add indexes to improve query performance based on load testing

-- ===== ORDER MANAGEMENT =====
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_client_id_idx" ON "Order"("client_id");
CREATE INDEX IF NOT EXISTS "Order_created_at_idx" ON "Order"("created_at");
CREATE INDEX IF NOT EXISTS "Order_status_created_at_idx" ON "Order"("status", "created_at");

-- ===== CLIENT MANAGEMENT =====
CREATE INDEX IF NOT EXISTS "Client_workspace_id_idx" ON "Client"("workspace_id");
CREATE INDEX IF NOT EXISTS "Client_created_at_idx" ON "Client"("created_at");

-- ===== PRODUCTION =====
CREATE INDEX IF NOT EXISTS "Lay_order_id_idx" ON "Lay"("order_id");
CREATE INDEX IF NOT EXISTS "Lay_status_idx" ON "Lay"("status");
CREATE INDEX IF NOT EXISTS "Lay_created_at_idx" ON "Lay"("created_at");

CREATE INDEX IF NOT EXISTS "Bundle_lay_id_idx" ON "Bundle"("lay_id");
CREATE INDEX IF NOT EXISTS "Bundle_status_idx" ON "Bundle"("status");
CREATE INDEX IF NOT EXISTS "Bundle_created_at_idx" ON "Bundle"("created_at");

CREATE INDEX IF NOT EXISTS "CuttingRun_lay_id_idx" ON "CuttingRun"("lay_id");
CREATE INDEX IF NOT EXISTS "CuttingRun_status_idx" ON "CuttingRun"("status");
CREATE INDEX IF NOT EXISTS "CuttingRun_created_at_idx" ON "CuttingRun"("created_at");

CREATE INDEX IF NOT EXISTS "PrintRun_order_id_idx" ON "PrintRun"("order_id");
CREATE INDEX IF NOT EXISTS "PrintRun_status_idx" ON "PrintRun"("status");
CREATE INDEX IF NOT EXISTS "PrintRun_created_at_idx" ON "PrintRun"("created_at");

CREATE INDEX IF NOT EXISTS "SewingRun_order_id_idx" ON "SewingRun"("order_id");
CREATE INDEX IF NOT EXISTS "SewingRun_operator_id_idx" ON "SewingRun"("operator_id");
CREATE INDEX IF NOT EXISTS "SewingRun_status_idx" ON "SewingRun"("status");
CREATE INDEX IF NOT EXISTS "SewingRun_created_at_idx" ON "SewingRun"("created_at");

-- ===== QUALITY CONTROL =====
CREATE INDEX IF NOT EXISTS "QCInspection_order_id_idx" ON "QCInspection"("order_id");
CREATE INDEX IF NOT EXISTS "QCInspection_status_idx" ON "QCInspection"("status");
CREATE INDEX IF NOT EXISTS "QCInspection_result_idx" ON "QCInspection"("result");
CREATE INDEX IF NOT EXISTS "QCInspection_created_at_idx" ON "QCInspection"("created_at");

CREATE INDEX IF NOT EXISTS "QCDefect_inspection_id_idx" ON "QCDefect"("inspection_id");
CREATE INDEX IF NOT EXISTS "QCDefect_severity_idx" ON "QCDefect"("severity");
CREATE INDEX IF NOT EXISTS "QCDefect_created_at_idx" ON "QCDefect"("created_at");

-- ===== FINANCE =====
CREATE INDEX IF NOT EXISTS "Invoice_client_id_idx" ON "Invoice"("client_id");
CREATE INDEX IF NOT EXISTS "Invoice_order_id_idx" ON "Invoice"("order_id");
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX IF NOT EXISTS "Invoice_due_date_idx" ON "Invoice"("due_date");
CREATE INDEX IF NOT EXISTS "Invoice_created_at_idx" ON "Invoice"("created_at");

CREATE INDEX IF NOT EXISTS "Payment_invoice_id_idx" ON "Payment"("invoice_id");
CREATE INDEX IF NOT EXISTS "Payment_client_id_idx" ON "Payment"("client_id");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_payment_date_idx" ON "Payment"("payment_date");

CREATE INDEX IF NOT EXISTS "Expense_workspace_id_idx" ON "Expense"("workspace_id");
CREATE INDEX IF NOT EXISTS "Expense_category_idx" ON "Expense"("category");
CREATE INDEX IF NOT EXISTS "Expense_status_idx" ON "Expense"("status");
CREATE INDEX IF NOT EXISTS "Expense_expense_date_idx" ON "Expense"("expense_date");

-- ===== HR & PAYROLL =====
CREATE INDEX IF NOT EXISTS "Employee_workspace_id_idx" ON "Employee"("workspace_id");
CREATE INDEX IF NOT EXISTS "Employee_status_idx" ON "Employee"("status");
CREATE INDEX IF NOT EXISTS "Employee_position_idx" ON "Employee"("position");
CREATE INDEX IF NOT EXISTS "Employee_department_idx" ON "Employee"("department");

CREATE INDEX IF NOT EXISTS "AttendanceLog_employee_id_idx" ON "AttendanceLog"("employee_id");
CREATE INDEX IF NOT EXISTS "AttendanceLog_date_idx" ON "AttendanceLog"("date");
CREATE INDEX IF NOT EXISTS "AttendanceLog_status_idx" ON "AttendanceLog"("status");

CREATE INDEX IF NOT EXISTS "PayrollPeriod_start_date_idx" ON "PayrollPeriod"("start_date");
CREATE INDEX IF NOT EXISTS "PayrollPeriod_end_date_idx" ON "PayrollPeriod"("end_date");
CREATE INDEX IF NOT EXISTS "PayrollPeriod_status_idx" ON "PayrollPeriod"("status");

-- ===== MAINTENANCE =====
CREATE INDEX IF NOT EXISTS "Asset_workspace_id_idx" ON "Asset"("workspace_id");
CREATE INDEX IF NOT EXISTS "Asset_status_idx" ON "Asset"("status");
CREATE INDEX IF NOT EXISTS "Asset_category_idx" ON "Asset"("category");

CREATE INDEX IF NOT EXISTS "WorkOrder_asset_id_idx" ON "WorkOrder"("asset_id");
CREATE INDEX IF NOT EXISTS "WorkOrder_assigned_to_idx" ON "WorkOrder"("assigned_to");
CREATE INDEX IF NOT EXISTS "WorkOrder_status_idx" ON "WorkOrder"("status");
CREATE INDEX IF NOT EXISTS "WorkOrder_priority_idx" ON "WorkOrder"("priority");
CREATE INDEX IF NOT EXISTS "WorkOrder_created_at_idx" ON "WorkOrder"("created_at");

-- ===== DELIVERY =====
CREATE INDEX IF NOT EXISTS "Shipment_workspace_id_idx" ON "Shipment"("workspace_id");
CREATE INDEX IF NOT EXISTS "Shipment_status_idx" ON "Shipment"("status");
CREATE INDEX IF NOT EXISTS "Shipment_created_at_idx" ON "Shipment"("created_at");

CREATE INDEX IF NOT EXISTS "Delivery_shipment_id_idx" ON "Delivery"("shipment_id");
CREATE INDEX IF NOT EXISTS "Delivery_status_idx" ON "Delivery"("status");
CREATE INDEX IF NOT EXISTS "Delivery_scheduled_date_idx" ON "Delivery"("scheduled_date");

-- ===== CLIENT PORTAL =====
CREATE INDEX IF NOT EXISTS "ClientSession_client_id_idx" ON "ClientSession"("client_id");
CREATE INDEX IF NOT EXISTS "ClientSession_expires_at_idx" ON "ClientSession"("expires_at");

CREATE INDEX IF NOT EXISTS "ClientNotification_client_id_idx" ON "ClientNotification"("client_id");
CREATE INDEX IF NOT EXISTS "ClientNotification_read_idx" ON "ClientNotification"("read");
CREATE INDEX IF NOT EXISTS "ClientNotification_created_at_idx" ON "ClientNotification"("created_at");

-- ===== MERCHANDISING AI =====
CREATE INDEX IF NOT EXISTS "DemandForecast_product_id_idx" ON "DemandForecast"("product_id");
CREATE INDEX IF NOT EXISTS "DemandForecast_forecast_date_idx" ON "DemandForecast"("forecast_date");

CREATE INDEX IF NOT EXISTS "ProductRecommendation_product_id_idx" ON "ProductRecommendation"("product_id");
CREATE INDEX IF NOT EXISTS "ProductRecommendation_recommendation_type_idx" ON "ProductRecommendation"("recommendation_type");

-- ===== AUTOMATION =====
CREATE INDEX IF NOT EXISTS "AutomationRule_trigger_type_idx" ON "AutomationRule"("trigger_type");
CREATE INDEX IF NOT EXISTS "AutomationRule_is_active_idx" ON "AutomationRule"("is_active");

CREATE INDEX IF NOT EXISTS "AutomationExecution_rule_id_idx" ON "AutomationExecution"("rule_id");
CREATE INDEX IF NOT EXISTS "AutomationExecution_status_idx" ON "AutomationExecution"("status");
CREATE INDEX IF NOT EXISTS "AutomationExecution_executed_at_idx" ON "AutomationExecution"("executed_at");

CREATE INDEX IF NOT EXISTS "Notification_user_id_idx" ON "Notification"("user_id");
CREATE INDEX IF NOT EXISTS "Notification_read_idx" ON "Notification"("read");
CREATE INDEX IF NOT EXISTS "Notification_created_at_idx" ON "Notification"("created_at");

CREATE INDEX IF NOT EXISTS "Alert_severity_idx" ON "Alert"("severity");
CREATE INDEX IF NOT EXISTS "Alert_status_idx" ON "Alert"("status");
CREATE INDEX IF NOT EXISTS "Alert_created_at_idx" ON "Alert"("created_at");

-- ===== AI CHAT =====
CREATE INDEX IF NOT EXISTS "AIChatConversation_workspace_id_idx" ON "AIChatConversation"("workspace_id");
CREATE INDEX IF NOT EXISTS "AIChatConversation_user_id_idx" ON "AIChatConversation"("user_id");
CREATE INDEX IF NOT EXISTS "AIChatConversation_status_idx" ON "AIChatConversation"("status");
CREATE INDEX IF NOT EXISTS "AIChatConversation_updated_at_idx" ON "AIChatConversation"("updated_at");

CREATE INDEX IF NOT EXISTS "AIChatMessage_conversation_id_idx" ON "AIChatMessage"("conversation_id");
CREATE INDEX IF NOT EXISTS "AIChatMessage_created_at_idx" ON "AIChatMessage"("created_at");

-- ===== COMPOSITE INDEXES FOR COMMON QUERIES =====

-- Orders by client and status (common filter combination)
CREATE INDEX IF NOT EXISTS "Order_client_status_idx" ON "Order"("client_id", "status");

-- Invoices by client and due date (payment tracking)
CREATE INDEX IF NOT EXISTS "Invoice_client_due_date_idx" ON "Invoice"("client_id", "due_date");

-- Employee attendance by date range
CREATE INDEX IF NOT EXISTS "AttendanceLog_employee_date_idx" ON "AttendanceLog"("employee_id", "date");

-- Work orders by asset and status (maintenance tracking)
CREATE INDEX IF NOT EXISTS "WorkOrder_asset_status_idx" ON "WorkOrder"("asset_id", "status");

-- Notifications by user and read status
CREATE INDEX IF NOT EXISTS "Notification_user_read_idx" ON "Notification"("user_id", "read");

-- Performance monitoring
-- Add comments to track index usage
COMMENT ON INDEX "Order_status_idx" IS 'Performance index for order filtering by status';
COMMENT ON INDEX "Order_client_id_idx" IS 'Performance index for order-client joins';
COMMENT ON INDEX "Invoice_due_date_idx" IS 'Performance index for payment reminders';
COMMENT ON INDEX "Employee_status_idx" IS 'Performance index for active employee queries';

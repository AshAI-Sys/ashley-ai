-- ASH AI Database Performance Optimization
-- SQLite Index Creation for Common Queries
-- Run this after prisma migrate to improve query performance

-- ===== CORE TABLES INDEXES =====

-- Workspace lookups (slug is already unique)
CREATE INDEX IF NOT EXISTS idx_workspace_active ON workspaces(is_active);
CREATE INDEX IF NOT EXISTS idx_workspace_created ON workspaces(created_at DESC);

-- User queries
CREATE INDEX IF NOT EXISTS idx_user_workspace ON users(workspace_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_user_last_login ON users(last_login_at DESC);

-- ===== ORDER & CLIENT INDEXES =====

-- Client lookups
CREATE INDEX IF NOT EXISTS idx_client_workspace ON clients(workspace_id, is_active);
CREATE INDEX IF NOT EXISTS idx_client_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_client_created ON clients(created_at DESC);

-- Order queries (most frequent)
CREATE INDEX IF NOT EXISTS idx_order_workspace ON orders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_order_client ON orders(client_id, status);
CREATE INDEX IF NOT EXISTS idx_order_status ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_created ON orders(created_at DESC);

-- Brand lookups
CREATE INDEX IF NOT EXISTS idx_brand_workspace ON brands(workspace_id);
CREATE INDEX IF NOT EXISTS idx_brand_client ON brands(client_id);

-- ===== PRODUCTION INDEXES =====

-- Cutting operations
CREATE INDEX IF NOT EXISTS idx_lay_workspace ON lays(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lay_order ON lays(order_id, status);
CREATE INDEX IF NOT EXISTS idx_lay_created ON lays(created_at DESC);

-- Bundles (frequently scanned)
CREATE INDEX IF NOT EXISTS idx_bundle_lay ON bundles(lay_id);
CREATE INDEX IF NOT EXISTS idx_bundle_qr ON bundles(qr_code);
CREATE INDEX IF NOT EXISTS idx_bundle_status ON bundles(current_status);

-- Cutting runs
CREATE INDEX IF NOT EXISTS idx_cutting_run_workspace ON cutting_runs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_cutting_run_lay ON cutting_runs(lay_id, status);
CREATE INDEX IF NOT EXISTS idx_cutting_run_created ON cutting_runs(created_at DESC);

-- Print runs
CREATE INDEX IF NOT EXISTS idx_print_run_workspace ON print_runs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_print_run_order ON print_runs(order_id, status);
CREATE INDEX IF NOT EXISTS idx_print_run_method ON print_runs(print_method);
CREATE INDEX IF NOT EXISTS idx_print_run_created ON print_runs(created_at DESC);

-- Sewing runs
CREATE INDEX IF NOT EXISTS idx_sewing_run_workspace ON sewing_runs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sewing_run_operator ON sewing_runs(operator_id);
CREATE INDEX IF NOT EXISTS idx_sewing_run_status ON sewing_runs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sewing_run_operation ON sewing_runs(operation_id);

-- ===== QUALITY CONTROL INDEXES =====

-- QC Inspections
CREATE INDEX IF NOT EXISTS idx_qc_inspection_workspace ON qc_inspections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_qc_inspection_order ON qc_inspections(order_id);
CREATE INDEX IF NOT EXISTS idx_qc_inspection_inspector ON qc_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_qc_inspection_status ON qc_inspections(inspection_result, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qc_inspection_type ON qc_inspections(inspection_type);

-- QC Defects
CREATE INDEX IF NOT EXISTS idx_qc_defect_workspace ON qc_defects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_qc_defect_inspection ON qc_defects(inspection_id);
CREATE INDEX IF NOT EXISTS idx_qc_defect_type ON qc_defects(defect_type_id);
CREATE INDEX IF NOT EXISTS idx_qc_defect_severity ON qc_defects(severity_level);

-- CAPA Tasks
CREATE INDEX IF NOT EXISTS idx_capa_workspace ON capa_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_capa_inspection ON capa_tasks(inspection_id);
CREATE INDEX IF NOT EXISTS idx_capa_assigned ON capa_tasks(assigned_to_id, status);
CREATE INDEX IF NOT EXISTS idx_capa_due_date ON capa_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_capa_priority ON capa_tasks(priority, status);

-- ===== FINISHING & DELIVERY INDEXES =====

-- Finishing runs
CREATE INDEX IF NOT EXISTS idx_finishing_run_workspace ON finishing_runs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_finishing_run_order ON finishing_runs(order_id, status);
CREATE INDEX IF NOT EXISTS idx_finishing_run_created ON finishing_runs(created_at DESC);

-- Finished units
CREATE INDEX IF NOT EXISTS idx_finished_unit_run ON finished_units(finishing_run_id);
CREATE INDEX IF NOT EXISTS idx_finished_unit_sku ON finished_units(sku);
CREATE INDEX IF NOT EXISTS idx_finished_unit_carton ON finished_units(carton_id);

-- Cartons
CREATE INDEX IF NOT EXISTS idx_carton_workspace ON cartons(workspace_id);
CREATE INDEX IF NOT EXISTS idx_carton_order ON cartons(order_id);
CREATE INDEX IF NOT EXISTS idx_carton_qr ON cartons(qr_code);
CREATE INDEX IF NOT EXISTS idx_carton_shipment ON cartons(shipment_id);

-- Shipments
CREATE INDEX IF NOT EXISTS idx_shipment_workspace ON shipments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_shipment_order ON shipments(order_id, status);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipment_date ON shipments(shipment_date DESC);

-- Deliveries
CREATE INDEX IF NOT EXISTS idx_delivery_workspace ON deliveries(workspace_id);
CREATE INDEX IF NOT EXISTS idx_delivery_shipment ON deliveries(shipment_id);
CREATE INDEX IF NOT EXISTS idx_delivery_driver ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status ON deliveries(status, scheduled_date);

-- ===== FINANCE INDEXES =====

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoice_workspace ON invoices(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invoice_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_client ON invoices(client_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON invoices(status, due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_created ON invoices(created_at DESC);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payment_workspace ON payments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_payment_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payment_method ON payments(payment_method);

-- Expenses
CREATE INDEX IF NOT EXISTS idx_expense_workspace ON expenses(workspace_id);
CREATE INDEX IF NOT EXISTS idx_expense_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expense_status ON expenses(approval_status);
CREATE INDEX IF NOT EXISTS idx_expense_date ON expenses(expense_date DESC);

-- ===== HR & PAYROLL INDEXES =====

-- Employees
CREATE INDEX IF NOT EXISTS idx_employee_workspace ON employees(workspace_id, is_active);
CREATE INDEX IF NOT EXISTS idx_employee_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employee_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employee_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employee_position ON employees(position);
CREATE INDEX IF NOT EXISTS idx_employee_department ON employees(department);

-- Attendance logs
CREATE INDEX IF NOT EXISTS idx_attendance_workspace ON attendance_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_logs(employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_logs(status);

-- Payroll
CREATE INDEX IF NOT EXISTS idx_payroll_workspace ON payroll_periods(workspace_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll_periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll_periods(status);

CREATE INDEX IF NOT EXISTS idx_payroll_earning_period ON payroll_earnings(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_earning_employee ON payroll_earnings(employee_id);

-- ===== MAINTENANCE INDEXES =====

-- Assets
CREATE INDEX IF NOT EXISTS idx_asset_workspace ON assets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_asset_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_asset_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_asset_code ON assets(asset_code);

-- Work orders
CREATE INDEX IF NOT EXISTS idx_work_order_workspace ON work_orders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_work_order_asset ON work_orders(asset_id, status);
CREATE INDEX IF NOT EXISTS idx_work_order_assigned ON work_orders(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_work_order_priority ON work_orders(priority, status);
CREATE INDEX IF NOT EXISTS idx_work_order_scheduled ON work_orders(scheduled_date);

-- Maintenance schedules
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_workspace ON maintenance_schedules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_asset ON maintenance_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_next ON maintenance_schedules(next_maintenance_date);

-- ===== DESIGN MANAGEMENT INDEXES =====

-- Design assets
CREATE INDEX IF NOT EXISTS idx_design_workspace ON design_assets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_design_order ON design_assets(order_id);
CREATE INDEX IF NOT EXISTS idx_design_status ON design_assets(approval_status);
CREATE INDEX IF NOT EXISTS idx_design_created ON design_assets(created_at DESC);

-- Design approvals
CREATE INDEX IF NOT EXISTS idx_design_approval_workspace ON design_approvals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_design_approval_asset ON design_approvals(design_asset_id);
CREATE INDEX IF NOT EXISTS idx_design_approval_status ON design_approvals(status);

-- ===== STAGE 16 - AI & INVENTORY INDEXES =====

-- Dynamic Pricing
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_workspace ON dynamic_pricing(workspace_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_order ON dynamic_pricing(order_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_created ON dynamic_pricing(created_at DESC);

-- Smart Scheduling
CREATE INDEX IF NOT EXISTS idx_smart_schedule_workspace ON smart_job_scheduling(workspace_id);
CREATE INDEX IF NOT EXISTS idx_smart_schedule_status ON smart_job_scheduling(status);
CREATE INDEX IF NOT EXISTS idx_smart_schedule_priority ON smart_job_scheduling(priority_score DESC);

-- Bottleneck Detection
CREATE INDEX IF NOT EXISTS idx_bottleneck_workspace ON bottleneck_detection(workspace_id);
CREATE INDEX IF NOT EXISTS idx_bottleneck_severity ON bottleneck_detection(severity);
CREATE INDEX IF NOT EXISTS idx_bottleneck_detected ON bottleneck_detection(detected_at DESC);

-- Predictive Maintenance
CREATE INDEX IF NOT EXISTS idx_predictive_maint_asset ON predictive_maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_predictive_maint_workspace ON predictive_maintenance(workspace_id);
CREATE INDEX IF NOT EXISTS idx_predictive_maint_predicted ON predictive_maintenance(predicted_failure_date);

-- Defect Detection
CREATE INDEX IF NOT EXISTS idx_defect_detection_inspection ON defect_detection_results(inspection_id);
CREATE INDEX IF NOT EXISTS idx_defect_detection_workspace ON defect_detection_results(workspace_id);
CREATE INDEX IF NOT EXISTS idx_defect_detection_analyzed ON defect_detection_results(analyzed_at DESC);

-- Material Inventory
CREATE INDEX IF NOT EXISTS idx_material_inventory_workspace ON material_inventory(workspace_id);
CREATE INDEX IF NOT EXISTS idx_material_inventory_sku ON material_inventory(sku);
CREATE INDEX IF NOT EXISTS idx_material_inventory_stock ON material_inventory(current_stock_quantity);
CREATE INDEX IF NOT EXISTS idx_material_inventory_updated ON material_inventory(last_updated DESC);

-- Suppliers
CREATE INDEX IF NOT EXISTS idx_supplier_workspace ON suppliers(workspace_id, is_active);
CREATE INDEX IF NOT EXISTS idx_supplier_rating ON suppliers(rating DESC);

-- Purchase Orders
CREATE INDEX IF NOT EXISTS idx_purchase_order_workspace ON purchase_orders(workspace_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_created ON purchase_orders(created_at DESC);

-- Stock Alerts
CREATE INDEX IF NOT EXISTS idx_stock_alert_workspace ON stock_alerts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_stock_alert_material ON stock_alerts(material_id);
CREATE INDEX IF NOT EXISTS idx_stock_alert_resolved ON stock_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_stock_alert_created ON stock_alerts(created_at DESC);

-- Tenant Branding
CREATE INDEX IF NOT EXISTS idx_tenant_branding_workspace ON tenant_branding(workspace_id);

-- Role Permissions
CREATE INDEX IF NOT EXISTS idx_role_permission_workspace ON role_permissions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_role_permission_role ON role_permissions(role_name);

-- Internationalization
CREATE INDEX IF NOT EXISTS idx_i18n_workspace ON internationalization_settings(workspace_id);

-- ===== AUDIT & ANALYTICS INDEXES =====

-- Audit logs (frequent reads by date range)
CREATE INDEX IF NOT EXISTS idx_audit_workspace ON audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- AI Analysis
CREATE INDEX IF NOT EXISTS idx_ai_analysis_workspace ON ai_analysis(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created ON ai_analysis(created_at DESC);

-- ===== CLIENT PORTAL INDEXES =====

-- Client sessions
CREATE INDEX IF NOT EXISTS idx_client_session_workspace ON client_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_client_session_client ON client_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_session_token ON client_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_client_session_expires ON client_sessions(expires_at);

-- Client notifications
CREATE INDEX IF NOT EXISTS idx_client_notification_workspace ON client_notifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_client_notification_client ON client_notifications(client_id, is_read);
CREATE INDEX IF NOT EXISTS idx_client_notification_created ON client_notifications(created_at DESC);

-- ===== MERCHANDISING AI INDEXES =====

-- Demand forecasts
CREATE INDEX IF NOT EXISTS idx_demand_forecast_workspace ON demand_forecasts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecast_sku ON demand_forecasts(sku);
CREATE INDEX IF NOT EXISTS idx_demand_forecast_date ON demand_forecasts(forecast_date);

-- Product recommendations
CREATE INDEX IF NOT EXISTS idx_product_rec_workspace ON product_recommendations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_product_rec_client ON product_recommendations(client_id);
CREATE INDEX IF NOT EXISTS idx_product_rec_type ON product_recommendations(recommendation_type);

-- ===== AUTOMATION INDEXES =====

-- Automation rules
CREATE INDEX IF NOT EXISTS idx_automation_rule_workspace ON automation_rules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_automation_rule_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_rule_trigger ON automation_rules(trigger_type);

-- Automation executions
CREATE INDEX IF NOT EXISTS idx_automation_exec_rule ON automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_exec_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_exec_created ON automation_executions(created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notification_workspace ON notifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notification_created ON notifications(created_at DESC);

-- Alerts
CREATE INDEX IF NOT EXISTS idx_alert_workspace ON alerts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_alert_assigned ON alerts(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_alert_severity ON alerts(severity, status);
CREATE INDEX IF NOT EXISTS idx_alert_created ON alerts(created_at DESC);

-- ===== AI CHAT INDEXES =====

-- AI Chat Conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversation_workspace ON ai_chat_conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversation_user ON ai_chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversation_updated ON ai_chat_conversations(last_message_at DESC);

-- AI Chat Messages
CREATE INDEX IF NOT EXISTS idx_chat_message_conversation ON ai_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_created ON ai_chat_messages(created_at);

-- ===== COMPOSITE INDEXES FOR COMPLEX QUERIES =====

-- Order tracking with client and status
CREATE INDEX IF NOT EXISTS idx_order_tracking ON orders(workspace_id, client_id, status, created_at DESC);

-- Production workflow tracking
CREATE INDEX IF NOT EXISTS idx_production_workflow ON orders(workspace_id, status, delivery_date);

-- Employee productivity analysis
CREATE INDEX IF NOT EXISTS idx_employee_productivity ON sewing_runs(operator_id, status, created_at DESC);

-- Quality trend analysis
CREATE INDEX IF NOT EXISTS idx_quality_trends ON qc_inspections(workspace_id, inspection_type, inspection_result, created_at DESC);

-- Financial reporting
CREATE INDEX IF NOT EXISTS idx_finance_reporting ON invoices(workspace_id, status, created_at DESC);

-- Inventory management
CREATE INDEX IF NOT EXISTS idx_inventory_management ON material_inventory(workspace_id, current_stock_quantity, last_updated DESC);

-- Performance summary
SELECT
  'Database indexes created successfully' as status,
  COUNT(*) as total_indexes
FROM sqlite_master
WHERE type = 'index'
  AND name LIKE 'idx_%';

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "settings" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password_hash" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "permissions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "requires_2fa" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_backup_codes" TEXT,
    "phone_number" TEXT,
    "avatar_url" TEXT,
    "last_login_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "users_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_person" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "tax_id" TEXT,
    "payment_terms" INTEGER,
    "credit_limit" REAL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "portal_settings" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "clients_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "logo_url" TEXT,
    "settings" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "brands_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "brands_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "order_number" TEXT NOT NULL,
    "po_number" TEXT,
    "order_type" TEXT DEFAULT 'NEW',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "total_amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "delivery_date" DATETIME,
    "notes" TEXT,
    "design_name" TEXT,
    "fabric_type" TEXT,
    "mockup_url" TEXT,
    "size_distribution" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "orders_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_line_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" REAL NOT NULL,
    "total_price" REAL NOT NULL,
    "printing_method" TEXT,
    "garment_type" TEXT,
    "size_breakdown" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "order_line_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "color_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "line_item_id" TEXT NOT NULL,
    "color_name" TEXT NOT NULL,
    "color_code" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "color_variants_line_item_id_fkey" FOREIGN KEY ("line_item_id") REFERENCES "order_line_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "garment_addons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "line_item_id" TEXT NOT NULL,
    "addon_type" TEXT NOT NULL,
    "addon_name" TEXT NOT NULL,
    "description" TEXT,
    "price_per_unit" REAL NOT NULL,
    "is_selected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "garment_addons_line_item_id_fkey" FOREIGN KEY ("line_item_id") REFERENCES "order_line_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_category" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "thumbnail_url" TEXT,
    "uploaded_by" TEXT,
    "notes" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "order_files_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_files_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "is_best_seller" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "artist_filename" TEXT,
    "mockup_image_url" TEXT,
    "notes_remarks" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "design_assets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_assets_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_assets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "print_locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "design_asset_id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "location_label" TEXT,
    "design_file_url" TEXT,
    "width_cm" REAL,
    "height_cm" REAL,
    "offset_x_cm" REAL,
    "offset_y_cm" REAL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "print_locations_design_asset_id_fkey" FOREIGN KEY ("design_asset_id") REFERENCES "design_assets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "files" TEXT NOT NULL,
    "placements" TEXT NOT NULL,
    "palette" TEXT,
    "meta" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "design_versions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "design_assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_approvals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "client_id" TEXT NOT NULL,
    "employee_id" TEXT,
    "workflow_id" TEXT,
    "approver_name" TEXT,
    "approver_email" TEXT,
    "approver_signed_at" DATETIME,
    "comments" TEXT,
    "esign_envelope_id" TEXT,
    "portal_token" TEXT,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "design_approvals_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_approvals_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "design_assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_approvals_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_approvals_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "design_approvals_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "design_approval_workflows" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "issues" TEXT,
    "metrics" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "design_checks_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "design_assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "routing_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "printing_method" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "routing_template_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "routing_template_id" TEXT NOT NULL,
    "step_name" TEXT NOT NULL,
    "step_order" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "estimated_hours" REAL,
    "requires_qc" BOOLEAN NOT NULL DEFAULT false,
    "dependencies" TEXT,
    "metadata" TEXT,
    CONSTRAINT "routing_template_steps_routing_template_id_fkey" FOREIGN KEY ("routing_template_id") REFERENCES "routing_templates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "routing_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "step_name" TEXT NOT NULL,
    "step_order" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "estimated_hours" REAL,
    "actual_hours" REAL,
    "assigned_to" TEXT,
    "notes" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "routing_steps_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bundles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "size_code" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "lay_id" TEXT,
    "qr_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bundles_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bundles_lay_id_fkey" FOREIGN KEY ("lay_id") REFERENCES "cut_lays" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "employee_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "hire_date" DATETIME NOT NULL,
    "salary_type" TEXT NOT NULL,
    "base_salary" REAL,
    "piece_rate" REAL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "contact_info" TEXT,
    "permissions" TEXT,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "employees_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attendance_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time_in" DATETIME,
    "time_out" DATETIME,
    "break_minutes" INTEGER,
    "overtime_minutes" INTEGER,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "attendance_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "order_id" TEXT,
    "invoice_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "subtotal" REAL NOT NULL,
    "discount_amount" REAL DEFAULT 0,
    "tax_amount" REAL DEFAULT 0,
    "total_amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "issue_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" DATETIME,
    "sent_at" DATETIME,
    "paid_at" DATETIME,
    "payment_terms" INTEGER,
    "notes" TEXT,
    "terms_conditions" TEXT,
    "metadata" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoice_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit_price" REAL NOT NULL,
    "discount_percent" REAL DEFAULT 0,
    "tax_percent" REAL DEFAULT 0,
    "line_total" REAL NOT NULL,
    "order_line_item_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "payment_number" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "payment_method" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" DATETIME,
    "bank_account_id" TEXT,
    "reconciled" BOOLEAN NOT NULL DEFAULT false,
    "reconciled_at" DATETIME,
    "notes" TEXT,
    "metadata" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "credit_number" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issue_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_at" DATETIME,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "credit_notes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "current_balance" REAL NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "transaction_ref" TEXT,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "transaction_date" DATETIME NOT NULL,
    "balance_after" REAL,
    "reconciled" BOOLEAN NOT NULL DEFAULT false,
    "reconciled_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bank_transactions_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "expense_number" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "expense_date" DATETIME NOT NULL,
    "payment_method" TEXT,
    "payment_ref" TEXT,
    "supplier" TEXT,
    "tax_amount" REAL DEFAULT 0,
    "receipt_url" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "order_id" TEXT,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "expenses_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "budget_amount" REAL,
    "actual_spend" REAL NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cost_allocations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "cost_center_id" TEXT NOT NULL,
    "order_id" TEXT,
    "allocation_type" TEXT NOT NULL,
    "cost_type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "allocation_date" DATETIME NOT NULL,
    "description" TEXT,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cost_allocations_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cost_allocations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "cost_center_id" TEXT NOT NULL,
    "budget_period" TEXT NOT NULL,
    "period_start" DATETIME NOT NULL,
    "period_end" DATETIME NOT NULL,
    "budgeted_amount" REAL NOT NULL,
    "spent_amount" REAL NOT NULL DEFAULT 0,
    "committed_amount" REAL NOT NULL DEFAULT 0,
    "variance" REAL NOT NULL DEFAULT 0,
    "variance_percent" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "budgets_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "financial_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "report_name" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "auto_generate" BOOLEAN NOT NULL DEFAULT false,
    "schedule" TEXT,
    "recipients" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "report_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "run_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period_start" DATETIME NOT NULL,
    "period_end" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "file_url" TEXT,
    "file_format" TEXT,
    "run_time_seconds" REAL,
    "error_message" TEXT,
    "generated_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "report_runs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "financial_reports" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "financial_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "previous_value" REAL,
    "target_value" REAL,
    "variance" REAL,
    "unit" TEXT,
    "period" TEXT NOT NULL,
    "period_start" DATETIME NOT NULL,
    "period_end" DATETIME NOT NULL,
    "calculation_method" TEXT,
    "data_source" TEXT,
    "calculated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "tax_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "tax_name" TEXT NOT NULL,
    "tax_type" TEXT NOT NULL,
    "rate_percent" REAL NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "applicable_to" TEXT NOT NULL,
    "effective_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "asset_number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "location" TEXT,
    "purchase_date" DATETIME,
    "purchase_cost" REAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "assets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "maintenance_schedule_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assigned_to" TEXT,
    "scheduled_date" DATETIME,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "cost" REAL,
    "labor_hours" REAL,
    "parts_used" TEXT,
    "notes" TEXT,
    "completion_notes" TEXT,
    "metadata" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "work_orders_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "work_orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "work_orders_maintenance_schedule_id_fkey" FOREIGN KEY ("maintenance_schedule_id") REFERENCES "maintenance_schedules" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "work_orders_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "work_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "old_values" TEXT,
    "new_values" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_activity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" DATETIME
);

-- CreateTable
CREATE TABLE "automations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger_type" TEXT NOT NULL,
    "conditions" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_run" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "fabric_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "item_id" TEXT,
    "lot_no" TEXT NOT NULL,
    "uom" TEXT NOT NULL,
    "qty_on_hand" REAL NOT NULL,
    "gsm" INTEGER,
    "width_cm" INTEGER,
    "received_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "fabric_batches_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cut_issues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "qty_issued" REAL NOT NULL,
    "uom" TEXT NOT NULL,
    "issued_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cut_issues_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cut_issues_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "fabric_batches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cut_lays" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "marker_name" TEXT,
    "marker_width_cm" INTEGER,
    "lay_length_m" REAL NOT NULL,
    "plies" INTEGER NOT NULL,
    "gross_used" REAL NOT NULL,
    "offcuts" REAL DEFAULT 0,
    "defects" REAL DEFAULT 0,
    "uom" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "cut_lays_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cut_outputs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "cut_lay_id" TEXT NOT NULL,
    "size_code" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cut_outputs_cut_lay_id_fkey" FOREIGN KEY ("cut_lay_id") REFERENCES "cut_lays" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "workcenter" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spec" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "machines_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "print_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "routing_step_id" TEXT,
    "method" TEXT NOT NULL,
    "print_options" TEXT,
    "workcenter" TEXT NOT NULL,
    "machine_id" TEXT,
    "started_at" DATETIME,
    "ended_at" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "print_runs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "print_runs_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "print_runs_routing_step_id_fkey" FOREIGN KEY ("routing_step_id") REFERENCES "routing_steps" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "print_run_outputs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "bundle_id" TEXT,
    "qty_good" INTEGER NOT NULL DEFAULT 0,
    "qty_reject" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "print_run_outputs_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "print_run_outputs_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "print_run_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "item_id" TEXT,
    "uom" TEXT NOT NULL,
    "qty" REAL NOT NULL,
    "source_batch_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "print_run_materials_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "print_rejects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "bundle_id" TEXT,
    "reason_code" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "photo_url" TEXT,
    "cost_attribution" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "print_rejects_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "print_rejects_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "silkscreen_prep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "screen_id" TEXT NOT NULL,
    "mesh_count" INTEGER NOT NULL,
    "emulsion_batch" TEXT,
    "exposure_seconds" INTEGER,
    "registration_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "silkscreen_prep_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "silkscreen_specs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "ink_type" TEXT NOT NULL,
    "coats" INTEGER NOT NULL,
    "squeegee_durometer" INTEGER,
    "floodbar" TEXT,
    "expected_ink_g" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "silkscreen_specs_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "curing_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "dryer_id" TEXT,
    "temp_c" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,
    "belt_speed" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "curing_logs_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "curing_logs_dryer_id_fkey" FOREIGN KEY ("dryer_id") REFERENCES "machines" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sublimation_prints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "printer_id" TEXT,
    "paper_m2" REAL NOT NULL,
    "ink_g" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sublimation_prints_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sublimation_prints_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "machines" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "heat_press_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "press_id" TEXT,
    "temp_c" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,
    "pressure" TEXT,
    "cycles" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "heat_press_logs_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "heat_press_logs_press_id_fkey" FOREIGN KEY ("press_id") REFERENCES "machines" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dtf_prints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "film_m2" REAL NOT NULL,
    "ink_g" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dtf_prints_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dtf_powder_cures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "powder_g" REAL NOT NULL,
    "temp_c" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dtf_powder_cures_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "embroidery_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "design_version_id" TEXT,
    "stitch_count" INTEGER NOT NULL,
    "machine_spm" INTEGER,
    "stabilizer_type" TEXT,
    "thread_colors" TEXT,
    "thread_breaks" INTEGER NOT NULL DEFAULT 0,
    "runtime_minutes" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "embroidery_runs_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "embroidery_runs_design_version_id_fkey" FOREIGN KEY ("design_version_id") REFERENCES "design_versions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qc_defect_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "qc_checklists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "qc_inspections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "routing_step_id" TEXT,
    "bundle_id" TEXT,
    "inspection_point_id" TEXT,
    "checklist_id" TEXT,
    "inspector_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "inspection_level" TEXT NOT NULL DEFAULT 'GII',
    "aql" REAL NOT NULL DEFAULT 2.5,
    "lot_size" INTEGER NOT NULL,
    "sample_size" INTEGER NOT NULL,
    "acceptance" INTEGER NOT NULL,
    "rejection" INTEGER NOT NULL,
    "critical_found" INTEGER NOT NULL DEFAULT 0,
    "major_found" INTEGER NOT NULL DEFAULT 0,
    "minor_found" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "result" TEXT,
    "disposition" TEXT,
    "hold_shipment" BOOLEAN NOT NULL DEFAULT false,
    "inspection_date" DATETIME NOT NULL,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "closed_at" DATETIME,
    "notes" TEXT,
    "ashley_analysis" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "qc_inspections_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_inspections_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_inspections_routing_step_id_fkey" FOREIGN KEY ("routing_step_id") REFERENCES "routing_steps" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "qc_inspections_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "qc_inspections_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "qc_checklists" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "qc_inspections_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_inspections_inspection_point_id_fkey" FOREIGN KEY ("inspection_point_id") REFERENCES "qc_inspection_points" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qc_samples" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "sample_no" INTEGER NOT NULL,
    "sampled_from" TEXT,
    "unit_ref" TEXT,
    "qty_sampled" INTEGER NOT NULL,
    "defects_found" INTEGER NOT NULL DEFAULT 0,
    "result" TEXT NOT NULL DEFAULT 'OK',
    "sample_data" TEXT,
    "sampled_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qc_samples_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "qc_inspections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qc_defects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "sample_id" TEXT,
    "defect_code_id" TEXT NOT NULL,
    "defect_type_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "severity" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "photo_url" TEXT,
    "operator_id" TEXT,
    "root_cause" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qc_defects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_defects_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "qc_inspections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_defects_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "qc_samples" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "qc_defects_defect_code_id_fkey" FOREIGN KEY ("defect_code_id") REFERENCES "qc_defect_codes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_defects_defect_type_id_fkey" FOREIGN KEY ("defect_type_id") REFERENCES "qc_defect_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "qc_defects_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "capa_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT,
    "capa_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "source_type" TEXT NOT NULL,
    "source_id" TEXT,
    "inspection_id" TEXT,
    "defect_id" TEXT,
    "root_cause" TEXT,
    "corrective_action" TEXT,
    "preventive_action" TEXT,
    "assigned_to" TEXT,
    "due_date" DATETIME,
    "completed_at" DATETIME,
    "verified_by" TEXT,
    "verified_at" DATETIME,
    "effectiveness" TEXT,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "capa_tasks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "capa_tasks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "capa_tasks_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "qc_inspections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "capa_tasks_defect_id_fkey" FOREIGN KEY ("defect_id") REFERENCES "qc_defects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "capa_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "capa_tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "capa_tasks_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "period_start" DATETIME NOT NULL,
    "period_end" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "total_amount" REAL,
    "processed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "payroll_earnings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "payroll_period_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "regular_hours" REAL,
    "overtime_hours" REAL,
    "piece_count" INTEGER,
    "piece_rate" REAL,
    "gross_pay" REAL NOT NULL,
    "deductions" REAL,
    "net_pay" REAL NOT NULL,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payroll_earnings_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payroll_earnings_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sewing_operations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "standard_minutes" REAL NOT NULL,
    "piece_rate" REAL,
    "depends_on" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sewing_operations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "piece_rates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "operation_name" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "effective_from" DATETIME,
    "effective_to" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "piece_rates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "piece_rates_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sewing_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "routing_step_id" TEXT NOT NULL,
    "operation_name" TEXT NOT NULL,
    "sewing_type" TEXT,
    "operator_id" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "started_at" DATETIME,
    "ended_at" DATETIME,
    "qty_good" INTEGER NOT NULL DEFAULT 0,
    "qty_reject" INTEGER NOT NULL DEFAULT 0,
    "reject_reason" TEXT,
    "reject_photo_url" TEXT,
    "earned_minutes" REAL,
    "piece_rate_pay" REAL,
    "actual_minutes" REAL,
    "efficiency_pct" REAL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sewing_runs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sewing_runs_routing_step_id_fkey" FOREIGN KEY ("routing_step_id") REFERENCES "routing_steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sewing_runs_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sewing_runs_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "production_lines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "efficiency" REAL NOT NULL DEFAULT 85,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "production_lines_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "work_stations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "production_line_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "station_type" TEXT NOT NULL,
    "hourly_capacity" INTEGER NOT NULL,
    "skill_required" TEXT,
    "machine_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "work_stations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "work_stations_production_line_id_fkey" FOREIGN KEY ("production_line_id") REFERENCES "production_lines" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "work_stations_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "production_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "production_line_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "planned_start" DATETIME NOT NULL,
    "planned_end" DATETIME NOT NULL,
    "actual_start" DATETIME,
    "actual_end" DATETIME,
    "planned_quantity" INTEGER NOT NULL,
    "completed_quantity" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "priority" INTEGER NOT NULL DEFAULT 5,
    "dependencies" TEXT,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "production_schedules_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "production_schedules_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "production_schedules_production_line_id_fkey" FOREIGN KEY ("production_line_id") REFERENCES "production_lines" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "production_schedules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "worker_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "production_schedule_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "work_station_id" TEXT,
    "assigned_date" DATETIME NOT NULL,
    "assigned_hours" REAL NOT NULL,
    "actual_hours" REAL,
    "efficiency_rating" REAL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "worker_assignments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "worker_assignments_production_schedule_id_fkey" FOREIGN KEY ("production_schedule_id") REFERENCES "production_schedules" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "worker_assignments_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "worker_assignments_work_station_id_fkey" FOREIGN KEY ("work_station_id") REFERENCES "work_stations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "worker_allocations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "production_line_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "allocation_date" DATETIME NOT NULL,
    "shift" TEXT NOT NULL,
    "hours_allocated" REAL NOT NULL,
    "skill_level" TEXT NOT NULL,
    "hourly_rate" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "worker_allocations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "worker_allocations_production_line_id_fkey" FOREIGN KEY ("production_line_id") REFERENCES "production_lines" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "worker_allocations_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "material_inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "material_type" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "supplier" TEXT,
    "color" TEXT,
    "unit" TEXT NOT NULL,
    "current_stock" REAL NOT NULL,
    "reserved_stock" REAL NOT NULL DEFAULT 0,
    "available_stock" REAL NOT NULL,
    "minimum_stock" REAL NOT NULL DEFAULT 0,
    "reorder_point" REAL NOT NULL DEFAULT 0,
    "cost_per_unit" REAL,
    "last_updated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "batch_number" TEXT,
    "expiry_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "material_inventory_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "material_requirements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "material_inventory_id" TEXT NOT NULL,
    "required_quantity" REAL NOT NULL,
    "allocated_quantity" REAL NOT NULL DEFAULT 0,
    "consumed_quantity" REAL NOT NULL DEFAULT 0,
    "waste_percentage" REAL NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "cost_estimate" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "material_requirements_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "material_requirements_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "material_requirements_material_inventory_id_fkey" FOREIGN KEY ("material_inventory_id") REFERENCES "material_inventory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "material_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "material_inventory_id" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit_cost" REAL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "material_transactions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "material_transactions_material_inventory_id_fkey" FOREIGN KEY ("material_inventory_id") REFERENCES "material_inventory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "material_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "production_progress_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "production_schedule_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "quantity_completed" INTEGER NOT NULL,
    "quantity_rejected" INTEGER NOT NULL DEFAULT 0,
    "quality_score" REAL,
    "notes" TEXT,
    "logged_by" TEXT NOT NULL,
    "logged_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_progress_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "production_progress_logs_production_schedule_id_fkey" FOREIGN KEY ("production_schedule_id") REFERENCES "production_schedules" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "production_progress_logs_logged_by_fkey" FOREIGN KEY ("logged_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "analysis_type" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "issues" TEXT,
    "recommendations" TEXT,
    "metadata" TEXT,
    "cache_key" TEXT,
    "result" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_analysis_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ai_analysis_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qc_inspection_points" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "criteria" TEXT NOT NULL,
    "standards" TEXT,
    "photo_required" BOOLEAN NOT NULL DEFAULT true,
    "ai_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "qc_inspection_points_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qc_defect_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "inspection_point_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 5,
    "description" TEXT NOT NULL,
    "root_causes" TEXT,
    "preventive_actions" TEXT,
    "detection_pattern" TEXT,
    "cost_impact" REAL,
    "customer_impact" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "qc_defect_types_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_defect_types_inspection_point_id_fkey" FOREIGN KEY ("inspection_point_id") REFERENCES "qc_inspection_points" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "capa_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "capa_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER,
    "description" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "capa_attachments_capa_id_fkey" FOREIGN KEY ("capa_id") REFERENCES "capa_tasks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "capa_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "capa_updates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "capa_id" TEXT NOT NULL,
    "update_text" TEXT NOT NULL,
    "status" TEXT,
    "updated_by" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "capa_updates_capa_id_fkey" FOREIGN KEY ("capa_id") REFERENCES "capa_tasks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "capa_updates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quality_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "target_value" REAL NOT NULL,
    "warning_limit" REAL,
    "control_limit" REAL,
    "lower_warning" REAL,
    "lower_control" REAL,
    "unit" TEXT,
    "calculation_method" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "quality_metrics_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quality_data_points" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "metric_id" TEXT NOT NULL,
    "measured_value" REAL NOT NULL,
    "sample_size" INTEGER,
    "measurement_date" DATETIME NOT NULL,
    "shift" TEXT,
    "production_line_id" TEXT,
    "order_id" TEXT,
    "operator_id" TEXT,
    "notes" TEXT,
    "is_outlier" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quality_data_points_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "quality_data_points_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "quality_metrics" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "quality_data_points_production_line_id_fkey" FOREIGN KEY ("production_line_id") REFERENCES "production_lines" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "quality_data_points_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "quality_data_points_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "quality_data_points_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quality_predictions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "prediction_type" TEXT NOT NULL,
    "predicted_value" REAL NOT NULL,
    "confidence_level" REAL NOT NULL,
    "risk_factors" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "prediction_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actual_outcome" REAL,
    "accuracy_score" REAL,
    "model_version" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "quality_predictions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "quality_predictions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_collaborations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "design_asset_id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "collaborator_id" TEXT NOT NULL,
    "collaborator_type" TEXT NOT NULL,
    "permission_level" TEXT NOT NULL,
    "invited_by" TEXT NOT NULL,
    "invited_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" DATETIME,
    "last_accessed" DATETIME,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "design_collaborations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_collaborations_design_asset_id_fkey" FOREIGN KEY ("design_asset_id") REFERENCES "design_assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_collaborations_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "design_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_collaborations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "design_asset_id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "collaboration_id" TEXT,
    "comment_text" TEXT NOT NULL,
    "comment_type" TEXT NOT NULL DEFAULT 'GENERAL',
    "position_x" REAL,
    "position_y" REAL,
    "annotation_area" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "parent_comment_id" TEXT,
    "attachments" TEXT,
    "mentioned_users" TEXT,
    "ashley_analysis" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "resolved_by" TEXT,
    "resolved_at" DATETIME,
    CONSTRAINT "design_comments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_comments_design_asset_id_fkey" FOREIGN KEY ("design_asset_id") REFERENCES "design_assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_comments_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "design_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_comments_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "design_collaborations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "design_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "design_comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "design_comments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_comments_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_approval_workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "workflow_name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "client_types" TEXT,
    "garment_types" TEXT,
    "approval_stages" TEXT NOT NULL,
    "auto_advance" BOOLEAN NOT NULL DEFAULT true,
    "notification_rules" TEXT NOT NULL,
    "sla_hours" INTEGER,
    "escalation_rules" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "design_approval_workflows_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_approval_workflows_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_file_validations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "design_version_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "validation_status" TEXT NOT NULL DEFAULT 'PENDING',
    "validation_results" TEXT,
    "issues_found" TEXT,
    "auto_corrections" TEXT,
    "color_profile" TEXT,
    "resolution_dpi" INTEGER,
    "dimensions" TEXT,
    "color_count" INTEGER,
    "print_ready" BOOLEAN NOT NULL DEFAULT false,
    "estimated_cost" REAL,
    "ashley_analysis" TEXT,
    "processed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "design_file_validations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_file_validations_design_version_id_fkey" FOREIGN KEY ("design_version_id") REFERENCES "design_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "description" TEXT,
    "preview_url" TEXT NOT NULL,
    "file_urls" TEXT NOT NULL,
    "print_methods" TEXT NOT NULL,
    "garment_types" TEXT NOT NULL,
    "color_variations" TEXT NOT NULL,
    "size_variations" TEXT NOT NULL,
    "tags" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "design_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_mockups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "design_version_id" TEXT NOT NULL,
    "mockup_type" TEXT NOT NULL,
    "garment_style" TEXT NOT NULL,
    "garment_color" TEXT NOT NULL,
    "mockup_url" TEXT NOT NULL,
    "generation_status" TEXT NOT NULL DEFAULT 'PENDING',
    "generation_params" TEXT,
    "processing_time" REAL,
    "file_size" INTEGER,
    "is_client_facing" BOOLEAN NOT NULL DEFAULT true,
    "watermarked" BOOLEAN NOT NULL DEFAULT true,
    "high_res_url" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "design_mockups_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_mockups_design_version_id_fkey" FOREIGN KEY ("design_version_id") REFERENCES "design_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_mockups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_cost_estimates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "design_version_id" TEXT NOT NULL,
    "estimation_type" TEXT NOT NULL,
    "print_method" TEXT NOT NULL,
    "color_count" INTEGER NOT NULL,
    "complexity_score" REAL NOT NULL,
    "setup_cost" REAL NOT NULL,
    "unit_cost" REAL NOT NULL,
    "minimum_quantity" INTEGER NOT NULL,
    "price_breaks" TEXT NOT NULL,
    "material_costs" TEXT NOT NULL,
    "labor_costs" TEXT NOT NULL,
    "overhead_costs" REAL NOT NULL,
    "margin_percentage" REAL NOT NULL,
    "estimated_time" REAL NOT NULL,
    "rush_surcharge" REAL,
    "ashley_insights" TEXT,
    "valid_until" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "design_cost_estimates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_cost_estimates_design_version_id_fkey" FOREIGN KEY ("design_version_id") REFERENCES "design_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_cost_estimates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_production_specs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "design_version_id" TEXT NOT NULL,
    "print_method" TEXT NOT NULL,
    "ink_colors" TEXT NOT NULL,
    "print_positions" TEXT NOT NULL,
    "curing_temperature" REAL,
    "curing_time" REAL,
    "mesh_count" TEXT,
    "press_pressure" REAL,
    "press_time" REAL,
    "special_inks" TEXT,
    "pre_treatment" TEXT,
    "post_processing" TEXT,
    "quality_checkpoints" TEXT NOT NULL,
    "production_notes" TEXT,
    "environmental_conditions" TEXT,
    "safety_requirements" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "design_production_specs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_production_specs_design_version_id_fkey" FOREIGN KEY ("design_version_id") REFERENCES "design_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_production_specs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "design_asset_id" TEXT NOT NULL,
    "metric_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "downloads_count" INTEGER NOT NULL DEFAULT 0,
    "approval_time" REAL,
    "revision_count" INTEGER NOT NULL DEFAULT 0,
    "client_rating" REAL,
    "production_efficiency" REAL,
    "defect_rate" REAL,
    "reorder_rate" REAL,
    "profit_margin" REAL,
    "ashley_score" REAL,
    "popularity_rank" INTEGER,
    "seasonality_score" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "design_analytics_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_analytics_design_asset_id_fkey" FOREIGN KEY ("design_asset_id") REFERENCES "design_assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "finishing_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "routing_step_id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "started_at" DATETIME,
    "ended_at" DATETIME,
    "materials" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "finishing_runs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "finishing_runs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "finishing_runs_routing_step_id_fkey" FOREIGN KEY ("routing_step_id") REFERENCES "routing_steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "finishing_runs_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "finished_units" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "size_code" TEXT NOT NULL,
    "color" TEXT,
    "serial" TEXT,
    "packed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "finished_units_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "finished_units_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cartons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "carton_no" INTEGER NOT NULL,
    "length_cm" INTEGER,
    "width_cm" INTEGER,
    "height_cm" INTEGER,
    "tare_weight_kg" REAL NOT NULL DEFAULT 0,
    "actual_weight_kg" REAL NOT NULL DEFAULT 0,
    "dim_weight_kg" REAL NOT NULL DEFAULT 0,
    "fill_percent" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "qr_code" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "cartons_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cartons_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "carton_contents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carton_id" TEXT NOT NULL,
    "finished_unit_id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "carton_contents_carton_id_fkey" FOREIGN KEY ("carton_id") REFERENCES "cartons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "carton_contents_finished_unit_id_fkey" FOREIGN KEY ("finished_unit_id") REFERENCES "finished_units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "consignee_name" TEXT NOT NULL,
    "consignee_address" TEXT NOT NULL,
    "contact_phone" TEXT,
    "method" TEXT NOT NULL,
    "carrier_ref" TEXT,
    "cod_amount" REAL,
    "status" TEXT NOT NULL DEFAULT 'READY_FOR_PICKUP',
    "eta" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "shipments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shipment_cartons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipment_id" TEXT NOT NULL,
    "carton_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shipment_cartons_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shipment_cartons_carton_id_fkey" FOREIGN KEY ("carton_id") REFERENCES "cartons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "delivery_reference" TEXT NOT NULL,
    "carrier_name" TEXT NOT NULL,
    "tracking_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "estimated_delivery_date" DATETIME,
    "actual_delivery_date" DATETIME,
    "delivery_address" TEXT NOT NULL,
    "special_instructions" TEXT,
    "current_location" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "deliveries_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shipment_deliveries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "delivery_id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shipment_deliveries_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shipment_deliveries_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "delivery_tracking_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "delivery_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "delivery_tracking_events_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pod_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "shipment_id" TEXT,
    "carton_id" TEXT,
    "recipient_name" TEXT NOT NULL,
    "recipient_phone" TEXT,
    "signature_url" TEXT,
    "photo_urls" TEXT,
    "notes" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "geolocation" TEXT,
    "delivery_status" TEXT NOT NULL DEFAULT 'DELIVERED',
    "cod_amount" REAL,
    "cod_collected" REAL,
    "cod_reference" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pod_records_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pod_records_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "maintenance_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "schedule_name" TEXT NOT NULL,
    "description" TEXT,
    "maintenance_type" TEXT NOT NULL,
    "frequency_type" TEXT NOT NULL,
    "frequency_value" INTEGER NOT NULL,
    "next_due_date" DATETIME NOT NULL,
    "last_completed" DATETIME,
    "estimated_duration" REAL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "instructions" TEXT,
    "required_parts" TEXT,
    "required_skills" TEXT,
    "safety_notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "maintenance_schedules_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "maintenance_schedules_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "maintenance_schedules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "demand_forecasts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT,
    "brand_id" TEXT,
    "product_category" TEXT,
    "product_type" TEXT,
    "forecast_period" TEXT NOT NULL,
    "forecast_date" DATETIME NOT NULL,
    "predicted_quantity" INTEGER NOT NULL,
    "predicted_revenue" REAL NOT NULL,
    "confidence_score" REAL NOT NULL,
    "seasonal_factor" REAL,
    "trend_factor" REAL,
    "external_factors" TEXT,
    "model_version" TEXT NOT NULL,
    "accuracy_score" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "demand_forecasts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "demand_forecasts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "demand_forecasts_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "recommendation_type" TEXT NOT NULL,
    "source_product_type" TEXT,
    "recommended_product_type" TEXT NOT NULL,
    "recommended_category" TEXT,
    "confidence_score" REAL NOT NULL,
    "expected_quantity" INTEGER,
    "expected_revenue" REAL,
    "reasoning" TEXT,
    "seasonal_relevance" REAL,
    "trend_alignment" REAL,
    "historical_success" REAL,
    "expires_at" DATETIME,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,
    "accepted_at" DATETIME,
    "actual_quantity" INTEGER,
    "actual_revenue" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "product_recommendations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_recommendations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "market_trends" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "trend_name" TEXT NOT NULL,
    "trend_category" TEXT NOT NULL,
    "trend_type" TEXT NOT NULL,
    "product_categories" TEXT NOT NULL,
    "geographic_scope" TEXT NOT NULL,
    "confidence_score" REAL NOT NULL,
    "impact_score" REAL NOT NULL,
    "adoption_rate" REAL,
    "peak_period_start" DATETIME,
    "peak_period_end" DATETIME,
    "data_sources" TEXT NOT NULL,
    "keywords" TEXT,
    "color_palette" TEXT,
    "style_attributes" TEXT,
    "target_demographics" TEXT,
    "competitive_analysis" TEXT,
    "opportunity_score" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "market_trends_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "material_id" TEXT,
    "product_category" TEXT,
    "insight_type" TEXT NOT NULL,
    "current_stock_level" REAL,
    "optimal_stock_level" REAL NOT NULL,
    "reorder_point" REAL,
    "reorder_quantity" REAL,
    "lead_time_days" INTEGER,
    "carrying_cost" REAL,
    "stockout_risk" REAL NOT NULL,
    "demand_variability" REAL,
    "seasonal_adjustment" REAL,
    "supplier_reliability" REAL,
    "cost_impact" REAL,
    "priority_score" REAL NOT NULL,
    "reasoning" TEXT,
    "expires_at" DATETIME,
    "is_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" DATETIME,
    "action_taken" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "inventory_insights_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_model_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "model_type" TEXT NOT NULL,
    "training_data_period" TEXT,
    "training_date" DATETIME NOT NULL,
    "validation_score" REAL,
    "production_metrics" TEXT NOT NULL,
    "feature_importance" TEXT,
    "hyperparameters" TEXT,
    "data_quality_score" REAL,
    "prediction_count" INTEGER NOT NULL DEFAULT 0,
    "correct_predictions" INTEGER NOT NULL DEFAULT 0,
    "accuracy_trend" TEXT,
    "last_retrain_date" DATETIME,
    "next_retrain_date" DATETIME,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "performance_threshold" REAL,
    "alert_threshold" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ai_model_metrics_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customer_segments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "segment_name" TEXT NOT NULL,
    "segment_description" TEXT,
    "segmentation_criteria" TEXT NOT NULL,
    "customer_count" INTEGER NOT NULL,
    "avg_order_value" REAL,
    "avg_order_frequency" REAL,
    "total_revenue" REAL,
    "profit_margin" REAL,
    "retention_rate" REAL,
    "churn_risk" REAL,
    "preferred_products" TEXT,
    "preferred_seasons" TEXT,
    "price_sensitivity" REAL,
    "lead_time_tolerance" REAL,
    "communication_prefs" TEXT,
    "growth_potential" REAL,
    "marketing_strategy" TEXT,
    "last_updated" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "customer_segments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "magic_token" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "client_sessions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "client_sessions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_email_sent" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" DATETIME,
    CONSTRAINT "client_notifications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "client_notifications_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "session_id" TEXT,
    "activity_type" TEXT NOT NULL,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "description" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "client_activities_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "client_activities_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "order_id" TEXT,
    "thread_id" TEXT,
    "sender_type" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_email" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "attachments" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "client_messages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "client_messages_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "client_messages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_portal_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "sms_notifications" BOOLEAN NOT NULL DEFAULT false,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "notification_frequency" TEXT NOT NULL DEFAULT 'REAL_TIME',
    "preferred_language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "theme" TEXT NOT NULL DEFAULT 'LIGHT',
    "dashboard_layout" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "client_portal_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "client_portal_settings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "trigger_type" TEXT NOT NULL,
    "trigger_config" TEXT NOT NULL,
    "conditions" TEXT,
    "actions" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "last_executed" DATETIME,
    "execution_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "automation_rules_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "automation_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "automation_executions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "trigger_data" TEXT,
    "execution_status" TEXT NOT NULL,
    "actions_executed" TEXT,
    "error_message" TEXT,
    "execution_time_ms" INTEGER,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    CONSTRAINT "automation_executions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "automation_executions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automation_rules" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject_template" TEXT,
    "body_template" TEXT NOT NULL,
    "variables" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notification_templates_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notification_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "template_id" TEXT,
    "recipient_type" TEXT NOT NULL,
    "recipient_id" TEXT,
    "recipient_email" TEXT,
    "recipient_phone" TEXT,
    "channel" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables_data" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduled_for" DATETIME,
    "sent_at" DATETIME,
    "delivered_at" DATETIME,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notifications_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT,
    "threshold_value" TEXT,
    "current_value" TEXT,
    "is_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_by" TEXT,
    "acknowledged_at" DATETIME,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" TEXT,
    "resolved_at" DATETIME,
    "resolution_notes" TEXT,
    "escalation_level" INTEGER NOT NULL DEFAULT 1,
    "next_escalation_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "alerts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "alerts_acknowledged_by_fkey" FOREIGN KEY ("acknowledged_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "alerts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_connected" BOOLEAN NOT NULL DEFAULT false,
    "last_sync" DATETIME,
    "sync_frequency" TEXT,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "integrations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "integrations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "integration_sync_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "integration_id" TEXT NOT NULL,
    "sync_type" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "records_processed" INTEGER NOT NULL DEFAULT 0,
    "records_success" INTEGER NOT NULL DEFAULT 0,
    "records_failed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "error_details" TEXT,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    "duration_ms" INTEGER,
    CONSTRAINT "integration_sync_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "integration_sync_logs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_chat_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT,
    "title" TEXT,
    "context_type" TEXT NOT NULL DEFAULT 'GENERAL',
    "context_id" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "last_message_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ai_chat_conversations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ai_chat_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'TEXT',
    "attachments" TEXT,
    "metadata" TEXT,
    "function_calls" TEXT,
    "feedback" TEXT,
    "feedback_reason" TEXT,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_chat_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_chat_suggestions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "suggestion_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "action_type" TEXT,
    "action_data" TEXT,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "is_acted_upon" BOOLEAN NOT NULL DEFAULT false,
    "dismissed_by" TEXT,
    "dismissed_at" DATETIME,
    "acted_by" TEXT,
    "acted_at" DATETIME,
    "valid_until" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_chat_suggestions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ai_chat_suggestions_dismissed_by_fkey" FOREIGN KEY ("dismissed_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ai_chat_suggestions_acted_by_fkey" FOREIGN KEY ("acted_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_chat_knowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT,
    "examples" TEXT,
    "related_topics" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "not_helpful_count" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ai_chat_knowledge_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ai_chat_knowledge_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "custom_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "report_type" TEXT NOT NULL,
    "data_source" TEXT NOT NULL,
    "query_config" TEXT NOT NULL,
    "visualization" TEXT,
    "columns" TEXT NOT NULL,
    "filters" TEXT,
    "sort_order" TEXT,
    "schedule" TEXT,
    "schedule_config" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "custom_reports_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "custom_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "report_executions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "report_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "executed_by" TEXT NOT NULL,
    "execution_time" INTEGER NOT NULL,
    "row_count" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "filters_applied" TEXT,
    "executed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_executions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "custom_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "report_executions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "report_executions_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "report_exports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "report_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "file_path" TEXT,
    "file_size" INTEGER,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" DATETIME,
    "exported_by" TEXT NOT NULL,
    "exported_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_exports_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "custom_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "report_exports_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "report_exports_exported_by_fkey" FOREIGN KEY ("exported_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "report_shares" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "report_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "shared_with" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "can_export" BOOLEAN NOT NULL DEFAULT true,
    "can_schedule" BOOLEAN NOT NULL DEFAULT false,
    "shared_by" TEXT NOT NULL,
    "shared_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessed_at" DATETIME,
    CONSTRAINT "report_shares_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "custom_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "report_shares_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "report_shares_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "executive_dashboards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dashboard_type" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "widgets" TEXT NOT NULL,
    "refresh_interval" INTEGER NOT NULL DEFAULT 300,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "executive_dashboards_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "executive_dashboards_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dashboard_widgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dashboard_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "widget_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "data_source" TEXT NOT NULL,
    "query_params" TEXT,
    "visualization" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "refresh_interval" INTEGER,
    "last_refreshed" DATETIME,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dashboard_widgets_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "executive_dashboards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dashboard_widgets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_category" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "event_data" TEXT,
    "user_id" TEXT,
    "session_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_events_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "production_heatmaps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "hour" INTEGER NOT NULL,
    "shift" TEXT,
    "station_type" TEXT NOT NULL,
    "station_id" TEXT,
    "efficiency" REAL NOT NULL,
    "output_units" INTEGER NOT NULL,
    "target_units" INTEGER NOT NULL,
    "defect_rate" REAL NOT NULL,
    "downtime_mins" INTEGER NOT NULL,
    "operators_count" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_heatmaps_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "profit_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "analysis_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_revenue" REAL NOT NULL,
    "base_price" REAL NOT NULL,
    "rush_fee" REAL NOT NULL DEFAULT 0,
    "design_fee" REAL NOT NULL DEFAULT 0,
    "shipping_fee" REAL NOT NULL DEFAULT 0,
    "total_cost" REAL NOT NULL,
    "material_cost" REAL NOT NULL,
    "labor_cost" REAL NOT NULL,
    "overhead_cost" REAL NOT NULL,
    "shipping_cost" REAL NOT NULL DEFAULT 0,
    "wastage_cost" REAL NOT NULL DEFAULT 0,
    "gross_profit" REAL NOT NULL,
    "gross_margin" REAL NOT NULL,
    "net_profit" REAL NOT NULL,
    "net_margin" REAL NOT NULL,
    "production_days" INTEGER NOT NULL,
    "lead_time_days" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "profit_analyses_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "profit_analyses_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "profit_analyses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "performed_by" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_activity_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_activity_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspaces_is_active_idx" ON "workspaces"("is_active");

-- CreateIndex
CREATE INDEX "workspaces_created_at_idx" ON "workspaces"("created_at");

-- CreateIndex
CREATE INDEX "workspaces_slug_is_active_idx" ON "workspaces"("slug", "is_active");

-- CreateIndex
CREATE INDEX "users_workspace_id_idx" ON "users"("workspace_id");

-- CreateIndex
CREATE INDEX "users_workspace_id_is_active_idx" ON "users"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "users_workspace_id_role_idx" ON "users"("workspace_id", "role");

-- CreateIndex
CREATE INDEX "users_workspace_id_last_login_at_idx" ON "users"("workspace_id", "last_login_at");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_workspace_id_email_key" ON "users"("workspace_id", "email");

-- CreateIndex
CREATE INDEX "clients_workspace_id_idx" ON "clients"("workspace_id");

-- CreateIndex
CREATE INDEX "clients_workspace_id_is_active_idx" ON "clients"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "clients_workspace_id_created_at_idx" ON "clients"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");

-- CreateIndex
CREATE INDEX "clients_is_active_idx" ON "clients"("is_active");

-- CreateIndex
CREATE INDEX "clients_created_at_idx" ON "clients"("created_at");

-- CreateIndex
CREATE INDEX "brands_workspace_id_idx" ON "brands"("workspace_id");

-- CreateIndex
CREATE INDEX "brands_workspace_id_is_active_idx" ON "brands"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "brands_workspace_id_client_id_idx" ON "brands"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "brands_client_id_idx" ON "brands"("client_id");

-- CreateIndex
CREATE INDEX "brands_code_idx" ON "brands"("code");

-- CreateIndex
CREATE INDEX "brands_is_active_idx" ON "brands"("is_active");

-- CreateIndex
CREATE INDEX "brands_created_at_idx" ON "brands"("created_at");

-- CreateIndex
CREATE INDEX "orders_workspace_id_idx" ON "orders"("workspace_id");

-- CreateIndex
CREATE INDEX "orders_workspace_id_status_idx" ON "orders"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "orders_workspace_id_client_id_idx" ON "orders"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "orders_workspace_id_created_at_idx" ON "orders"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_workspace_id_delivery_date_idx" ON "orders"("workspace_id", "delivery_date");

-- CreateIndex
CREATE INDEX "orders_client_id_idx" ON "orders"("client_id");

-- CreateIndex
CREATE INDEX "orders_brand_id_idx" ON "orders"("brand_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_order_number_idx" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_delivery_date_idx" ON "orders"("delivery_date");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_workspace_id_order_number_key" ON "orders"("workspace_id", "order_number");

-- CreateIndex
CREATE INDEX "order_line_items_workspace_id_idx" ON "order_line_items"("workspace_id");

-- CreateIndex
CREATE INDEX "order_line_items_order_id_idx" ON "order_line_items"("order_id");

-- CreateIndex
CREATE INDEX "order_line_items_sku_idx" ON "order_line_items"("sku");

-- CreateIndex
CREATE INDEX "order_line_items_printing_method_idx" ON "order_line_items"("printing_method");

-- CreateIndex
CREATE INDEX "order_line_items_created_at_idx" ON "order_line_items"("created_at");

-- CreateIndex
CREATE INDEX "color_variants_line_item_id_idx" ON "color_variants"("line_item_id");

-- CreateIndex
CREATE INDEX "color_variants_color_name_idx" ON "color_variants"("color_name");

-- CreateIndex
CREATE INDEX "garment_addons_line_item_id_idx" ON "garment_addons"("line_item_id");

-- CreateIndex
CREATE INDEX "garment_addons_addon_type_idx" ON "garment_addons"("addon_type");

-- CreateIndex
CREATE INDEX "garment_addons_is_selected_idx" ON "garment_addons"("is_selected");

-- CreateIndex
CREATE INDEX "order_files_workspace_id_idx" ON "order_files"("workspace_id");

-- CreateIndex
CREATE INDEX "order_files_workspace_id_order_id_idx" ON "order_files"("workspace_id", "order_id");

-- CreateIndex
CREATE INDEX "order_files_order_id_idx" ON "order_files"("order_id");

-- CreateIndex
CREATE INDEX "order_files_file_type_idx" ON "order_files"("file_type");

-- CreateIndex
CREATE INDEX "order_files_file_category_idx" ON "order_files"("file_category");

-- CreateIndex
CREATE INDEX "order_files_created_at_idx" ON "order_files"("created_at");

-- CreateIndex
CREATE INDEX "design_assets_workspace_id_idx" ON "design_assets"("workspace_id");

-- CreateIndex
CREATE INDEX "design_assets_workspace_id_status_idx" ON "design_assets"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "design_assets_workspace_id_method_idx" ON "design_assets"("workspace_id", "method");

-- CreateIndex
CREATE INDEX "design_assets_workspace_id_is_best_seller_idx" ON "design_assets"("workspace_id", "is_best_seller");

-- CreateIndex
CREATE INDEX "design_assets_brand_id_idx" ON "design_assets"("brand_id");

-- CreateIndex
CREATE INDEX "design_assets_order_id_idx" ON "design_assets"("order_id");

-- CreateIndex
CREATE INDEX "design_assets_status_idx" ON "design_assets"("status");

-- CreateIndex
CREATE INDEX "design_assets_method_idx" ON "design_assets"("method");

-- CreateIndex
CREATE INDEX "design_assets_is_best_seller_idx" ON "design_assets"("is_best_seller");

-- CreateIndex
CREATE INDEX "design_assets_created_at_idx" ON "design_assets"("created_at");

-- CreateIndex
CREATE INDEX "print_locations_design_asset_id_idx" ON "print_locations"("design_asset_id");

-- CreateIndex
CREATE INDEX "print_locations_location_idx" ON "print_locations"("location");

-- CreateIndex
CREATE INDEX "design_versions_asset_id_idx" ON "design_versions"("asset_id");

-- CreateIndex
CREATE INDEX "design_versions_created_at_idx" ON "design_versions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "design_versions_asset_id_version_key" ON "design_versions"("asset_id", "version");

-- CreateIndex
CREATE INDEX "design_approvals_workspace_id_idx" ON "design_approvals"("workspace_id");

-- CreateIndex
CREATE INDEX "design_approvals_workspace_id_status_idx" ON "design_approvals"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "design_approvals_workspace_id_client_id_idx" ON "design_approvals"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "design_approvals_asset_id_idx" ON "design_approvals"("asset_id");

-- CreateIndex
CREATE INDEX "design_approvals_client_id_idx" ON "design_approvals"("client_id");

-- CreateIndex
CREATE INDEX "design_approvals_employee_id_idx" ON "design_approvals"("employee_id");

-- CreateIndex
CREATE INDEX "design_approvals_status_idx" ON "design_approvals"("status");

-- CreateIndex
CREATE INDEX "design_approvals_portal_token_idx" ON "design_approvals"("portal_token");

-- CreateIndex
CREATE INDEX "design_approvals_expires_at_idx" ON "design_approvals"("expires_at");

-- CreateIndex
CREATE INDEX "design_approvals_created_at_idx" ON "design_approvals"("created_at");

-- CreateIndex
CREATE INDEX "design_checks_asset_id_idx" ON "design_checks"("asset_id");

-- CreateIndex
CREATE INDEX "design_checks_method_idx" ON "design_checks"("method");

-- CreateIndex
CREATE INDEX "design_checks_result_idx" ON "design_checks"("result");

-- CreateIndex
CREATE INDEX "design_checks_created_at_idx" ON "design_checks"("created_at");

-- CreateIndex
CREATE INDEX "routing_templates_workspace_id_idx" ON "routing_templates"("workspace_id");

-- CreateIndex
CREATE INDEX "routing_templates_workspace_id_is_active_idx" ON "routing_templates"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "routing_templates_workspace_id_printing_method_idx" ON "routing_templates"("workspace_id", "printing_method");

-- CreateIndex
CREATE INDEX "routing_templates_printing_method_idx" ON "routing_templates"("printing_method");

-- CreateIndex
CREATE INDEX "routing_templates_is_active_idx" ON "routing_templates"("is_active");

-- CreateIndex
CREATE INDEX "routing_templates_created_at_idx" ON "routing_templates"("created_at");

-- CreateIndex
CREATE INDEX "routing_template_steps_workspace_id_idx" ON "routing_template_steps"("workspace_id");

-- CreateIndex
CREATE INDEX "routing_template_steps_routing_template_id_idx" ON "routing_template_steps"("routing_template_id");

-- CreateIndex
CREATE INDEX "routing_template_steps_routing_template_id_step_order_idx" ON "routing_template_steps"("routing_template_id", "step_order");

-- CreateIndex
CREATE INDEX "routing_template_steps_department_idx" ON "routing_template_steps"("department");

-- CreateIndex
CREATE INDEX "routing_steps_workspace_id_idx" ON "routing_steps"("workspace_id");

-- CreateIndex
CREATE INDEX "routing_steps_workspace_id_status_idx" ON "routing_steps"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "routing_steps_order_id_idx" ON "routing_steps"("order_id");

-- CreateIndex
CREATE INDEX "routing_steps_order_id_step_order_idx" ON "routing_steps"("order_id", "step_order");

-- CreateIndex
CREATE INDEX "routing_steps_status_idx" ON "routing_steps"("status");

-- CreateIndex
CREATE INDEX "routing_steps_department_idx" ON "routing_steps"("department");

-- CreateIndex
CREATE INDEX "routing_steps_assigned_to_idx" ON "routing_steps"("assigned_to");

-- CreateIndex
CREATE INDEX "routing_steps_created_at_idx" ON "routing_steps"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bundles_qr_code_key" ON "bundles"("qr_code");

-- CreateIndex
CREATE INDEX "bundles_workspace_id_idx" ON "bundles"("workspace_id");

-- CreateIndex
CREATE INDEX "bundles_workspace_id_status_idx" ON "bundles"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "bundles_order_id_idx" ON "bundles"("order_id");

-- CreateIndex
CREATE INDEX "bundles_lay_id_idx" ON "bundles"("lay_id");

-- CreateIndex
CREATE INDEX "bundles_status_idx" ON "bundles"("status");

-- CreateIndex
CREATE INDEX "bundles_qr_code_idx" ON "bundles"("qr_code");

-- CreateIndex
CREATE INDEX "bundles_created_at_idx" ON "bundles"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_workspace_id_idx" ON "employees"("workspace_id");

-- CreateIndex
CREATE INDEX "employees_workspace_id_is_active_idx" ON "employees"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "employees_workspace_id_position_idx" ON "employees"("workspace_id", "position");

-- CreateIndex
CREATE INDEX "employees_workspace_id_department_idx" ON "employees"("workspace_id", "department");

-- CreateIndex
CREATE INDEX "employees_workspace_id_salary_type_idx" ON "employees"("workspace_id", "salary_type");

-- CreateIndex
CREATE INDEX "employees_position_idx" ON "employees"("position");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "employees"("department");

-- CreateIndex
CREATE INDEX "employees_is_active_idx" ON "employees"("is_active");

-- CreateIndex
CREATE INDEX "employees_hire_date_idx" ON "employees"("hire_date");

-- CreateIndex
CREATE INDEX "employees_created_at_idx" ON "employees"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "employees_workspace_id_employee_number_key" ON "employees"("workspace_id", "employee_number");

-- CreateIndex
CREATE INDEX "attendance_logs_workspace_id_idx" ON "attendance_logs"("workspace_id");

-- CreateIndex
CREATE INDEX "attendance_logs_employee_id_idx" ON "attendance_logs"("employee_id");

-- CreateIndex
CREATE INDEX "attendance_logs_date_idx" ON "attendance_logs"("date");

-- CreateIndex
CREATE INDEX "attendance_logs_status_idx" ON "attendance_logs"("status");

-- CreateIndex
CREATE INDEX "attendance_logs_workspace_id_date_idx" ON "attendance_logs"("workspace_id", "date");

-- CreateIndex
CREATE INDEX "attendance_logs_workspace_id_status_idx" ON "attendance_logs"("workspace_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_logs_employee_id_date_key" ON "attendance_logs"("employee_id", "date");

-- CreateIndex
CREATE INDEX "invoices_workspace_id_idx" ON "invoices"("workspace_id");

-- CreateIndex
CREATE INDEX "invoices_workspace_id_status_idx" ON "invoices"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "invoices_workspace_id_client_id_idx" ON "invoices"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "invoices_workspace_id_due_date_idx" ON "invoices"("workspace_id", "due_date");

-- CreateIndex
CREATE INDEX "invoices_workspace_id_issue_date_idx" ON "invoices"("workspace_id", "issue_date");

-- CreateIndex
CREATE INDEX "invoices_client_id_idx" ON "invoices"("client_id");

-- CreateIndex
CREATE INDEX "invoices_order_id_idx" ON "invoices"("order_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_due_date_idx" ON "invoices"("due_date");

-- CreateIndex
CREATE INDEX "invoices_issue_date_idx" ON "invoices"("issue_date");

-- CreateIndex
CREATE INDEX "invoices_created_at_idx" ON "invoices"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_workspace_id_invoice_number_key" ON "invoices"("workspace_id", "invoice_number");

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_items_order_line_item_id_idx" ON "invoice_items"("order_line_item_id");

-- CreateIndex
CREATE INDEX "invoice_items_created_at_idx" ON "invoice_items"("created_at");

-- CreateIndex
CREATE INDEX "payments_workspace_id_idx" ON "payments"("workspace_id");

-- CreateIndex
CREATE INDEX "payments_workspace_id_status_idx" ON "payments"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "payments_workspace_id_payment_method_idx" ON "payments"("workspace_id", "payment_method");

-- CreateIndex
CREATE INDEX "payments_workspace_id_payment_date_idx" ON "payments"("workspace_id", "payment_date");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "payments_bank_account_id_idx" ON "payments"("bank_account_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_payment_method_idx" ON "payments"("payment_method");

-- CreateIndex
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");

-- CreateIndex
CREATE INDEX "payments_reconciled_idx" ON "payments"("reconciled");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_workspace_id_payment_number_key" ON "payments"("workspace_id", "payment_number");

-- CreateIndex
CREATE INDEX "credit_notes_workspace_id_idx" ON "credit_notes"("workspace_id");

-- CreateIndex
CREATE INDEX "credit_notes_workspace_id_status_idx" ON "credit_notes"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "credit_notes_invoice_id_idx" ON "credit_notes"("invoice_id");

-- CreateIndex
CREATE INDEX "credit_notes_status_idx" ON "credit_notes"("status");

-- CreateIndex
CREATE INDEX "credit_notes_reason_idx" ON "credit_notes"("reason");

-- CreateIndex
CREATE INDEX "credit_notes_issue_date_idx" ON "credit_notes"("issue_date");

-- CreateIndex
CREATE INDEX "credit_notes_created_at_idx" ON "credit_notes"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_workspace_id_credit_number_key" ON "credit_notes"("workspace_id", "credit_number");

-- CreateIndex
CREATE INDEX "bank_accounts_workspace_id_idx" ON "bank_accounts"("workspace_id");

-- CreateIndex
CREATE INDEX "bank_accounts_workspace_id_is_active_idx" ON "bank_accounts"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "bank_accounts_workspace_id_account_type_idx" ON "bank_accounts"("workspace_id", "account_type");

-- CreateIndex
CREATE INDEX "bank_accounts_account_type_idx" ON "bank_accounts"("account_type");

-- CreateIndex
CREATE INDEX "bank_accounts_is_active_idx" ON "bank_accounts"("is_active");

-- CreateIndex
CREATE INDEX "bank_accounts_created_at_idx" ON "bank_accounts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_workspace_id_account_number_key" ON "bank_accounts"("workspace_id", "account_number");

-- CreateIndex
CREATE INDEX "bank_transactions_workspace_id_idx" ON "bank_transactions"("workspace_id");

-- CreateIndex
CREATE INDEX "bank_transactions_workspace_id_transaction_date_idx" ON "bank_transactions"("workspace_id", "transaction_date");

-- CreateIndex
CREATE INDEX "bank_transactions_workspace_id_type_idx" ON "bank_transactions"("workspace_id", "type");

-- CreateIndex
CREATE INDEX "bank_transactions_bank_account_id_idx" ON "bank_transactions"("bank_account_id");

-- CreateIndex
CREATE INDEX "bank_transactions_transaction_date_idx" ON "bank_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "bank_transactions_type_idx" ON "bank_transactions"("type");

-- CreateIndex
CREATE INDEX "bank_transactions_category_idx" ON "bank_transactions"("category");

-- CreateIndex
CREATE INDEX "bank_transactions_reconciled_idx" ON "bank_transactions"("reconciled");

-- CreateIndex
CREATE INDEX "bank_transactions_created_at_idx" ON "bank_transactions"("created_at");

-- CreateIndex
CREATE INDEX "expenses_workspace_id_idx" ON "expenses"("workspace_id");

-- CreateIndex
CREATE INDEX "expenses_workspace_id_category_idx" ON "expenses"("workspace_id", "category");

-- CreateIndex
CREATE INDEX "expenses_workspace_id_expense_date_idx" ON "expenses"("workspace_id", "expense_date");

-- CreateIndex
CREATE INDEX "expenses_workspace_id_approved_idx" ON "expenses"("workspace_id", "approved");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_order_id_idx" ON "expenses"("order_id");

-- CreateIndex
CREATE INDEX "expenses_expense_date_idx" ON "expenses"("expense_date");

-- CreateIndex
CREATE INDEX "expenses_approved_idx" ON "expenses"("approved");

-- CreateIndex
CREATE INDEX "expenses_supplier_idx" ON "expenses"("supplier");

-- CreateIndex
CREATE INDEX "expenses_created_at_idx" ON "expenses"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_workspace_id_expense_number_key" ON "expenses"("workspace_id", "expense_number");

-- CreateIndex
CREATE INDEX "cost_centers_workspace_id_idx" ON "cost_centers"("workspace_id");

-- CreateIndex
CREATE INDEX "cost_centers_workspace_id_is_active_idx" ON "cost_centers"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "cost_centers_workspace_id_type_idx" ON "cost_centers"("workspace_id", "type");

-- CreateIndex
CREATE INDEX "cost_centers_type_idx" ON "cost_centers"("type");

-- CreateIndex
CREATE INDEX "cost_centers_is_active_idx" ON "cost_centers"("is_active");

-- CreateIndex
CREATE INDEX "cost_centers_created_at_idx" ON "cost_centers"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_workspace_id_code_key" ON "cost_centers"("workspace_id", "code");

-- CreateIndex
CREATE INDEX "cost_allocations_workspace_id_idx" ON "cost_allocations"("workspace_id");

-- CreateIndex
CREATE INDEX "cost_allocations_workspace_id_allocation_date_idx" ON "cost_allocations"("workspace_id", "allocation_date");

-- CreateIndex
CREATE INDEX "cost_allocations_cost_center_id_idx" ON "cost_allocations"("cost_center_id");

-- CreateIndex
CREATE INDEX "cost_allocations_order_id_idx" ON "cost_allocations"("order_id");

-- CreateIndex
CREATE INDEX "cost_allocations_allocation_type_idx" ON "cost_allocations"("allocation_type");

-- CreateIndex
CREATE INDEX "cost_allocations_allocation_date_idx" ON "cost_allocations"("allocation_date");

-- CreateIndex
CREATE INDEX "cost_allocations_created_at_idx" ON "cost_allocations"("created_at");

-- CreateIndex
CREATE INDEX "budgets_workspace_id_idx" ON "budgets"("workspace_id");

-- CreateIndex
CREATE INDEX "budgets_workspace_id_status_idx" ON "budgets"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "budgets_cost_center_id_idx" ON "budgets"("cost_center_id");

-- CreateIndex
CREATE INDEX "budgets_budget_period_idx" ON "budgets"("budget_period");

-- CreateIndex
CREATE INDEX "budgets_status_idx" ON "budgets"("status");

-- CreateIndex
CREATE INDEX "budgets_period_start_idx" ON "budgets"("period_start");

-- CreateIndex
CREATE INDEX "budgets_period_end_idx" ON "budgets"("period_end");

-- CreateIndex
CREATE INDEX "budgets_created_at_idx" ON "budgets"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_workspace_id_cost_center_id_budget_period_key" ON "budgets"("workspace_id", "cost_center_id", "budget_period");

-- CreateIndex
CREATE INDEX "financial_reports_workspace_id_idx" ON "financial_reports"("workspace_id");

-- CreateIndex
CREATE INDEX "financial_reports_workspace_id_is_active_idx" ON "financial_reports"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "financial_reports_workspace_id_report_type_idx" ON "financial_reports"("workspace_id", "report_type");

-- CreateIndex
CREATE INDEX "financial_reports_report_type_idx" ON "financial_reports"("report_type");

-- CreateIndex
CREATE INDEX "financial_reports_is_active_idx" ON "financial_reports"("is_active");

-- CreateIndex
CREATE INDEX "financial_reports_auto_generate_idx" ON "financial_reports"("auto_generate");

-- CreateIndex
CREATE INDEX "financial_reports_created_at_idx" ON "financial_reports"("created_at");

-- CreateIndex
CREATE INDEX "report_runs_workspace_id_idx" ON "report_runs"("workspace_id");

-- CreateIndex
CREATE INDEX "report_runs_workspace_id_status_idx" ON "report_runs"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "report_runs_report_id_idx" ON "report_runs"("report_id");

-- CreateIndex
CREATE INDEX "report_runs_status_idx" ON "report_runs"("status");

-- CreateIndex
CREATE INDEX "report_runs_run_date_idx" ON "report_runs"("run_date");

-- CreateIndex
CREATE INDEX "report_runs_period_start_idx" ON "report_runs"("period_start");

-- CreateIndex
CREATE INDEX "report_runs_period_end_idx" ON "report_runs"("period_end");

-- CreateIndex
CREATE INDEX "report_runs_created_at_idx" ON "report_runs"("created_at");

-- CreateIndex
CREATE INDEX "financial_metrics_workspace_id_idx" ON "financial_metrics"("workspace_id");

-- CreateIndex
CREATE INDEX "financial_metrics_workspace_id_metric_type_idx" ON "financial_metrics"("workspace_id", "metric_type");

-- CreateIndex
CREATE INDEX "financial_metrics_workspace_id_period_idx" ON "financial_metrics"("workspace_id", "period");

-- CreateIndex
CREATE INDEX "financial_metrics_metric_name_idx" ON "financial_metrics"("metric_name");

-- CreateIndex
CREATE INDEX "financial_metrics_metric_type_idx" ON "financial_metrics"("metric_type");

-- CreateIndex
CREATE INDEX "financial_metrics_period_idx" ON "financial_metrics"("period");

-- CreateIndex
CREATE INDEX "financial_metrics_period_start_idx" ON "financial_metrics"("period_start");

-- CreateIndex
CREATE INDEX "financial_metrics_period_end_idx" ON "financial_metrics"("period_end");

-- CreateIndex
CREATE INDEX "financial_metrics_calculated_at_idx" ON "financial_metrics"("calculated_at");

-- CreateIndex
CREATE INDEX "tax_settings_workspace_id_idx" ON "tax_settings"("workspace_id");

-- CreateIndex
CREATE INDEX "tax_settings_workspace_id_is_active_idx" ON "tax_settings"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "tax_settings_workspace_id_tax_type_idx" ON "tax_settings"("workspace_id", "tax_type");

-- CreateIndex
CREATE INDEX "tax_settings_tax_type_idx" ON "tax_settings"("tax_type");

-- CreateIndex
CREATE INDEX "tax_settings_is_active_idx" ON "tax_settings"("is_active");

-- CreateIndex
CREATE INDEX "tax_settings_is_default_idx" ON "tax_settings"("is_default");

-- CreateIndex
CREATE INDEX "tax_settings_effective_date_idx" ON "tax_settings"("effective_date");

-- CreateIndex
CREATE INDEX "tax_settings_end_date_idx" ON "tax_settings"("end_date");

-- CreateIndex
CREATE INDEX "assets_workspace_id_idx" ON "assets"("workspace_id");

-- CreateIndex
CREATE INDEX "assets_workspace_id_status_idx" ON "assets"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "assets_workspace_id_type_idx" ON "assets"("workspace_id", "type");

-- CreateIndex
CREATE INDEX "assets_status_idx" ON "assets"("status");

-- CreateIndex
CREATE INDEX "assets_type_idx" ON "assets"("type");

-- CreateIndex
CREATE INDEX "assets_location_idx" ON "assets"("location");

-- CreateIndex
CREATE INDEX "assets_purchase_date_idx" ON "assets"("purchase_date");

-- CreateIndex
CREATE INDEX "assets_created_at_idx" ON "assets"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "assets_workspace_id_asset_number_key" ON "assets"("workspace_id", "asset_number");

-- CreateIndex
CREATE INDEX "work_orders_workspace_id_idx" ON "work_orders"("workspace_id");

-- CreateIndex
CREATE INDEX "work_orders_workspace_id_status_idx" ON "work_orders"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "work_orders_workspace_id_priority_idx" ON "work_orders"("workspace_id", "priority");

-- CreateIndex
CREATE INDEX "work_orders_workspace_id_type_idx" ON "work_orders"("workspace_id", "type");

-- CreateIndex
CREATE INDEX "work_orders_asset_id_idx" ON "work_orders"("asset_id");

-- CreateIndex
CREATE INDEX "work_orders_maintenance_schedule_id_idx" ON "work_orders"("maintenance_schedule_id");

-- CreateIndex
CREATE INDEX "work_orders_assigned_to_idx" ON "work_orders"("assigned_to");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");

-- CreateIndex
CREATE INDEX "work_orders_priority_idx" ON "work_orders"("priority");

-- CreateIndex
CREATE INDEX "work_orders_type_idx" ON "work_orders"("type");

-- CreateIndex
CREATE INDEX "work_orders_scheduled_date_idx" ON "work_orders"("scheduled_date");

-- CreateIndex
CREATE INDEX "work_orders_created_at_idx" ON "work_orders"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_hash_key" ON "user_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_is_active_idx" ON "user_sessions"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "fabric_batches_workspace_id_idx" ON "fabric_batches"("workspace_id");

-- CreateIndex
CREATE INDEX "fabric_batches_workspace_id_brand_id_idx" ON "fabric_batches"("workspace_id", "brand_id");

-- CreateIndex
CREATE INDEX "fabric_batches_brand_id_idx" ON "fabric_batches"("brand_id");

-- CreateIndex
CREATE INDEX "fabric_batches_lot_no_idx" ON "fabric_batches"("lot_no");

-- CreateIndex
CREATE INDEX "fabric_batches_uom_idx" ON "fabric_batches"("uom");

-- CreateIndex
CREATE INDEX "fabric_batches_received_at_idx" ON "fabric_batches"("received_at");

-- CreateIndex
CREATE INDEX "fabric_batches_created_at_idx" ON "fabric_batches"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "fabric_batches_workspace_id_lot_no_key" ON "fabric_batches"("workspace_id", "lot_no");

-- CreateIndex
CREATE UNIQUE INDEX "cut_outputs_cut_lay_id_size_code_key" ON "cut_outputs"("cut_lay_id", "size_code");

-- CreateIndex
CREATE INDEX "machines_workspace_id_idx" ON "machines"("workspace_id");

-- CreateIndex
CREATE INDEX "machines_name_idx" ON "machines"("name");

-- CreateIndex
CREATE INDEX "machines_is_active_idx" ON "machines"("is_active");

-- CreateIndex
CREATE INDEX "machines_created_at_idx" ON "machines"("created_at");

-- CreateIndex
CREATE INDEX "print_runs_workspace_id_idx" ON "print_runs"("workspace_id");

-- CreateIndex
CREATE INDEX "print_runs_workspace_id_status_idx" ON "print_runs"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "print_runs_workspace_id_method_idx" ON "print_runs"("workspace_id", "method");

-- CreateIndex
CREATE INDEX "print_runs_order_id_idx" ON "print_runs"("order_id");

-- CreateIndex
CREATE INDEX "print_runs_routing_step_id_idx" ON "print_runs"("routing_step_id");

-- CreateIndex
CREATE INDEX "print_runs_machine_id_idx" ON "print_runs"("machine_id");

-- CreateIndex
CREATE INDEX "print_runs_status_idx" ON "print_runs"("status");

-- CreateIndex
CREATE INDEX "print_runs_method_idx" ON "print_runs"("method");

-- CreateIndex
CREATE INDEX "print_runs_started_at_idx" ON "print_runs"("started_at");

-- CreateIndex
CREATE INDEX "print_runs_ended_at_idx" ON "print_runs"("ended_at");

-- CreateIndex
CREATE INDEX "print_runs_created_at_idx" ON "print_runs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "qc_defect_codes_workspace_id_code_key" ON "qc_defect_codes"("workspace_id", "code");

-- CreateIndex
CREATE INDEX "qc_inspections_workspace_id_idx" ON "qc_inspections"("workspace_id");

-- CreateIndex
CREATE INDEX "qc_inspections_workspace_id_status_idx" ON "qc_inspections"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "qc_inspections_workspace_id_stage_idx" ON "qc_inspections"("workspace_id", "stage");

-- CreateIndex
CREATE INDEX "qc_inspections_order_id_idx" ON "qc_inspections"("order_id");

-- CreateIndex
CREATE INDEX "qc_inspections_bundle_id_idx" ON "qc_inspections"("bundle_id");

-- CreateIndex
CREATE INDEX "qc_inspections_routing_step_id_idx" ON "qc_inspections"("routing_step_id");

-- CreateIndex
CREATE INDEX "qc_inspections_inspector_id_idx" ON "qc_inspections"("inspector_id");

-- CreateIndex
CREATE INDEX "qc_inspections_status_idx" ON "qc_inspections"("status");

-- CreateIndex
CREATE INDEX "qc_inspections_stage_idx" ON "qc_inspections"("stage");

-- CreateIndex
CREATE INDEX "qc_inspections_inspection_date_idx" ON "qc_inspections"("inspection_date");

-- CreateIndex
CREATE INDEX "qc_inspections_created_at_idx" ON "qc_inspections"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "qc_samples_inspection_id_sample_no_key" ON "qc_samples"("inspection_id", "sample_no");

-- CreateIndex
CREATE INDEX "qc_defects_workspace_id_idx" ON "qc_defects"("workspace_id");

-- CreateIndex
CREATE INDEX "qc_defects_workspace_id_severity_idx" ON "qc_defects"("workspace_id", "severity");

-- CreateIndex
CREATE INDEX "qc_defects_inspection_id_idx" ON "qc_defects"("inspection_id");

-- CreateIndex
CREATE INDEX "qc_defects_defect_code_id_idx" ON "qc_defects"("defect_code_id");

-- CreateIndex
CREATE INDEX "qc_defects_severity_idx" ON "qc_defects"("severity");

-- CreateIndex
CREATE INDEX "qc_defects_created_at_idx" ON "qc_defects"("created_at");

-- CreateIndex
CREATE INDEX "capa_tasks_workspace_id_idx" ON "capa_tasks"("workspace_id");

-- CreateIndex
CREATE INDEX "capa_tasks_workspace_id_status_idx" ON "capa_tasks"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "capa_tasks_workspace_id_priority_idx" ON "capa_tasks"("workspace_id", "priority");

-- CreateIndex
CREATE INDEX "capa_tasks_workspace_id_type_idx" ON "capa_tasks"("workspace_id", "type");

-- CreateIndex
CREATE INDEX "capa_tasks_order_id_idx" ON "capa_tasks"("order_id");

-- CreateIndex
CREATE INDEX "capa_tasks_assigned_to_idx" ON "capa_tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "capa_tasks_created_by_idx" ON "capa_tasks"("created_by");

-- CreateIndex
CREATE INDEX "capa_tasks_verified_by_idx" ON "capa_tasks"("verified_by");

-- CreateIndex
CREATE INDEX "capa_tasks_status_idx" ON "capa_tasks"("status");

-- CreateIndex
CREATE INDEX "capa_tasks_priority_idx" ON "capa_tasks"("priority");

-- CreateIndex
CREATE INDEX "capa_tasks_type_idx" ON "capa_tasks"("type");

-- CreateIndex
CREATE INDEX "capa_tasks_due_date_idx" ON "capa_tasks"("due_date");

-- CreateIndex
CREATE INDEX "capa_tasks_created_at_idx" ON "capa_tasks"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "capa_tasks_workspace_id_capa_number_key" ON "capa_tasks"("workspace_id", "capa_number");

-- CreateIndex
CREATE INDEX "payroll_periods_workspace_id_idx" ON "payroll_periods"("workspace_id");

-- CreateIndex
CREATE INDEX "payroll_periods_workspace_id_status_idx" ON "payroll_periods"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "payroll_periods_status_idx" ON "payroll_periods"("status");

-- CreateIndex
CREATE INDEX "payroll_periods_period_start_idx" ON "payroll_periods"("period_start");

-- CreateIndex
CREATE INDEX "payroll_periods_period_end_idx" ON "payroll_periods"("period_end");

-- CreateIndex
CREATE INDEX "payroll_periods_created_at_idx" ON "payroll_periods"("created_at");

-- CreateIndex
CREATE INDEX "payroll_earnings_workspace_id_idx" ON "payroll_earnings"("workspace_id");

-- CreateIndex
CREATE INDEX "payroll_earnings_payroll_period_id_idx" ON "payroll_earnings"("payroll_period_id");

-- CreateIndex
CREATE INDEX "payroll_earnings_employee_id_idx" ON "payroll_earnings"("employee_id");

-- CreateIndex
CREATE INDEX "payroll_earnings_workspace_id_employee_id_idx" ON "payroll_earnings"("workspace_id", "employee_id");

-- CreateIndex
CREATE INDEX "payroll_earnings_workspace_id_payroll_period_id_idx" ON "payroll_earnings"("workspace_id", "payroll_period_id");

-- CreateIndex
CREATE INDEX "payroll_earnings_created_at_idx" ON "payroll_earnings"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_earnings_payroll_period_id_employee_id_key" ON "payroll_earnings"("payroll_period_id", "employee_id");

-- CreateIndex
CREATE INDEX "sewing_runs_order_id_idx" ON "sewing_runs"("order_id");

-- CreateIndex
CREATE INDEX "sewing_runs_order_id_status_idx" ON "sewing_runs"("order_id", "status");

-- CreateIndex
CREATE INDEX "sewing_runs_bundle_id_idx" ON "sewing_runs"("bundle_id");

-- CreateIndex
CREATE INDEX "sewing_runs_operator_id_idx" ON "sewing_runs"("operator_id");

-- CreateIndex
CREATE INDEX "sewing_runs_routing_step_id_idx" ON "sewing_runs"("routing_step_id");

-- CreateIndex
CREATE INDEX "sewing_runs_status_idx" ON "sewing_runs"("status");

-- CreateIndex
CREATE INDEX "sewing_runs_started_at_idx" ON "sewing_runs"("started_at");

-- CreateIndex
CREATE INDEX "sewing_runs_ended_at_idx" ON "sewing_runs"("ended_at");

-- CreateIndex
CREATE INDEX "sewing_runs_created_at_idx" ON "sewing_runs"("created_at");

-- CreateIndex
CREATE INDEX "production_schedules_workspace_id_idx" ON "production_schedules"("workspace_id");

-- CreateIndex
CREATE INDEX "production_schedules_workspace_id_status_idx" ON "production_schedules"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "production_schedules_order_id_idx" ON "production_schedules"("order_id");

-- CreateIndex
CREATE INDEX "production_schedules_production_line_id_idx" ON "production_schedules"("production_line_id");

-- CreateIndex
CREATE INDEX "production_schedules_status_idx" ON "production_schedules"("status");

-- CreateIndex
CREATE INDEX "production_schedules_created_at_idx" ON "production_schedules"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "worker_assignments_production_schedule_id_worker_id_assigned_date_key" ON "worker_assignments"("production_schedule_id", "worker_id", "assigned_date");

-- CreateIndex
CREATE UNIQUE INDEX "worker_allocations_production_line_id_worker_id_allocation_date_shift_key" ON "worker_allocations"("production_line_id", "worker_id", "allocation_date", "shift");

-- CreateIndex
CREATE INDEX "material_inventory_workspace_id_idx" ON "material_inventory"("workspace_id");

-- CreateIndex
CREATE INDEX "material_inventory_workspace_id_material_type_idx" ON "material_inventory"("workspace_id", "material_type");

-- CreateIndex
CREATE INDEX "material_inventory_workspace_id_location_idx" ON "material_inventory"("workspace_id", "location");

-- CreateIndex
CREATE INDEX "material_inventory_material_type_idx" ON "material_inventory"("material_type");

-- CreateIndex
CREATE INDEX "material_inventory_location_idx" ON "material_inventory"("location");

-- CreateIndex
CREATE INDEX "material_inventory_created_at_idx" ON "material_inventory"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "material_inventory_workspace_id_material_name_color_batch_number_key" ON "material_inventory"("workspace_id", "material_name", "color", "batch_number");

-- CreateIndex
CREATE UNIQUE INDEX "material_requirements_order_id_material_inventory_id_key" ON "material_requirements"("order_id", "material_inventory_id");

-- CreateIndex
CREATE INDEX "material_transactions_workspace_id_idx" ON "material_transactions"("workspace_id");

-- CreateIndex
CREATE INDEX "material_transactions_workspace_id_transaction_type_idx" ON "material_transactions"("workspace_id", "transaction_type");

-- CreateIndex
CREATE INDEX "material_transactions_transaction_type_idx" ON "material_transactions"("transaction_type");

-- CreateIndex
CREATE INDEX "material_transactions_created_at_idx" ON "material_transactions"("created_at");

-- CreateIndex
CREATE INDEX "ai_analysis_workspace_id_entity_entity_id_idx" ON "ai_analysis"("workspace_id", "entity", "entity_id");

-- CreateIndex
CREATE INDEX "ai_analysis_cache_key_idx" ON "ai_analysis"("cache_key");

-- CreateIndex
CREATE INDEX "finishing_runs_workspace_id_idx" ON "finishing_runs"("workspace_id");

-- CreateIndex
CREATE INDEX "finishing_runs_workspace_id_status_idx" ON "finishing_runs"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "finishing_runs_order_id_idx" ON "finishing_runs"("order_id");

-- CreateIndex
CREATE INDEX "finishing_runs_routing_step_id_idx" ON "finishing_runs"("routing_step_id");

-- CreateIndex
CREATE INDEX "finishing_runs_operator_id_idx" ON "finishing_runs"("operator_id");

-- CreateIndex
CREATE INDEX "finishing_runs_status_idx" ON "finishing_runs"("status");

-- CreateIndex
CREATE INDEX "finishing_runs_created_at_idx" ON "finishing_runs"("created_at");

-- CreateIndex
CREATE INDEX "finished_units_workspace_id_idx" ON "finished_units"("workspace_id");

-- CreateIndex
CREATE INDEX "finished_units_order_id_idx" ON "finished_units"("order_id");

-- CreateIndex
CREATE INDEX "finished_units_sku_idx" ON "finished_units"("sku");

-- CreateIndex
CREATE INDEX "finished_units_created_at_idx" ON "finished_units"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "cartons_qr_code_key" ON "cartons"("qr_code");

-- CreateIndex
CREATE INDEX "cartons_workspace_id_idx" ON "cartons"("workspace_id");

-- CreateIndex
CREATE INDEX "cartons_workspace_id_status_idx" ON "cartons"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "cartons_order_id_idx" ON "cartons"("order_id");

-- CreateIndex
CREATE INDEX "cartons_status_idx" ON "cartons"("status");

-- CreateIndex
CREATE INDEX "cartons_created_at_idx" ON "cartons"("created_at");

-- CreateIndex
CREATE INDEX "shipments_workspace_id_idx" ON "shipments"("workspace_id");

-- CreateIndex
CREATE INDEX "shipments_workspace_id_status_idx" ON "shipments"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "shipments_order_id_idx" ON "shipments"("order_id");

-- CreateIndex
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "shipments_created_at_idx" ON "shipments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_delivery_reference_key" ON "deliveries"("delivery_reference");

-- CreateIndex
CREATE INDEX "deliveries_workspace_id_idx" ON "deliveries"("workspace_id");

-- CreateIndex
CREATE INDEX "deliveries_workspace_id_status_idx" ON "deliveries"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "deliveries_order_id_idx" ON "deliveries"("order_id");

-- CreateIndex
CREATE INDEX "deliveries_status_idx" ON "deliveries"("status");

-- CreateIndex
CREATE INDEX "deliveries_created_at_idx" ON "deliveries"("created_at");

-- CreateIndex
CREATE INDEX "pod_records_workspace_id_idx" ON "pod_records"("workspace_id");

-- CreateIndex
CREATE INDEX "pod_records_delivery_id_idx" ON "pod_records"("delivery_id");

-- CreateIndex
CREATE INDEX "maintenance_schedules_workspace_id_idx" ON "maintenance_schedules"("workspace_id");

-- CreateIndex
CREATE INDEX "maintenance_schedules_workspace_id_asset_id_idx" ON "maintenance_schedules"("workspace_id", "asset_id");

-- CreateIndex
CREATE INDEX "maintenance_schedules_workspace_id_is_active_idx" ON "maintenance_schedules"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "maintenance_schedules_asset_id_idx" ON "maintenance_schedules"("asset_id");

-- CreateIndex
CREATE INDEX "maintenance_schedules_frequency_type_idx" ON "maintenance_schedules"("frequency_type");

-- CreateIndex
CREATE INDEX "maintenance_schedules_is_active_idx" ON "maintenance_schedules"("is_active");

-- CreateIndex
CREATE INDEX "maintenance_schedules_next_due_date_idx" ON "maintenance_schedules"("next_due_date");

-- CreateIndex
CREATE INDEX "maintenance_schedules_created_at_idx" ON "maintenance_schedules"("created_at");

-- CreateIndex
CREATE INDEX "demand_forecasts_workspace_id_idx" ON "demand_forecasts"("workspace_id");

-- CreateIndex
CREATE INDEX "demand_forecasts_workspace_id_client_id_idx" ON "demand_forecasts"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "demand_forecasts_workspace_id_brand_id_idx" ON "demand_forecasts"("workspace_id", "brand_id");

-- CreateIndex
CREATE INDEX "demand_forecasts_client_id_idx" ON "demand_forecasts"("client_id");

-- CreateIndex
CREATE INDEX "demand_forecasts_brand_id_idx" ON "demand_forecasts"("brand_id");

-- CreateIndex
CREATE INDEX "demand_forecasts_forecast_period_idx" ON "demand_forecasts"("forecast_period");

-- CreateIndex
CREATE INDEX "demand_forecasts_forecast_date_idx" ON "demand_forecasts"("forecast_date");

-- CreateIndex
CREATE INDEX "demand_forecasts_created_at_idx" ON "demand_forecasts"("created_at");

-- CreateIndex
CREATE INDEX "product_recommendations_workspace_id_idx" ON "product_recommendations"("workspace_id");

-- CreateIndex
CREATE INDEX "product_recommendations_workspace_id_client_id_idx" ON "product_recommendations"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "product_recommendations_workspace_id_recommendation_type_idx" ON "product_recommendations"("workspace_id", "recommendation_type");

-- CreateIndex
CREATE INDEX "product_recommendations_client_id_idx" ON "product_recommendations"("client_id");

-- CreateIndex
CREATE INDEX "product_recommendations_recommendation_type_idx" ON "product_recommendations"("recommendation_type");

-- CreateIndex
CREATE INDEX "product_recommendations_confidence_score_idx" ON "product_recommendations"("confidence_score");

-- CreateIndex
CREATE INDEX "product_recommendations_created_at_idx" ON "product_recommendations"("created_at");

-- CreateIndex
CREATE INDEX "ai_model_metrics_workspace_id_idx" ON "ai_model_metrics"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_model_metrics_workspace_id_model_name_idx" ON "ai_model_metrics"("workspace_id", "model_name");

-- CreateIndex
CREATE INDEX "ai_model_metrics_workspace_id_model_version_idx" ON "ai_model_metrics"("workspace_id", "model_version");

-- CreateIndex
CREATE INDEX "ai_model_metrics_model_name_idx" ON "ai_model_metrics"("model_name");

-- CreateIndex
CREATE INDEX "ai_model_metrics_model_version_idx" ON "ai_model_metrics"("model_version");

-- CreateIndex
CREATE INDEX "ai_model_metrics_created_at_idx" ON "ai_model_metrics"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "client_sessions_magic_token_key" ON "client_sessions"("magic_token");

-- CreateIndex
CREATE INDEX "client_sessions_workspace_id_idx" ON "client_sessions"("workspace_id");

-- CreateIndex
CREATE INDEX "client_sessions_workspace_id_client_id_idx" ON "client_sessions"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "client_sessions_workspace_id_is_used_idx" ON "client_sessions"("workspace_id", "is_used");

-- CreateIndex
CREATE INDEX "client_sessions_client_id_idx" ON "client_sessions"("client_id");

-- CreateIndex
CREATE INDEX "client_sessions_magic_token_idx" ON "client_sessions"("magic_token");

-- CreateIndex
CREATE INDEX "client_sessions_is_used_idx" ON "client_sessions"("is_used");

-- CreateIndex
CREATE INDEX "client_sessions_expires_at_idx" ON "client_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "client_sessions_created_at_idx" ON "client_sessions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "client_sessions_workspace_id_magic_token_key" ON "client_sessions"("workspace_id", "magic_token");

-- CreateIndex
CREATE INDEX "client_notifications_workspace_id_idx" ON "client_notifications"("workspace_id");

-- CreateIndex
CREATE INDEX "client_notifications_workspace_id_client_id_idx" ON "client_notifications"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "client_notifications_workspace_id_is_read_idx" ON "client_notifications"("workspace_id", "is_read");

-- CreateIndex
CREATE INDEX "client_notifications_client_id_idx" ON "client_notifications"("client_id");

-- CreateIndex
CREATE INDEX "client_notifications_type_idx" ON "client_notifications"("type");

-- CreateIndex
CREATE INDEX "client_notifications_is_read_idx" ON "client_notifications"("is_read");

-- CreateIndex
CREATE INDEX "client_notifications_created_at_idx" ON "client_notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "client_portal_settings_workspace_id_client_id_key" ON "client_portal_settings"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "automation_rules_workspace_id_idx" ON "automation_rules"("workspace_id");

-- CreateIndex
CREATE INDEX "automation_rules_workspace_id_is_active_idx" ON "automation_rules"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "automation_rules_workspace_id_trigger_type_idx" ON "automation_rules"("workspace_id", "trigger_type");

-- CreateIndex
CREATE INDEX "automation_rules_trigger_type_idx" ON "automation_rules"("trigger_type");

-- CreateIndex
CREATE INDEX "automation_rules_is_active_idx" ON "automation_rules"("is_active");

-- CreateIndex
CREATE INDEX "automation_rules_created_at_idx" ON "automation_rules"("created_at");

-- CreateIndex
CREATE INDEX "automation_executions_workspace_id_idx" ON "automation_executions"("workspace_id");

-- CreateIndex
CREATE INDEX "automation_executions_workspace_id_execution_status_idx" ON "automation_executions"("workspace_id", "execution_status");

-- CreateIndex
CREATE INDEX "automation_executions_rule_id_idx" ON "automation_executions"("rule_id");

-- CreateIndex
CREATE INDEX "automation_executions_execution_status_idx" ON "automation_executions"("execution_status");

-- CreateIndex
CREATE INDEX "automation_executions_started_at_idx" ON "automation_executions"("started_at");

-- CreateIndex
CREATE INDEX "automation_executions_completed_at_idx" ON "automation_executions"("completed_at");

-- CreateIndex
CREATE INDEX "notifications_workspace_id_idx" ON "notifications"("workspace_id");

-- CreateIndex
CREATE INDEX "notifications_workspace_id_status_idx" ON "notifications"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "notifications_workspace_id_channel_idx" ON "notifications"("workspace_id", "channel");

-- CreateIndex
CREATE INDEX "notifications_template_id_idx" ON "notifications"("template_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_channel_idx" ON "notifications"("channel");

-- CreateIndex
CREATE INDEX "notifications_scheduled_for_idx" ON "notifications"("scheduled_for");

-- CreateIndex
CREATE INDEX "notifications_sent_at_idx" ON "notifications"("sent_at");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "alerts_workspace_id_idx" ON "alerts"("workspace_id");

-- CreateIndex
CREATE INDEX "alerts_workspace_id_severity_idx" ON "alerts"("workspace_id", "severity");

-- CreateIndex
CREATE INDEX "alerts_workspace_id_alert_type_idx" ON "alerts"("workspace_id", "alert_type");

-- CreateIndex
CREATE INDEX "alerts_workspace_id_is_acknowledged_idx" ON "alerts"("workspace_id", "is_acknowledged");

-- CreateIndex
CREATE INDEX "alerts_workspace_id_is_resolved_idx" ON "alerts"("workspace_id", "is_resolved");

-- CreateIndex
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");

-- CreateIndex
CREATE INDEX "alerts_alert_type_idx" ON "alerts"("alert_type");

-- CreateIndex
CREATE INDEX "alerts_acknowledged_by_idx" ON "alerts"("acknowledged_by");

-- CreateIndex
CREATE INDEX "alerts_resolved_by_idx" ON "alerts"("resolved_by");

-- CreateIndex
CREATE INDEX "alerts_is_acknowledged_idx" ON "alerts"("is_acknowledged");

-- CreateIndex
CREATE INDEX "alerts_is_resolved_idx" ON "alerts"("is_resolved");

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

-- CreateIndex
CREATE INDEX "integrations_workspace_id_idx" ON "integrations"("workspace_id");

-- CreateIndex
CREATE INDEX "integrations_workspace_id_is_active_idx" ON "integrations"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "integrations_workspace_id_type_idx" ON "integrations"("workspace_id", "type");

-- CreateIndex
CREATE INDEX "integrations_type_idx" ON "integrations"("type");

-- CreateIndex
CREATE INDEX "integrations_is_active_idx" ON "integrations"("is_active");

-- CreateIndex
CREATE INDEX "integrations_created_at_idx" ON "integrations"("created_at");

-- CreateIndex
CREATE INDEX "integration_sync_logs_workspace_id_idx" ON "integration_sync_logs"("workspace_id");

-- CreateIndex
CREATE INDEX "integration_sync_logs_workspace_id_status_idx" ON "integration_sync_logs"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "integration_sync_logs_integration_id_idx" ON "integration_sync_logs"("integration_id");

-- CreateIndex
CREATE INDEX "integration_sync_logs_status_idx" ON "integration_sync_logs"("status");

-- CreateIndex
CREATE INDEX "integration_sync_logs_started_at_idx" ON "integration_sync_logs"("started_at");

-- CreateIndex
CREATE INDEX "integration_sync_logs_completed_at_idx" ON "integration_sync_logs"("completed_at");

-- CreateIndex
CREATE INDEX "ai_chat_conversations_workspace_id_idx" ON "ai_chat_conversations"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_chat_conversations_workspace_id_user_id_idx" ON "ai_chat_conversations"("workspace_id", "user_id");

-- CreateIndex
CREATE INDEX "ai_chat_conversations_workspace_id_context_type_idx" ON "ai_chat_conversations"("workspace_id", "context_type");

-- CreateIndex
CREATE INDEX "ai_chat_conversations_user_id_idx" ON "ai_chat_conversations"("user_id");

-- CreateIndex
CREATE INDEX "ai_chat_conversations_is_archived_idx" ON "ai_chat_conversations"("is_archived");

-- CreateIndex
CREATE INDEX "ai_chat_conversations_last_message_at_idx" ON "ai_chat_conversations"("last_message_at");

-- CreateIndex
CREATE INDEX "ai_chat_conversations_created_at_idx" ON "ai_chat_conversations"("created_at");

-- CreateIndex
CREATE INDEX "ai_chat_messages_conversation_id_idx" ON "ai_chat_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "ai_chat_messages_role_idx" ON "ai_chat_messages"("role");

-- CreateIndex
CREATE INDEX "ai_chat_messages_created_at_idx" ON "ai_chat_messages"("created_at");

-- CreateIndex
CREATE INDEX "ai_chat_suggestions_workspace_id_idx" ON "ai_chat_suggestions"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_chat_suggestions_workspace_id_is_dismissed_idx" ON "ai_chat_suggestions"("workspace_id", "is_dismissed");

-- CreateIndex
CREATE INDEX "ai_chat_suggestions_workspace_id_category_idx" ON "ai_chat_suggestions"("workspace_id", "category");

-- CreateIndex
CREATE INDEX "ai_chat_suggestions_suggestion_type_idx" ON "ai_chat_suggestions"("suggestion_type");

-- CreateIndex
CREATE INDEX "ai_chat_suggestions_priority_idx" ON "ai_chat_suggestions"("priority");

-- CreateIndex
CREATE INDEX "ai_chat_suggestions_is_dismissed_idx" ON "ai_chat_suggestions"("is_dismissed");

-- CreateIndex
CREATE INDEX "ai_chat_suggestions_is_acted_upon_idx" ON "ai_chat_suggestions"("is_acted_upon");

-- CreateIndex
CREATE INDEX "ai_chat_suggestions_created_at_idx" ON "ai_chat_suggestions"("created_at");

-- CreateIndex
CREATE INDEX "ai_chat_knowledge_workspace_id_idx" ON "ai_chat_knowledge"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_chat_knowledge_workspace_id_category_idx" ON "ai_chat_knowledge"("workspace_id", "category");

-- CreateIndex
CREATE INDEX "ai_chat_knowledge_workspace_id_is_active_idx" ON "ai_chat_knowledge"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "ai_chat_knowledge_category_idx" ON "ai_chat_knowledge"("category");

-- CreateIndex
CREATE INDEX "ai_chat_knowledge_is_active_idx" ON "ai_chat_knowledge"("is_active");

-- CreateIndex
CREATE INDEX "ai_chat_knowledge_created_at_idx" ON "ai_chat_knowledge"("created_at");

-- CreateIndex
CREATE INDEX "custom_reports_workspace_id_idx" ON "custom_reports"("workspace_id");

-- CreateIndex
CREATE INDEX "custom_reports_workspace_id_is_public_idx" ON "custom_reports"("workspace_id", "is_public");

-- CreateIndex
CREATE INDEX "custom_reports_workspace_id_created_by_idx" ON "custom_reports"("workspace_id", "created_by");

-- CreateIndex
CREATE INDEX "custom_reports_report_type_idx" ON "custom_reports"("report_type");

-- CreateIndex
CREATE INDEX "custom_reports_data_source_idx" ON "custom_reports"("data_source");

-- CreateIndex
CREATE INDEX "custom_reports_is_favorite_idx" ON "custom_reports"("is_favorite");

-- CreateIndex
CREATE INDEX "custom_reports_created_at_idx" ON "custom_reports"("created_at");

-- CreateIndex
CREATE INDEX "report_executions_report_id_idx" ON "report_executions"("report_id");

-- CreateIndex
CREATE INDEX "report_executions_workspace_id_idx" ON "report_executions"("workspace_id");

-- CreateIndex
CREATE INDEX "report_executions_executed_by_idx" ON "report_executions"("executed_by");

-- CreateIndex
CREATE INDEX "report_executions_status_idx" ON "report_executions"("status");

-- CreateIndex
CREATE INDEX "report_executions_executed_at_idx" ON "report_executions"("executed_at");

-- CreateIndex
CREATE INDEX "report_exports_report_id_idx" ON "report_exports"("report_id");

-- CreateIndex
CREATE INDEX "report_exports_workspace_id_idx" ON "report_exports"("workspace_id");

-- CreateIndex
CREATE INDEX "report_exports_exported_by_idx" ON "report_exports"("exported_by");

-- CreateIndex
CREATE INDEX "report_exports_exported_at_idx" ON "report_exports"("exported_at");

-- CreateIndex
CREATE INDEX "report_exports_expires_at_idx" ON "report_exports"("expires_at");

-- CreateIndex
CREATE INDEX "report_shares_report_id_idx" ON "report_shares"("report_id");

-- CreateIndex
CREATE INDEX "report_shares_workspace_id_idx" ON "report_shares"("workspace_id");

-- CreateIndex
CREATE INDEX "report_shares_shared_with_idx" ON "report_shares"("shared_with");

-- CreateIndex
CREATE INDEX "report_shares_shared_by_idx" ON "report_shares"("shared_by");

-- CreateIndex
CREATE INDEX "executive_dashboards_workspace_id_idx" ON "executive_dashboards"("workspace_id");

-- CreateIndex
CREATE INDEX "executive_dashboards_workspace_id_is_default_idx" ON "executive_dashboards"("workspace_id", "is_default");

-- CreateIndex
CREATE INDEX "executive_dashboards_dashboard_type_idx" ON "executive_dashboards"("dashboard_type");

-- CreateIndex
CREATE INDEX "executive_dashboards_is_active_idx" ON "executive_dashboards"("is_active");

-- CreateIndex
CREATE INDEX "dashboard_widgets_dashboard_id_idx" ON "dashboard_widgets"("dashboard_id");

-- CreateIndex
CREATE INDEX "dashboard_widgets_workspace_id_idx" ON "dashboard_widgets"("workspace_id");

-- CreateIndex
CREATE INDEX "dashboard_widgets_widget_type_idx" ON "dashboard_widgets"("widget_type");

-- CreateIndex
CREATE INDEX "analytics_events_workspace_id_idx" ON "analytics_events"("workspace_id");

-- CreateIndex
CREATE INDEX "analytics_events_workspace_id_event_type_idx" ON "analytics_events"("workspace_id", "event_type");

-- CreateIndex
CREATE INDEX "analytics_events_workspace_id_event_category_idx" ON "analytics_events"("workspace_id", "event_category");

-- CreateIndex
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events"("user_id");

-- CreateIndex
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events"("created_at");

-- CreateIndex
CREATE INDEX "production_heatmaps_workspace_id_idx" ON "production_heatmaps"("workspace_id");

-- CreateIndex
CREATE INDEX "production_heatmaps_workspace_id_date_idx" ON "production_heatmaps"("workspace_id", "date");

-- CreateIndex
CREATE INDEX "production_heatmaps_workspace_id_station_type_idx" ON "production_heatmaps"("workspace_id", "station_type");

-- CreateIndex
CREATE INDEX "production_heatmaps_workspace_id_date_hour_idx" ON "production_heatmaps"("workspace_id", "date", "hour");

-- CreateIndex
CREATE INDEX "production_heatmaps_date_station_type_idx" ON "production_heatmaps"("date", "station_type");

-- CreateIndex
CREATE INDEX "profit_analyses_workspace_id_idx" ON "profit_analyses"("workspace_id");

-- CreateIndex
CREATE INDEX "profit_analyses_workspace_id_client_id_idx" ON "profit_analyses"("workspace_id", "client_id");

-- CreateIndex
CREATE INDEX "profit_analyses_workspace_id_order_id_idx" ON "profit_analyses"("workspace_id", "order_id");

-- CreateIndex
CREATE INDEX "profit_analyses_workspace_id_analysis_date_idx" ON "profit_analyses"("workspace_id", "analysis_date");

-- CreateIndex
CREATE INDEX "profit_analyses_client_id_idx" ON "profit_analyses"("client_id");

-- CreateIndex
CREATE INDEX "profit_analyses_order_id_idx" ON "profit_analyses"("order_id");

-- CreateIndex
CREATE INDEX "profit_analyses_gross_margin_idx" ON "profit_analyses"("gross_margin");

-- CreateIndex
CREATE INDEX "profit_analyses_net_margin_idx" ON "profit_analyses"("net_margin");

-- CreateIndex
CREATE INDEX "order_activity_logs_workspace_id_idx" ON "order_activity_logs"("workspace_id");

-- CreateIndex
CREATE INDEX "order_activity_logs_workspace_id_order_id_idx" ON "order_activity_logs"("workspace_id", "order_id");

-- CreateIndex
CREATE INDEX "order_activity_logs_workspace_id_created_at_idx" ON "order_activity_logs"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "order_activity_logs_order_id_idx" ON "order_activity_logs"("order_id");

-- CreateIndex
CREATE INDEX "order_activity_logs_order_id_created_at_idx" ON "order_activity_logs"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "order_activity_logs_event_type_idx" ON "order_activity_logs"("event_type");

-- CreateIndex
CREATE INDEX "order_activity_logs_created_at_idx" ON "order_activity_logs"("created_at");

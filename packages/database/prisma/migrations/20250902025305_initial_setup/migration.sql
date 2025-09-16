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
    "permissions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "requires_2fa" BOOLEAN NOT NULL DEFAULT false,
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
    "status" TEXT NOT NULL DEFAULT 'draft',
    "total_amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "delivery_date" DATETIME,
    "notes" TEXT,
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
CREATE TABLE "design_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT,
    "name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "thumbnail_url" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" DATETIME,
    "approved_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "design_assets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "design_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "design_asset_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "changes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "design_versions_design_asset_id_fkey" FOREIGN KEY ("design_asset_id") REFERENCES "design_assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "bundle_number" TEXT NOT NULL,
    "qr_code" TEXT NOT NULL,
    "garment_type" TEXT NOT NULL,
    "size" TEXT,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "current_stage" TEXT,
    "location" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bundles_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "employee_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "hire_date" DATETIME NOT NULL,
    "salary_type" TEXT NOT NULL,
    "base_salary" REAL,
    "piece_rate" REAL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "contact_info" TEXT,
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
    "status" TEXT NOT NULL DEFAULT 'pending',
    "subtotal" REAL NOT NULL,
    "tax_amount" REAL,
    "total_amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "due_date" DATETIME,
    "paid_at" DATETIME,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "payment_method" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processed_at" DATETIME,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "notes" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "work_orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
CREATE TABLE "cut_lays" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "lay_number" TEXT NOT NULL,
    "fabric_type" TEXT NOT NULL,
    "fabric_width" REAL NOT NULL,
    "layer_count" INTEGER NOT NULL,
    "total_length" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cut_outputs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "cut_lay_id" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "pieces_cut" INTEGER NOT NULL,
    "wastage" REAL,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cut_outputs_cut_lay_id_fkey" FOREIGN KEY ("cut_lay_id") REFERENCES "cut_lays" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cut_outputs_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "print_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "run_number" TEXT NOT NULL,
    "printing_method" TEXT NOT NULL,
    "machine_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "setup_time" REAL,
    "run_time" REAL,
    "pieces_printed" INTEGER,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "notes" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "print_run_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "print_run_id" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "cost" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "print_run_materials_print_run_id_fkey" FOREIGN KEY ("print_run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "print_outputs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "print_run_id" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "pieces_printed" INTEGER NOT NULL,
    "quality_grade" TEXT,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "print_outputs_print_run_id_fkey" FOREIGN KEY ("print_run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "print_outputs_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sewing_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "employee_id" TEXT,
    "pieces_completed" INTEGER,
    "piece_rate" REAL,
    "earnings" REAL,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sewing_runs_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qc_inspections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "bundle_id" TEXT NOT NULL,
    "inspector_id" TEXT NOT NULL,
    "sample_size" INTEGER NOT NULL,
    "defects_found" INTEGER NOT NULL,
    "pass_fail" BOOLEAN NOT NULL,
    "aql_level" TEXT,
    "inspection_date" DATETIME NOT NULL,
    "notes" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qc_inspections_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "qc_defects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "defect_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qc_defects_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "qc_inspections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_workspace_id_email_key" ON "users"("workspace_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "orders_workspace_id_order_number_key" ON "orders"("workspace_id", "order_number");

-- CreateIndex
CREATE UNIQUE INDEX "design_versions_design_asset_id_version_number_key" ON "design_versions"("design_asset_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "bundles_qr_code_key" ON "bundles"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "bundles_workspace_id_bundle_number_key" ON "bundles"("workspace_id", "bundle_number");

-- CreateIndex
CREATE UNIQUE INDEX "employees_workspace_id_employee_number_key" ON "employees"("workspace_id", "employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_logs_employee_id_date_key" ON "attendance_logs"("employee_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_workspace_id_invoice_number_key" ON "invoices"("workspace_id", "invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "assets_workspace_id_asset_number_key" ON "assets"("workspace_id", "asset_number");

-- CreateIndex
CREATE UNIQUE INDEX "cut_lays_workspace_id_lay_number_key" ON "cut_lays"("workspace_id", "lay_number");

-- CreateIndex
CREATE UNIQUE INDEX "print_runs_workspace_id_run_number_key" ON "print_runs"("workspace_id", "run_number");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_earnings_payroll_period_id_employee_id_key" ON "payroll_earnings"("payroll_period_id", "employee_id");

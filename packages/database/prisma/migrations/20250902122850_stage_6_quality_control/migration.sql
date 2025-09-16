/*
  Warnings:

  - You are about to drop the column `defect_type` on the `qc_defects` table. All the data in the column will be lost.
  - You are about to drop the column `aql_level` on the `qc_inspections` table. All the data in the column will be lost.
  - You are about to drop the column `defects_found` on the `qc_inspections` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `qc_inspections` table. All the data in the column will be lost.
  - You are about to drop the column `pass_fail` on the `qc_inspections` table. All the data in the column will be lost.
  - Added the required column `defect_code_id` to the `qc_defects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checklist_id` to the `qc_inspections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inspection_type` to the `qc_inspections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lot_size` to the `qc_inspections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `qc_inspections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `result` to the `qc_inspections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `qc_inspections` table without a default value. This is not possible if the table is not empty.

*/
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
CREATE TABLE "qc_samples" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "sample_no" INTEGER NOT NULL,
    "bundle_ref" TEXT,
    "qty_sampled" INTEGER NOT NULL,
    "defects_found" INTEGER NOT NULL DEFAULT 0,
    "pass_fail" BOOLEAN NOT NULL,
    "sample_data" TEXT,
    "sampled_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qc_samples_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "qc_inspections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "capa_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
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
    "attachments" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "capa_tasks_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "qc_inspections" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "capa_tasks_defect_id_fkey" FOREIGN KEY ("defect_id") REFERENCES "qc_defects" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "capa_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "capa_tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "capa_tasks_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_qc_defects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "sample_id" TEXT,
    "defect_code_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "severity" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "photo_url" TEXT,
    "operator_id" TEXT,
    "root_cause" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "qc_defects_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "qc_inspections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_defects_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "qc_samples" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "qc_defects_defect_code_id_fkey" FOREIGN KEY ("defect_code_id") REFERENCES "qc_defect_codes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_defects_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "employees" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_qc_defects" ("created_at", "description", "id", "inspection_id", "quantity", "severity", "workspace_id") SELECT "created_at", "description", "id", "inspection_id", "quantity", "severity", "workspace_id" FROM "qc_defects";
DROP TABLE "qc_defects";
ALTER TABLE "new_qc_defects" RENAME TO "qc_defects";
CREATE TABLE "new_qc_inspections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "routing_step_id" TEXT,
    "bundle_id" TEXT,
    "checklist_id" TEXT NOT NULL,
    "inspector_id" TEXT NOT NULL,
    "inspection_type" TEXT NOT NULL,
    "inspection_level" TEXT NOT NULL DEFAULT 'GENERAL_II',
    "aql_critical" REAL NOT NULL DEFAULT 0.0,
    "aql_major" REAL NOT NULL DEFAULT 2.5,
    "aql_minor" REAL NOT NULL DEFAULT 4.0,
    "lot_size" INTEGER NOT NULL,
    "sample_size" INTEGER NOT NULL,
    "critical_found" INTEGER NOT NULL DEFAULT 0,
    "major_found" INTEGER NOT NULL DEFAULT 0,
    "minor_found" INTEGER NOT NULL DEFAULT 0,
    "result" TEXT NOT NULL,
    "disposition" TEXT,
    "inspection_date" DATETIME NOT NULL,
    "started_at" DATETIME,
    "completed_at" DATETIME,
    "notes" TEXT,
    "ashley_analysis" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "qc_inspections_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_inspections_routing_step_id_fkey" FOREIGN KEY ("routing_step_id") REFERENCES "routing_steps" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "qc_inspections_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "qc_inspections_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "qc_checklists" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "qc_inspections_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_qc_inspections" ("bundle_id", "created_at", "id", "inspection_date", "inspector_id", "notes", "sample_size", "workspace_id") SELECT "bundle_id", "created_at", "id", "inspection_date", "inspector_id", "notes", "sample_size", "workspace_id" FROM "qc_inspections";
DROP TABLE "qc_inspections";
ALTER TABLE "new_qc_inspections" RENAME TO "qc_inspections";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "qc_defect_codes_workspace_id_code_key" ON "qc_defect_codes"("workspace_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "qc_samples_inspection_id_sample_no_key" ON "qc_samples"("inspection_id", "sample_no");

-- CreateIndex
CREATE UNIQUE INDEX "capa_tasks_workspace_id_capa_number_key" ON "capa_tasks"("workspace_id", "capa_number");

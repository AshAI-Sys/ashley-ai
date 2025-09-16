/*
  Warnings:

  - You are about to drop the `print_outputs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `cost` on the `print_run_materials` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `print_run_materials` table. All the data in the column will be lost.
  - You are about to drop the column `print_run_id` on the `print_run_materials` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `print_run_materials` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `print_run_materials` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `print_run_materials` table. All the data in the column will be lost.
  - You are about to drop the column `completed_at` on the `print_runs` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `print_runs` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `print_runs` table. All the data in the column will be lost.
  - You are about to drop the column `pieces_printed` on the `print_runs` table. All the data in the column will be lost.
  - You are about to drop the column `printing_method` on the `print_runs` table. All the data in the column will be lost.
  - You are about to drop the column `run_number` on the `print_runs` table. All the data in the column will be lost.
  - You are about to drop the column `run_time` on the `print_runs` table. All the data in the column will be lost.
  - You are about to drop the column `setup_time` on the `print_runs` table. All the data in the column will be lost.
  - Added the required column `qty` to the `print_run_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `run_id` to the `print_run_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uom` to the `print_run_materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `print_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `print_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workcenter` to the `print_runs` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "print_outputs";
PRAGMA foreign_keys=on;

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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_print_run_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "run_id" TEXT NOT NULL,
    "item_id" TEXT,
    "uom" TEXT NOT NULL,
    "qty" REAL NOT NULL,
    "source_batch_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "print_run_materials_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "print_runs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_print_run_materials" ("created_at", "id") SELECT "created_at", "id" FROM "print_run_materials";
DROP TABLE "print_run_materials";
ALTER TABLE "new_print_run_materials" RENAME TO "print_run_materials";
CREATE TABLE "new_print_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "routing_step_id" TEXT,
    "method" TEXT NOT NULL,
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
INSERT INTO "new_print_runs" ("created_at", "id", "machine_id", "order_id", "started_at", "status", "updated_at", "workspace_id") SELECT "created_at", "id", "machine_id", "order_id", "started_at", "status", "updated_at", "workspace_id" FROM "print_runs";
DROP TABLE "print_runs";
ALTER TABLE "new_print_runs" RENAME TO "print_runs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

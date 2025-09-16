/*
  Warnings:

  - You are about to drop the column `completed_at` on the `sewing_runs` table. All the data in the column will be lost.
  - You are about to drop the column `earnings` on the `sewing_runs` table. All the data in the column will be lost.
  - You are about to drop the column `employee_id` on the `sewing_runs` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `sewing_runs` table. All the data in the column will be lost.
  - You are about to drop the column `operation` on the `sewing_runs` table. All the data in the column will be lost.
  - You are about to drop the column `piece_rate` on the `sewing_runs` table. All the data in the column will be lost.
  - You are about to drop the column `pieces_completed` on the `sewing_runs` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `sewing_runs` table. All the data in the column will be lost.
  - Added the required column `operation_name` to the `sewing_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operator_id` to the `sewing_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `sewing_runs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routing_step_id` to the `sewing_runs` table without a default value. This is not possible if the table is not empty.

*/
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sewing_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "routing_step_id" TEXT NOT NULL,
    "operation_name" TEXT NOT NULL,
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
INSERT INTO "new_sewing_runs" ("bundle_id", "created_at", "id", "started_at", "updated_at") SELECT "bundle_id", "created_at", "id", "started_at", "updated_at" FROM "sewing_runs";
DROP TABLE "sewing_runs";
ALTER TABLE "new_sewing_runs" RENAME TO "sewing_runs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

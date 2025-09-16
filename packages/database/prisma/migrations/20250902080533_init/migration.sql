/*
  Warnings:

  - You are about to drop the column `bundle_number` on the `bundles` table. All the data in the column will be lost.
  - You are about to drop the column `current_stage` on the `bundles` table. All the data in the column will be lost.
  - You are about to drop the column `garment_type` on the `bundles` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `bundles` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `bundles` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `bundles` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `bundles` table. All the data in the column will be lost.
  - You are about to drop the column `fabric_type` on the `cut_lays` table. All the data in the column will be lost.
  - You are about to drop the column `fabric_width` on the `cut_lays` table. All the data in the column will be lost.
  - You are about to drop the column `lay_number` on the `cut_lays` table. All the data in the column will be lost.
  - You are about to drop the column `layer_count` on the `cut_lays` table. All the data in the column will be lost.
  - You are about to drop the column `total_length` on the `cut_lays` table. All the data in the column will be lost.
  - You are about to drop the column `bundle_id` on the `cut_outputs` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `cut_outputs` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `cut_outputs` table. All the data in the column will be lost.
  - You are about to drop the column `pieces_cut` on the `cut_outputs` table. All the data in the column will be lost.
  - You are about to drop the column `wastage` on the `cut_outputs` table. All the data in the column will be lost.
  - Added the required column `qty` to the `bundles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size_code` to the `bundles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `cut_lays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gross_used` to the `cut_lays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lay_length_m` to the `cut_lays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plies` to the `cut_lays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uom` to the `cut_lays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `cut_outputs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size_code` to the `cut_outputs` table without a default value. This is not possible if the table is not empty.

*/
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bundles" (
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
INSERT INTO "new_bundles" ("created_at", "id", "order_id", "qr_code", "status", "updated_at", "workspace_id") SELECT "created_at", "id", "order_id", "qr_code", "status", "updated_at", "workspace_id" FROM "bundles";
DROP TABLE "bundles";
ALTER TABLE "new_bundles" RENAME TO "bundles";
CREATE UNIQUE INDEX "bundles_qr_code_key" ON "bundles"("qr_code");
CREATE TABLE "new_cut_lays" (
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
INSERT INTO "new_cut_lays" ("created_at", "id", "order_id", "updated_at", "workspace_id") SELECT "created_at", "id", "order_id", "updated_at", "workspace_id" FROM "cut_lays";
DROP TABLE "cut_lays";
ALTER TABLE "new_cut_lays" RENAME TO "cut_lays";
CREATE TABLE "new_cut_outputs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspace_id" TEXT NOT NULL,
    "cut_lay_id" TEXT NOT NULL,
    "size_code" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cut_outputs_cut_lay_id_fkey" FOREIGN KEY ("cut_lay_id") REFERENCES "cut_lays" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_cut_outputs" ("created_at", "cut_lay_id", "id", "workspace_id") SELECT "created_at", "cut_lay_id", "id", "workspace_id" FROM "cut_outputs";
DROP TABLE "cut_outputs";
ALTER TABLE "new_cut_outputs" RENAME TO "cut_outputs";
CREATE UNIQUE INDEX "cut_outputs_cut_lay_id_size_code_key" ON "cut_outputs"("cut_lay_id", "size_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "fabric_batches_workspace_id_lot_no_key" ON "fabric_batches"("workspace_id", "lot_no");

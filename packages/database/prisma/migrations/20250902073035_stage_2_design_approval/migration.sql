/*
  Warnings:

  - You are about to drop the column `approved_at` on the `design_assets` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `design_assets` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `design_assets` table. All the data in the column will be lost.
  - You are about to drop the column `file_size` on the `design_assets` table. All the data in the column will be lost.
  - You are about to drop the column `file_type` on the `design_assets` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `design_assets` table. All the data in the column will be lost.
  - You are about to drop the column `is_approved` on the `design_assets` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `design_assets` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail_url` on the `design_assets` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `design_assets` table. All the data in the column will be lost.
  - You are about to drop the column `changes` on the `design_versions` table. All the data in the column will be lost.
  - You are about to drop the column `design_asset_id` on the `design_versions` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `design_versions` table. All the data in the column will be lost.
  - You are about to drop the column `version_number` on the `design_versions` table. All the data in the column will be lost.
  - You are about to drop the column `workspace_id` on the `design_versions` table. All the data in the column will be lost.
  - Added the required column `brand_id` to the `design_assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `design_assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `design_assets` table without a default value. This is not possible if the table is not empty.
  - Made the column `order_id` on table `design_assets` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `asset_id` to the `design_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `files` to the `design_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placements` to the `design_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `design_versions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "design_approvals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "client_id" TEXT NOT NULL,
    "approver_name" TEXT,
    "approver_email" TEXT,
    "approver_signed_at" DATETIME,
    "comments" TEXT,
    "esign_envelope_id" TEXT,
    "portal_token" TEXT,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "design_approvals_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "design_assets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_approvals_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_design_assets" (
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
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "design_assets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_assets_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "design_assets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_design_assets" ("created_at", "id", "name", "order_id", "updated_at", "workspace_id") SELECT "created_at", "id", "name", "order_id", "updated_at", "workspace_id" FROM "design_assets";
DROP TABLE "design_assets";
ALTER TABLE "new_design_assets" RENAME TO "design_assets";
CREATE TABLE "new_design_versions" (
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
INSERT INTO "new_design_versions" ("created_at", "created_by", "id") SELECT "created_at", "created_by", "id" FROM "design_versions";
DROP TABLE "design_versions";
ALTER TABLE "new_design_versions" RENAME TO "design_versions";
CREATE UNIQUE INDEX "design_versions_asset_id_version_key" ON "design_versions"("asset_id", "version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

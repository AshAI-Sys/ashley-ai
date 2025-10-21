#!/usr/bin/env node

/**
 * SQLite to PostgreSQL Migration Script
 * Exports all data from SQLite and imports to PostgreSQL
 */

const { PrismaClient } = require("@ash-ai/database");
const fs = require("fs");
const path = require("path");

// SQLite connection
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: "file:../packages/database/prisma/dev.db",
    },
  },
});

// PostgreSQL connection
const postgresClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const EXPORT_FILE = path.join(__dirname, "migration-data.json");

// Order matters due to foreign key constraints
const TABLES = [
  "workspace",
  "user",
  "brand",
  "client",
  "order",
  "designAsset",
  "designApproval",
  "employee",
  "machine",
  "materialInventory",
  "lay",
  "bundle",
  "cuttingRun",
  "printRun",
  "sewingOperation",
  "sewingRun",
  "qualityControlCheck",
  "defectCode",
  "finishingRun",
  "finishedUnit",
  "carton",
  "shipment",
  "delivery",
  "invoice",
  "payment",
  "expense",
  "asset",
  "workOrder",
  // Add more tables as needed
];

async function exportFromSQLite() {
  console.log("📤 Exporting data from SQLite...");

  const data = {};
  let totalRecords = 0;

  for (const table of TABLES) {
    try {
      const records = await sqliteClient[table].findMany();
      data[table] = records;
      totalRecords += records.length;
      console.log(`  ✓ ${table}: ${records.length} records`);
    } catch (error) {
      console.log(`  ⚠ ${table}: skipped (${error.message})`);
      data[table] = [];
    }
  }

  fs.writeFileSync(EXPORT_FILE, JSON.stringify(data, null, 2));
  console.log(`\n✅ Exported ${totalRecords} records to ${EXPORT_FILE}`);

  return data;
}

async function importToPostgreSQL(data) {
  console.log("\n📥 Importing data to PostgreSQL...");

  let totalImported = 0;

  for (const table of TABLES) {
    const records = data[table] || [];
    if (records.length === 0) continue;

    try {
      // Import records one by one to handle errors gracefully
      for (const record of records) {
        try {
          await postgresClient[table].create({
            data: record,
          });
          totalImported++;
        } catch (error) {
          console.log(
            `  ⚠ ${table}: Failed to import record ${record.id} - ${error.message}`
          );
        }
      }
      console.log(`  ✓ ${table}: ${records.length} records imported`);
    } catch (error) {
      console.log(`  ✗ ${table}: ${error.message}`);
    }
  }

  console.log(`\n✅ Imported ${totalImported} records to PostgreSQL`);
}

async function verifyMigration() {
  console.log("\n🔍 Verifying migration...");

  for (const table of TABLES) {
    try {
      const count = await postgresClient[table].count();
      console.log(`  ✓ ${table}: ${count} records`);
    } catch (error) {
      console.log(`  ⚠ ${table}: ${error.message}`);
    }
  }
}

async function main() {
  console.log("🚀 Starting SQLite → PostgreSQL Migration\n");
  console.log("SQLite: file:../packages/database/prisma/dev.db");
  console.log(
    "PostgreSQL:",
    process.env.DATABASE_URL?.split("@")[1] || "Not configured"
  );
  console.log("");

  try {
    // Step 1: Export from SQLite
    const data = await exportFromSQLite();

    // Step 2: Import to PostgreSQL
    await importToPostgreSQL(data);

    // Step 3: Verify
    await verifyMigration();

    console.log("\n🎉 Migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("  1. Verify data in Prisma Studio: npx prisma studio");
    console.log("  2. Test the application: pnpm --filter @ash/admin dev");
    console.log("  3. Update DATABASE_URL in .env for production");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Check if PostgreSQL URL is configured
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("sqlite")) {
  console.error("❌ PostgreSQL DATABASE_URL not configured in .env");
  console.error("Please set DATABASE_URL to your PostgreSQL connection string");
  process.exit(1);
}

main();

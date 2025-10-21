// Check database schema for User table
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "packages", "database", "prisma", "dev.db");
console.log("Database path:", dbPath);

const db = new Database(dbPath, { readonly: true });

try {
  // Get schema for User table
  const result = db.prepare("PRAGMA table_info(User)").all();

  console.log("\n=== User Table Schema ===");
  console.log("Columns:");
  result.forEach(col => {
    console.log(
      `  - ${col.name} (${col.type})${col.notnull ? " NOT NULL" : ""}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ""}`
    );
  });

  // Check if email_verified exists
  const hasEmailVerified = result.find(col => col.name === "email_verified");
  console.log(
    "\n❓ Does email_verified column exist?",
    hasEmailVerified ? "✅ YES" : "❌ NO"
  );

  if (!hasEmailVerified) {
    console.log(
      "\n🔥 PROBLEM: email_verified column is missing from database!"
    );
    console.log("   This is why registration is failing.");
  }
} catch (error) {
  console.error("Error:", error.message);
} finally {
  db.close();
}

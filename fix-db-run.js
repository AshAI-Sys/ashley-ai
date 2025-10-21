// Script to add missing columns to the database
const { execSync } = require("child_process");
const path = require("path");

const dbPath = path.join(__dirname, "packages", "database", "prisma", "dev.db");
console.log("🔧 Fixing database schema...");
console.log("📍 Database:", dbPath);

// SQL commands to add missing columns
const sqlCommands = [
  "ALTER TABLE User ADD COLUMN email_verified INTEGER DEFAULT 0;",
  "ALTER TABLE User ADD COLUMN email_verification_token TEXT;",
  "ALTER TABLE User ADD COLUMN email_verification_expires INTEGER;",
  "ALTER TABLE User ADD COLUMN email_verification_sent_at INTEGER;",
];

sqlCommands.forEach((sql, index) => {
  try {
    console.log(`\n${index + 1}. Running: ${sql}`);
    execSync(`cd "packages/database" && npx prisma db execute --stdin`, {
      input: sql,
      stdio: "inherit",
    });
    console.log("   ✅ Success");
  } catch (error) {
    // Column might already exist, which is fine
    if (error.message.includes("duplicate column name")) {
      console.log("   ⚠️  Column already exists (OK)");
    } else {
      console.log("   ❌ Error:", error.message);
    }
  }
});

console.log("\n✅ Database schema fix completed!");
console.log("🔄 Now regenerating Prisma client...");

try {
  execSync("cd packages/database && npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma client regenerated!");
} catch (error) {
  console.error("❌ Failed to regenerate Prisma client:", error.message);
}

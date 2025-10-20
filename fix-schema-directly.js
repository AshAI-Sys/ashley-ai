/* eslint-disable no-console */
/**
 * Direct SQLite Database Fix
 * Adds the missing email_verified column using raw SQL
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'packages', 'database', 'prisma', 'dev.db');
console.log('\n🔧 Fixing database schema...');
console.log('Database path:', dbPath, '\n');

try {
  const db = new Database(dbPath);

  // Check if column already exists
  const tableInfo = db.pragma('table_info(users)');
  const hasEmailVerified = tableInfo.some(col => col.name === 'email_verified');

  if (hasEmailVerified) {
    console.log('✓ email_verified column already exists');

    // Just update existing records to be verified
    const result = db.prepare('UPDATE users SET email_verified = 1').run();
    console.log(`✓ Updated ${result.changes} user record(s)`);
  } else {
    console.log('⏳ Adding email_verified column...');

    // Add the missing columns
    db.exec(`
      ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT 1;
    `);

    db.exec(`
      ALTER TABLE users ADD COLUMN email_verification_token TEXT;
    `);

    db.exec(`
      ALTER TABLE users ADD COLUMN email_verification_expires DATETIME;
    `);

    db.exec(`
      ALTER TABLE users ADD COLUMN email_verification_sent_at DATETIME;
    `);

    console.log('✓ Added email verification columns');

    // Update existing users
    const result = db.prepare('UPDATE users SET email_verified = 1').run();
    console.log(`✓ Updated ${result.changes} user record(s)`);
  }

  db.close();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ DATABASE FIXED SUCCESSFULLY!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔄 Next step: Restart your dev server');
  console.log('   pnpm --filter @ash/admin dev\n');

} catch (error) {
  console.error('\n✖ ERROR:', error.message);

  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('\n📦 Installing better-sqlite3...');
    require('child_process').execSync('pnpm add better-sqlite3 -w', { stdio: 'inherit' });
    console.log('\n✓ Installed! Please run this script again.');
  } else {
    console.error(error);
  }
}

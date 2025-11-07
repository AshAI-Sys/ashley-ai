/**
 * Unlock Account Script
 *
 * Usage: node unlock-account.js <email>
 * Example: node unlock-account.js ashai.system@gmail.com
 */

const { createClient } = require('redis');

async function unlockAccount(email) {
  const normalizedEmail = email.toLowerCase();
  const attemptKey = `failed_login:${normalizedEmail}`;
  const lockKey = `locked:${normalizedEmail}`;

  console.log(`\n🔓 Unlocking account: ${email}`);
  console.log(`Redis Keys to clear:`);
  console.log(`  - ${attemptKey}`);
  console.log(`  - ${lockKey}`);

  // Connect to Redis
  const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redis.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
  });

  try {
    await redis.connect();
    console.log('✅ Connected to Redis\n');

    // Check current status
    const locked = await redis.get(lockKey);
    const attempts = await redis.get(attemptKey);

    console.log('📊 Current Status:');
    console.log(`  - Locked: ${locked ? 'YES' : 'NO'}`);
    console.log(`  - Failed Attempts: ${attempts || '0'}`);

    if (locked) {
      const ttl = await redis.ttl(lockKey);
      const minutesRemaining = Math.ceil(ttl / 60);
      console.log(`  - Lockout Expires In: ${minutesRemaining} minutes\n`);
    }

    // Delete lockout keys
    const deletedAttempts = await redis.del(attemptKey);
    const deletedLock = await redis.del(lockKey);

    console.log('\n🗑️  Clearing lockout keys...');
    console.log(`  - Deleted ${deletedAttempts} attempt key(s)`);
    console.log(`  - Deleted ${deletedLock} lock key(s)`);

    // Verify cleared
    const verifyLocked = await redis.get(lockKey);
    const verifyAttempts = await redis.get(attemptKey);

    console.log('\n✅ Verification:');
    console.log(`  - Locked: ${verifyLocked ? 'YES (FAILED)' : 'NO (SUCCESS)'}`);
    console.log(`  - Failed Attempts: ${verifyAttempts || '0'}`);

    if (!verifyLocked && !verifyAttempts) {
      console.log('\n🎉 SUCCESS! Account unlocked successfully!');
      console.log('You can now login with your credentials.');
    } else {
      console.log('\n⚠️  WARNING: Account may still be locked. Manual Redis cleanup may be needed.');
    }

  } catch (error) {
    console.error('\n❌ Error unlocking account:', error);
    throw error;
  } finally {
    await redis.disconnect();
    console.log('\n🔌 Disconnected from Redis\n');
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('\n❌ Error: Email address required');
  console.log('Usage: node unlock-account.js <email>');
  console.log('Example: node unlock-account.js ashai.system@gmail.com\n');
  process.exit(1);
}

// Run the unlock
unlockAccount(email)
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });

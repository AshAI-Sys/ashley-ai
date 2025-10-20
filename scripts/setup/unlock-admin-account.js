/* eslint-disable no-console */
/**
 * Unlock Admin Account
 * Clears Redis lockout for admin@ashleyai.com
 */

async function unlockAccount() {
  try {
    console.log('\n🔓 Unlocking admin account via API...\n');

    // Call the unlock API
    const response = await fetch('http://localhost:3001/api/admin/unlock-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ashleyai.com'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS:', data.message || 'Account unlocked');
    } else {
      console.log('❌ API Error:', data.error || 'Unknown error');
      console.log('\n⚠️  Trying manual Redis unlock...\n');

      // Manual unlock via direct script
      console.log('Run this command to manually unlock:');
      console.log('');
      console.log('pnpm --filter @ash/admin exec tsx -e "');
      console.log('  import { unlockAccount } from \'./src/lib/account-lockout\';');
      console.log('  unlockAccount(\'admin@ashleyai.com\').then(() => console.log(\'✅ Unlocked!\'))');
      console.log('"');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SIMPLE FIX: Just wait 30 minutes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('The account will automatically unlock after 30 minutes.');
    console.log('\nOR clear your browser cookies and try again in a few minutes.\n');
  }
}

unlockAccount();

/**
 * Clear Redis Lockout - Direct Script
 * Run this in the ash-admin directory
 */

import { unlockAccount } from './src/lib/account-lockout'

async function main() {
  console.log('\n🔓 Unlocking admin@ashleyai.com...\n')

  try {
    await unlockAccount('admin@ashleyai.com')
    console.log('✅ Account unlocked successfully!\n')
    console.log('📋 You can now login with:')
    console.log('   Email: admin@ashleyai.com')
    console.log('   Password: Admin123!\n')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  process.exit(0)
}

main()

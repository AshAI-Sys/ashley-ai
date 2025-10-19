/**
 * Clear Demo Data Script
 *
 * This script removes all demo/test accounts from the database
 * Run this ONCE to clean up before going to production
 *
 * Usage:
 *   npx tsx scripts/clear-demo-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function main() {
  try {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan')
    log('  ASHLEY AI - Clear Demo Data', 'bold')
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan')

    // Check for demo accounts
    const demoUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'admin@ashleyai.com' },
          { email: { contains: '@demo' } },
          { email: { contains: '@test' } },
        ]
      },
      include: {
        workspace: true
      }
    })

    const demoWorkspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { slug: 'demo-workspace' },
          { slug: { contains: 'demo' } },
          { slug: { contains: 'test' } },
          { id: 'demo-workspace-1' },
        ]
      }
    })

    if (demoUsers.length === 0 && demoWorkspaces.length === 0) {
      log('✅ No demo data found. Database is clean!', 'green')
      return
    }

    log('🔍 Found demo data:', 'yellow')
    log(`   - ${demoUsers.length} demo user(s)`, 'yellow')
    log(`   - ${demoWorkspaces.length} demo workspace(s)\n`, 'yellow')

    // List demo users
    if (demoUsers.length > 0) {
      log('Demo Users:', 'cyan')
      demoUsers.forEach(user => {
        log(`   - ${user.email} (${user.first_name} ${user.last_name}) - Workspace: ${user.workspace?.name || 'N/A'}`, 'cyan')
      })
      log('')
    }

    // List demo workspaces
    if (demoWorkspaces.length > 0) {
      log('Demo Workspaces:', 'cyan')
      demoWorkspaces.forEach(ws => {
        log(`   - ${ws.name} (${ws.slug})`, 'cyan')
      })
      log('')
    }

    log('⚠️  WARNING: This will DELETE all demo data!', 'red')
    log('   This action cannot be undone.\n', 'red')

    // Confirm deletion
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise<string>((resolve) => {
      rl.question('Type "DELETE" to confirm: ', (ans: string) => {
        rl.close()
        resolve(ans)
      })
    })

    if (answer !== 'DELETE') {
      log('\n❌ Cancelled. No data was deleted.', 'red')
      return
    }

    log('\n⏳ Deleting demo data...', 'yellow')

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      // Delete users first (due to foreign key constraints)
      const deletedUsers = await tx.user.deleteMany({
        where: {
          OR: [
            { email: 'admin@ashleyai.com' },
            { email: { contains: '@demo' } },
            { email: { contains: '@test' } },
          ]
        }
      })
      log(`   ✓ Deleted ${deletedUsers.count} demo user(s)`, 'green')

      // Delete demo workspaces
      const deletedWorkspaces = await tx.workspace.deleteMany({
        where: {
          OR: [
            { slug: 'demo-workspace' },
            { slug: { contains: 'demo' } },
            { slug: { contains: 'test' } },
            { id: 'demo-workspace-1' },
          ]
        }
      })
      log(`   ✓ Deleted ${deletedWorkspaces.count} demo workspace(s)`, 'green')
    })

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green')
    log('  ✅ DEMO DATA CLEARED SUCCESSFULLY!', 'bold')
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'green')

    log('📝 Next Steps:', 'cyan')
    log('   1. Go to http://localhost:3001/register', 'cyan')
    log('   2. Create your real admin account', 'cyan')
    log('   3. Start using Ashley AI with production data!\n', 'cyan')

  } catch (error) {
    log('\n❌ ERROR: Failed to clear demo data', 'red')
    if (error instanceof Error) {
      log(`   ${error.message}\n`, 'red')
    }
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

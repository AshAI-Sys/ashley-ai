import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./packages/database/prisma/dev.db'
    }
  }
})

async function checkDatabase() {
  try {
    console.log('🔍 Checking Database for Duplicates\n')
    console.log('='.repeat(60))

    // Check for workspace "reefer"
    console.log('\n1️⃣ Checking workspace "reefer"...')
    const workspace = await prisma.workspace.findUnique({
      where: { slug: 'reefer' }
    })

    if (workspace) {
      console.log('   ⚠️  FOUND - Workspace "reefer" EXISTS')
      console.log('   ID:', workspace.id)
      console.log('   Name:', workspace.name)
      console.log('   Slug:', workspace.slug)
    } else {
      console.log('   ✅ Workspace "reefer" is AVAILABLE')
    }

    // Check for email
    console.log('\n2️⃣ Checking email "kelvinmorfe17@gmail.com"...')
    const user = await prisma.user.findFirst({
      where: { email: 'kelvinmorfe17@gmail.com' }
    })

    if (user) {
      console.log('   ⚠️  FOUND - Email EXISTS')
      console.log('   ID:', user.id)
      console.log('   Name:', user.first_name, user.last_name)
      console.log('   Email:', user.email)
      console.log('   Role:', user.role)
      console.log('   Email Verified:', user.email_verified)
    } else {
      console.log('   ✅ Email "kelvinmorfe17@gmail.com" is AVAILABLE')
    }

    // List all workspaces
    console.log('\n3️⃣ All Workspaces:')
    const allWorkspaces = await prisma.workspace.findMany()

    if (allWorkspaces.length === 0) {
      console.log('   📭 No workspaces found')
    } else {
      console.log(`   Found ${allWorkspaces.length} workspace(s):`)
      allWorkspaces.forEach((ws, idx) => {
        console.log(`   ${idx + 1}. ${ws.name} (slug: ${ws.slug})`)
      })
    }

    // List all users
    console.log('\n4️⃣ All Users:')
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        email_verified: true
      }
    })

    if (allUsers.length === 0) {
      console.log('   📭 No users found')
    } else {
      console.log(`   Found ${allUsers.length} user(s):`)
      allUsers.forEach((u, idx) => {
        console.log(`   ${idx + 1}. ${u.email} (${u.first_name} ${u.last_name}) - ${u.role}`)
        console.log(`      Verified: ${u.email_verified}`)
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n📊 SUMMARY:')
    console.log(`   Workspaces: ${allWorkspaces.length}`)
    console.log(`   Users: ${allUsers.length}`)

    if (workspace || user) {
      console.log('\n⚠️  CONFLICT DETECTED!')
      console.log('\n💡 SOLUTIONS:')
      console.log('   Option 1: Use different workspace name/email')
      console.log('   Option 2: Delete conflicting records')
      console.log('   Option 3: Login with existing credentials')

      console.log('\n🗑️  To delete these records, I can create a cleanup script.')
    } else {
      console.log('\n✅ NO CONFLICTS - Registration should work!')
    }

    console.log('\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()

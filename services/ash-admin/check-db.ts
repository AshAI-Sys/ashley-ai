import { prisma } from './src/lib/db'

async function checkDatabase() {
  try {
    console.log('🔍 Checking Database for Duplicates\n')
    console.log('=' .repeat(60))

    // Check for workspace "reefer"
    console.log('\n1️⃣ Checking workspace "reefer"...')
    const workspace = await prisma.workspace.findUnique({
      where: { slug: 'reefer' },
      include: {
        users: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
            role: true
          }
        }
      }
    })

    if (workspace) {
      console.log('   ⚠️  FOUND - Workspace "reefer" EXISTS')
      console.log('   ID:', workspace.id)
      console.log('   Name:', workspace.name)
      console.log('   Slug:', workspace.slug)
      console.log('   Active:', workspace.is_active)
      console.log('   Users in this workspace:', workspace.users.length)
      if (workspace.users.length > 0) {
        workspace.users.forEach(u => {
          console.log(`      - ${u.email} (${u.first_name} ${u.last_name}) - ${u.role}`)
        })
      }
    } else {
      console.log('   ✅ Workspace "reefer" is AVAILABLE')
    }

    // Check for email
    console.log('\n2️⃣ Checking email "kelvinmorfe17@gmail.com"...')
    const user = await prisma.user.findFirst({
      where: { email: 'kelvinmorfe17@gmail.com' },
      include: {
        workspace: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    if (user) {
      console.log('   ⚠️  FOUND - Email "kelvinmorfe17@gmail.com" EXISTS')
      console.log('   ID:', user.id)
      console.log('   Name:', user.first_name, user.last_name)
      console.log('   Email:', user.email)
      console.log('   Role:', user.role)
      console.log('   Active:', user.is_active)
      console.log('   Email Verified:', user.email_verified)
      console.log('   Workspace:', user.workspace?.name, `(${user.workspace?.slug})`)
    } else {
      console.log('   ✅ Email "kelvinmorfe17@gmail.com" is AVAILABLE')
    }

    // List all workspaces
    console.log('\n3️⃣ All Workspaces in Database:')
    const allWorkspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (allWorkspaces.length === 0) {
      console.log('   📭 No workspaces found')
    } else {
      console.log(`   Found ${allWorkspaces.length} workspace(s):`)
      allWorkspaces.forEach((ws, idx) => {
        console.log(`   ${idx + 1}. ${ws.name} (slug: ${ws.slug})`)
        console.log(`      Active: ${ws.is_active} | Users: ${ws._count.users}`)
      })
    }

    // List all users
    console.log('\n4️⃣ All Users in Database:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        email_verified: true,
        workspace: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    if (allUsers.length === 0) {
      console.log('   📭 No users found')
    } else {
      console.log(`   Found ${allUsers.length} user(s):`)
      allUsers.forEach((u, idx) => {
        console.log(`   ${idx + 1}. ${u.email}`)
        console.log(`      Name: ${u.first_name} ${u.last_name}`)
        console.log(`      Role: ${u.role} | Active: ${u.is_active} | Verified: ${u.email_verified}`)
        console.log(`      Workspace: ${u.workspace?.name} (${u.workspace?.slug})`)
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log('\n📊 SUMMARY:')
    console.log(`   Workspaces: ${allWorkspaces.length}`)
    console.log(`   Users: ${allUsers.length}`)

    if (workspace || user) {
      console.log('\n⚠️  CONFLICT DETECTED!')
      console.log('\n💡 SOLUTIONS:')
      if (workspace && user) {
        console.log('   1. Delete both workspace and user (see delete script below)')
        console.log('   2. Use different workspace name AND email')
        console.log('   3. Login with existing credentials instead')
      } else if (workspace) {
        console.log('   1. Delete workspace "reefer" (see delete script below)')
        console.log('   2. Use different workspace name (e.g., "reefer-new", "reefer2")')
      } else if (user) {
        console.log('   1. Delete user with email (see delete script below)')
        console.log('   2. Use different email (e.g., "kelvinmorfe17+new@gmail.com")')
        console.log('   3. Login with existing credentials instead')
      }

      console.log('\n📝 DELETE SCRIPT:')
      console.log('   Run this command to delete and start fresh:')
      console.log('   cd "C:\\Users\\Khell\\Desktop\\Ashley AI\\services\\ash-admin"')
      console.log('   pnpm exec ts-node delete-duplicates.ts')
    } else {
      console.log('\n✅ NO CONFLICTS - Registration should work!')
      console.log('\n🤔 If registration still fails, check:')
      console.log('   1. Password meets requirements (8+ chars, uppercase, lowercase, number)')
      console.log('   2. Dev server is running without errors')
      console.log('   3. Browser console for API error details')
    }

    console.log('\n')

  } catch (error: any) {
    console.error('\n❌ Database Error:', error.message)
    console.error('\nFull error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()

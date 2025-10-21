import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteConflicts() {
  console.log('🗑️  Deleting Conflicting Data\n')
  console.log('Removing:')
  console.log('  - Workspace: "reefer"')
  console.log('  - Email: "kelvinmorfe17@gmail.com"')
  console.log('')

  try {
    // Delete user first (foreign key constraint)
    console.log('Step 1: Deleting user...')
    const deletedUser = await prisma.user.deleteMany({
      where: { email: 'kelvinmorfe17@gmail.com' }
    })

    if (deletedUser.count > 0) {
      console.log(`✅ Deleted ${deletedUser.count} user(s) with email "kelvinmorfe17@gmail.com"`)
    } else {
      console.log('ℹ️  No user found with email "kelvinmorfe17@gmail.com" (already clean)')
    }

    // Delete workspace
    console.log('\nStep 2: Deleting workspace...')
    const deletedWorkspace = await prisma.workspace.deleteMany({
      where: { slug: 'reefer' }
    })

    if (deletedWorkspace.count > 0) {
      console.log(`✅ Deleted ${deletedWorkspace.count} workspace(s) with slug "reefer"`)
    } else {
      console.log('ℹ️  No workspace found with slug "reefer" (already clean)')
    }

    console.log('\n✨ Cleanup Complete!')
    console.log('\n🎯 Next Steps:')
    console.log('   1. Go to http://localhost:3001/register')
    console.log('   2. Fill in your registration details:')
    console.log('      - Workspace Name: Reefer')
    console.log('      - Email: kelvinmorfe17@gmail.com')
    console.log('      - Password: (make sure it has 8+ chars, uppercase, lowercase, number)')
    console.log('   3. Click "Create Admin Account"')
    console.log('\n✅ Registration should now work!')

  } catch (error: any) {
    console.error('\n❌ Error during cleanup:', error.message)

    if (error.code === 'P2003') {
      console.error('\nℹ️  This is a foreign key constraint error.')
      console.error('   Some data depends on these records.')
      console.error('   Try opening Prisma Studio to manually delete:')
      console.error('   npx prisma studio')
    }
  } finally {
    await prisma.$disconnect()
  }
}

deleteConflicts()

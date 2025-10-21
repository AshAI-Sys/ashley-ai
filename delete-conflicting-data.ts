import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteConflicts() {
  console.log('🗑️  Deleting Conflicting Data\n')
  console.log('This will delete:')
  console.log('  - Workspace with slug "reefer"')
  console.log('  - User with email "kelvinmorfe17@gmail.com"')
  console.log('')

  try {
    // Delete user first (foreign key constraint)
    const deletedUser = await prisma.user.deleteMany({
      where: { email: 'kelvinmorfe17@gmail.com' }
    })
    console.log(`✅ Deleted ${deletedUser.count} user(s) with email "kelvinmorfe17@gmail.com"`)

    // Delete workspace
    const deletedWorkspace = await prisma.workspace.deleteMany({
      where: { slug: 'reefer' }
    })
    console.log(`✅ Deleted ${deletedWorkspace.count} workspace(s) with slug "reefer"`)

    console.log('\n✨ Cleanup complete! You can now register with these credentials.')

  } catch (error: any) {
    console.error('\n❌ Error during cleanup:', error.message)
    console.error('\nNote: This error might occur if the records don\'t exist (which is fine!)')
  } finally {
    await prisma.$disconnect()
  }
}

deleteConflicts()

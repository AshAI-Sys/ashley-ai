const { PrismaClient } = require('./packages/database/dist/index.js')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./packages/database/prisma/dev.db'
    }
  }
})

async function checkUser() {
  try {
    // Check for user with email containing 'kelvin'
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'kelvin'
        }
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        workspace_id: true
      }
    })

    console.log('Users with email containing "kelvin":')
    console.log(JSON.stringify(users, null, 2))

    // Check workspace with slug 'reefer'
    const workspace = await prisma.workspace.findUnique({
      where: {
        slug: 'reefer'
      }
    })

    console.log('\nWorkspace with slug "reefer":')
    console.log(JSON.stringify(workspace, null, 2))

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()

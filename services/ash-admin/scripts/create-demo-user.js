const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Creating demo user...')

  // Create workspace first
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo',
      settings: '{}',
    },
  })

  console.log('✓ Workspace created:', workspace.name)

  // Hash the password
  const passwordHash = await bcrypt.hash('admin123', 10)

  // Create demo user
  const user = await prisma.user.upsert({
    where: {
      workspace_id_email: {
        workspace_id: workspace.id,
        email: 'admin@ashleyai.com',
      },
    },
    update: {
      password_hash: passwordHash,
    },
    create: {
      email: 'admin@ashleyai.com',
      password_hash: passwordHash,
      first_name: 'Admin',
      last_name: 'User',
      role: 'ADMIN',
      is_active: true,
      workspace_id: workspace.id,
    },
  })

  console.log('✓ Demo user created:', user.email)
  console.log('')
  console.log('==========================================')
  console.log('  Login Credentials:')
  console.log('  Email: admin@ashleyai.com')
  console.log('  Password: admin123')
  console.log('==========================================')
  console.log('')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

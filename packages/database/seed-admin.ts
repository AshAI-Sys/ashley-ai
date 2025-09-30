import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding admin user...')

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'ashley-ai' },
    update: {},
    create: {
      name: 'Ashley AI',
      slug: 'ashley-ai'
    }
  })

  console.log('✅ Workspace created:', workspace.name)

  // Hash the password
  const hashedPassword = await bcrypt.hash('Admin@12345', 10)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ashleyai.com' },
    update: {
      password: hashedPassword
    },
    create: {
      email: 'admin@ashleyai.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      position: 'System Administrator',
      department: 'Administration',
      workspaceId: workspace.id
    }
  })

  console.log('✅ Admin user created')
  console.log('')
  console.log('==========================================')
  console.log('🔑 Login Credentials:')
  console.log('==========================================')
  console.log('Email:    admin@ashleyai.com')
  console.log('Password: Admin@12345')
  console.log('==========================================')
  console.log('')
  console.log('⚠️  IMPORTANT: Change this password after first login!')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
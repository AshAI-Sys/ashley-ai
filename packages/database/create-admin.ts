import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Creating admin user...')

  // Create default workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Workspace',
      slug: 'default',
    },
  })

  console.log('✅ Workspace created:', workspace.name)

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 12)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ashleyai.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@ashleyai.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      name: 'Admin User',
      role: 'admin',
      position: 'Administrator',
      department: 'Administration',
      workspaceId: workspace.id,
    },
  })

  console.log('✅ Admin user created!')
  console.log('📧 Email:', admin.email)
  console.log('🔑 Password: admin123')
  console.log('')
  console.log('🎉 Database initialized successfully!')
  console.log('🌐 You can now login at: http://localhost:3001/login')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

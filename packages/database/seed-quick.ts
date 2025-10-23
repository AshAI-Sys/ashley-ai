import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'ashley-ai' },
    update: {},
    create: {
      name: 'Ashley AI Manufacturing',
      slug: 'ashley-ai',
      is_active: true,
    },
  })

  console.log('✅ Workspace created:', workspace.name)

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 12)

  // Create admin user
  const user = await prisma.user.upsert({
    where: {
      workspace_id_email: {
        workspace_id: workspace.id,
        email: 'kelvinmorfe17@gmail.com'
      }
    },
    update: {},
    create: {
      workspace_id: workspace.id,
      email: 'kelvinmorfe17@gmail.com',
      first_name: 'Kelvin',
      last_name: 'Morfe',
      password_hash: passwordHash,
      role: 'SUPER_ADMIN',
      is_active: true,
    },
  })

  console.log('✅ Admin user created:', user.email)
  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📋 Login credentials:')
  console.log('   Email: kelvinmorfe17@gmail.com')
  console.log('   Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

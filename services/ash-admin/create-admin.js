const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Create workspace first
    const workspace = await prisma.workspace.upsert({
      where: { slug: 'ashley-ai' },
      update: {},
      create: {
        name: 'Ashley AI',
        slug: 'ashley-ai',
        settings: JSON.stringify({})
      }
    })

    console.log('✅ Workspace created:', workspace.name)

    // Hash password
    const passwordHash = await bcrypt.hash('admin123', 12)

    // Create admin user
    const admin = await prisma.user.upsert({
      where: {
        workspace_id_email: {
          workspace_id: workspace.id,
          email: 'admin@ashleyai.com'
        }
      },
      update: {
        password_hash: passwordHash
      },
      create: {
        workspace_id: workspace.id,
        email: 'admin@ashleyai.com',
        username: 'admin',
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        position: 'Administrator',
        department: 'Administration',
        is_active: true,
        email_verified: true,
        permissions: JSON.stringify([
          'users:read', 'users:write', 'users:delete',
          'orders:read', 'orders:write', 'orders:delete',
          'clients:read', 'clients:write', 'clients:delete',
          'finance:read', 'finance:write', 'hr:read', 'hr:write'
        ])
      }
    })

    console.log('✅ Admin user created!')
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  LOGIN CREDENTIALS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Email:    admin@ashleyai.com')
    console.log('Password: admin123')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

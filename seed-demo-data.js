/**
 * ASHLEY AI - DEMO DATA SEEDER
 * Creates demo admin user and sample data for testing
 */

const { PrismaClient } = require('./node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data...\n')

  // 1. Create/Update Workspace
  console.log('📦 Creating workspace...')
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Ashley AI Factory',
      slug: 'default',
      is_active: true,
      settings: JSON.stringify({
        timezone: 'Asia/Manila',
        currency: 'PHP',
        language: 'en'
      })
    }
  })
  console.log('✅ Workspace created:', workspace.name)

  // 2. Create Admin User
  console.log('\n👤 Creating admin user...')
  const passwordHash = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: {
      workspace_id_email: {
        workspace_id: workspace.id,
        email: 'admin@ashleyai.com'
      }
    },
    update: {
      password_hash: passwordHash,
      is_active: true
    },
    create: {
      workspace_id: workspace.id,
      email: 'admin@ashleyai.com',
      username: 'admin',
      password_hash: passwordHash,
      first_name: 'Admin',
      last_name: 'User',
      role: 'ADMIN',
      position: 'System Administrator',
      department: 'Administration',
      is_active: true,
      permissions: JSON.stringify({
        all: ['*'],
        finance: ['read', 'write', 'delete'],
        hr: ['read', 'write', 'delete'],
        production: ['read', 'write', 'delete']
      })
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // 3. Create Demo Clients
  console.log('\n🏢 Creating demo clients...')

  const client1 = await prisma.client.upsert({
    where: { email: 'john@abcmfg.com' },
    update: {},
    create: {
      workspace_id: workspace.id,
      name: 'ABC Manufacturing Inc.',
      contact_person: 'John Doe',
      email: 'john@abcmfg.com',
      phone: '09171234567',
      address: JSON.stringify({
        street: '123 Industrial Ave',
        city: 'Quezon City',
        state: 'Metro Manila',
        postal_code: '1100',
        country: 'Philippines'
      }),
      tax_id: '123-456-789',
      payment_terms: 30,
      credit_limit: 500000,
      is_active: true
    }
  })

  const client2 = await prisma.client.upsert({
    where: { email: 'maria@xyzltd.com' },
    update: {},
    create: {
      workspace_id: workspace.id,
      name: 'XYZ Apparel Ltd.',
      contact_person: 'Maria Santos',
      email: 'maria@xyzltd.com',
      phone: '09187654321',
      address: JSON.stringify({
        street: '456 Fashion Street',
        city: 'Makati City',
        state: 'Metro Manila',
        postal_code: '1200',
        country: 'Philippines'
      }),
      tax_id: '987-654-321',
      payment_terms: 60,
      credit_limit: 1000000,
      is_active: true
    }
  })

  console.log('✅ Created 2 demo clients')

  // 4. Create Demo Employees
  console.log('\n👥 Creating demo employees...')

  const employees = [
    {
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      email: 'juan.delacruz@ashley.com',
      password: 'employee123',
      position: 'Sewing Operator',
      department: 'Sewing',
      salary_type: 'PIECE',
      piece_rate: 8
    },
    {
      first_name: 'Maria',
      last_name: 'Santos',
      email: 'maria.santos@ashley.com',
      password: 'employee123',
      position: 'Cutting Operator',
      department: 'Cutting',
      salary_type: 'DAILY',
      base_salary: 550
    },
    {
      first_name: 'Pedro',
      last_name: 'Reyes',
      email: 'pedro.reyes@ashley.com',
      password: 'employee123',
      position: 'QC Inspector',
      department: 'Quality Control',
      salary_type: 'MONTHLY',
      base_salary: 18000
    }
  ]

  for (const emp of employees) {
    const empPasswordHash = await bcrypt.hash(emp.password, 10)

    await prisma.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        workspace_id: workspace.id,
        employee_number: `EMP${Date.now()}${Math.floor(Math.random() * 1000)}`,
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        password_hash: empPasswordHash,
        role: 'employee',
        position: emp.position,
        department: emp.department,
        salary_type: emp.salary_type,
        base_salary: emp.base_salary || null,
        piece_rate: emp.piece_rate || null,
        hire_date: new Date(),
        is_active: true,
        contact_info: JSON.stringify({
          phone: '0917XXXXXXX',
          address: 'Philippines'
        })
      }
    })
  }

  console.log('✅ Created 3 demo employees')

  // 5. Create Demo Orders
  console.log('\n📋 Creating demo orders...')

  const order1 = await prisma.order.create({
    data: {
      workspace_id: workspace.id,
      client_id: client1.id,
      order_number: 'ORD-2025-001',
      status: 'draft',
      total_amount: 250000,
      currency: 'PHP',
      delivery_date: new Date('2025-12-31'),
      notes: 'Sample order - 1000 pieces polo shirts'
    }
  })

  const order2 = await prisma.order.create({
    data: {
      workspace_id: workspace.id,
      client_id: client2.id,
      order_number: 'ORD-2025-002',
      status: 'confirmed',
      total_amount: 500000,
      currency: 'PHP',
      delivery_date: new Date('2025-11-30'),
      notes: 'Sample order - 2000 pieces t-shirts'
    }
  })

  console.log('✅ Created 2 demo orders')

  console.log('\n' + '='.repeat(60))
  console.log('✨ DEMO DATA SEEDING COMPLETE!\n')
  console.log('📊 Summary:')
  console.log('   - 1 Workspace (Ashley AI Factory)')
  console.log('   - 1 Admin User (admin@ashleyai.com / password123)')
  console.log('   - 2 Clients (ABC Manufacturing, XYZ Apparel)')
  console.log('   - 3 Employees (Juan, Maria, Pedro)')
  console.log('   - 2 Orders (ORD-2025-001, ORD-2025-002)')
  console.log('\n🔐 LOGIN CREDENTIALS:')
  console.log('   Admin: admin@ashleyai.com / password123')
  console.log('   Employee: juan.delacruz@ashley.com / employee123')
  console.log('   Employee: maria.santos@ashley.com / employee123')
  console.log('   Employee: pedro.reyes@ashley.com / employee123')
  console.log('='.repeat(60) + '\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

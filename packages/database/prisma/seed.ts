import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      id: 'demo-workspace-1',
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      is_active: true,
    },
  })
  console.log('✅ Workspace created:', workspace.slug)

  // Create demo user
  const user = await prisma.user.upsert({
    where: {
      workspace_id_email: {
        workspace_id: workspace.id,
        email: 'admin@ashleyai.com'
      }
    },
    update: {},
    create: {
      email: 'admin@ashleyai.com',
      password_hash: '$2a$10$demoHashForDevelopment', // Demo hash
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      workspace_id: workspace.id,
      position: 'System Administrator',
      department: 'IT',
      is_active: true,
    },
  })
  console.log('✅ User created:', user.email)

  // Create demo clients
  const client1 = await prisma.client.upsert({
    where: { id: 'client-1' },
    update: {},
    create: {
      id: 'client-1',
      workspace_id: workspace.id,
      name: 'Manila Shirts Co.',
      contact_person: 'Juan Dela Cruz',
      email: 'orders@manilashirts.com',
      phone: '+63 917 123 4567',
      address: JSON.stringify({
        street: '123 Quezon Avenue',
        city: 'Manila',
        state: 'Metro Manila',
        postal_code: '1100',
        country: 'Philippines'
      }),
      payment_terms: 30,
      credit_limit: 500000,
      is_active: true,
    },
  })

  const client2 = await prisma.client.upsert({
    where: { id: 'client-2' },
    update: {},
    create: {
      id: 'client-2',
      workspace_id: workspace.id,
      name: 'Cebu Sports Apparel',
      contact_person: 'Maria Santos',
      email: 'procurement@cebusports.ph',
      phone: '+63 932 987 6543',
      address: JSON.stringify({
        street: '456 Osmeña Boulevard',
        city: 'Cebu City',
        state: 'Cebu',
        postal_code: '6000',
        country: 'Philippines'
      }),
      payment_terms: 45,
      credit_limit: 750000,
      is_active: true,
    },
  })

  const client3 = await prisma.client.upsert({
    where: { id: 'client-3' },
    update: {},
    create: {
      id: 'client-3',
      workspace_id: workspace.id,
      name: 'Davao Uniform Solutions',
      contact_person: 'Pedro Ramos',
      email: 'info@davaouniform.com',
      phone: '+63 912 345 6789',
      address: JSON.stringify({
        street: '789 J.P. Laurel Avenue',
        city: 'Davao City',
        state: 'Davao del Sur',
        postal_code: '8000',
        country: 'Philippines'
      }),
      payment_terms: 60,
      credit_limit: 1000000,
      is_active: true,
    },
  })
  console.log('✅ Clients created: 3')

  // Create demo brands
  const brand1 = await prisma.brand.upsert({
    where: { id: 'brand-1' },
    update: {},
    create: {
      id: 'brand-1',
      workspace_id: workspace.id,
      client_id: client1.id,
      name: 'Manila Classic',
      code: 'MNLC',
      is_active: true,
    },
  })

  const brand2 = await prisma.brand.upsert({
    where: { id: 'brand-2' },
    update: {},
    create: {
      id: 'brand-2',
      workspace_id: workspace.id,
      client_id: client1.id,
      name: 'Manila Pro',
      code: 'MNLP',
      is_active: true,
    },
  })

  const brand3 = await prisma.brand.upsert({
    where: { id: 'brand-3' },
    update: {},
    create: {
      id: 'brand-3',
      workspace_id: workspace.id,
      client_id: client2.id,
      name: 'Cebu Athletes',
      code: 'CBAT',
      is_active: true,
    },
  })
  console.log('✅ Brands created: 3')

  // Create demo orders
  const order1 = await prisma.order.upsert({
    where: { id: 'order-1' },
    update: {},
    create: {
      id: 'order-1',
      workspace_id: workspace.id,
      order_number: 'ORD-2024-001',
      client_id: client1.id,
      brand_id: brand1.id,
      total_amount: 125000,
      currency: 'PHP',
      status: 'IN_PRODUCTION',
      delivery_date: new Date('2024-12-15'),
      notes: 'Cotton crew neck t-shirts with custom print - 500 units',
    },
  })

  const order2 = await prisma.order.upsert({
    where: { id: 'order-2' },
    update: {},
    create: {
      id: 'order-2',
      workspace_id: workspace.id,
      order_number: 'ORD-2024-002',
      client_id: client2.id,
      brand_id: brand3.id,
      total_amount: 89500,
      currency: 'PHP',
      status: 'PENDING_APPROVAL',
      delivery_date: new Date('2024-12-20'),
      notes: 'Polo shirts with embroidered logo - 300 units',
    },
  })

  const order3 = await prisma.order.upsert({
    where: { id: 'order-3' },
    update: {},
    create: {
      id: 'order-3',
      workspace_id: workspace.id,
      order_number: 'ORD-2024-003',
      client_id: client3.id,
      total_amount: 67500,
      currency: 'PHP',
      status: 'COMPLETED',
      delivery_date: new Date('2024-11-30'),
      notes: 'Custom printed hoodies - 200 units',
    },
  })
  console.log('✅ Orders created: 3')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
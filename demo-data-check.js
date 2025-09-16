const { PrismaClient } = require('@prisma/client')

async function showDemoData() {
  const prisma = new PrismaClient()
  
  try {
    console.log('\n🏢 DEMO WORKSPACES:')
    const workspaces = await prisma.workspace.findMany()
    workspaces.forEach(w => {
      console.log(`  • ${w.name} (${w.slug}) - ${w.is_active ? 'ACTIVE' : 'INACTIVE'}`)
    })

    console.log('\n👥 DEMO CLIENTS:')
    const clients = await prisma.client.findMany()
    clients.forEach(c => {
      console.log(`  • ${c.name} - Contact: ${c.contact_person} (${c.email})`)
    })

    console.log('\n📋 DEMO ORDERS:')
    const orders = await prisma.order.findMany({
      include: {
        client: { select: { name: true } },
        brand: { select: { name: true } }
      }
    })
    orders.forEach(o => {
      console.log(`  • ${o.order_number} - ${o.client.name} - ₱${o.total_amount.toLocaleString()} - Status: ${o.status}`)
    })

    console.log('\n👷 DEMO EMPLOYEES:')
    const employees = await prisma.employee.findMany()
    employees.forEach(e => {
      console.log(`  • ${e.first_name} ${e.last_name} - ${e.department} (${e.position})`)
    })

    console.log('\n🏭 DEMO ASSETS:')
    const assets = await prisma.asset.findMany()
    assets.forEach(a => {
      console.log(`  • ${a.name} - ${a.category} - Status: ${a.status}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showDemoData()
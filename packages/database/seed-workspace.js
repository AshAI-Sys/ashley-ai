const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Creating default workspace...')

  // Create default workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Default Workspace',
      slug: 'default',
      is_active: true
    }
  })

  console.log('Default workspace created:', workspace.id)

  // Create a test employee
  const employee = await prisma.employee.upsert({
    where: { employee_number: 'EMP001' },
    update: {},
    create: {
      workspace_id: 'default',
      employee_number: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      position: 'Test Employee',
      department: 'HR',
      hire_date: new Date('2023-01-01'),
      salary_type: 'DAILY',
      base_salary: 500.0,
      piece_rate: null,
      is_active: true,
      contact_info: JSON.stringify({
        phone: '+1-555-0123',
        email: 'john.doe@ashleyai.com'
      })
    }
  })

  console.log('Test employee created:', employee.id)
  console.log('Basic setup completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
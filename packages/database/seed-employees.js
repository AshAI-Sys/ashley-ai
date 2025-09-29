const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedEmployees() {
  console.log('🌱 Seeding employee accounts...')

  try {
    // Create a default workspace if it doesn't exist
    let workspace = await prisma.workspace.findFirst()
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'Ashley AI Manufacturing',
          settings: JSON.stringify({
            timezone: 'UTC',
            work_hours: { start: '08:00', end: '17:00' }
          })
        }
      })
    }

    const employees = [
      {
        employee_number: 'EMP-001',
        first_name: 'Maria',
        last_name: 'Santos',
        email: 'cutting@ashleyai.com',
        password: 'password',
        role: 'operator',
        position: 'Cutting Operator',
        department: 'Production',
        salary_type: 'HOURLY',
        base_salary: 15.00,
        piece_rate: null
      },
      {
        employee_number: 'EMP-002',
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        email: 'sewing@ashleyai.com',
        password: 'password',
        role: 'operator',
        position: 'Sewing Operator',
        department: 'Production',
        salary_type: 'PIECE',
        base_salary: null,
        piece_rate: 2.50
      },
      {
        employee_number: 'EMP-003',
        first_name: 'Ana',
        last_name: 'Reyes',
        email: 'qc@ashleyai.com',
        password: 'password',
        role: 'operator',
        position: 'QC Inspector',
        department: 'Quality Control',
        salary_type: 'DAILY',
        base_salary: 120.00,
        piece_rate: null
      },
      {
        employee_number: 'EMP-004',
        first_name: 'Carlos',
        last_name: 'Garcia',
        email: 'printing@ashleyai.com',
        password: 'password',
        role: 'operator',
        position: 'Printing Operator',
        department: 'Production',
        salary_type: 'HOURLY',
        base_salary: 16.00,
        piece_rate: null
      },
      {
        employee_number: 'EMP-005',
        first_name: 'Linda',
        last_name: 'Torres',
        email: 'packing@ashleyai.com',
        password: 'password',
        role: 'operator',
        position: 'Packing Operator',
        department: 'Finishing',
        salary_type: 'HOURLY',
        base_salary: 14.00,
        piece_rate: null
      },
      {
        employee_number: 'SUP-001',
        first_name: 'Roberto',
        last_name: 'Martinez',
        email: 'supervisor@ashleyai.com',
        password: 'password',
        role: 'supervisor',
        position: 'Production Supervisor',
        department: 'Production',
        salary_type: 'MONTHLY',
        base_salary: 3500.00,
        piece_rate: null
      },
      {
        employee_number: 'MGR-001',
        first_name: 'Patricia',
        last_name: 'Cruz',
        email: 'manager@ashleyai.com',
        password: 'password',
        role: 'manager',
        position: 'Production Manager',
        department: 'Production',
        salary_type: 'MONTHLY',
        base_salary: 5500.00,
        piece_rate: null
      },
      {
        employee_number: 'WHR-001',
        first_name: 'Miguel',
        last_name: 'Fernandez',
        email: 'warehouse@ashleyai.com',
        password: 'password',
        role: 'operator',
        position: 'Warehouse Staff',
        department: 'Logistics',
        salary_type: 'DAILY',
        base_salary: 100.00,
        piece_rate: null
      }
    ]

    for (const emp of employees) {
      // Check if employee already exists
      const existingEmployee = await prisma.employee.findUnique({
        where: { email: emp.email }
      })

      if (existingEmployee) {
        console.log(`✅ Employee ${emp.email} already exists`)
        continue
      }

      // Hash password
      const password_hash = await bcrypt.hash(emp.password, 10)

      // Create employee
      const employee = await prisma.employee.create({
        data: {
          ...emp,
          password_hash,
          workspace_id: workspace.id,
          hire_date: new Date(),
          contact_info: JSON.stringify({
            phone: '+63 9XX XXX XXXX',
            emergency_contact: {
              name: 'Emergency Contact',
              phone: '+63 9XX XXX XXXX',
              relationship: 'Family'
            }
          }),
          permissions: JSON.stringify({
            dashboard: ['view'],
            profile: ['view', 'edit_own'],
            attendance: ['view_own', 'checkin', 'checkout']
          })
        }
      })

      console.log(`✅ Created employee: ${employee.first_name} ${employee.last_name} (${employee.email})`)
    }

    console.log('\n🎉 Employee seeding completed!')
    console.log('\n📋 Available Employee Accounts:')
    console.log('Email: cutting@ashleyai.com | Password: password | Role: Cutting Operator')
    console.log('Email: sewing@ashleyai.com | Password: password | Role: Sewing Operator')
    console.log('Email: qc@ashleyai.com | Password: password | Role: QC Inspector')
    console.log('Email: printing@ashleyai.com | Password: password | Role: Printing Operator')
    console.log('Email: packing@ashleyai.com | Password: password | Role: Packing Operator')
    console.log('Email: supervisor@ashleyai.com | Password: password | Role: Production Supervisor')
    console.log('Email: manager@ashleyai.com | Password: password | Role: Production Manager')
    console.log('Email: warehouse@ashleyai.com | Password: password | Role: Warehouse Staff')

  } catch (error) {
    console.error('❌ Error seeding employees:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedEmployees()
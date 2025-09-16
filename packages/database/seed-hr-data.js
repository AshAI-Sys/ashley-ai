const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding HR data...')

  // Create sample employees
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { employee_number: 'EMP001' },
      update: {},
      create: {
        workspace_id: 'default',
        employee_number: 'EMP001',
        first_name: 'Maria',
        last_name: 'Santos',
        position: 'Sewing Operator',
        department: 'Production',
        hire_date: new Date('2023-03-15'),
        salary_type: 'PIECE',
        base_salary: null,
        piece_rate: 8.50,
        is_active: true,
        contact_info: JSON.stringify({
          phone: '+63-912-345-6789',
          email: 'maria.santos@ashleyai.com'
        })
      }
    }),
    prisma.employee.upsert({
      where: { employee_number: 'EMP002' },
      update: {},
      create: {
        workspace_id: 'default',
        employee_number: 'EMP002',
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        position: 'Quality Inspector',
        department: 'Quality Control',
        hire_date: new Date('2022-11-20'),
        salary_type: 'DAILY',
        base_salary: 650.00,
        piece_rate: null,
        is_active: true,
        contact_info: JSON.stringify({
          phone: '+63-912-345-6790',
          email: 'juan.delacruz@ashleyai.com'
        })
      }
    }),
    prisma.employee.upsert({
      where: { employee_number: 'EMP003' },
      update: {},
      create: {
        workspace_id: 'default',
        employee_number: 'EMP003',
        first_name: 'Ana',
        last_name: 'Rodriguez',
        position: 'Print Operator',
        department: 'Printing',
        hire_date: new Date('2024-01-10'),
        salary_type: 'HOURLY',
        base_salary: 85.00,
        piece_rate: null,
        is_active: true,
        contact_info: JSON.stringify({
          phone: '+63-912-345-6791',
          email: 'ana.rodriguez@ashleyai.com'
        })
      }
    }),
    prisma.employee.upsert({
      where: { employee_number: 'EMP004' },
      update: {},
      create: {
        workspace_id: 'default',
        employee_number: 'EMP004',
        first_name: 'Pedro',
        last_name: 'Garcia',
        position: 'Cutting Operator',
        department: 'Cutting',
        hire_date: new Date('2023-08-01'),
        salary_type: 'DAILY',
        base_salary: 700.00,
        piece_rate: null,
        is_active: true,
        contact_info: JSON.stringify({
          phone: '+63-912-345-6792',
          email: 'pedro.garcia@ashleyai.com'
        })
      }
    }),
    prisma.employee.upsert({
      where: { employee_number: 'EMP005' },
      update: {},
      create: {
        workspace_id: 'default',
        employee_number: 'EMP005',
        first_name: 'Lisa',
        last_name: 'Wong',
        position: 'Supervisor',
        department: 'Production',
        hire_date: new Date('2021-05-10'),
        salary_type: 'MONTHLY',
        base_salary: 28000.00,
        piece_rate: null,
        is_active: true,
        contact_info: JSON.stringify({
          phone: '+63-912-345-6793',
          email: 'lisa.wong@ashleyai.com'
        })
      }
    })
  ])

  console.log(`Created ${employees.length} employees`)

  // Create attendance records for today
  const today = new Date()
  const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const attendanceRecords = await Promise.all([
    // Maria - Present
    prisma.attendanceLog.upsert({
      where: {
        employee_id_date: {
          employee_id: employees[0].id,
          date: dateOnly
        }
      },
      update: {},
      create: {
        workspace_id: 'default',
        employee_id: employees[0].id,
        date: dateOnly,
        time_in: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15),
        time_out: null,
        break_minutes: 0,
        overtime_minutes: 0,
        status: 'APPROVED',
        notes: 'Regular check-in'
      }
    }),
    // Juan - Present
    prisma.attendanceLog.upsert({
      where: {
        employee_id_date: {
          employee_id: employees[1].id,
          date: dateOnly
        }
      },
      update: {},
      create: {
        workspace_id: 'default',
        employee_id: employees[1].id,
        date: dateOnly,
        time_in: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 45),
        time_out: null,
        break_minutes: 0,
        overtime_minutes: 0,
        status: 'APPROVED',
        notes: 'Early check-in'
      }
    }),
    // Pedro - Completed day
    prisma.attendanceLog.upsert({
      where: {
        employee_id_date: {
          employee_id: employees[3].id,
          date: dateOnly
        }
      },
      update: {},
      create: {
        workspace_id: 'default',
        employee_id: employees[3].id,
        date: dateOnly,
        time_in: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0),
        time_out: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30),
        break_minutes: 60,
        overtime_minutes: 30,
        status: 'PENDING',
        notes: 'Overtime for rush order'
      }
    }),
    // Lisa - Supervisor present
    prisma.attendanceLog.upsert({
      where: {
        employee_id_date: {
          employee_id: employees[4].id,
          date: dateOnly
        }
      },
      update: {},
      create: {
        workspace_id: 'default',
        employee_id: employees[4].id,
        date: dateOnly,
        time_in: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 30),
        time_out: null,
        break_minutes: 0,
        overtime_minutes: 0,
        status: 'APPROVED',
        notes: 'Management check-in'
      }
    })
  ])

  console.log(`Created ${attendanceRecords.length} attendance records`)

  // Create a sample payroll period
  const payrollPeriod = await prisma.payrollPeriod.upsert({
    where: { id: 'sample-payroll-period' },
    update: {},
    create: {
      id: 'sample-payroll-period',
      workspace_id: 'default',
      period_start: new Date('2025-01-01'),
      period_end: new Date('2025-01-15'),
      status: 'completed',
      total_amount: 185000,
      processed_at: new Date('2025-01-16')
    }
  })

  // Create sample payroll earnings
  const payrollEarnings = await Promise.all([
    prisma.payrollEarning.upsert({
      where: {
        payroll_period_id_employee_id: {
          payroll_period_id: payrollPeriod.id,
          employee_id: employees[0].id
        }
      },
      update: {},
      create: {
        workspace_id: 'default',
        payroll_period_id: payrollPeriod.id,
        employee_id: employees[0].id,
        regular_hours: 120,
        overtime_hours: 8,
        piece_count: 1200,
        piece_rate: 8.50,
        gross_pay: 10200,
        deductions: 1020,
        net_pay: 9180
      }
    }),
    prisma.payrollEarning.upsert({
      where: {
        payroll_period_id_employee_id: {
          payroll_period_id: payrollPeriod.id,
          employee_id: employees[1].id
        }
      },
      update: {},
      create: {
        workspace_id: 'default',
        payroll_period_id: payrollPeriod.id,
        employee_id: employees[1].id,
        regular_hours: 120,
        overtime_hours: 0,
        piece_count: 0,
        piece_rate: null,
        gross_pay: 9750, // 15 days * 650
        deductions: 975,
        net_pay: 8775
      }
    })
  ])

  console.log(`Created ${payrollEarnings.length} payroll earnings records`)
  console.log('HR data seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
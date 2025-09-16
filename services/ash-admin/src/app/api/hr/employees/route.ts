import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const position = searchParams.get('position')
    const department = searchParams.get('department')
    const search = searchParams.get('search')

    const where: any = { workspace_id: 'default' }
    if (status && status !== 'all') {
      if (status === 'ACTIVE') where.is_active = true
      if (status === 'INACTIVE') where.is_active = false
    }
    if (position && position !== 'all') where.position = position
    if (department && department !== 'all') where.department = department

    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { employee_number: { contains: search, mode: 'insensitive' } }
      ]
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        attendance: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          },
          orderBy: { created_at: 'desc' },
          take: 1
        },
        _count: {
          select: {
            sewing_runs: true,
            qc_inspections: true
          }
        }
      },
      orderBy: [{ first_name: 'asc' }, { last_name: 'asc' }]
    })

    // Process attendance status for today
    const processedEmployees = employees.map(employee => {
      const todayAttendance = employee.attendance[0]
      let attendanceStatus = 'ABSENT'
      let lastCheckin = null

      if (todayAttendance) {
        lastCheckin = todayAttendance.time_in
        // If there's time_in but no time_out, employee is present
        if (todayAttendance.time_in && !todayAttendance.time_out) {
          attendanceStatus = 'PRESENT'
        } else if (todayAttendance.time_out) {
          attendanceStatus = 'ABSENT' // Clocked out
        }
      }

      return {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        employee_number: employee.employee_number,
        position: employee.position,
        department: employee.department,
        hire_date: employee.hire_date.toISOString(),
        salary_type: employee.salary_type,
        base_salary: employee.base_salary,
        piece_rate: employee.piece_rate,
        status: employee.is_active ? 'ACTIVE' : 'INACTIVE',
        attendance_status: attendanceStatus,
        last_checkin: lastCheckin?.toISOString() || null,
        total_productions: (employee._count.sewing_runs || 0),
        qc_inspections_count: employee._count.qc_inspections || 0,
        contact_info: employee.contact_info ? JSON.parse(employee.contact_info) : null
      }
    })

    return NextResponse.json({
      success: true,
      data: processedEmployees
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      first_name,
      last_name,
      employee_number,
      position,
      department,
      hire_date,
      salary_type,
      base_salary,
      piece_rate,
      contact_info = {}
    } = data

    // Ensure default workspace exists
    await prisma.workspace.upsert({
      where: { slug: 'default' },
      update: {},
      create: {
        id: 'default',
        name: 'Default Workspace',
        slug: 'default',
        is_active: true
      }
    })

    const employee = await prisma.employee.create({
      data: {
        workspace_id: 'default',
        employee_number: employee_number || `EMP${Date.now()}`,
        first_name,
        last_name,
        position,
        department,
        hire_date: hire_date ? new Date(hire_date) : new Date(),
        salary_type: salary_type || 'DAILY',
        base_salary: base_salary || null,
        piece_rate: piece_rate || null,
        is_active: true,
        contact_info: JSON.stringify(contact_info)
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        employee_number: employee.employee_number,
        position: employee.position,
        department: employee.department,
        hire_date: employee.hire_date.toISOString(),
        salary_type: employee.salary_type,
        base_salary: employee.base_salary,
        piece_rate: employee.piece_rate,
        status: employee.is_active ? 'ACTIVE' : 'INACTIVE',
        contact_info: employee.contact_info ? JSON.parse(employee.contact_info) : null
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    // Handle date conversion
    if (updateData.hire_date) {
      updateData.hire_date = new Date(updateData.hire_date)
    }
    if (updateData.separation_date) {
      updateData.separation_date = new Date(updateData.separation_date)
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        brands: { select: { name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      data: employee
    })

  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}
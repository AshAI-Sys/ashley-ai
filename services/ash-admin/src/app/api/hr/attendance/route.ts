import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employee_id = searchParams.get('employee_id')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    if (employee_id) where.employee_id = employee_id
    if (status && status !== 'all') where.approved = status === 'approved'
    if (type && type !== 'all') where.type = type

    // Date filtering
    if (date_from || date_to) {
      where.ts = {}
      if (date_from) where.ts.gte = new Date(date_from)
      if (date_to) where.ts.lte = new Date(date_to)
    } else {
      // Default to today if no date range specified
      const today = new Date()
      where.ts = {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999))
      }
    }

    const attendanceLogs = await prisma.attendanceLog.findMany({
      where,
      include: {
        employee: {
          select: {
            name: true,
            role: true,
            department: true
          }
        }
      },
      orderBy: { ts: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: attendanceLogs
    })
  } catch (error) {
    console.error('Error fetching attendance logs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      employee_id,
      type, // IN/OUT/BREAK_START/BREAK_END
      source = 'MANUAL', // KIOSK/MOBILE/SUPERVISOR/WEBHOOK/MANUAL
      geo,
      selfie_url,
      device_id,
      timestamp
    } = data

    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employee_id },
      select: { id: true, name: true, status: true }
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    if (employee.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Employee is not active' },
        { status: 400 }
      )
    }

    const attendanceLog = await prisma.attendanceLog.create({
      data: {
        employee_id,
        ts: timestamp ? new Date(timestamp) : new Date(),
        type,
        source,
        geo: geo || {},
        selfie_url,
        device_id,
        approved: source === 'MANUAL' ? false : true // Manual entries need approval
      },
      include: {
        employee: {
          select: {
            name: true,
            role: true,
            department: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: attendanceLog
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating attendance log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create attendance log' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, approved, approver_notes } = data

    const attendanceLog = await prisma.attendanceLog.update({
      where: { id },
      data: {
        approved,
        meta: approver_notes ? { approver_notes } : undefined
      },
      include: {
        employee: {
          select: {
            name: true,
            role: true,
            department: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: attendanceLog
    })

  } catch (error) {
    console.error('Error updating attendance log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update attendance log' },
      { status: 500 }
    )
  }
}
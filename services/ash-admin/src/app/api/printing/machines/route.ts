import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workcenter = searchParams.get('workcenter')
    const activeOnly = searchParams.get('active_only') === 'true'

    // Build where clause
    const where: any = {}
    if (workcenter) where.workcenter = workcenter
    if (activeOnly) where.is_active = true

    const machines = await prisma.machine.findMany({
      where,
      orderBy: [
        { workcenter: 'asc' },
        { name: 'asc' }
      ],
      include: {
        print_runs: {
          where: {
            status: { in: ['IN_PROGRESS', 'PAUSED'] }
          },
          include: {
            order: {
              select: {
                order_number: true,
                brand: {
                  select: {
                    name: true,
                    code: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Transform data for frontend
    const transformedMachines = await Promise.all(machines.map(async (machine) => {
      const spec = machine.spec ? JSON.parse(machine.spec) : {}
      const currentRun = machine.print_runs[0] || null
      
      return {
        id: machine.id,
        name: machine.name,
        workcenter: machine.workcenter,
        is_active: machine.is_active,
        specifications: spec,
        status: currentRun ? 'BUSY' : machine.is_active ? 'AVAILABLE' : 'OFFLINE',
        current_run: currentRun ? {
          id: currentRun.id,
          method: currentRun.method,
          status: currentRun.status,
          order: currentRun.order
        } : null,
        utilization: await calculateMachineUtilization(machine.id),
        maintenance_due: await checkMaintenanceDue(machine.id),
        created_at: machine.created_at,
        updated_at: machine.updated_at
      }
    }))

    return NextResponse.json({
      success: true,
      data: transformedMachines
    })

  } catch (error) {
    console.error('Machines API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch machines' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      workcenter,
      specifications = {},
      is_active = true
    } = body

    // Validate required fields
    if (!name || !workcenter) {
      return NextResponse.json(
        { success: false, error: 'Machine name and workcenter are required' },
        { status: 400 }
      )
    }

    // Validate workcenter
    const validWorkcenters = ['PRINTING', 'HEAT_PRESS', 'EMB', 'DRYER']
    if (!validWorkcenters.includes(workcenter)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workcenter' },
        { status: 400 }
      )
    }

    // Create machine
    const machine = await prisma.machine.create({
      data: {
        workspace_id: 'default', // Should come from session
        name,
        workcenter,
        spec: JSON.stringify(specifications),
        is_active
      }
    })

    return NextResponse.json({
      success: true,
      data: machine
    })

  } catch (error) {
    console.error('Create machine error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create machine' },
      { status: 500 }
    )
  }
}

async function calculateMachineUtilization(machineId: string): Promise<number> {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get total runs today
    const totalRuns = await prisma.printRun.count({
      where: {
        machine_id: machineId,
        created_at: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Get completed runs today
    const completedRuns = await prisma.printRun.count({
      where: {
        machine_id: machineId,
        status: 'DONE',
        ended_at: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Calculate utilization as percentage
    return totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0
  } catch (error) {
    console.error('Error calculating machine utilization:', error)
    return 0
  }
}

async function checkMaintenanceDue(machineId: string): Promise<boolean> {
  try {
    // Check if there are any pending maintenance work orders
    const pendingMaintenance = await prisma.workOrder.findFirst({
      where: {
        asset: {
          // Assuming machines are linked to assets
          // This would need to be implemented based on your asset management
        },
        status: { in: ['open', 'scheduled'] },
        type: { in: ['preventive_maintenance', 'repair'] }
      }
    })

    return !!pendingMaintenance
  } catch (error) {
    console.error('Error checking maintenance due:', error)
    return false
  }
}
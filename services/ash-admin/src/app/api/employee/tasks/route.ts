import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  createSuccessResponse,
  withErrorHandling,
} from '../../../../lib/error-handling'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const department = searchParams.get('department')
  const position = searchParams.get('position')

  if (!department) {
    return NextResponse.json(
      { success: false, error: 'Department is required' },
      { status: 400 }
    )
  }

  let tasks: any[] = []

  // Get department-specific tasks
  switch (department) {
    case 'Cutting':
      // Get pending cutting runs
      const cuttingRuns = await prisma.cuttingRun.findMany({
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        },
        include: {
          lay: {
            include: {
              order: {
                select: {
                  order_number: true,
                  client: {
                    select: { name: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 20
      })

      tasks = cuttingRuns.map(run => ({
        id: run.id,
        type: 'CUTTING',
        title: `Cutting Run - ${run.lay.order.client.name}`,
        description: `Cut ${run.total_bundles || 0} bundles for Order ${run.lay.order.order_number}`,
        status: run.status,
        priority: run.total_bundles && run.total_bundles > 50 ? 'HIGH' : 'MEDIUM',
        due_date: null,
        created_at: run.created_at.toISOString()
      }))
      break

    case 'Printing':
      // Get pending print runs
      const printRuns = await prisma.printRun.findMany({
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 20
      })

      tasks = printRuns.map(run => ({
        id: run.id,
        type: 'PRINTING',
        title: `${run.print_method} - ${run.order.client.name}`,
        description: `Print ${run.quantity} units for Order ${run.order.order_number}`,
        status: run.status,
        priority: run.quantity && run.quantity > 100 ? 'HIGH' : 'MEDIUM',
        due_date: null,
        created_at: run.created_at.toISOString()
      }))
      break

    case 'Sewing':
      // Get pending sewing runs
      const sewingRuns = await prisma.sewingRun.findMany({
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 20
      })

      tasks = sewingRuns.map(run => ({
        id: run.id,
        type: 'SEWING',
        title: `Sewing - ${run.order.client.name}`,
        description: `Sew ${run.pieces_to_complete} pieces for Order ${run.order.order_number}`,
        status: run.status,
        priority: run.pieces_to_complete && run.pieces_to_complete > 200 ? 'HIGH' : 'MEDIUM',
        due_date: null,
        created_at: run.created_at.toISOString()
      }))
      break

    case 'Quality Control':
      // Get pending QC checks
      const qcChecks = await prisma.qualityControlCheck.findMany({
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 20
      })

      tasks = qcChecks.map(check => ({
        id: check.id,
        type: 'QC',
        title: `QC Inspection - ${check.order.client.name}`,
        description: `Inspect ${check.lot_size} units for Order ${check.order.order_number}`,
        status: check.status,
        priority: check.result === 'FAIL' ? 'HIGH' : 'MEDIUM',
        due_date: null,
        created_at: check.created_at.toISOString()
      }))
      break

    case 'Finishing':
      // Get pending finishing runs
      const finishingRuns = await prisma.finishingRun.findMany({
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 20
      })

      tasks = finishingRuns.map(run => ({
        id: run.id,
        type: 'FINISHING',
        title: `Finishing - ${run.order.client.name}`,
        description: `Finish ${run.quantity} units for Order ${run.order.order_number}`,
        status: run.status,
        priority: run.quantity && run.quantity > 100 ? 'HIGH' : 'MEDIUM',
        due_date: null,
        created_at: run.created_at.toISOString()
      }))
      break

    case 'Warehouse':
      // Get pending shipments
      const shipments = await prisma.shipment.findMany({
        where: {
          status: {
            in: ['PENDING', 'PREPARING']
          }
        },
        include: {
          order: {
            select: {
              order_number: true,
              client: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 20
      })

      tasks = shipments.map(shipment => ({
        id: shipment.id,
        type: 'WAREHOUSE',
        title: `Shipment - ${shipment.order.client.name}`,
        description: `Prepare shipment for Order ${shipment.order.order_number}`,
        status: shipment.status === 'PENDING' ? 'PENDING' : 'IN_PROGRESS',
        priority: shipment.status === 'URGENT' ? 'HIGH' : 'MEDIUM',
        due_date: null,
        created_at: shipment.created_at.toISOString()
      }))
      break

    default:
      // For other departments, return empty array or generic tasks
      tasks = []
  }

  return createSuccessResponse(tasks)
})

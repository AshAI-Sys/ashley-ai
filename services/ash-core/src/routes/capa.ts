import { Router } from 'express'
import { db } from '@ash-ai/database'
import { logger } from '@ash/shared'
import { z } from 'zod'
import { Request, Response } from 'express'

const router = Router()
const prisma = db

// ================================
// VALIDATION SCHEMAS
// ================================

const CreateCAPASchema = z.object({
  title: z.string().min(1),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  source_type: z.enum(['QC_INSPECTION', 'CUSTOMER_COMPLAINT', 'INTERNAL_AUDIT', 'OTHER']),
  source_id: z.string().optional(),
  inspection_id: z.string().optional(),
  defect_id: z.string().optional(),
  root_cause: z.string().optional(),
  corrective_action: z.string().optional(),
  preventive_action: z.string().optional(),
  assigned_to: z.string().optional(),
  due_date: z.string().datetime().optional(),
  created_by: z.string()
})

const UpdateCAPASchema = z.object({
  title: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'CLOSED']).optional(),
  root_cause: z.string().optional(),
  corrective_action: z.string().optional(),
  preventive_action: z.string().optional(),
  assigned_to: z.string().optional(),
  due_date: z.string().datetime().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional()
})

const CloseCAPASchema = z.object({
  effectiveness: z.enum(['EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'INEFFECTIVE']),
  verified_by: z.string(),
  notes: z.string().optional()
})

// ================================
// CAPA TASK MANAGEMENT
// ================================

// Get all CAPA tasks with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] as string
    const {
      status,
      priority,
      type,
      source_type,
      assigned_to,
      created_by,
      due_from,
      due_to,
      page = '1',
      limit = '50',
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where = {
      workspace_id: workspaceId,
      ...(status && { status: status as string }),
      ...(priority && { priority: priority as string }),
      ...(type && { type: type as string }),
      ...(source_type && { source_type: source_type as string }),
      ...(assigned_to && { assigned_to: assigned_to as string }),
      ...(created_by && { created_by: created_by as string }),
      ...(due_from && due_to && {
        due_date: {
          gte: new Date(due_from as string),
          lte: new Date(due_to as string)
        }
      })
    }

    const orderBy = {
      [sort_by as string]: sort_order as 'asc' | 'desc'
    }

    const [capaTasks, total] = await Promise.all([
      prisma.cAPATask.findMany({
        where,
        include: {
          inspection: {
            select: { 
              id: true,
              order: { select: { order_number: true } },
              inspection_type: true,
              result: true
            }
          },
          defect: {
            select: { 
              defect_code: { select: { code: true, name: true } },
              severity: true
            }
          },
          assignee: {
            select: { first_name: true, last_name: true, employee_number: true }
          },
          creator: {
            select: { first_name: true, last_name: true }
          },
          verifier: {
            select: { first_name: true, last_name: true }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.cAPATask.count({ where })
    ])

    res.json({
      capa_tasks: capaTasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    logger.error('Error fetching CAPA tasks:', error)
    res.status(500).json({ error: 'Failed to fetch CAPA tasks' })
  }
})

// Get CAPA task by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const workspaceId = req.headers['x-workspace-id'] as string

    const capaTask = await prisma.cAPATask.findFirst({
      where: { id, workspace_id: workspaceId },
      include: {
        inspection: {
          include: {
            order: { 
              select: { order_number: true, client: { select: { name: true } } }
            },
            defects: {
              include: { defect_code: true }
            }
          }
        },
        defect: {
          include: {
            defect_code: true,
            inspection: {
              select: { 
                order: { select: { order_number: true } }
              }
            }
          }
        },
        assignee: {
          select: { 
            id: true, first_name: true, last_name: true, 
            employee_number: true, position: true 
          }
        },
        creator: {
          select: { 
            id: true, first_name: true, last_name: true, 
            employee_number: true 
          }
        },
        verifier: {
          select: { 
            id: true, first_name: true, last_name: true, 
            employee_number: true 
          }
        }
      }
    })

    if (!capaTask) {
      return res.status(404).json({ error: 'CAPA task not found' })
    }

    // Parse attachments if they exist
    const capaWithParsedAttachments = {
      ...capaTask,
      attachments: capaTask.attachments ? JSON.parse(capaTask.attachments) : []
    }

    res.json(capaWithParsedAttachments)
  } catch (error) {
    logger.error('Error fetching CAPA task:', error)
    res.status(500).json({ error: 'Failed to fetch CAPA task' })
  }
})

// Create new CAPA task
router.post('/', async (req: Request, res: Response) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] as string
    const validatedData = CreateCAPASchema.parse(req.body)

    // Generate CAPA number
    const capaNumber = `CAPA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`

    const capaTask = await prisma.cAPATask.create({
      data: {
        workspace_id: workspaceId,
        capa_number: capaNumber,
        ...validatedData,
        ...(validatedData.due_date && { due_date: new Date(validatedData.due_date) })
      },
      include: {
        assignee: {
          select: { first_name: true, last_name: true }
        },
        creator: {
          select: { first_name: true, last_name: true }
        }
      }
    })

    logger.info(`CAPA task created: ${capaTask.capa_number}`)
    res.status(201).json(capaTask)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors })
    }
    logger.error('Error creating CAPA task:', error)
    res.status(500).json({ error: 'Failed to create CAPA task' })
  }
})

// Update CAPA task
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const workspaceId = req.headers['x-workspace-id'] as string
    const validatedData = UpdateCAPASchema.parse(req.body)

    const updateData: any = {
      ...validatedData,
      ...(validatedData.due_date && { due_date: new Date(validatedData.due_date) }),
      ...(validatedData.attachments && { attachments: JSON.stringify(validatedData.attachments) })
    }

    const capaTask = await prisma.cAPATask.update({
      where: { id, workspace_id: workspaceId },
      data: updateData,
      include: {
        assignee: {
          select: { first_name: true, last_name: true }
        }
      }
    })

    logger.info(`CAPA task updated: ${capaTask.capa_number}`)
    res.json(capaTask)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors })
    }
    logger.error('Error updating CAPA task:', error)
    res.status(500).json({ error: 'Failed to update CAPA task' })
  }
})

// Start working on CAPA task
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const workspaceId = req.headers['x-workspace-id'] as string

    const capaTask = await prisma.cAPATask.update({
      where: { id, workspace_id: workspaceId },
      data: { status: 'IN_PROGRESS' }
    })

    logger.info(`CAPA task started: ${capaTask.capa_number}`)
    res.json(capaTask)
  } catch (error) {
    logger.error('Error starting CAPA task:', error)
    res.status(500).json({ error: 'Failed to start CAPA task' })
  }
})

// Mark CAPA task for verification
router.post('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const workspaceId = req.headers['x-workspace-id'] as string

    const capaTask = await prisma.cAPATask.update({
      where: { id, workspace_id: workspaceId },
      data: { status: 'PENDING_VERIFICATION' }
    })

    logger.info(`CAPA task marked for verification: ${capaTask.capa_number}`)
    res.json(capaTask)
  } catch (error) {
    logger.error('Error marking CAPA task for verification:', error)
    res.status(500).json({ error: 'Failed to mark CAPA task for verification' })
  }
})

// Close CAPA task with effectiveness evaluation
router.post('/:id/close', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const workspaceId = req.headers['x-workspace-id'] as string
    const validatedData = CloseCAPASchema.parse(req.body)

    const capaTask = await prisma.cAPATask.update({
      where: { id, workspace_id: workspaceId },
      data: {
        status: 'CLOSED',
        effectiveness: validatedData.effectiveness,
        verified_by: validatedData.verified_by,
        verified_at: new Date(),
        completed_at: new Date(),
        ...(validatedData.notes && { notes: validatedData.notes })
      },
      include: {
        verifier: {
          select: { first_name: true, last_name: true }
        }
      }
    })

    logger.info(`CAPA task closed: ${capaTask.capa_number} - Effectiveness: ${validatedData.effectiveness}`)
    res.json(capaTask)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors })
    }
    logger.error('Error closing CAPA task:', error)
    res.status(500).json({ error: 'Failed to close CAPA task' })
  }
})

// Reopen CAPA task if effectiveness was inadequate
router.post('/:id/reopen', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const workspaceId = req.headers['x-workspace-id'] as string
    const { reason, priority } = req.body

    const capaTask = await prisma.cAPATask.update({
      where: { id, workspace_id: workspaceId },
      data: {
        status: 'OPEN',
        priority: priority || 'MEDIUM',
        notes: reason ? `Reopened: ${reason}` : 'Task reopened for additional action',
        verified_by: null,
        verified_at: null,
        completed_at: null,
        effectiveness: null
      }
    })

    logger.info(`CAPA task reopened: ${capaTask.capa_number}`)
    res.json(capaTask)
  } catch (error) {
    logger.error('Error reopening CAPA task:', error)
    res.status(500).json({ error: 'Failed to reopen CAPA task' })
  }
})

// ================================
// CAPA ANALYTICS
// ================================

// Get CAPA summary dashboard data
router.get('/analytics/summary', async (req: Request, res: Response) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] as string
    const { from_date, to_date } = req.query

    const dateFilter = from_date && to_date ? {
      created_at: {
        gte: new Date(from_date as string),
        lte: new Date(to_date as string)
      }
    } : {}

    // Get status distribution
    const statusCounts = await prisma.cAPATask.groupBy({
      by: ['status'],
      where: { workspace_id: workspaceId, ...dateFilter },
      _count: { id: true }
    })

    // Get priority distribution
    const priorityCounts = await prisma.cAPATask.groupBy({
      by: ['priority'],
      where: { workspace_id: workspaceId, ...dateFilter },
      _count: { id: true }
    })

    // Get source type distribution
    const sourceTypeCounts = await prisma.cAPATask.groupBy({
      by: ['source_type'],
      where: { workspace_id: workspaceId, ...dateFilter },
      _count: { id: true }
    })

    // Get effectiveness tracking for closed tasks
    const effectivenessCounts = await prisma.cAPATask.groupBy({
      by: ['effectiveness'],
      where: { 
        workspace_id: workspaceId, 
        status: 'CLOSED',
        effectiveness: { not: null },
        ...dateFilter
      },
      _count: { id: true }
    })

    // Get overdue tasks
    const overdueTasks = await prisma.cAPATask.count({
      where: {
        workspace_id: workspaceId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        due_date: { lt: new Date() }
      }
    })

    // Calculate average time to completion
    const completedTasks = await prisma.cAPATask.findMany({
      where: {
        workspace_id: workspaceId,
        status: 'CLOSED',
        completed_at: { not: null },
        ...dateFilter
      },
      select: { created_at: true, completed_at: true }
    })

    const avgCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          const days = Math.floor((task.completed_at!.getTime() - task.created_at.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) / completedTasks.length
      : 0

    res.json({
      status_distribution: statusCounts,
      priority_distribution: priorityCounts,
      source_type_distribution: sourceTypeCounts,
      effectiveness_distribution: effectivenessCounts,
      overdue_count: overdueTasks,
      average_completion_days: Math.round(avgCompletionTime * 100) / 100,
      total_tasks: statusCounts.reduce((sum, s) => sum + s._count.id, 0)
    })
  } catch (error) {
    logger.error('Error fetching CAPA analytics:', error)
    res.status(500).json({ error: 'Failed to fetch CAPA analytics' })
  }
})

// Get CAPA trend analysis
router.get('/analytics/trends', async (req: Request, res: Response) => {
  try {
    const workspaceId = req.headers['x-workspace-id'] as string
    const { period = 'month', limit = '12' } = req.query

    const limitNum = parseInt(limit as string)

    // Generate date ranges based on period
    const now = new Date()
    const trends = []

    for (let i = limitNum - 1; i >= 0; i--) {
      let startDate: Date, endDate: Date, label: string

      if (period === 'week') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7) - 6)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7))
        label = `Week of ${startDate.toISOString().split('T')[0]}`
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        label = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }

      const [created, closed, effectiveness] = await Promise.all([
        prisma.cAPATask.count({
          where: {
            workspace_id: workspaceId,
            created_at: { gte: startDate, lte: endDate }
          }
        }),
        prisma.cAPATask.count({
          where: {
            workspace_id: workspaceId,
            completed_at: { gte: startDate, lte: endDate },
            status: 'CLOSED'
          }
        }),
        prisma.cAPATask.count({
          where: {
            workspace_id: workspaceId,
            completed_at: { gte: startDate, lte: endDate },
            effectiveness: 'EFFECTIVE'
          }
        })
      ])

      trends.push({
        period: label,
        created_count: created,
        closed_count: closed,
        effective_count: effectiveness
      })
    }

    res.json({ trends })
  } catch (error) {
    logger.error('Error fetching CAPA trends:', error)
    res.status(500).json({ error: 'Failed to fetch CAPA trends' })
  }
})

export default router
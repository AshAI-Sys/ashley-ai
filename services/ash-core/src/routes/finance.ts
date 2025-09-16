import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { prisma, createWithWorkspace, logAudit } from '@ash/database'
import { AuthenticatedRequest, requirePermission } from '../middleware/auth'
import { logger } from '@ash/shared/logger'

const router = Router()

// Get invoices
router.get('/invoices', [
  requirePermission('finance:read'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'paid', 'failed', 'refunded']),
  query('client_id').optional().isUUID(),
  query('overdue_only').optional().isBoolean()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const status = req.query.status as string
    const client_id = req.query.client_id as string
    const overdue_only = req.query.overdue_only === 'true'

    const skip = (page - 1) * limit

    const where = {
      workspace_id: req.user!.workspace_id,
      ...(status && { status }),
      ...(client_id && { client_id }),
      ...(overdue_only && {
        status: 'pending',
        due_date: { lt: new Date() }
      })
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, contact_person: true }
          },
          order: {
            select: { id: true, order_number: true }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              payment_method: true,
              status: true,
              processed_at: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.invoice.count({ where })
    ])

    // Calculate payment status for each invoice
    const invoicesWithStatus = invoices.map(invoice => {
      const totalPaid = invoice.payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount.toNumber(), 0)
      
      const isOverdue = invoice.due_date && invoice.due_date < new Date() && invoice.status === 'pending'
      
      return {
        ...invoice,
        total_paid: totalPaid,
        balance: invoice.total_amount.toNumber() - totalPaid,
        is_overdue: isOverdue
      }
    })

    res.json({
      data: invoicesWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logger.error('Get invoices error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch invoices'
    })
  }
})

// Get invoice by ID
router.get('/invoices/:id', [
  requirePermission('finance:read'),
  param('id').isUUID()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id
      },
      include: {
        client: true,
        order: {
          include: {
            line_items: true,
            brand: { select: { name: true } }
          }
        },
        payments: {
          orderBy: { created_at: 'desc' }
        }
      }
    })

    if (!invoice) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Invoice not found'
      })
    }

    // Calculate totals
    const totalPaid = invoice.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount.toNumber(), 0)

    const invoiceWithTotals = {
      ...invoice,
      total_paid: totalPaid,
      balance: invoice.total_amount.toNumber() - totalPaid,
      is_overdue: invoice.due_date && invoice.due_date < new Date() && invoice.status === 'pending'
    }

    res.json(invoiceWithTotals)

  } catch (error) {
    logger.error('Get invoice error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch invoice'
    })
  }
})

// Create invoice
router.post('/invoices', [
  requirePermission('finance:manage'),
  body('order_id').isUUID(),
  body('due_date').optional().isISO8601(),
  body('notes').optional().isString(),
  body('line_items').optional().isArray(),
  body('line_items.*.description').optional().isString(),
  body('line_items.*.quantity').optional().isInt({ min: 1 }),
  body('line_items.*.unit_price').optional().isDecimal(),
  body('tax_rate').optional().isDecimal({ decimal_digits: '4' })
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { order_id, due_date, notes, line_items, tax_rate = 0 } = req.body

    // Get order details
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      },
      include: {
        client: true,
        line_items: true
      }
    })

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      })
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        order_id: order.id,
        workspace_id: req.user!.workspace_id
      }
    })

    if (existingInvoice) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invoice already exists for this order'
      })
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { workspace_id: req.user!.workspace_id }
    })
    const invoice_number = `INV-${(invoiceCount + 1).toString().padStart(6, '0')}`

    // Calculate totals
    const subtotal = line_items ? 
      line_items.reduce((sum: number, item: any) => sum + (item.quantity * parseFloat(item.unit_price)), 0) :
      order.total_amount.toNumber()

    const tax_amount = subtotal * parseFloat(tax_rate)
    const total_amount = subtotal + tax_amount

    const invoice = await prisma.invoice.create({
      data: createWithWorkspace(req.user!.workspace_id, {
        client_id: order.client_id,
        order_id: order.id,
        invoice_number,
        status: 'pending',
        subtotal,
        tax_amount,
        total_amount,
        currency: order.currency,
        due_date: due_date ? new Date(due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        metadata: {
          notes,
          line_items: line_items || order.line_items,
          tax_rate
        }
      }),
      include: {
        client: { select: { name: true } },
        order: { select: { order_number: true } }
      }
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'CREATE',
      resource: 'invoice',
      resourceId: invoice.id,
      newValues: invoice,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Invoice created', {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      order_id: order.id,
      amount: total_amount,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    res.status(201).json(invoice)

  } catch (error) {
    logger.error('Create invoice error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create invoice'
    })
  }
})

// Create payment
router.post('/invoices/:id/payments', [
  requirePermission('finance:manage'),
  param('id').isUUID(),
  body('amount').isDecimal({ decimal_digits: '2' }),
  body('payment_method').isIn(['cash', 'bank_transfer', 'gcash', 'stripe', 'check']),
  body('reference').optional().isString(),
  body('notes').optional().isString()
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { amount, payment_method, reference, notes } = req.body

    // Get invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        workspace_id: req.user!.workspace_id
      },
      include: {
        payments: true
      }
    })

    if (!invoice) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Invoice not found'
      })
    }

    // Calculate remaining balance
    const totalPaid = invoice.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount.toNumber(), 0)
    
    const remainingBalance = invoice.total_amount.toNumber() - totalPaid
    const paymentAmount = parseFloat(amount)

    if (paymentAmount > remainingBalance) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Payment amount exceeds remaining balance'
      })
    }

    const payment = await prisma.$transaction(async (tx) => {
      // Create payment record
      const newPayment = await tx.payment.create({
        data: createWithWorkspace(req.user!.workspace_id, {
          invoice_id: invoice.id,
          amount: paymentAmount,
          currency: invoice.currency,
          payment_method,
          reference,
          status: 'paid', // For now, assume all payments are immediately successful
          processed_at: new Date(),
          metadata: { notes }
        })
      })

      // Update invoice status if fully paid
      const newTotalPaid = totalPaid + paymentAmount
      if (newTotalPaid >= invoice.total_amount.toNumber()) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { 
            status: 'paid',
            paid_at: new Date()
          }
        })
      }

      return newPayment
    })

    // Log audit
    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'CREATE',
      resource: 'payment',
      resourceId: payment.id,
      newValues: payment,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Payment created', {
      payment_id: payment.id,
      invoice_id: invoice.id,
      amount: paymentAmount,
      method: payment_method,
      workspace_id: req.user!.workspace_id,
      user_id: req.user!.user_id
    })

    res.status(201).json(payment)

  } catch (error) {
    logger.error('Create payment error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create payment'
    })
  }
})

// Get financial summary
router.get('/summary', [
  requirePermission('finance:read'),
  query('period').optional().isIn(['today', 'week', 'month', 'quarter', 'year'])
], async (req: AuthenticatedRequest, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const period = req.query.period as string || 'month'
    const workspaceId = req.user!.workspace_id

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get financial metrics
    const [
      totalRevenue,
      totalInvoiced,
      totalPaid,
      pendingInvoices,
      overdueInvoices,
      recentPayments
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          workspace_id: workspaceId,
          status: 'paid',
          processed_at: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      prisma.invoice.aggregate({
        where: {
          workspace_id: workspaceId,
          created_at: { gte: startDate }
        },
        _sum: { total_amount: true },
        _count: true
      }),
      prisma.payment.aggregate({
        where: {
          workspace_id: workspaceId,
          status: 'paid',
          processed_at: { gte: startDate }
        },
        _count: true
      }),
      prisma.invoice.count({
        where: {
          workspace_id: workspaceId,
          status: 'pending'
        }
      }),
      prisma.invoice.count({
        where: {
          workspace_id: workspaceId,
          status: 'pending',
          due_date: { lt: new Date() }
        }
      }),
      prisma.payment.findMany({
        where: {
          workspace_id: workspaceId,
          status: 'paid',
          processed_at: { gte: startDate }
        },
        include: {
          invoice: {
            include: {
              client: { select: { name: true } },
              order: { select: { order_number: true } }
            }
          }
        },
        orderBy: { processed_at: 'desc' },
        take: 10
      })
    ])

    const summary = {
      period,
      metrics: {
        total_revenue: totalRevenue._sum.amount?.toNumber() || 0,
        total_invoiced: totalInvoiced._sum.total_amount?.toNumber() || 0,
        invoices_count: totalInvoiced._count,
        payments_count: totalPaid._count,
        pending_invoices: pendingInvoices,
        overdue_invoices: overdueInvoices,
        collection_rate: totalInvoiced._sum.total_amount ? 
          ((totalRevenue._sum.amount?.toNumber() || 0) / totalInvoiced._sum.total_amount.toNumber() * 100).toFixed(1) + '%' : 
          '0%'
      },
      recent_payments: recentPayments,
      generated_at: new Date().toISOString()
    }

    res.json(summary)

  } catch (error) {
    logger.error('Financial summary error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch financial summary'
    })
  }
})

export { router as financeRouter }
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const client_id = searchParams.get('client_id')
    const source = searchParams.get('source')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    const where: any = {}
    if (client_id) where.client_id = client_id
    if (source && source !== 'all') where.source = source

    if (date_from || date_to) {
      where.received_at = {}
      if (date_from) where.received_at.gte = new Date(date_from)
      if (date_to) where.received_at.lte = new Date(date_to)
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        client: { select: { name: true } },
        payment_allocations: {
          include: {
            invoice: {
              select: {
                invoice_no: true,
                total: true,
                brand: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { received_at: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: payments
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      client_id,
      source,
      amount,
      ref_no,
      received_at,
      invoice_allocations = []
    } = data

    // Validate total allocation doesn't exceed payment amount
    const totalAllocated = invoice_allocations.reduce((sum: number, allocation: any) => sum + allocation.amount, 0)
    if (totalAllocated > amount) {
      return NextResponse.json(
        { success: false, error: 'Total allocation exceeds payment amount' },
        { status: 400 }
      )
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          workspace_id: 'default',
          payer_type: 'CLIENT',
          client_id,
          source,
          amount,
          ref_no,
          received_at: new Date(received_at || Date.now())
        }
      })

      // Create payment allocations and update invoice balances
      for (const allocation of invoice_allocations) {
        await tx.paymentAllocation.create({
          data: {
            payment_id: payment.id,
            invoice_id: allocation.invoice_id,
            amount: allocation.amount
          }
        })

        // Update invoice balance
        const invoice = await tx.invoice.findUnique({
          where: { id: allocation.invoice_id },
          select: { balance: true, total: true }
        })

        if (!invoice) {
          throw new Error(`Invoice ${allocation.invoice_id} not found`)
        }

        const newBalance = invoice.balance - allocation.amount
        let newStatus = 'OPEN'

        if (newBalance <= 0) {
          newStatus = 'PAID'
        } else if (newBalance < invoice.total) {
          newStatus = 'PARTIAL'
        }

        await tx.invoice.update({
          where: { id: allocation.invoice_id },
          data: {
            balance: Math.max(0, newBalance),
            status: newStatus
          }
        })
      }

      return payment
    })

    // Fetch the complete payment record with relationships
    const paymentWithDetails = await prisma.payment.findUnique({
      where: { id: result.id },
      include: {
        client: { select: { name: true } },
        payment_allocations: {
          include: {
            invoice: {
              select: {
                invoice_no: true,
                total: true,
                brand: { select: { name: true } }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: paymentWithDetails
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
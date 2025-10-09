import { NextRequest } from 'next/server'
import {
  createSuccessResponse,
  ValidationError,
  withErrorHandling
} from '../../../lib/error-handling'

// Simple health check endpoint to test error handling system
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const test = searchParams.get('test')
  const seed = searchParams.get('seed')

  // Database seeding functionality - TEMPORARY
  if (seed === 'ashley-ai-2024') {
    const { PrismaClient } = await import('@prisma/client')
    const bcrypt = await import('bcryptjs')
    const prisma = db

    try {
      const workspace = await prisma.workspace.upsert({
        where: { slug: 'demo-workspace' },
        update: {},
        create: { id: 'demo-workspace-1', name: 'Demo Workspace', slug: 'demo-workspace', is_active: true },
      })
      const passwordHash = await bcrypt.hash('password123', 10)
      const user = await prisma.user.upsert({
        where: { workspace_id_email: { workspace_id: workspace.id, email: 'admin@ashleyai.com' } },
        update: {},
        create: {
          email: 'admin@ashleyai.com', password_hash: passwordHash, first_name: 'Admin', last_name: 'User',
          role: 'admin', workspace_id: workspace.id, position: 'System Administrator', department: 'IT', is_active: true,
        },
      })

      // Create demo clients
      const client1 = await prisma.client.upsert({
        where: { id: 'client-1' },
        update: {},
        create: {
          id: 'client-1', workspace_id: workspace.id, name: 'Manila Shirts Co.',
          contact_person: 'Juan Dela Cruz', email: 'orders@manilashirts.com', phone: '+63 917 123 4567',
          address: JSON.stringify({ street: '123 Quezon Avenue', city: 'Manila', state: 'Metro Manila', postal_code: '1100', country: 'Philippines' }),
          payment_terms: 30, credit_limit: 500000, is_active: true,
        },
      })

      // Create demo orders
      await prisma.order.upsert({
        where: { id: 'order-1' },
        update: {},
        create: {
          id: 'order-1', workspace_id: workspace.id, order_number: 'ORD-2024-001',
          client_id: client1.id, total_amount: 125000, currency: 'PHP', status: 'IN_PRODUCTION',
          delivery_date: new Date('2024-12-15'), notes: 'Cotton crew neck t-shirts with custom print - 500 units',
        },
      })

      await prisma.$disconnect()
      return createSuccessResponse({
        message: '🎉 Database seeded with demo data!',
        loginCredentials: { email: 'admin@ashleyai.com', password: 'password123' }
      })
    } catch (error: any) {
      await prisma.$disconnect()
      throw new Error(`Seed failed: ${error.message}`)
    }
  }

  // Test different error scenarios
  if (test === 'validation') {
    throw new ValidationError('This is a test validation error', 'test_field', {
      providedValue: test,
      expectedFormat: 'none'
    })
  }

  return createSuccessResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Ashley AI API is running successfully'
  })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json()

  return createSuccessResponse({
    status: 'echo',
    receivedData: body,
    timestamp: new Date().toISOString()
  })
})
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
    const prisma = new PrismaClient()

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
      await prisma.$disconnect()
      return createSuccessResponse({
        message: '🎉 Database seeded!',
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
import { NextRequest } from 'next/server'
import { prisma } from '../../../../../lib/db'
import {
  createSuccessResponse,
  withErrorHandling,
  handleDatabaseError
} from '../../../lib/error-handling'

// Test database connection and Prisma client singleton
export const GET = withErrorHandling(async (request: NextRequest) => {
  try {
    // Test basic database connection
    await prisma.$connect()

    // Test a simple query to verify schema is accessible
    const workspaceCount = await prisma.workspace.count()

    return createSuccessResponse({
      database: 'connected',
      prismaClient: 'working',
      workspaceCount: workspaceCount,
      timestamp: new Date().toISOString(),
      message: 'Database connection and Prisma client singleton working correctly'
    })
  } catch (error) {
    // Use our standardized database error handling
    const dbError = handleDatabaseError(error)
    throw dbError
  }
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json()
  const { name, slug } = body

  if (!name || !slug) {
    return createSuccessResponse({
      test: 'validation',
      message: 'This endpoint tests database operations but requires name and slug'
    })
  }

  try {
    // Test creating a workspace to verify write operations
    const workspace = await prisma.workspace.create({
      data: {
        name: name,
        slug: slug,
        is_active: true
      }
    })

    return createSuccessResponse({
      operation: 'create',
      workspace: workspace,
      message: 'Database write operation successful'
    })
  } catch (error) {
    const dbError = handleDatabaseError(error)
    throw dbError
  }
})
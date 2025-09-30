import { NextRequest } from 'next/server'
import { storageService } from '@/lib/storageService'
import { createSuccessResponse, createErrorResponse } from '@/lib/error-handling'

/**
 * Test File Storage API
 * POST /api/test-storage
 *
 * Tests file upload functionality
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return createErrorResponse('No file provided', 400)
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to storage
    const result = await storageService.upload(buffer, file.name, {
      folder: 'test-uploads',
      contentType: file.type,
    })

    return createSuccessResponse({
      message: 'File uploaded successfully',
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      storage: result,
      provider: process.env.ASH_STORAGE_PROVIDER || 'local',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in test-storage API:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to upload file',
      500
    )
  }
}

/**
 * Get storage configuration info
 * GET /api/test-storage
 */
export async function GET() {
  const provider = process.env.ASH_STORAGE_PROVIDER || 'local'
  const configured = provider === 'local' || (
    !!process.env.ASH_AWS_ACCESS_KEY_ID &&
    !!process.env.ASH_AWS_SECRET_ACCESS_KEY &&
    !!process.env.ASH_AWS_BUCKET
  )

  return createSuccessResponse({
    provider,
    configured,
    bucket: process.env.ASH_AWS_BUCKET || 'not configured',
    region: process.env.ASH_AWS_REGION || 'not configured',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    usage: 'POST /api/test-storage with multipart/form-data and a "file" field',
  })
}
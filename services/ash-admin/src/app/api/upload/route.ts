import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST /api/upload - Upload file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'ashley-ai'
    const type = (formData.get('type') as string) || 'image' // image, document, video

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json(
        {
          error: 'Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.',
          configuration_needed: true
        },
        { status: 503 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: type === 'document' ? 'raw' : 'auto',
          transformation: type === 'image' ? [
            { quality: 'auto', fetch_format: 'auto' }
          ] : undefined,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at,
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// DELETE /api/upload - Delete file from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('public_id')

    if (!publicId) {
      return NextResponse.json(
        { error: 'public_id is required' },
        { status: 400 }
      )
    }

    const result = await cloudinary.uploader.destroy(publicId)

    return NextResponse.json({
      success: result.result === 'ok',
      result: result.result,
    })
  } catch (error: any) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete file',
        details: error.message
      },
      { status: 500 }
    )
  }
}

// GET /api/upload - Check upload configuration status
export async function GET() {
  return NextResponse.json({
    configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || null,
  })
}

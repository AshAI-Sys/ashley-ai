import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  return requireAuth(request, async (userId, workspaceId) => {
    try {
      const formData = await request.formData()
      const file = formData.get('avatar') as File

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
      }

      // TODO: In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, we'll use a data URL (not recommended for production)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const avatar_url = `data:${file.type};base64,${base64}`

      // Update user avatar
      await prisma.user.update({
        where: { id: userId },
        data: {
          avatar_url,
          updated_at: new Date()
        }
      })

      return NextResponse.json({ success: true, avatar_url })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return requireAuth(request, async (userId, workspaceId) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          avatar_url: null,
          updated_at: new Date()
        }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error removing avatar:', error)
      return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 })
    }
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  return requireAuth(request, async (userId, workspaceId) => {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          name: true,
          slug: true,
          description: true,
          industry: true,
          company_size: true,
          website: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          country: true,
          postal_code: true,
          timezone: true,
          currency: true,
          date_format: true,
          tax_id: true,
          logo_url: true
        }
      })

      if (!workspace) {
        return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
      }

      return NextResponse.json(workspace)
    } catch (error) {
      console.error('Error fetching workspace settings:', error)
      return NextResponse.json({ error: 'Failed to fetch workspace' }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(request, async (userId, workspaceId) => {
    try {
      const body = await request.json()

      const updateData: any = {
        updated_at: new Date()
      }

      // Only update fields that are provided
      const allowedFields = [
        'name', 'description', 'industry', 'company_size', 'website', 'email', 'phone',
        'address', 'city', 'state', 'country', 'postal_code', 'timezone', 'currency',
        'date_format', 'tax_id'
      ]

      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          updateData[field] = body[field]
        }
      })

      const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: updateData
      })

      return NextResponse.json({ success: true, workspace: updatedWorkspace })
    } catch (error) {
      console.error('Error updating workspace settings:', error)
      return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 })
    }
  })
}

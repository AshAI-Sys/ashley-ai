import { NextRequest, NextResponse } from 'next/server'
import { db } from '@ash-ai/database'

const prisma = db

// Simple token validation (replace with proper tokenService if needed)
async function validateApprovalToken(token: string) {
  try {
    // For now, extract approval ID from token (simplified)
    // In production, use JWT or encrypted tokens
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [approvalId, clientId] = decoded.split(':')
    return {
      valid: true,
      payload: { approvalId, clientId, designId: '', version: 1 }
    }
  } catch {
    return { valid: false, error: 'Invalid token', expired: false }
  }
}

async function logSecurityEvent(event: any) {
  // Log to console for now
  console.log('Security event:', event)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Get client IP and user agent for security logging
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Validate the secure token
    const tokenValidation = await validateApprovalToken(params.token)

    if (!tokenValidation.valid) {
      // Log security event
      await logSecurityEvent({
        type: 'invalid_access',
        ipAddress: clientIp,
        userAgent: userAgent,
        details: {
          error: tokenValidation.error,
          expired: tokenValidation.expired
        }
      })

      return NextResponse.json(
        { 
          success: false, 
          message: tokenValidation.expired ? 'Link has expired' : 'Invalid or expired approval link',
          expired: tokenValidation.expired 
        },
        { status: tokenValidation.expired ? 410 : 404 }
      )
    }

    const { payload } = tokenValidation

    // Find approval using validated data
    const approval = await prisma.designApproval.findFirst({
      where: {
        id: payload!.approvalId,
        client_id: payload!.clientId
      },
      include: {
        design_asset: {
          include: {
            order: {
              include: {
                client: true
              }
            },
            brand: true
          }
        },
        client: true
      }
    })

    if (!approval) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired approval link' },
        { status: 404 }
      )
    }

    // Get the specific design version using validated data
    const designVersion = await prisma.designVersion.findFirst({
      where: {
        asset_id: payload!.designId,
        version: payload!.version
      }
    })

    if (!designVersion) {
      return NextResponse.json(
        { success: false, message: 'Design version not found' },
        { status: 404 }
      )
    }

    // Log successful token validation
    await logSecurityEvent({
      type: 'token_validated',
      approvalId: payload!.approvalId,
      clientId: payload!.clientId,
      ipAddress: clientIp,
      userAgent: userAgent
    })

    // Check if expired (but still allow viewing)
    const isExpired = approval.expires_at && new Date() > approval.expires_at

    // Calculate time remaining
    let timeRemaining = ''
    if (approval.expires_at && !isExpired) {
      const now = new Date()
      const expiry = approval.expires_at
      const diffInHours = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours > 24) {
        const days = Math.ceil(diffInHours / 24)
        timeRemaining = `${days} day${days > 1 ? 's' : ''}`
      } else if (diffInHours > 1) {
        timeRemaining = `${diffInHours} hours`
      } else if (diffInHours === 1) {
        timeRemaining = '1 hour'
      } else {
        timeRemaining = 'Less than 1 hour'
      }
    }

    const responseData = {
      id: approval.id,
      status: isExpired ? 'EXPIRED' : approval.status,
      version: approval.version,
      comments: approval.comments,
      expires_at: approval.expires_at,
      created_at: approval.created_at,
      time_remaining: timeRemaining,
      design_asset: {
        id: approval.design_asset.id,
        name: approval.design_asset.name,
        method: approval.design_asset.method,
        order: {
          order_number: approval.design_asset.order.order_number,
          client: {
            name: approval.design_asset.order.client.name
          }
        },
        brand: {
          name: approval.design_asset.brand.name,
          code: approval.design_asset.brand.code
        }
      },
      design_version: designVersion,
      client: {
        name: approval.client.name,
        email: approval.client.email
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error fetching approval data:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
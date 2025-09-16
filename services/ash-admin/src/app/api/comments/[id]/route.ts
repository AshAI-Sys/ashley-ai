import { NextRequest, NextResponse } from 'next/server'

// TODO: Fix Prisma client model name issue for DesignComment
// Temporarily disabled all comment operations

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    success: false,
    message: 'Comment update temporarily disabled - Prisma model issue'
  }, { status: 503 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    success: false,
    message: 'Comment deletion temporarily disabled - Prisma model issue'
  }, { status: 503 })
}
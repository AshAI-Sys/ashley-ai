import { NextRequest, NextResponse } from 'next/server'

// TODO: Fix Prisma client model name issue for Shipment
// Temporarily disabled all shipment operations

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: [],
    message: 'Shipments temporarily disabled - Prisma model issue'
  })
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    success: false,
    message: 'Shipment creation temporarily disabled - Prisma model issue'
  }, { status: 503 })
}